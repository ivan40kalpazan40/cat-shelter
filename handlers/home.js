const url = require('url');
const fs = require('fs');
const path = require('path');

const cats = require('../data/cats.json');

module.exports = (req, res) => {
  // pathname
  const pathname = url.parse(req.url).pathname;
  if (pathname === '/' && req.method === 'GET') {
    // logic for showing the index html page
    let filePath = path.normalize(
      path.join(__dirname, '../views/home/index.html')
    );
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log(`ERR: ${err}`);
        res.writeHead(404, 'Status 404. Not Found', {
          'Content-Type': 'text/plain',
        });
        res.write('Not Found');
        res.end();
      } else {
        res.writeHead(200, 'Success', { 'Content-Type': 'text/html' });
        res.write(data);
        res.end();
      }
    });
  } else {
    return true;
  }
};
