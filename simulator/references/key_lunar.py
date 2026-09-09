"""Remove user-requested magenta background; preserve source and pack four poses."""
from pathlib import Path
from collections import deque
import json, sys
import numpy as np
from PIL import Image, ImageDraw

src, dest = map(Path, sys.argv[1:3])
rgb = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
h, w = rgb.shape[:2]
excess = np.minimum(rgb[:,:,0], rgb[:,:,2]) - rgb[:,:,1]
candidate = excess > 8
connected = np.zeros((h,w), dtype=bool)
queue = deque()
for x in range(w):
    for y in (0,h-1):
        if candidate[y,x]: connected[y,x]=True; queue.append((y,x))
for y in range(h):
    for x in (0,w-1):
        if candidate[y,x] and not connected[y,x]: connected[y,x]=True; queue.append((y,x))
while queue:
    y,x = queue.popleft()
    for yy,xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
        if 0<=yy<h and 0<=xx<w and candidate[yy,xx] and not connected[yy,xx]:
            connected[yy,xx]=True; queue.append((yy,xx))
alpha=np.ones((h,w),dtype=np.float32)
alpha[connected]=np.clip(1-excess[connected]/255,0,1)
alpha[connected & (excess>210)]=0
# Undo the magenta contribution to antialiased boundary pixels.
edge=connected & (alpha>0)
for channel,bg in ((0,255),(1,0),(2,255)):
    rgb[:,:,channel][edge]=np.clip((rgb[:,:,channel][edge]-bg*(1-alpha[edge]))/alpha[edge],0,255)
rgba=np.dstack((rgb,alpha*255)).astype(np.uint8)
rgba[alpha==0,:3]=0
cutout=Image.fromarray(rgba)
cutout.save(dest.with_name(dest.stem+'-cutout.png'))
poses=[]
occupied=(alpha>0.15).sum(axis=0)>3
starts=np.flatnonzero(occupied & ~np.r_[False,occupied[:-1]])
ends=np.flatnonzero(occupied & ~np.r_[occupied[1:],False])+1
spans=[]
for left,right in zip(starts,ends):
    if spans and left-spans[-1][1]<12: spans[-1][1]=int(right)
    else: spans.append([int(left),int(right)])
spans=[span for span in spans if span[1]-span[0]>w*.12]
if len(spans)!=4: raise ValueError(f'Expected four separated poses, found {spans}')
for left,right in spans:
    crop=cutout.crop((max(0,left-2),0,min(w,right+2),h))
    box=crop.getbbox()
    if box is None: raise ValueError('Empty pose')
    poses.append(crop.crop(box))
cellw=max(p.width for p in poses)+40
cellh=max(p.height for p in poses)+40
sheet=Image.new('RGBA',(4*cellw,cellh))
for i,p in enumerate(poses): sheet.alpha_composite(p,(i*cellw+(cellw-p.width)//2,cellh-20-p.height))
sheet.save(dest)
preview=Image.new('RGB',(sheet.width,2*sheet.height))
for row,color in enumerate(('#ecebd5','#434b60')):
    bg=Image.new('RGBA',sheet.size,color); bg.alpha_composite(sheet)
    preview.paste(bg.convert('RGB'),(0,row*sheet.height))
preview.save(dest.with_name(dest.stem+'-edge-check.jpg'))
print(json.dumps({'size':sheet.size,'mode':sheet.mode,'transparent_pixels':int((np.asarray(sheet)[:,:,3]==0).sum()),'source':str(src),'output':str(dest)}))
