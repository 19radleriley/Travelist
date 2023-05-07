var express = require('express');
var router = express.Router();

const Country = require("../models/country");
const Todo = require('../models/todo');
const User = require("../models/user");

// router.get("/users", (req, res, next) => {
//     User.collection.drop();
//     var users = [
//         {
//             username : "seneca",
//             email : "seneca@philosophers.com",
//             password : "123"
//         },
//         // {
//         //     username : "aristotle",
//         //     email : "aristotle@philosophers.com",
//         //     password : "123"
//         // },
//         // {
//         //     username : "socrates",
//         //     email : "socrates@philosophers.com",
//         //     password : "123"
//         // },
//     ];
//     User.insertMany(users, (err, userList) => {
//         if (err) {
//             console.log("Hit an error inserting users");
//             res.status(500).send();
//         }
//         else {
//             res.json(userList);
//         }
//     });
// });

// router.get("/countries", (req, res, next) => {
//     console.log("I happen");
//     Country.collection.drop();

//     User.find({}, (err, users) => {
//         if (err) {
//             console.log("Hit an error getting users");
//             res.status(500).send();
//         }
//         else {
//             let countries = [
//                 {
//                     userId : users[0]._id,
//                     name : "ukraine",
//                     capital : "Kyiv",
//                     continent : "Europe",
//                     flagLink : "https://flagcdn.com/w320/ua.png", 
//                     latitude : 49,
//                     longitude : 32,
//                     zoom : 5,
//                     languages : ["Ukrainian", "Russian", "English"],
//                     links : [],
//                     visited : false,
//                     checklists : []
//                 },
//                 {
//                     userId : users[0]._id,
//                     flagLink : "https://flagcdn.com/w320/at.png", 
//                     name : "austria",
//                     latitude : 47.333,
//                     longitude : 13.333,
//                     zoom : 5,
//                     capital : "Vienna",
//                     continent : "Europe",
//                     languages : ["German", "English"],
//                     links : [],
//                     visited : false,
//                     checklists : []
//                 },
//                 {
//                     userId : users[0]._id,
//                     flagLink : "https://flagcdn.com/w320/ca.png", 
//                     name : "canada",
//                     latitude : 60,
//                     longitude : -95,
//                     zoom : 5,
//                     capital : "Ottawa",
//                     continent : "Europe",
//                     languages : ["English", "French"],
//                     links : [],
//                     visited : true,
//                     notes : []
//                 },
//                 {
//                     userId : users[0]._id,
//                     flagLink : "https://flagcdn.com/w320/it.png", 
//                     name : "italy",
//                     latitude : 42.83,
//                     longitude : 12.83,
//                     zoom : 5,
//                     capital : "Rome",
//                     continent : "europe",
//                     languages : ["Italian", "English"],
//                     links : [],
//                     visited : true,
//                     checklists : []
//                 },
//             ];

//             console.log(countries);

//             Country.insertMany(countries, (countriesErr, countryList) => {
//                 if (countriesErr) {
//                     res.status(500).send("Failed to insert dummy countries");
//                 }
//                 else {
//                     res.json(countryList);
//                 }
//             });
//         }
//     });
// });

// router.get("/", (req, res, next) => {
//     Todo.collection.drop();
//     User.find({}, (err, users) => {
//         if (err) {
//             res.status(500).send("Failed to get users in dummy/todos")
//         }
//         else {
//             let todos = [
//                 {
//                     title : "Vienna",
//                     description : "I am too poor to visit this city.",
//                     userId : users[0]._id
//                 },
//                 {
//                     title : "Lviv", 
//                     description : "I am too scared to visit this city (right now, fuck Putin).",
//                     userId : users[0]._id
//                 }
//             ]

//             Todo.insertMany(todos, (todoErr, todoList) => {
//                 if (todoErr) {
//                     res.status(500).send("Failed to create and insert dummy todos");
//                 }
//                 else {
//                     res.json(todoList);
//                 }
//             });
//         }
//     })
// });

module.exports = router;