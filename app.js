const express = require('express');
// const fs = require('fs');
const routes = require('./routes/index');
const stylus = require('express-stylus');
const path = require('path');
const nib = require('nib');
const app = express();
const minify = require('express-minify');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
// const https = require('https');
const publicDir = path.join(__dirname, '/public');
// const options = {
//    key  : fs.readFileSync('server.key'),
//    cert : fs.readFileSync('server.crt')
// };
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://CONNECTION_LINK");
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running. ✗');
  process.exit();
});

app.set('views', __dirname + '/public/views');
app.set("view engine", "pug");

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "kokonsecretkey"
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(stylus({
    src: publicDir,
    use: [nib()],
    import: ['nib']
}));
app.use(express.static(publicDir, {maxAge: 604800000 }));
app.use(minify());
app.use(function(req,resp,next){
    if (req.headers['x-forwarded-proto'] == 'http') {
        return resp.redirect(301, 'https://' + req.headers.host + '/');
    } else {
        return next();
    }
});
app.use('/', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Listening on " + port);
});

