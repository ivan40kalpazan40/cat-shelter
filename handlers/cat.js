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
  } else if (
    pathname.includes('/cats-edit') &&
    req.method.toLowerCase() === 'get'
  ) {
    // get the cat ID
    const link = url.parse(req.url);
    const {
      protocol,
      slashes,
      auth,
      host,
      port,
      hostname,
      hash,
      search,
      query,
      path,
      href,
    } = link;

    const catId = path.split('/').reverse()[0];
    // Search in cats.json with that ID
    const foundCat = cats.find((cat) => cat.id === catId);

    // populate the editCat.html template with the found cat info
    const readFile = fs.createReadStream(`./views/editCat.html`, {
      encoding: 'utf-8',
    });
    readFile.on('data', (data) => {
      let modifiedData = data.toString().replace(`{{id}}`, foundCat.id);
      modifiedData = modifiedData.replace(`{{name}}`, foundCat.name);
      modifiedData = modifiedData.replace(
        `{{description}}`,
        foundCat.description
      );
      const breedsAsOptions = breeds.map((b) => {
        if (b === foundCat.breed) {
          return `<option value="${b}" selected>${b}</option>`;
        }
        return `<option value="${b}">${b}</option>`;
      });
      modifiedData = modifiedData.replace(
        '{{catBreeds}}',
        breedsAsOptions.join('')
      );
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(modifiedData);
    });

    readFile.on('end', () => {
      res.end();
    });
  } else if (pathname.includes('/cats-find-new-home') && req.method === 'GET') {
    // get the cat ID
    const link = url.parse(req.url);
    const {
      protocol,
      slashes,
      auth,
      host,
      port,
      hostname,
      hash,
      search,
      query,
      path,
      href,
    } = link;

    const catId = path.split('/').reverse()[0];
    // Get the corresponding cat object for that ID
    const foundCat = cats.find((cat) => cat.id === catId);

    const readCat = fs.createReadStream('./views/catShelter.html', {
      encoding: 'utf-8',
    });
    readCat.on('data', (data) => {
      let modifiedData = data.toString().replace(`{{id}}`, foundCat.id);
      modifiedData = modifiedData.replace(`{{image}}`, foundCat.image);
      modifiedData = modifiedData.replace(`{{name}}`, foundCat.name);
      modifiedData = modifiedData.replace(`{{name}}`, foundCat.name);
      modifiedData = modifiedData.replace(
        `{{description}}`,
        foundCat.description
      );
      modifiedData = modifiedData.replace(`{{breed}}`, foundCat.breed);
      modifiedData = modifiedData.replace(`{{breed}}`, foundCat.breed);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(modifiedData);
    });
    readCat.on('end', () => {
      res.end();
    });
  } else if (
    pathname.includes('/cats-edit') &&
    req.method.toLowerCase() === 'post'
  ) {
    // get data from form
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        return console.error(`ERR:: ${err.message}`);
      }
      const { name, description, breed } = fields;
      const { size, type, lastModified } = files.upload;
      const filePath = files.upload.path;
      const fileName = files.upload.name;

      const newPath = path.normalize(
        path.join(__dirname, '../', './content/images/', fileName)
      );

      fs.rename(filePath, newPath, (err) => {
        if (err) {
          console.error(`ERR: ${err.message}`);
        } else {
          console.log(`The file -> ${fileName} <-- was successfully uploaded!`);
        }
      });
      // find cat in JSON with same id
      fs.readFile('./data/cats.json', (err, data) => {
        if (err) {
          return console.error(`ERR:: ${err.message}`);
        }

        let cats = JSON.parse(data);
        const catId = req.url.split('/').reverse()[0];
        const catObj = {
          id: catId,
          name,
          description,
          breed,
          image: fileName,
        };
        // update JSON
        let foundCat = cats.find((cat) => cat.id === catId);
        let foundIndex = cats.indexOf(foundCat);
        cats.splice(foundIndex, 1, catObj);
        let json = JSON.stringify(cats);
        fs.writeFile('./data/cats.json', json, (err) => {
          if (err) {
            return console.error(`ERR:: ${err.message}`);
          }
          console.log(`Cat updated successfully`);
          // redirect to Home
          res.writeHead(300, {
            Location: '/',
            'Content-Type': 'application/json',
          });
          res.end();
        });
      });
    });
  } else if (
    pathname.includes('/cats-find-new-home') &&
    req.method.toLowerCase() === 'post'
  ) {
    fs.readFile('./data/cats.json', (err, data) => {
      if (err) {
        return console.error(`ERR: ${err.message}`);
      }
      let cats = JSON.parse(data);
      const catId = req.url.split('/').reverse()[0];
      let foundCat = cats.find((cat) => cat.id === catId);
      const catIndex = cats.indexOf(foundCat);
      cats.splice(catIndex, 1);
      const json = JSON.stringify(cats);
      console.log(json);
      fs.writeFile('./data/cats.json', json, (err) => {
        if (err) {
          return console.error(`ERR:: ${err.message}`);
        }
        console.log(
          `The cat named ${foundCat.name} found shelter. Happy days in your new home, ${foundCat.name}!`
        );
        res.writeHead(301, {
          Location: '/',
          'Content-Type': 'application/json',
        });
        res.end();
      });
    });
  } else {
    return true;
  }
};
