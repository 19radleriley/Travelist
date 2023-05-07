const mongoose = require("mongoose");

const CountrySchema = new mongoose.Schema({
    userId : mongoose.ObjectId,
    name : String,
    flagLink : String,
    visited : Boolean,
});

const Country = mongoose.model("Country", CountrySchema);
module.exports = Country;