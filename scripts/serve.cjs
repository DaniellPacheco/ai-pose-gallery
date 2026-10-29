// Servidor local da galeria. Não requer pacotes adicionais.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  let file;
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  } catch {
    res.writeHead(400).end();
    return;
  }
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (!['GET', 'HEAD'].includes(req.method) ||
      !(relative === 'index.html' || relative === 'data/pose-pt.json' || /^(img|thumbs)\/[\w-]+\.(png|jpg)$/.test(relative))) {
    res.writeHead(403).end('Acesso negado');
    return;
  }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404).end('Arquivo não encontrado');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
  });
});
server.on('error', error => {
  console.error('Não foi possível iniciar a galeria:', error.message);
  process.exitCode = 1;
});
server.listen(8080, '127.0.0.1', () => console.log('Galeria: http://127.0.0.1:8080\nPara encerrar, pressione Ctrl+C.'));
