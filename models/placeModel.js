const mongoose = require('mongoose');

const placeSchema = mongoose.Schema({
  place: {type: String, required: true},
  img:  {type: String, default: "https://i.imgur.com/ngbdJZi.jpg"},
  description:  String,
  beenThere: {type: Boolean, required: true},
  public: {type: Boolean, required: true},
  likes: {type: Number, default: 0},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Place', placeSchema);
