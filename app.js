const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const config = require('./config.json');

const app = express();
const port = 3000;

app.use('/static', express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: config.session_secret,
    resave: true,
    saveUninitialized: false
}));

const rooms = require('./api/rooms');
const users = require('./api/users');
const views = require('./views');

app.use('/', views);
app.use('/api/rooms', rooms);
app.use('/api/users', users);

app.listen(port, (err) => {
    if (err) {
        return console.error(err);
    }

    console.log(`App running successfully on ${port}`);
})