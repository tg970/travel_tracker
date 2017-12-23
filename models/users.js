const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  first: { type: String, required: true },
  last: { type: String },
  pic: { type: String, default: 'assets/default_user.png'},
  email: { type: String },
  placesWant : [{type: mongoose.Schema.Types.ObjectId, ref: 'Place'}],
  placesBeen : [{type: mongoose.Schema.Types.ObjectId, ref: 'Place'}],
  likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Place'}]
}, { timestamps: true });

userSchema.pre('save', function(next) {
   if (this.isModified('password')) {
      const hashedPass = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
      this.password = hashedPass;
   }
   next();
});

// Method to Authenticate Password
userSchema.methods.auth = function (password) {
   // compare password to the bcrypt password
   return bcrypt.compareSync(password, this.password); // t or f
}

module.exports = mongoose.model('User', userSchema);
