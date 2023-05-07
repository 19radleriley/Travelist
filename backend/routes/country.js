var express = require('express');
var router = express.Router();
var axios  = require("axios");
const Country = require('../models/country');
const Todo = require('../models/todo');
const User = require('../models/user');
const Checklist = require('../models/checklist');

const travelBriefingLink = "https://travelbriefing.org/"
const restCountriesLink = "https://restcountries.com/v3.1/"
const wikiLinksURL = "https://en.wikipedia.org/w/api.php?origin=*&action=parse&format=json&page=";
const wikiSummaryURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=" 
const linkPrefix = "https://en.wikipedia.org/wiki/";
const ignored_sections = ["bibliography", "see also", "references", "external links", "notes and references"];

router.get("/", (req, res, next) => {
    res.send("All good!");
});

/*
 * Get a list of all countries from rest countries api.
 * The list can be filtered by continent or by search
 * based on the query parameters
 */
router.get("/countries", (req, res, next) => {
    let name = req.query.name;
    let continent = req.query.continent;
    axios.get(restCountriesLink + "all")
        .then(data => {
            // Filter based on name
            if (name != undefined) {
                data.data = data.data.filter(country => {
                    return country.name.common.toLowerCase().includes(name.toLowerCase());
                });
            }
            // Filter based on the continent
            else if (continent != undefined && continent != "all") {
                data.data = data.data.filter(country => {
                    return country.continents[0].toLowerCase() == continent;
                });
            }

            // Sort alphabetically 
            // data.data.sort((c1, c2) => c1.name.common > c2.name.common ? 1 : -1);
            // Shuffle 
            // data.data.sort((c1, c2) => Math.random() - 0.5);

            // Only return the data that is needed for list view
            res.json(data.data.map(country => {
                return {
                    name : country.name.common,
                    flag : country.flags.png
                }
            }));
        });
});

/*
 * Get data for a specific country from an external api
 * api to get data i specified in a query parameter
 */
router.get("/countries/:cName", (req, res, next) => {
    let data = req.query.data;

    if (data == "rest-countries") {
        restCountries(req, res);
    }
    else if (data == "wiki-links") {
        wikiLinks(req, res);     
    }
    else if (data == "wiki-summary") {
        wikiSummary(req, res);
    }
    else if (data == "travel-briefing") {
        // travelBriefing(req, res);
        res.status(404).send();
    }
});

/*
 * Get all of the saved countries for a user
 */
router.get("/:uid/countries", (req, res, next) => {
    validate(req, res, () => {
        User.findOne({_id : req.params.uid}, (err, user) => {

            if (err || user == undefined) {
                res.status(500).send();
            }
            else {
                let filter = { 
                    visited : req.query.visited == "true" ? true : false,
                    userId : user._id
                }
                Country.find(filter, defaultCB(res));
            }
        });
    });
});

/*
 * Get a single country that a user has saved
 */
router.get("/:uid/countries/:cName", (req, res, next) => {
    validate(req, res, () => {
        Country.findOne({userId : req.params.uid, name : req.params.cName},
            defaultCB(res));
    });
});

/*
 * Get a list of all checklists for a specific user
 */
router.get("/:uid/checklists", (req, res, next) => {
    validate(req, res, () => {
        let query = { userId : req.params.uid }
        if (req.query.country != "none") {
            query.cName = req.query.country;
        }

        Checklist.find(query, defaultCB(res));    
    });
});

/*
 * Get a list of todos from a specific checklist
 * that belongs to a specific user
 */
router.get("/:uid/checklists/:cid/todos", (req, res, next) => {
    validate(req, res, () => {
        Todo.find({checklistId : req.params.cid}, defaultCB(res));
    });
});

/* ===== POST Endpoints ===== */

/* 
 * Create a new country for a specific user
 */
router.post("/:uid/countries", (req, res, next) => {
    validate(req, res, () => {
        createCountry(req.body, defaultCB(res));
    });
});

/* 
 * Create a new checklist for a specific user
 */
router.post("/:uid/checklists", (req, res, next) => {
    validate(req, res, () => {
        req.body.userId = req.params.uid;
        createChecklist(req.body, defaultCB(res));
    });
});

/*
 * Create a new todo in a checklist for a specific user
 */
router.post("/:uid/checklists/:cid/todos", (req, res, next) => {
    validate(req, res, () => {
        createTodo(req.body, defaultCB(res));
    });
});

/* ===== DELETE Endpoints ===== */

/*
 * Remove a country for a specific user
 */
router.delete("/:uid/countries/:cName", (req, res, next) => {
    validate(req, res, () => {
        // "Soft Delete System" Won't delete the checklists for this country
        // Because checklists are associated with a user and a coutry's name, 
        // they can persist across deletes
        Country.deleteOne({ userId : req.params.uid, name : req.params.cName}, (err, result) => {
            if (err) {
                res.status(500).send();
            }
            else {
                res.json(result);
            }
        });
    });
});

/*
 * Delete a specific checklist for a user.
 * This also entails deleting all todos for a checklist
 */
router.delete("/:uid/checklists/:cid", (req, res, next) => {
    validate(req, res, () => {
        // Delete all todos associated with this checklist
        Todo.deleteMany({checklistId : req.params.cid}, (err, result) => {
            if (err) {
                res.status(500).send("Failed to delete todos associated with checklist");
            }
            else {
                // Then delete the checklist
                Checklist.deleteOne({_id : req.params.cid}, defaultCB(res));
            }
        });
    });
});

/* ===== Put Endpoints ===== */

/*
 * Update a country to be visited or not
 */
