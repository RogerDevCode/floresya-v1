const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const PORT = 3001

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
}

const server = http.createServer((req, res) => {
  // Parse URL
  const parsedUrl = url.parse(req.url)
  let pathname = parsedUrl.pathname

  // Default to index.html
  if (pathname === '/') {
    pathname = '/public/index.html'
  }

  // Get file path
  const filePath = path.join(__dirname, pathname)

  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase()
  const mimeType = mimeTypes[extname] || 'application/octet-stream'

  // Read file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end('<h1>404 Not Found</h1>', 'utf-8')
      } else {
        // Server error
        res.writeHead(500)
        res.end(`Server Error: ${error.code}`, 'utf-8')
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': mimeType })
      res.end(content, 'utf-8')
    }
  })
})

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}/`)
  console.log('Serving files from public directory')
})

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down test server...')
  server.close(() => {
    console.log('Server closed.')
    process.exit(0)
  })
})

module.exports = server
