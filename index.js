const http = require('http');
const port = 4444;
const handlers = require('./handlers');

// const url = require('url');
// const fs = require('fs/promises');
// const path = require('path');

http
  .createServer((req, res) => {
    for (let handler of handlers) {
      if (!handler(req, res)) {
        break;
      }
    }
  })
  .listen(port, () => {
    console.log(`Server   running on port ${port}....`);
  });
