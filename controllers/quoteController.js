const express = require('express');
const router = express.Router();
const request = require('request');

const Quote = require('../models/quoteModel.js');
const QuoteArr = require('../data/quotes.js');

// CREATE
router.post('/', async (req, res) => {
  try {
    const newQuote = await Quote.create(req.body);
    res.status(200).json(newQuote);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
});

// Commented out for deployment
// router.get('/seed', async (req, res) => {
//   try {
//     for (let quote of QuoteArr) {
//       const newQuote = await Quote.create(quote);
//     }
//     const allQuotes = await Quote.find();
//     res.status(200).json(allQuotes);
//   } catch (e) {
//     console.log(e);
//     res.status(400).json({err: e.message});
//   }
// });

// READ
router.get('/', async (req, res) => {
  try {
    const allQuotes = await Quote.find();
    let randNum = Math.floor(Math.random()*allQuotes.length)
    let randQuote = allQuotes[randNum]
    res.status(200).json(randQuote);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
});


// API Route....JSON parse fails every 1 in 5ish
// Maybe there's a better way to parse? Want to keep incase we need it on next project.
// router.get('/seedApi', async (req, res) => {
//   try {
//     request('https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en', (error, response, body) => {
//       //console.log('error:', error);
//       console.log('apiStatusCode:', response.statusCode);
//       console.log('body:', body);
//       let json = JSON.parse(body);
//       res.status(200).send(json);
//       //const newQuote = await Quote.create(json);
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(400).json({err: e.message});
//   }
// });

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updatedQuote = await Quote.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.status(200).json(updatedQuote);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deletedQuote = await Quote.findByIdAndRemove(req.params.id);
    res.status(200).json(deletedQuote);
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
})


module.exports = router;
