const express = require('express');
const router = express.Router();

const Place = require('../models/placeModel.js');
const User = require('../models/users.js');


//ALL PLACES
// router.get('/', async (req, res) => {
//   try {
//     const allPlaces = await Place.find() //.populate('user');
//     res.status(200).json(allPlaces);
//   } catch (e) {
//     console.log(e);
//     res.status(400).json({err: e.message});
//   }
// });

//ALL PUBLIC PLACES (Dupl route, needs new URI)
router.get('/', async (req, res) => {
  try {
    const publicPlaces = await Place.find({public: true}) //.populate('user');
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
    console.log(user);
    const beenToArr = { data: []}
    for (let i = 0; i < user.placesBeen.length; i++ ) {
      let place = await Place.findById(user.placesBeen[i]);
      if (place) {
        beenToArr.data.unshift(place)
      } else {
        user.placesBeen.splice(i,1)
        saveUser = true;
        console.log('user save');
      }
    }
    //const userBeenToPlaces = await Place.find(  ); //{$and [ {user: loggedUser._id}, {beenTo: true} ] }
    console.log(beenToArr);
    res.status(200).json(beenToArr);
  } catch (e) {
    console.log(e);
    res.status(200).json({err: e.message});
  }
});

//USER NOT BEEN-TO PLACES
router.get('/userNotBeen', async (req, res) => {
  try {
    const loggedUser = await User.find({username: req.session.username});
    const userBeenToPlaces = await Place.find( ); // {$and [ {user: loggedUser._id}, {beenTo: false} ] }
    res.status(200).json(userBeenToPlaces);
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
    const updatedPlace = await Place.findByIdAndUpdate(req.params.id, req.body, {new: true}); // moved one paren
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
