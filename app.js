const express = require('express');
const routes = require('./routes/index');
const stylus = require('express-stylus');
const path = require('path');
const nib = require('nib');
const app = express();
const publicDir = path.join(__dirname, '/public');

app.set('views', __dirname + '/public/views');
app.set("view engine", "pug");

app.use(stylus({
    src: publicDir,
    use: [nib()],
    import: ['nib']
}));

app.use(express.static(publicDir));
app.use('/', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Listening on " + port);
});

