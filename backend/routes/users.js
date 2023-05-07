var express = require('express');
var router = express.Router();
var User = require("../models/user");
var uuid = require("uuid");
const Country = require('../models/country');
const Todo = require('../models/todo');
const Checklist = require('../models/checklist');
const bcrypt = require("bcrypt");

/*
 * Default callback that checks for an error,
 * or null data and responds accordingly
 */
function defaultCB(res) {
    return (err, responseData) => {
        if (err) {
            res.status(500).send(err);
        }
        else if (responseData == null || responseData == undefined) {
            res.status(404).send({ msg: "Not Found" });
        }
        else {
            res.json(responseData);
        }
    }
}

/*
 * This is a function that echoes back 
 * the current user that is logged in
 * Remove the password before sending it back
 */
router.get("/whoami", (req, res, next) => {
  if (req.session.user) {
    let nopswd = {
      username : req.session.user.username,
      email : req.session.user.email,
      admin : req.session.user.admin,
      active : req.session.user.active,
      _id : req.session.user._id
    }
    res.status(200).send(nopswd);
  }
  else {
    res.status(204).send();
  }
});

// Function used to insert admin into the system
router.get("/create-admin", (req, res, next) => {
  let admin = new User({
    username : "admin-riley-radle",
    email : "radle2279@uwlax.edu",
    password : bcrypt.hashSync("Pantherbball11", 5),
    admin : true,
    active : true
  });
  admin.save();
  res.json(admin);
});

/*
 * This function allows a user to update their
 * own information (username, email, and password)
 */
router.put("/users/:uid", (req, res, next) => {
  validateUser(req, res, () => {
    let updatingPass = req.body.password == "" ? false : true;
    validCredentials(req, res, updatingPass, () => {
      User.findOne({_id : req.params.uid}, (err, user) => {
        if (err) {
          res.status(500).send(err);
        }
        else {
          if (updatingPass) {
            user.password = req.body.password;
          }
          user.email = req.body.email;
          user.username = req.body.username;
          user.save();

          let noPswdUser = {
            _id : user._id,
            username : user.username,
            email : user.email,
            admin : user.admin,
            active : user.active
          }

          res.json(noPswdUser);
        }
      });
    });
  });
});

/*
 * This is an admin endpoint that allows the 
 * admin to get a list of users
 */
router.get("/admins/:aid/users", (req, res, next) => {
  validate(req, res, () => {
    User.find({}, (err, users) => {
      if (err) {
        res.status(500).json(err);
      }
      else {
        res.json(
          users.filter(user => user._id != req.params.aid)
        );
      }
    });
  });
});

/*
 * This is an admin endpoint that allows 
 * for the admin to create a new user
 */
router.post("/admins/:aid/users", (req, res, next) => {
  validate(req, res, () => {
    validCredentials(req, res, true, () => {
      let user = new User({
        username : req.body.username,
        email : req.body.email,
        password : bcrypt.hashSync(req.body.password, 10),
        admin : req.body.admin,
        active : req.body.active
      });
      user.save();
      let noPswdUser = {
        _id : user._id,
        username : user.username,
        email : user.email,
        admin : Boolean(user.admin),
        active : Boolean(user.active)
      }
      res.json(noPswdUser);
    });
  });
});

/*
 * This is an admin endpoint that allows for 
 * the admin to delete a specific user.
 */
router.delete("/admins/:aid/users/:uid", (req, res, next) => {
  validate(req, res, () => {
    deleteUser(req, res);
  });
});

/*
 * This is an admin endpoint that allows the admin 
 * to update a specific user's information 
 */
router.put("/admins/:aid/users/:uid", (req, res, next) => {
  validate(req, res, () => {
    let updatingPass = req.body.password == "" ? false : true;
    validCredentials(req, res, updatingPass, () => {
      User.findOne({_id : req.params.uid}, (err, user) => {
        if (err) {
          res.status(500).send(err);
        }
        else {
          if (updatingPass) {
            user.password = req.body.password;
          }
          user.email = req.body.email;
          user.username = req.body.username;
          user.active = req.body.active;
          user.admin = req.body.admin;
          user.save();

          let noPswdUser = {
            _id : user._id,
            username : user.username,
            email : user.email,
            admin : user.admin,
            active : user.active
          }

          res.json(noPswdUser);
        }
      });
    });
  });
})

router.post("/register", (req, res, next) => {
  // Do some validity checking 
  validCredentials(req, res, true, () => {
    const hashed = bcrypt.hashSync(req.body.password, 10);
    // Create a new user and add them to the database
    let user = new User({
      username : req.body.email.split("@")[0],
      email : req.body.email,
      password : hashed, // Need to encrypt this eventually
      admin : false,
      active : true
    });
    user.save();

    // Log the newly registered user in 
    req.session.regenerate(loginLogic(req, res));
  });
});

