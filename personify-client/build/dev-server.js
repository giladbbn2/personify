import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.resolve();
const publicDir = path.join(__dirname, "dist"); // folder with your static files

const server = http.createServer((req, res) => {
  // Parse request URL
  const parsedUrl = url.parse(req.url);
  let pathname = `${publicDir}${parsedUrl.pathname}`;

  // Default to index.html if directory
  if (fs.existsSync(pathname) && fs.statSync(pathname).isDirectory()) {
    pathname = path.join(pathname, "index.html");
  }

  // File extension and MIME type mapping
  const ext = path.extname(pathname).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".wav": "audio/wav",
    ".mp4": "video/mp4",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".otf": "font/otf",
    ".wasm": "application/wasm"
  };

  const contentType = mimeTypes[ext] || "application/octet-stream";

  // Serve file
  fs.readFile(pathname, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("404 Not Found");
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", contentType);
      res.end(data);
    }
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});