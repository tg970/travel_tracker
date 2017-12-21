const express = require('express');
const router = express.Router();
const request = require('request');

const Quote = require('../models/quoteModel.js');

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

// READ
router.get('/', async (req, res) => {
  try {
    request('https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en', (error, response, body) => {
      //console.log('error:', error);
      console.log('apiStatusCode:', response.statusCode);
      console.log('body:', body);
      let json = JSON.parse(body)
      res.status(200).send(json);
    })
  } catch (e) {
    console.log(e);
    res.status(400).json({err: e.message});
  }
});

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
