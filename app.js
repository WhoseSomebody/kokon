const express = require('express');
const routes = require('./routes/index');
const stylus = require('express-stylus');
const path = require('path');
const nib = require('nib');
const app = express();
const https = require('https');
const publicDir = path.join(__dirname, '/public');
const options = {
   key  : fs.readFileSync('server.key'),
   cert : fs.readFileSync('server.crt')
};

app.set('views', __dirname + '/public/views');
app.set("view engine", "pug");

app.use(stylus({
    src: publicDir,
    use: [nib()],
    import: ['nib']
}));

app.use(express.static(publicDir, {maxAge: 604800000 }));
app.use('/', routes);

const port = process.env.PORT || 3000;
https.createServer(options, app).listen(port, () => {
    console.log("Listening on " + port);
});

