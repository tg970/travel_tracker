const express = require('express');
const router = express.Router();

const User   = require('../models/users.js');
const Place   = require('../models/placeModel.js');

router.get('/', async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const places = await Place.find({ user: user._id });
    res.status(200).json({ user, places });
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    req.session.user = user;
    res.status(201).json(user);
  } catch (err) {
    //console.log(err);
    res.status(400).json({ err: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.status(200).json(updatedUser);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    await Place.remove({ user: user.id });
    res.status(200).json({ message: 'User and Places Removed' });
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: err.message });
  }
  //res.send('delete route running')
});

router.get('/addWant/:userId/:placeId', async (req, res) => {
  try {
    const updatingUser = await User.findById(req.params.userId);
    console.log('updatingUser:',updatingUser);
    const userPlacesWant = updatingUser.placesWant
    console.log('userPlacesWant before:',userPlacesWant);
    userPlacesWant.push(req.params.placeId)
    console.log('userPlacesWant after:',userPlacesWant);
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, {$set: {placesWant: userPlacesWant}}, {new: true});
    console.log('updatedUser',updatedUser);
    res.status(200).json(updatedUser);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})

module.exports = router;
