// Lightweight, zero-dependency local static server with auto port fallback
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let safePath = req.url.split('?')[0];
  let filePath = path.join(__dirname, safePath === '/' ? 'index.html' : safePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const DEFAULT_PORTS = [8080, 5173, 3001, 8000, 0];
let portIndex = 0;

function tryListen() {
  const port = DEFAULT_PORTS[portIndex];
  server.listen(port, () => {
    const activePort = server.address().port;
    console.log(`Portfolio live server running at http://localhost:${activePort}`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    portIndex++;
    if (portIndex < DEFAULT_PORTS.length) {
      tryListen();
    } else {
      console.error('No free port found.');
    }
  } else {
    console.error('Server error:', err);
  }
});

tryListen();
