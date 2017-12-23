const express = require('express');
const router = express.Router();

const User   = require('../models/users.js');
const Place   = require('../models/placeModel.js');

//Comment out for deployment...need to keep for additional dev
router.get('/', async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

router.get('/:id', async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    const myPlaces = { beenTo: [], wantTo: [] };
    let saveUser = false;
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
    const updatingUser = await User.findById(req.params.id);
    if (updatingUser.auth(req.body.password)) {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
      req.session.user = user;
      res.status(200).json(updatedUser);
    } else {
      res.status(403).json({ err: 'forbiden'})
    };
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const updatingUser = await User.findById(req.params.id);
    if (updatingUser.auth(req.body.password)) {
      const deletedUser = await User.findByIdAndRemove(req.params.id);
      await Place.remove({ user: deletedUser._id });
      req.session.destroy()
      res.status(200).json({ message: 'User and Places Removed' });
    } else {
      res.status(403).json({ err: 'forbiden'})
    };
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: err.message });
  }
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
    if (removeIndex >= 0) {
      userPlacesWant.splice(removeIndex, 1)
    }
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
});

router.post('/addLike/:userId/:placeId', async (req, res) => {
  try {
    const updatingUser = await User.findById(req.params.userId);
    if (updatingUser) {
      const userPlacesLiked = updatingUser.likes;
      userPlacesLiked.push(req.params.placeId);
      const updatedUser = await User.findByIdAndUpdate(req.params.userId, {$set: {likes: userPlacesLiked}}, {new: true});
      const updatePlace = await Place.findByIdAndUpdate(req.params.placeId, {$inc: {likes: +1}}, {new: true}).populate('user', 'username');
      res.status(200).json({ user: updatedUser, place: updatePlace});
    } else {
      res.status(400).json({ login: true });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
});

router.put('/removeLike/:userId/:placeId', async (req, res) => {
  try {
    const updatingUser = await User.findById(req.params.userId);
    const userPlacesLiked = updatingUser.likes;
    const removeIndex = userPlacesLiked.findIndex(i => i == req.params.placeId)
    if (removeIndex >= 0) {
      userPlacesLiked.splice(removeIndex, 1)
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, {$set: {likes: userPlacesLiked}}, {new: true});
    const updatePlace = await Place.findByIdAndUpdate(req.params.placeId, {$inc: {likes: -1}}, {new: true}).populate('user', 'username');
    res.status(200).json({ user: updatedUser, place: updatePlace});
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
});


module.exports = router;
