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
    const userPlacesWant = updatingUser.placesWant
    userPlacesWant.push(req.params.placeId)
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, {$set: {placesWant: userPlacesWant}}, {new: true});
    res.status(200).json(updatedUser);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})

router.get('/addBeen/:userId/:placeId', async (req, res) => {
  try {
    const updatingUser = await User.findById(req.params.userId);
    const userPlacesBeen = updatingUser.placesBeen
    userPlacesBeen.push(req.params.placeId)
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, {$set: {placesBeen: userPlacesBeen}}, {new: true});
    res.status(200).json(updatedUser);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})

router.get('/removeWant/:userId/:placeId', async (req, res) => {
  try {
    const updatingUser = await User.findById(req.params.userId);
    const userPlacesWant = updatingUser.placesWant
    const removeIndex = userPlacesWant.findIndex(i => i === req.params.placeId)
    console.log('removeIndex Want:', removeIndex);
    userPlacesWant.splice(removeIndex, 1);
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, {$set: {placesWant: userPlacesWant}}, {new: true});
    res.status(200).json(updatedUser);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})

router.get('/removeBeen/:userId/:placeId', async (req, res) => {
  try {
    const updatingUser = await User.findById(req.params.userId);
    const userPlacesBeen = updatingUser.placesBeen
    const removeIndex = userPlacesBeen.findIndex(i => i === req.params.placeId)
    userPlacesBeen.splice(removeIndex, 1);
    console.log('removeIndex Want:', removeIndex);
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, {$set: {placesBeen: userPlacesBeen}}, {new: true});
    res.status(200).json(updatedUser);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})

module.exports = router;
