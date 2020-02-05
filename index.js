require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
var limits = {
  files: 1, // allow only 1 file per request
  fileSize: 1024 * 1024, // 1 MB (max file size)
  };
// multer middleware
const upload = multer({
  dest: path.join(__dirname, './public/images'),
  limits: limits
});
const handleError = (err, res) => {
  res
    .status(500)
    .contentType('text/plain')
    .end('Oops! Something went wrong!');
};
app.get('/', (req, res) => {
  const fp = path.join(__dirname, `./public/images/`);
  fs.readdir(fp, (err, contents) => {
    // unexpected error handler
    if (err) return handleError(err, res);
    console.log(contents);
    return res.render('index', { data: contents });
  });
});

app.get('/api/images/:image', (req, res) => {
  res.sendFile(path.join(__dirname, `./public/images/${req.params.image}`));
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    console.log(req.file.path);
    const filePath = req.file.path;
    const storagePath = path.join(
      __dirname,
      `./public/images/${req.file.originalname}`
    );
    if (
      path.extname(req.file.originalname).toLowerCase() === '.png' ||
      path.extname(req.file.originalname).toLowerCase() === '.jpg' ||
      path.extname(req.file.originalname).toLowerCase() === '.gif' ||
      path.extname(req.file.originalname).toLowerCase() === '.svg'
    ) {
      fs.rename(filePath, storagePath, err => {
        if (err) return handleError(err, res);

        console.log('File uploaded!');
        return res.redirect(`/api/images/${req.file.originalname}`);
      });
    } else {
      fs.unlink(filePath, err => {
        if (err) return handleError(err, res);

        return res
          .status(403)
          .contentType('text/plain')
          .end(
            'Please check file format. Only [.png, .jpg, .gif, .svg] files are allowed!'
          );
      });
    }
  } else {
    res
      .status(403)
      .contentType('text/plain')
      .end('Please select a file!');
  }
});

app.get('/delete/:image', async (req, res) => {
  console.log(req.params.image);
  const fp = path.join(__dirname, `./public/images/${req.params.image}`);
  await fs.unlink(fp, err => {
    // unexpected error handler
    if (err) return handleError(err, res);
    return console.log(`${req.params.image} was removed from the server.`);
  });
  res.redirect('/');
});

app.get('/test', (req, res) => {
  res.send('TEST route');
});

app.listen(app.get('port'), () => {
  console.log(`Node app is running at localhost: ${app.get('port')}`);
});
