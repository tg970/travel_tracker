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
    let user = await User.findById(req.params.id);
    const myPlaces = { beenTo: [], wantTo: [] };
    let saveUser = false;
    //console.log(user);
    for (let i = 0; i < user.placesBeen.length; i++ ) {
      let place = await Place.findById(user.placesBeen[i]).populate('user', 'username');;
      if (place) {
        myPlaces.beenTo.unshift(place)
      } else {
        user.placesBeen.splice(i,1)
        saveUser = true;
      }
    }
    for (let i = 0; i < user.placesWant.length; i++ ) {
      let place = await Place.findById(user.placesWant[i]).populate('user', 'username');;
      if (place) {
        myPlaces.wantTo.unshift(place)
      } else {
        user.placesWant.splice(i,1)
        saveUser = true
      }
    }
    if (saveUser) {
      user = await User.findByIdAndUpdate(req.params.id, user, {new: true})
    }
    //console.log({ user, myPlaces });
    res.status(200).json({ user, myPlaces });
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
    req.session.user = user;
    res.status(200).json(updatedUser);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    await Place.remove({ user: user._id });
    req.session.destroy()
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
    const removeIndex = userPlacesWant.findIndex(i => i == req.params.placeId)
    console.log('removeIndex Want:', removeIndex);
    if (removeIndex >= 0) {
      userPlacesWant.splice(removeIndex, 1)
      console.log('splice true');
    } else {
      console.log('splice false');
    };
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
    const removeIndex = userPlacesBeen.findIndex(i => i == req.params.placeId)
    if (removeIndex >= 0) {
      userPlacesBeen.splice(removeIndex, 1)
      console.log('splice true');
    } else {
      console.log('splice false');
    };
    //console.log('removeIndex Been:', removeIndex);
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, {$set: {placesBeen: userPlacesBeen}}, {new: true});
    res.status(200).json(updatedUser);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})

module.exports = router;
