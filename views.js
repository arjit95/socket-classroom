const express = require('express');
const router = express.Router();

router.get('/', (req, res) => req.session.token ? res.render('dashboard') : res.render('index'));
router.get('/index', (_, res) => res.redirect('/'));
router.get('/dashboard', (req, res) => req.session.token ? res.render('dashboard') : res.redirect('/'));

module.exports = router;