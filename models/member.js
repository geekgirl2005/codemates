var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var MemberSchema = mongoose.Schema({
    username: String,
    password: String
});

MemberSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("Member", MemberSchema);