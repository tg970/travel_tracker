const mongoose = require('mongoose');

const quoteSchema = mongoose.Schema({
  quoteText: {type: String, required: true},
  quoteAuthor: {type: String, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Quote', quoteSchema);
