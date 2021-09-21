const url = require('url');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const formidable = require('formidable');
const uniqid = require('uniqid');

const cats = require('../data/cats.json');
const breeds = require('../data/breeds.json');
const convert = require('../utils/convert');

module.exports = (req, res) => {
  const pathname = url.parse(req.url).pathname;

  if (pathname === '/cats/add-cat' && req.method === 'GET') {
    const filePath = path.normalize(
      path.join(__dirname, '../views/addCat.html')
    );
    const addCatRead = fs.createReadStream(filePath);
    const catBreedPlaceholder = breeds.map(
      (breed) => `<option value="${breed}">${breed}</option>`
    );
    addCatRead.on('data', (data) => {
      let chunk = data.toString();
      let replaced = chunk.replace(
        `{{catBreeds}}`,
        catBreedPlaceholder.join('')
      );
      res.write(replaced);
    });
    addCatRead.on('end', () => {
      res.end();
    });

    addCatRead.on('error', (err) => console.log(`ERR: ${err.message}`));
  } else if (pathname === '/cats/add-breed' && req.method === 'GET') {
    const filePath = path.normalize(
      path.join(__dirname, '../views/addBreed.html')
    );
    const addBreedRead = fs.createReadStream(filePath);
    addBreedRead.on('data', (data) => {
      res.write(data);
    });
    addBreedRead.on('end', () => {
      res.end();
    });
    addBreedRead.on('error', (err) => console.log(`ERR: ${err.message}`));
  } else if (pathname === '/cats/add-cat' && req.method === 'POST') {
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) throw err;
      const { name, description, breed } = fields;
      const { size, type, lastModified } = files.upload;
      const fileName = files.upload.name;
      const filePath = files.upload.path;
      const newPath = path.normalize(
        path.join(__dirname, '../', './content/images/', fileName)
      );
      fs.rename(filePath, newPath, (err) => {
        if (err) {
          console.error('ERR::' + err.message);
        }
        console.log('File was uploaded successfully!');
      });
      fs.readFile('./data/cats.json', (err, data) => {
        if (err) {
          return console.error(`ERR:: ${err.message}`);
        }
        let cats = JSON.parse(data);
        const catObj = {
          id: uniqid(),
          name,
          description,
          breed,
          image: fileName,
        };
        cats.push(catObj);
        let json = JSON.stringify(cats);
        fs.writeFile('./data/cats.json', json, (err) => {
          if (err) {
            return console.error(`ERR:: ${err.message}`);
          }
          console.log(`Cat added successfully`);
          res.writeHead(301, { Location: '/' });
          res.end();
        });
      });
    });
  } else if (pathname === '/cats/add-breed' && req.method === 'POST') {
    let formData = '';
    req.on('data', (data) => {
      formData += data;
    });
    req.on('end', () => {
      let body = qs.parse(formData);
      fs.readFile('./data/breeds.json', (err, data) => {
        if (err) {
          throw err.message;
        }
        let breeds = JSON.parse(data);
        breeds.push(body.breed);
        let json = JSON.stringify(breeds);
        fs.writeFile('./data/breeds.json', json, (err) => {
          if (err) {
            return console.error(`ERR: ${err.message}`);
          }
          console.log(`Breed added successfully!`);
        });
        res.writeHead(301, { Location: '/' });
        res.end();
      });
    });
  } else {
    return true;
  }
};
