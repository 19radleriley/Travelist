var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
var mongoose = require("mongoose");

// Load our routes
var countryRouter = require('./routes/country');
var usersRouter = require('./routes/users');
var dummyRouter = require("./routes/dummy");

// Connecting to the database 
mongoose.connect("mongodb://127.0.0.1/Travelist");

var app = express();

// Set up the session management
let mongoSessionStore = new MongoDBStore({
  uri : "mongodb://127.0.0.1:27017",
  collection: "sessions"
});

app.use(session({
  secret: "9e253b06-6a93-48bf-92b3-a0f0d67338e9",
  resave: true, // Save session id to mongo store with every response 
  saveUninitialized: false, // Don't save to mongo if the session is empty
  cookie: {
    httpOnly: true, // Client doesn't need to access the cookie
    secure: false, // Aren't running https 
    sameSite: false, 
    maxAge: 1000 * 60 * 10 // 10 minute sessions
  },
  name: "sid", // Name of the cookie
  rolling: true, // Update the maxAge of cookie with every response 
  store: mongoSessionStore // Save session data in mongo
}));

// Default setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Link to our routes
let prefix = "/travelist/api/v1";
app.use(prefix, countryRouter);
app.use(prefix, usersRouter);
app.use("/dummy", dummyRouter);

// Return the html page at the end of get requests
// This keeps the page from indefinitely reloading
app.get("/*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
