const fs = require('fs');
const url = require('url');

function getContentType(url) {
  if (url.endsWith('css')) {
    return 'text/css';
  } else if (url.endsWith('html')) {
    return 'text/html';
  } else if (url.endsWith('png')) {
    return 'image/png';
  } else if (url.endsWith('ico')) {
    return 'image/x-icon';
  } else if (url.endsWith('js')) {
    let type = 'text/javascript' || 'application/javascript';
    return type;
  }
}

module.exports = (req, res) => {
  const pathname = url.parse(req.url).pathname;
  if (pathname.startsWith('/content') && req.method === 'GET') {
    fs.readFile(`./${pathname}`, 'utf-8', (err, data) => {
      if (err) {
        console.error(`ERR: ${err.message}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('Error was found!');
        res.end();
        return;
      }
      // console.log(pathname);
      let code = 301 || 200;
      console.log(code);
      res.writeHead(code, { 'Content-Type': getContentType(pathname) });
      res.write(data);
      res.end();
      return;
    });
  } else {
    return true;
  }
};
