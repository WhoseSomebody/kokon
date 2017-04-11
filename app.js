const express = require('express');
// const fs = require('fs');
const routes = require('./routes/index');
const stylus = require('express-stylus');
const path = require('path');
const nib = require('nib');
const app = express();
const minify = require('express-minify');
// const https = require('https');
const publicDir = path.join(__dirname, '/public');
// const options = {
//    key  : fs.readFileSync('server.key'),
//    cert : fs.readFileSync('server.crt')
// };

app.set('views', __dirname + '/public/views');
app.set("view engine", "pug");

app.use(stylus({
    src: publicDir,
    use: [nib()],
    import: ['nib']
}));
app.use(express.static(publicDir, {maxAge: 604800000 }));
app.use(minify());
var https_redirect = function () {
  return function(req, res, next) {
    if (req.secure) {
      if(env === 'development') {
        return res.redirect('https://localhost:3000' + req.url);
      } else {
        return res.redirect('https://' + req.headers.host + req.url);
      }
    } else {
      return next();
    }
  };
};
app.use(https_redirect());
app.use('/', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Listening on " + port);
});

