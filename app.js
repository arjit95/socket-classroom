const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');

const session = require('express-session');
const config = require('./config.json');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const MemoryStore = require('memorystore')(session);
const sessionStore = new MemoryStore();
const port = 3000;

app.use('/static', express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(cookieParser(config.cookie_secret));
app.use(session({
    secret: config.session_secret,
    resave: true,
    store: sessionStore,
    saveUninitialized: false,
    secret: config.cookie_secret
}));
app.use(function (req, res, next) {
    req.io = io;
    next();
});


io.use(function(socket, next) {
    const data = socket.handshake || socket.request;
    const COOKIE_NAME = 'connect.sid';
  
    if ( !data.headers.cookie ) {
        return next(new Error('Missing cookie headers'));
    }
  
    const cookies = cookie.parse(data.headers.cookie);
    if ( !cookies[COOKIE_NAME] ) {
        return next(new Error('Missing cookie ' + COOKIE_NAME));
    }
  
    const sid = cookieParser.signedCookie(cookies[COOKIE_NAME], config.cookie_secret);
    if ( !sid ) {
        return next(new Error('Cookie signature is not valid'));
    }
  
    data.sid = sid;
    sessionStore.get(sid, function(err, session) {
        if (err) return next(err);
        if (! session) return next(new Error('session not found'));
        data.session = session;
        next();
    });
});

io.on('connect', (socket) => {
    socket.on('subscribe', function (roomID) {
        io.emit(roomID, {command: 'refresh'}); // update list when new user is added

        socket.on(roomID, (payload) => io.emit(roomID, payload));
        socket.on('disconnect', () => socket.emit(roomID, {command: 'refresh'}));
    })
});

const rooms = require('./api/rooms');
const users = require('./api/users');
const views = require('./views');

app.use('/', views);
app.use('/api/rooms', rooms);
app.use('/api/users', users);

http.listen(port, (err) => {
    if (err) {
        return console.error(err);
    }

    console.log(`App running successfully on ${port}`);
})