/* 
 * This function logs a user in by regenerating
 * the session, validating their information, and 
 * then 
 */
router.post("/login", (req, res, next) => {
  req.session.regenerate(loginLogic(req, res));
});

/*
 * This function logs a user out by 
 * regenerating the session.
 */
router.post("/logout", (req, res, next) => {
  req.session.regenerate(err => {
    res.json({ msg: "ok" });
  });
});

/* ===== Service Code ===== */

/*
 * This function validates admins by ensuring
 * that they are the current user on the session 
 * and that a csrf token is passed
 */
function validate(req, res, cb) {
  // Ensure that the current session user is an admin
  if (req.session.user && req.session.user._id == req.params.aid
    && req.session.user.admin == true && req.get("X-CSRF") == req.session.csrf) {
      cb();
  }
  else {
    res.status(403).send();
  }
}

/*
 * This function validates normal users by ensuring
 * that they are the current user on the session 
 * and that a csrf token is passed
 */
function validateUser(req, res, cb) {
  // Ensure that the current session user is an admin
  if (req.session.user && req.session.user._id == req.params.uid
      && req.get("X-CSRF") == req.session.csrf) {
      cb();
  }
  else {
    res.status(403).send();
  }
}

/*
 * This function performs the login for a user
 * by checking credentials and attaching the 
 * user to the session object on the request.
 */
function loginLogic(req, res) {
  return (err) => {
    if (err) {
      res.status(403).send(err);
    }
    else {
      let email = req.body.email || "";
      let password = req.body.password || "";

      User.findOne({ email: email }, (findErr, user) => {
        if (findErr || !user) {
          res.status(403).send("The credentials you entered are not recognized.");
        }
        else if (user.active == false) {
          res.status(403).send("Your account has been deactivated.");
        }
        else {
          bcrypt.compare(password, user.password, (err2, valid) => {
            if (err2 || !valid) {
              res.status(403).send("The credentials you entered are not recognized.")
            }
            else {
              req.session.user = user;

              let csrf = uuid.v4();
              req.session.csrf = csrf;
              res.cookie("X-CSRF", csrf);

              let noPswdUser = {
                _id : user._id,
                username : user.username,
                email : user.email, 
                admin : user.admin,
                active : user.active
              }

              res.json(noPswdUser);
            }
          });
        }
      });
    }
  }
}

const domains = [".com", ".edu", ".org", ".net"];
const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

/*
 * This function determines if the credentials a user is trying 
 * to create are valid.  Emails must have an '@' and a domain,
 * and passwords must be > 6 characters and contain a special character
 */
function validCredentials(req, res, updatingPass, cb) {
  User.findOne({email : req.body.email}, (err, user) => {
    // Check for valid email
    if (!req.body._id && user) { // Not updating and not another user with this email
      res.status(400).send("This email is taken by another user.");
    }
    else if (req.body.email.indexOf("@") == -1) {
      res.status(400).send("Emails must contain an @.");
    } 
    else if (!domains.includes(req.body.email.slice(-4))) {
      res.status(400).send("Emails must end in a valid domain.");
    }
    else if (req.body.email.split("@")[0].length == 0) {
      res.status(400).send("Emails must contain user information before the @.");
    }
    // Check for valid password
    else if (updatingPass && req.body.password.length < 6) {
      res.status(400).send("Passwords must be 6 or more characters.");
    }
    // Doesn't have a special character in it
    else if (updatingPass && !specialChars.test(req.body.password)) {
      res.status(400).send("Passwords must contain a special character.");
    }
    // All checks out
    else {
      // Execute the callback function
      cb();
    }
  });
}

/*
 * This function deletes a user.  These deletes must percolate
 * down to the todos, checklists, and countries that belonged to them
 */
function deleteUser(req, res) {
  // Delete todos, checklists, and countries associated with the user
  Todo.deleteMany({userId : req.params.uid}, todoErr => {
    if (todoErr) {
      res.status(500).send(todoErr);
    }
    else {
      Checklist.deleteMany({userId : req.params.uid}, checklistErr => {
        if (checklistErr) {
          res.status(500).send(checklistErr);
        }
        else {
          Country.deleteMany({userId : req.params.uid}, countryErr => {
            if (countryErr) {
              res.status(500).send(countryErr);
            }
            else {
              User.deleteOne({_id : req.params.uid}, defaultCB(res));
            }
          });
        }
      });
    }
  });
}

module.exports = router;