router.put("/:uid/countries/:cName", (req, res, next) => {
    validate(req, res, () => {
        Country.findOne({userId : req.params.uid, name : req.params.cName}, (err, country) => {
            if (err) {
                res.status(500).send();
            }  
            else {
                if (req.query.visited == "true") {
                    country.visited = true;
                }
                else {
                    country.visited = false;
                }
                country.save();
                res.json(country);
            }
        });
    });
});

/* 
 * Update a todo to be completed or not completed
 */
router.put("/:uid/checklists/:cid/todos/:tid", (req, res, next) => {
    validate(req, res, () => {
        Todo.findOne({_id : req.params.tid}, (err, todo) => {
            if (err) {
                res.status(500).send("Failed to update todo");
            }
            else {
                todo.completed = !req.body.completed;
                todo.save();
                res.json(todo);
            }
        });
    });
});

/* ===== Service Functions ===== */

/*
 * Validates the user and executes a cb function if they are valid
 */
function validate(req, res, cb) {
    if (req.session.user && req.session.user._id == req.params.uid
         && req.get("X-CSRF") == req.session.csrf) {
        cb();
    } 
    else {
        req.session.regenerate(() => {
            res.status(403).send(); // Forbidden
        });
    }
}

/*
 * Create a new country and save it to the database
 */
function createCountry(country, cb) {
    let newCountry = new Country({
        userId : country.userId,
        name : country.name,
        flagLink : country.flagLink,
        visited : false,
    });
    newCountry.save();
    if (newCountry) {
        cb(null, newCountry);
    }
    else {
        cb({msg : "Failed to create country"}, null)
    }
}

/*
 * Create a new checklist and save it to the database
 */
function createChecklist(checklist, cb) {
    let cList = new Checklist({
        title : checklist.title,
        description : checklist.description,
        userId : checklist.userId,
        cName : checklist.cName,
        flagLink : checklist.flagLink,
    });
    cList.save();

    if (cList) {
        cb(null, cList);
    }
    else {
        cb({msg : "Failed to create checklist"}, null)
    }
}

/*
 * Create a new todo and save it to the database
 */
function createTodo(todo, cb) {
    let newTodo = new Todo({
        task : todo.task.trim(),
        completed : todo.completed, 
        checklistId : todo.checklistId,
        userId : todo.userId
    });
    newTodo.save();
    
    if (newTodo) {
        cb(null, newTodo);
    }
    else {
        cb({msg: "Failed to create todo"}, null);
    }
}

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
 * This function retrieves the summary of 
 * a wikipedia page for a specific country.  
 * It first checks to see if there is a "Tourism in ____"
 * page, and if not, simply finds the page for the country
 */
function wikiSummary(req, res) {
    let country = req.params.cName.split(" ").join("%20");
    axios.get(wikiSummaryURL + `Tourism%20in%20${country}`)
        .then(response => {
            if (response.data.query.pages["-1"]) {
                axios.get(wikiSummaryURL + country)
                    .then(backup => {
                        let pageid = Object.keys(backup.data.query.pages)[0];
                        res.json(backup.data.query.pages[pageid].extract);

                    }).catch(err => {
                        res.json(err);
                    });
            }
            else {
                let pageid = Object.keys(response.data.query.pages)[0];
                res.json(response.data.query.pages[pageid].extract);
            }
        }).catch(err => res.status(500).json(err));
}

/*
 * This function retrieves the section links for a 
 * wikipedia page.  It checks first to see if there is a
 * "Tourism in _____" page, and if not, simply finds the page
 * for the country and grabs its sections.
 */
function wikiLinks(req, res) {
    let cName = req.params.cName.charAt(0).toUpperCase() + req.params.cName.slice(1);
    axios.get(wikiLinksURL + "Tourism in " + cName)
        .then(response => {
            let urls = [];
            if (!response.data.error) {
                response.data.parse.sections.forEach(section => {
                    if (!ignored_sections.includes(section.line.toLowerCase())) {
                        urls.push({section : section.line, link : linkPrefix + section.fromtitle + "#" + section.anchor }); 
                    }
                });

                if (urls.length == 0) {
                    urls.push({ 
                        section: `Tourism in ${req.params.cName}`,
                        link : linkPrefix + `tourism_in_${req.params.cName}`
                    });
                }
            }
            else {
                urls.push({ 
                    section: `Tourism in ${req.params.cName}`,
                    link : linkPrefix + `tourism_in_${req.params.cName}`
                });
            }
            res.send(urls);
        }).catch(error => {  console.log("ERROR CAUGHT!!!"); res.status(500).json(error);});
}

/*
 * This function retrieves single country from the 
 * rest countries api.  This includes important data
 * such as a flag png, lat and lon, capital city, languages,
 * and currency.
 */
function restCountries(req, res) {
    let cName = req.params.cName;
    axios.get(restCountriesLink + `name/${cName}`)
        .then(data => {
            res.json(data.data[0]);
        }).catch(err => res.json(err));
}

/*
 * This function retrieves data for a single country
 * from the travel briefing api.  It includes information
 * for languages, average temperatures based on the time of year,
 * safety information, time zone, and phone numbers
 */
function travelBriefing(req, res) {
    axios.get(travelBriefingLink + req.params.cName + "?format=json")
        .then(response => {
            if (response.data.names.name.toLowerCase() == req.params.cName.toLowerCase()) {
                res.send(response.data);
            }
            else {
                res.status(404).json({ msg : "Travel briefing doesn't have this country" });
            }
        }).catch(err => res.status(500).send(err));
}

module.exports = router;
