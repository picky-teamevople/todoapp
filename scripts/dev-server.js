const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "src");
const port = process.env.PORT || 4173;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

http
  .createServer((req, res) => {
    const urlPath = req.url === "/" ? "/demo.html" : req.url.split("?")[0];
    const filePath = path.join(root, decodeURIComponent(urlPath));
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`dev server on http://localhost:${port}`));
