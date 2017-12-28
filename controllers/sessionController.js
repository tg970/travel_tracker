const express = require('express');
const router  = express.Router();

const User = require('../models/users.js');

router.get('/', (req, res) => {
  try {
    res.status(200).json({user: req.session.user});
  } catch (err) {
    res.status(400).json({ seshErr: err.message });
  }
});

router.post('/login', async (req, res) => {
   try {
     const userFromDB = await User.findOne({ username: req.body.username });
     if (userFromDB.auth(req.body.password)) {
       let user = {};
       user._id = userFromDB._id;
       user.username = userFromDB.username;
       user.first = userFromDB.first;
       user.last = userFromDB.last;
       user.likes = userFromDB.likes;
       user.placesBeen = userFromDB.placesBeen;
       user.placesWant = userFromDB.placesWant;
       user.pic = userFromDB.pic;
       req.session.user = user;
       res.status(200).json(user);
     } else {
       res.status(403).json({ err: 'Password does not match what we have...' })
     }
   } catch (err) {
     console.log(err);
     res.status(400).json({ err: err.message });
   }
});

router.delete('/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: 'Session destroyed'});
  });
});

module.exports = router;
