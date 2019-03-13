const express = require('express');
const router = express.Router();

router.get('/', (req, res) => req.session.token ? res.render('dashboard') : res.render('index'));
router.get('/index', (_, res) => res.redirect('/'));
router.get('/dashboard', (req, res) => {
    if (req.session.token) {
        return res.render('dashboard', {roomId: req.session.roomId});
    }

    res.redirect('/api/users/logout');
});

module.exports = router;