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
        let modifiedCats = cats.map((cat) => {
          const imgSrc = path.join('./content/images/', cat.image);
          return `<li>
          <img
            src="${imgSrc}"
            alt="${cat.name}"
          />
          <h3>${cat.name}</h3>
          <p><span>Breed: </span>${cat.breed}</p>
          <p>
            <span>Description: </span>${cat.description}
          </p>
          <ul class="buttons">
            <li class="btn edit"><a href="/cats-edit/${cat.id}">Change Info</a></li>
            <li class="btn delete"><a href="/cats-find-new-home/${cat.id}">New Home</a></li>
          </ul>
        </li>`;
        });
        let modifiedData = data
          .toString()
          .replace('{{cats}}', modifiedCats.join(''));
        res.writeHead(200, 'Success', { 'Content-Type': 'text/html' });
        res.write(modifiedData);
        res.end();
      }
    });
  } else {
    return true;
  }
};
