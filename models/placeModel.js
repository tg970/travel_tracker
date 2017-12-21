const mongoose = require('mongoose');

const placeSchema = mongoose.Schema({
  place: {type: String, required: true},
  img:  {type: String, default: 'assets/default.jpg'},
  description:  String,
  beenThere: {type: Boolean, default: false},
  public: {type: Boolean, default: false},
  likes: {type: Number, default: 0},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Place', placeSchema);
