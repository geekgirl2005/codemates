var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
    name: String,
    about: String,
    gender: String,
    room: String,
    bathroom: String,
    budget: String,
    commute: String,
    comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("User", userSchema);