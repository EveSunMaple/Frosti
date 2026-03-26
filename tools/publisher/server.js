/**
 * Blog Publisher — Lightweight local server
 * Zero external dependencies, Node.js built-in modules only.
 * 
 * Usage:  node tools/publisher/server.js
 *         pnpm run publish
 */

import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename, resolve, dirname } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Config ---
const PORT = 3721;
const PROJECT_ROOT = resolve(__dirname, "../..");
const BLOG_DIR = join(PROJECT_ROOT, "src/content/blog");
const IMAGE_DIR = join(PROJECT_ROOT, "public/image");

// Ensure target directories exist
[BLOG_DIR, IMAGE_DIR].forEach(dir => { if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".webp": "image/webp",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
};

const MD_EXTS   = new Set([".md", ".mdx"]);
const IMG_EXTS  = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);

// ─── Helpers ────────────────────────────────────
function parseMultipart(buf, boundary) {
  const parts = [];
  const boundaryBuf = Buffer.from(`--${boundary}`);
  let start = indexOf(buf, boundaryBuf, 0);
  if (start === -1) return parts;
  start += boundaryBuf.length + 2; // skip \r\n

  while (true) {
    const end = indexOf(buf, boundaryBuf, start);
    if (end === -1) break;
    const partBuf = buf.subarray(start, end - 2); // trim trailing \r\n
    const headerEnd = indexOf(partBuf, Buffer.from("\r\n\r\n"), 0);
    if (headerEnd === -1) { start = end + boundaryBuf.length + 2; continue; }
    
    const headerStr = partBuf.subarray(0, headerEnd).toString("utf-8");
    const body = partBuf.subarray(headerEnd + 4);
    
    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    
    parts.push({
      name: nameMatch ? nameMatch[1] : "",
      filename: filenameMatch ? filenameMatch[1] : "",
      data: body,
    });
    
    start = end + boundaryBuf.length;
    if (buf[start] === 0x2d && buf[start + 1] === 0x2d) break; // --
    start += 2; // \r\n
  }
  return parts;
}

function indexOf(buf, search, from) {
  for (let i = from; i <= buf.length - search.length; i++) {
    let found = true;
    for (let j = 0; j < search.length; j++) {
      if (buf[i + j] !== search[j]) { found = false; break; }
    }
    if (found) return i;
  }
  return -1;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function getExistingPosts() {
  if (!existsSync(BLOG_DIR)) return [];
  return readdirSync(BLOG_DIR)
    .filter(f => MD_EXTS.has(extname(f).toLowerCase()))
    .map(f => {
      const content = readFileSync(join(BLOG_DIR, f), "utf-8");
      const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      let title = f;
      let pubDate = "";
      if (fmMatch) {
        const titleMatch = fmMatch[1].match(/title:\s*["']?(.+?)["']?\s*$/m);
        const dateMatch  = fmMatch[1].match(/pubDate:\s*["']?(.+?)["']?\s*$/m);
        if (titleMatch) title = titleMatch[1];
        if (dateMatch) pubDate = dateMatch[1];
      }
      return { filename: f, title, pubDate };
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

function getExistingImages() {
  if (!existsSync(IMAGE_DIR)) return [];
  return readdirSync(IMAGE_DIR)
    .filter(f => IMG_EXTS.has(extname(f).toLowerCase()))
    .map(f => ({
      filename: f,
      size: statSync(join(IMAGE_DIR, f)).size,
    }));
}

function json(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

// ─── Server ─────────────────────────────────────
const server = createServer(async (req, res) => {
  // CORS (for dev convenience)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // --- Static file serving (the GUI) ---
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    const html = readFileSync(join(__dirname, "index.html"), "utf-8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  // --- API: List existing posts ---
  if (req.method === "GET" && url.pathname === "/api/posts") {
    json(res, { posts: getExistingPosts(), images: getExistingImages() });
    return;
  }

  // --- API: Upload files ---
  if (req.method === "POST" && url.pathname === "/api/upload") {
    try {
      const ct = req.headers["content-type"] || "";
      const boundaryMatch = ct.match(/boundary=(.+)/);
      if (!boundaryMatch) { json(res, { error: "No boundary in content-type" }, 400); return; }

      const body = await readBody(req);
      const parts = parseMultipart(body, boundaryMatch[1]);
      const results = [];

      for (const part of parts) {
        if (!part.filename) continue;
        const ext = extname(part.filename).toLowerCase();
        let destDir, destPath, webPath;

        if (MD_EXTS.has(ext)) {
          destDir = BLOG_DIR;
          destPath = join(destDir, part.filename);
          webPath = `src/content/blog/${part.filename}`;
        } else if (IMG_EXTS.has(ext)) {
          destDir = IMAGE_DIR;
          destPath = join(destDir, part.filename);
          webPath = `/image/${part.filename}`;
        } else {
          results.push({ filename: part.filename, status: "skipped", reason: "Unsupported file type" });
          continue;
        }

        writeFileSync(destPath, part.data);
        results.push({ filename: part.filename, status: "ok", path: webPath, size: part.data.length });
      }

      json(res, { results });
    } catch (err) {
      json(res, { error: err.message }, 500);
    }
    return;
  }

  // --- API: Update frontmatter of an uploaded MD ---
  if (req.method === "POST" && url.pathname === "/api/update-frontmatter") {
    try {
      const body = await readBody(req);
      const { filename, frontmatter, content } = JSON.parse(body.toString("utf-8"));
      if (!filename) { json(res, { error: "Missing filename" }, 400); return; }

      const filePath = join(BLOG_DIR, basename(filename));
      const fullContent = `---\n${frontmatter.trim()}\n---\n\n${content || ""}`;
      writeFileSync(filePath, fullContent, "utf-8");
      json(res, { status: "ok", path: filePath });
    } catch (err) {
      json(res, { error: err.message }, 500);
    }
    return;
  }

  // --- API: Git publish ---
  if (req.method === "POST" && url.pathname === "/api/publish") {
    try {
      const body = await readBody(req);
      const { message } = JSON.parse(body.toString("utf-8") || "{}");
      const commitMsg = message || `📝 New blog post published at ${new Date().toISOString()}`;
      
      const opts = { cwd: PROJECT_ROOT, encoding: "utf-8", stdio: "pipe" };
      execSync("git add .", opts);
      execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, opts);
      const pushResult = execSync("git push", opts);
      
      json(res, { status: "ok", message: "Published successfully!", output: pushResult });
    } catch (err) {
      // git commit may fail if nothing to commit
      json(res, { error: err.message, stderr: err.stderr?.toString() }, 500);
    }
    return;
  }

  // --- 404 ---
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`\n  🚀 Blog Publisher is running at \x1b[36mhttp://localhost:${PORT}\x1b[0m\n`);
  console.log(`  Blog dir:  ${BLOG_DIR}`);
  console.log(`  Image dir: ${IMAGE_DIR}\n`);
});
