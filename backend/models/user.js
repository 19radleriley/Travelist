const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username : String,
    email : String,
    password : String, // Make sure we hash and salt this 
    admin : Boolean,
    active : Boolean
});

const User = mongoose.model("User", UserSchema);
module.exports = User;

