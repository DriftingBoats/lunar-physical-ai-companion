import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([['/', 'index.html'], ['/app.js', 'app.js'], ['/state.js', 'state.js'], ['/style.css', 'style.css'], ['/hardware.css', 'hardware.css']]);
const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', png:'image/png' };
files.set('/lunar.js','lunar.js');
files.set('/lunar-poses.png','lunar-poses.png');
for (const file of ['life.js','character.js']) files.set('/'+file,file);
http.createServer(async (req, res) => {
  const file = files.get(new URL(req.url, 'http://localhost').pathname);
  if (!file) { res.writeHead(404); res.end(); return; }
  try {
    const body = await readFile(new URL(file, import.meta.url));
    res.writeHead(200, { 'Content-Type': `${types[file.split('.').pop()]}; charset=utf-8` });
    res.end(body);
  } catch { res.writeHead(500); res.end('Unable to load simulator'); }
}).listen(18743, '127.0.0.1', () => console.log('Lunar simulator: http://127.0.0.1:18743'));
