import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.resolve();
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "dist"); // folder with your index.html, js, css, media

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = path.join(PUBLIC_DIR, parsedUrl.pathname);

  fs.stat(pathname, (err, stats) => {
    if (!err && stats.isFile()) {
      // ✅ serve file if it exists
      serveFile(pathname, res);
    } else if (!err && stats.isDirectory()) {
      // ✅ serve index.html if they hit a folder
      serveFile(path.join(pathname, "index.html"), res);
    } else {
      // ❌ file not found → fallback to SPA entry (index.html)
      serveFile(path.join(PUBLIC_DIR, "index.html"), res);
    }
  });
});

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end("500 Internal Server Error");
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".json": "application/json",
      };
      res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
      res.end(data);
    }
  });
}

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});