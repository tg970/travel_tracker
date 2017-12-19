const express = require('express');
const router  = express.Router();

const User = require('../models/users.js');

router.get('/', async (req, res) => {
  //console.log('req.session firing')
  try {
    await console.log(req.session);
    res.status(200).json({user: req.session.user});
  } catch (err) {
    res.status(400).json({ seshErr: err.message });
  }
});

router.post('/login', async (req, res) => {
   try {
     const user = await User.findOne({ username: req.body.username });
     //console.log('userFound:', user);
     if (user.auth(req.body.password)) {
       //console.log('userAuth true');
       req.session.user = user;
       //req.session.logged = true;
       //console.log('sessionControlr:', req.session);
       res.status(200).json(user);
     } else {
       res.status(403).json({ err: 'Password does not match what we have...' })
     }
   } catch (err) {
     res.status(400).json({ err: err.message });
   }
});

router.delete('/logout', (req, res) => {
  console.log('session to destroy: ', req.session);
  req.session.destroy(() => {
    console.log('session has been destroyed ... ');
    res.status(200).json({ message: 'Session destroyed'});
  });
});

module.exports = router;
