var mongoose = require("mongoose");

const ChecklistSchema = new mongoose.Schema({
    title : String,
    description : String,
    cName : String,
    flagLink : String,
    userId : mongoose.ObjectId,
});

const Checklist = mongoose.model("Checklist", ChecklistSchema);
module.exports = Checklist;