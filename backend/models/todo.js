const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
    task : String,
    completed : Boolean,
    checklistId : mongoose.ObjectId,
    userId : mongoose.ObjectId
});

const Todo = mongoose.model("Todo", TodoSchema);
module.exports = Todo;