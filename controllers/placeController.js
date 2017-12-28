const express = require('express');
const router = express.Router();

const Place = require('../models/placeModel.js');
const User = require('../models/users.js');


//ALL PUBLIC PLACES (Dupl route, needs new URI)
router.get('/', async (req, res) => {
  try {
    const publicPlaces = await Place.find({public: true}).populate('user', 'username');
    res.status(200).json(publicPlaces);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
});

//USER PLACES
router.get('/byUser', async (req, res) => {
  try {
    const loggedUser = await User.find({username: req.session.username});
    const userPlaces = await Place.find({user: loggedUser._id});
    res.status(200).json(userPlaces);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
});

//USER BEEN-TO PLACES
router.get('/beenTo/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const beenToArr = { arr: []}
    for (let i = 0; i < user.placesBeen.length; i++ ) {
      let place = await Place.findById(user.placesBeen[i]).populate('user', 'username');
      if (place) {
        beenToArr.arr.unshift(place)
      } else {
        user.placesBeen.splice(i,1)
        saveUser = true;
        console.log('user save');
      }
    }
    res.status(200).json(beenToArr);
  } catch (e) {
    console.log(e);
    res.status(200).json({err: e.message});
  }
});

//USER NOT Want-TO PLACES
router.get('/wantTo/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const wantToArr = { arr: []}
    for (let i = 0; i < user.placesWant.length; i++ ) {
      let place = await Place.findById(user.placesWant[i]).populate('user', 'username');
      wantToArr.arr.unshift(place)
    }
    res.status(200).json(wantToArr);
  } catch (e) {
    console.log(e);
    res.status(200).json({err: e.message});
  }
});


//CREATE
router.post('/', async (req, res) => {
  try {
    const newPlace = await Place.create(req.body);
    res.status(200).json(newPlace);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
});

//EDIT
router.put('/:id', async (req, res) => {
  try {
    if (req.body.img === '') req.body.img = 'assets/default.jpg'
    const updatedPlace = await Place.findByIdAndUpdate(req.params.id, req.body, {new: true}).populate('user', 'username');
    res.status(200).json(updatedPlace);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})

//DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deletedPlace = await Place.findByIdAndRemove(req.params.id);
    res.status(200).json(deletedPlace);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})

module.exports = router; // need to export the router
