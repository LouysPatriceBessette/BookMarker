let express = require('express')
let app = express()
let multer = require('multer');

// File size upgrage: https://github.com/expressjs/multer/issues/436
let upload = multer({
    limits: {
        fieldSize: 1064 * 1024 * 1024
    }
})

let MongoClient = require('mongodb').MongoClient;
let ObjectId = require("mongodb").ObjectID;
let hash = require('object-hash');

let cookieParser = require('cookie-parser');
app.use(cookieParser());

let reloadMagic = require('./reload-magic.js')
reloadMagic(app)

// REQUEST!
const request = require('request');


let Export_Mongo = false; // Set to false when you do not care about exporting the data (most of the time)

// To BACKUP MONGO IN A FILE
const fs = require('fs');
let server_date_time = require("./src/js-lib/date_time_format_serverside.js")

let saveToFile = (filename, data) => {

    let filePath = "./MongoExports/"
    let fileExt = ".txt"
    let now = server_date_time().filename

    // Produce the filename
    let file = filePath + now + filename + fileExt

    // Stringify the data
    let dataToString = JSON.stringify(data)

    // Write the file
    fs.writeFile(file, dataToString, (err) => {
        // Error management
        if (err) throw err;

        // Success case, the file was saved
        console.log("\nSave to file success!\n File: " + file + "\n");
    });
}

app.use('/', express.static('build')); // Needed for the HTML and JS files
app.use('/', express.static('public')); // Needed for local assets

// ==================================================================================================== Database


// IMPORTANT! - That mongo connection TAKES TIME!
// ==============================================
//      If we don't await for it, a cookie request enters before `dbo` is defined.
//
//      And I get:
//          (node:72196) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'collection' of undefined
//
//      But we just cant use await here...
//
// SOLUTION:
//
//  Have the WHOLE server (endpoint and everything) in a function... So it does not run right away.
//
//  Call that function when `dbo` is defined.
//
// ==============================================

let url = "mongodb+srv://Bes7weB:bmowi6R4jOiVe8LDzI2q@cluster0-8e3qb.gcp.mongodb.net/test?retryWrites=true&w=majority"

MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, db) => {
    if (err) {
        console.log("LINE# 84 - MongoClient connect error - ", err)
    }
    let dbo = db.db("BookMarker")

    // dbo is now defined... Start the server!
    start_server(dbo)
})

// ============================================================================================================================================================ SERVER

let start_server = dbo => {

    // =============================================================================================================================== FUNCTIONS
    let generateSessionId = () => {
        return "" + Math.floor(Math.random() * 10000000000);
    };

    // =============================================================================================================================== DBO FUNCTIONS

    // ======================================= SESSION GET / SET / DEL
    let db_session = async action => {

        // action must be an object:
        //      for "set" : { do: "set", sid: [number], user_id: [number] }
        //      for "get" : { do: "get", sid: [number] }
        //      for "del" : { do: "del", sid: [number] }

        //console.log("LINE# 111 - Request to sessions is starting.", action.sid)

        if (
            (
                action.do !== undefined && // action.do must be well defined
                typeof (action.do) === "string" &&
                action.do.length === 3
            ) &&
            (
                typeof (action.callback) === "function" // in ALL cases, a callback must be provided
            ) &&
            (
                (
                    action.sid !== undefined && // sid must be present and be a number
                    !isNaN(parseInt(action.sid))
                ) ||
                action.user_id !== undefined
            )
        ) {

            // We have all params...
            //console.log("LINE# 132 - Conditions met.")

            switch (action.do) {

                // ==================================================================== SET
                case "set":

                    if (action.user_id) {
                        console.log("LINE# 140 - Attempting a session SET")
                        return dbo.collection('sessions').insertOne({
                            sid: action.sid,
                            user_id: action.user_id,
                            date: action.date
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 147 - user SET error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on set user.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 156 - db_result", db_result)

                            // go on with the provided callback
                            return action.callback(db_result)
                        })
                    }

                    // if no user_id
                    else {
                        return null
                    }
                    break;

                    // ==================================================================== GET
                case "get":

                    if (action.sid) {
                        console.log("LINE# 173 - Attempting a session GET")
                        return dbo.collection('sessions').findOne({
                            sid: action.sid,
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 178 - user GET error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on find user.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 187 - db_result", db_result)

                            if (Export_Mongo) {
                                // MONGO DATA SAVED to file!
                                saveToFile("Sessions", db_result)
                            }

                            // go on with the provided callback
                            return action.callback(db_result)
                        })
                    }

                    // if no sid
                    else {
                        return null
                    }
                    break;

                    // ==================================================================== DEL
                case "del":

                    if (action.sid) {
                        console.log("LINE# 209 - Attempting a session DEL")
                        return dbo.collection('sessions').deleteOne({
                            sid: action.sid
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 214 - user DEL error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on delete user.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 223 - db_result", db_result)

                            // go on with the provided callback
                            return action.callback(db_result)
                        })
                    }

                    // if no sid
                    else {
                        return null
                    }
                    break

                    // ==================================================================== DEFAULT
                default:
                    console.log("LINE# 238 - Attempting nothing... You provided garbage in 'do'.")
                    return null
            } // END switch

            // Failed on conditions
        } else {
            // ==================================================================== Missing or malformed params
            console.log("LINE# 245 - Request to sessions failed on params condition.")
            return null
        }
    } // END db_session()

    // ======================================= USER GET / SET / DEL  using username / sid
    let db_user = async action => {

        // action must be an object:
        //      for "set" : { do: "set", username: [string], password: [string], bank_id: [dbo inserted id]}
        //      for "get" : { do: "get", user_id: [number], username: [string] } // One of the two... But if username, a password must be matching
        //      for "del" : { do: "del", user_id: [number] } NOT DONE YET
        //      for "upd" : { do: "upd", user_id: [number], username: [string], password: [string] } NOT DONE YET

        //console.log("LINE# 259 - Request to users is starting.")

        if (
            (
                action.do !== undefined && // action.do must be well defined
                typeof (action.do) === "string" &&
                action.do.length === 3
            ) &&
            (
                typeof (action.callback) === "function" // in ALL cases, a callback must be provided
            ) &&
            (
                action.user_id !== undefined || // Needs at least one username OR user_id
                (action.username !== undefined && action.password !== undefined)
            )
        ) {

            // We have all params...
            //console.log("LINE# 277 - Conditions met.")

            switch (action.do) {

                // ==================================================================== SET
                case "set":

                    if (action.username && action.password && action.bank_id) {
                        console.log("LINE# 285 - Attempting a user SET")
                        return dbo.collection('users').insertOne({
                            name: action.username,
                            password: action.password,
                            bank_id: action.bank_id
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 292 - user insert error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on find user.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 301 - db_result", db_result)

                            // go on with the provided callback
                            return action.callback(db_result)
                        })
                    }

                    // if no username password and bank_id (obtained from a GET links...)
                    else {
                        return null
                    }
                    break;

                    // ==================================================================== GET
                case "get":

                    // username
                    if (action.username) {
                        console.log("LINE# 319 - Attempting a user GET")

                        return dbo.collection('users').findOne({
                            name: action.username
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 325 - user GET error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on find user.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 334 - db_result", db_result)

                            // A user is found
                            if (db_result !== null) {
                                console.log("LINE# 338 - User found.")

                                // Password match?
                                if (db_result.password === action.password) {
                                    console.log("LINE# 342 - Password match.")

                                    if (Export_Mongo) {
                                        // MONGO DATA SAVED to file!
                                        saveToFile("Users", db_result)
                                    }

                                    // go on with the provided callback
                                    return action.callback(db_result)
                                }

                                console.log("LINE# 353 - Password do not match.")
                                return null
                            }

                            console.log("LINE# 357 - User not found.")
                            return action.callback(db_result)
                        })
                    }

                    // user_id
                    else if (action.user_id) {
                        console.log("LINE# 364 - Attempting a user GET")

                        return dbo.collection('users').findOne({
                            _id: ObjectId(action.user_id)
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 370 - user GET error", err);
                                local_session_response = {
                                    success: false,
                                    errorMsg: "DBO error on find session",
                                    err: err
                                };
                                return null
                            }

                            //console.log("LINE# 379 - db_result", db_result)

                            if (Export_Mongo) {
                                // MONGO DATA SAVED to file!
                                saveToFile("Users", db_result)
                            }

                            // go on with the provided callback
                            return action.callback(db_result)
                        })
                    }

                    // if no username of user_id
                    else {
                        return null
                    }
                    break;

                    // ==================================================================== DEL
                case "del":

                    console.log("LINE# 400 - Attempting nothing... DEL is not written yet.")
                    return null
                    break

                    // ==================================================================== UPD
                case "upd":

                    console.log("LINE# 407 - Attempting nothing... UPD is not written yet.")
                    return null
                    break

                    // ==================================================================== DEFAULT
                default:
                    console.log("LINE# 413 - Attempting nothing... You provided garbage in 'do'.")
                    return null
            } // END switch

            // Failed on conditions
        } else {
            // ==================================================================== Missing or malformed params
            console.log("LINE# 420 - Request to sessions failed on params condition.")
            return null
        }
    } // END db_user()


    // ======================================= LINK GET / SET / DEL
    let db_link = async action => {

        // action must be an object:
        //      for "set" : { do: "set", categories: [array of objects], links: [array of objects], history: [array of objects] }
        //      for "get" : { do: "get", bank_id: [dbo inserted id] }
        //      for "del" : { do: "del", bank_id: [dbo inserted id] }   NOT DONE YET
        //      for "upd" : { do: "upd", bank_id: [dbo inserted id], categories: [array of objects], links: [array of objects], history: [array of objects] }

        //console.log("LINE# 435 - Request to links is starting.")

        if (
            (
                action.do !== undefined && // action.do must be well defined
                typeof (action.do) === "string" &&
                action.do.length === 3
            ) &&
            (
                typeof (action.callback) === "function" // in ALL cases, a callback must be provided
            )
        ) {

            // We have all params...
            //console.log("LINE# 449 - Conditions met.")

            switch (action.do) {

                // ==================================================================== SET
                case "set":

                    if (action.categories && action.links && action.history) {
                        console.log("LINE# 457 - Attempting a link SET")
                        return dbo.collection('links').insertOne({
                            categories: action.categories,
                            links: action.links,
                            history: action.history
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 464 - user insert error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on SET links.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 473 - db_result", db_result)

                            // go on with the provided callback
                            return action.callback(db_result)
                        })
                    }

                    // if no bank_id and all data
                    console.log("LINE# 481 - Missing data!")
                    return null

                    break;

                    // ==================================================================== GET
                case "get":

                    if (action.bank_id) {
                        console.log("LINE# 490 - Attempting a link GET")
                        return dbo.collection('links').findOne({
                            _id: ObjectId(action.bank_id)
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 495 - user GET error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on GET links.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 504 - db_result", db_result)

                            if (Export_Mongo) {
                                // MONGO DATA SAVED to file!
                                saveToFile("Links", db_result)
                            }

                            // go on with the provided callback
                            return action.callback(db_result)
                        })
                    }

                    // if no bank_id
                    console.log("LINE# 517 - No bank_id.")
                    return null

                    break;

                    // ==================================================================== DEL
                case "del":

                    console.log("LINE# 525 - Attempting nothing... DEL is not written yet.")
                    return null
                    break

                    // ==================================================================== UPD
                case "upd":

                    if (action.bank_id && action.categories && action.links && action.history) {
                        console.log("LINE# 533 - Attempting a link UPD")

                        return dbo.collection("links").updateOne({
                            _id: ObjectId(action.bank_id)
                        }, {
                            $set: {
                                categories: action.categories,
                                links: action.links,
                                history: action.history
                            }
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 545 - user GET error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on UPD links.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 554 - db_result", db_result)

                            // go on with the provided callback
                            return action.callback(db_result)
                        })
                    }

                    // if no bank_id and all data
                    console.log("LINE# 562 - Missing data!")
                    return null
                    break

                    // ==================================================================== DEFAULT
                default:
                    console.log("LINE# 568 - Attempting nothing... You provided garbage in 'do'.")
                    return null
            } // END switch

            // Failed on conditions
        } else {
            // ==================================================================== Missing or malformed params
            console.log("LINE# 575 - Request to sessions failed on params condition.")
            return null
        }
    } // END db_link()

    // =============================================================================================================================== ENDPOINTS

    // =========================================================================================================== Signup
    app.post('/signup', upload.none(), async (req, res) => {
        console.log("\n======================================================= /signup")

        let usr = req.body.username
        let pwd = hash({
            passwordHashed: req.body.password
        }) // has to be an object

        // ========= Information collection while the dbo resquest are going.
        let collected = {}

        let signed_up = session_response => {
            if (session_response !== null) {
                console.log("LINE# 596 - Cookie created.")
                console.log("\n============= Signup success. =============\n\n")

                // Create a sid
                res.cookie("sid", collected.sid);

                // Request response
                res.json({
                    success: true,
                    errorMsg: "New user created. Welcome on BookMarker.club!",
                    user: {
                        username: collected.username,
                        userBank_id: collected.bank_id,
                        categories: collected.categories,
                        links: collected.links,
                        history: collected.history
                    }
                });
            }

            // No response from session set??? It would be surprising...
            else {
                console.log("LINE# 618 - Cookie not created.")
                res.json({
                    success: false,
                    errorMsg: "Something when wrong with the session setting..."
                });
            }
        }

        // Set a session
        set_session = async (set_new_user_result) => {
            if (set_new_user_result !== null) {
                console.log("LINE# 629 - New user created.")
                console.log("\n==============================\n  Welcome on BookMarker.club!  \n==============================\n\n")

                // Set a cookie
                let sid = generateSessionId();

                // Collect some infos
                collected["username"] = set_new_user_result.ops[0].name
                collected["bank_id"] = set_new_user_result.ops[0].bank_id
                collected["sid"] = sid

                return db_session({
                    do: "set",
                    user_id: set_new_user_result.ops[0]._id,
                    sid: sid,
                    callback: signed_up
                })
            }

            console.log("LINE# 648 - New user not created.")
            return null
        }

        // Create the new user
        let set_new_user = async (set_startup_link_response) => {
            if (set_startup_link_response !== null) {
                console.log("LINE# 655 - Startup links created.")

                // Collect some infos
                collected["categories"] = set_startup_link_response.ops[0].categories
                collected["links"] = set_startup_link_response.ops[0].links
                collected["history"] = set_startup_link_response.ops[0].history

                return db_user({
                    do: "set",
                    username: usr,
                    password: pwd,
                    bank_id: set_startup_link_response.ops[0]._id,
                    callback: set_session
                })
            }

            console.log("LINE# 671 - Startup links not created.")
            return null
        }

        // If user does not exist, create it's startup links
        let set_startup_link = async user_exist_response => {
            if (user_exist_response !== null) {
                console.log("LINE# 678 - username already taken.");
                res.json({
                    success: false,
                    errorMsg: "Username already taken."
                });
                return null;
            }

            console.log("LINE# 686 - username available.");
            return db_link({
                do: "set",
                categories: emptyBank.categories,
                links: emptyBank.links,
                history: emptyBank.history,
                res: res,
                callback: set_new_user
            })
        }

        // check if the username is already taken.
        return db_user({
            do: "get",
            username: usr,
            password: pwd,
            res: res,
            callback: set_startup_link
        })
    })

    // =========================================================================================================== Login
    app.post('/login', upload.none(), async (req, res) => {
        console.log("\n======================================================= /login")

        let pwd = hash({
            passwordHashed: req.body.password
        }) // has to be an object

        // ========= Information collection while the dbo resquest are going.
        let collected = {}

        let logged_in = db_link_response => {
            if (db_link_response !== null) {
                console.log("LINE# 720 - User links retreived.")
                console.log("\n============= Login success. =============\n\n")

                // Request response
                res.cookie("sid", collected.sid);
                res.json({
                    success: true,
                    user: {
                        username: collected.username,
                        userBank_id: collected.bank_id,
                        categories: db_link_response.categories,
                        links: db_link_response.links,
                        history: db_link_response.history,
                        errorMsg: "No error."
                    }
                })
                return null
            }

            console.log("LINE# 739 - User links not retreived.")
            return null
        }

        let get_links = async set_session_response => {
            if (set_session_response !== null) {
                console.log("LINE# 745 - Session setted.")

                return db_link({
                    do: "get",
                    bank_id: collected.bank_id,
                    callback: logged_in
                })
            }

            console.log = ("LINE# 754 - Session not setted.")
            return null
        }

        let set_session = async get_user_response => {
            if (get_user_response !== null) {
                console.log("LINE# 760 - User valid.")

                // Create a sid
                let sid = generateSessionId();

                // Collect soome infos.
                collected["username"] = get_user_response.username
                collected["bank_id"] = get_user_response.bank_id
                collected["sid"] = sid

                // Set a session
                return db_session({
                    do: "set",
                    user_id: get_user_response._id,
                    sid: sid,
                    callback: get_links
                })
            }

            console.log("LINE# 779 - User invalid.")
            res.json({
                success: false,
                errorMsg: "User not found."
            });
            return null;
        }

        return db_user({
            do: "get",
            username: req.body.username,
            password: pwd,
            res: res,
            callback: set_session
        })
    })

    // =========================================================================================================== Cookie
    app.post('/cookie', upload.none(), async (req, res) => {
        console.log("\n======================================================= /cookie")

        let sid = req.cookies.sid

        // ========= Information collection while the dbo resquest are going.
        let collected = {}

        let cookie_logged = get_links_result => {
            if (get_links_result !== null) {
                console.log("LINE# 807 - User links found.")
                console.log("\n============= Cookie login success. =============\n\n")
                res.json({
                    success: true,
                    errorMsg: "User links found.",
                    user: {
                        username: collected.username,
                        userBank_id: collected.bank_id,
                        categories: get_links_result.categories,
                        links: get_links_result.links,
                        history: get_links_result.history,
                    }
                });
            } else {
                console.log("LINE# 821 - User links not found.")
                res.json({
                    success: false,
                    errorMsg: "User links not found."
                })
                return null
            }
        }

        // Get our user's links
        let get_links = async (get_user_response) => {
            // If user found
            if (get_user_response !== null) {
                console.log("LINE# 834 - User found.")

                collected["username"] = get_user_response.name
                collected["bank_id"] = get_user_response.bank_id

                return db_link({
                    do: "get",
                    bank_id: get_user_response.bank_id,
                    callback: cookie_logged
                })
            }

            // User not found
            console.log("LINE# 847 - User not found.")
            res.json({
                success: false,
                errorMsg: "User not found."
            })
            return null
        }

        // Get our user
        let get_user = async (session_response) => {
            // Session found?
            if (session_response !== null) {
                console.log("LINE# 859 - Session found.")
                return db_user({
                    do: "get",
                    user_id: session_response.user_id,
                    callback: get_links
                })
            }

            // Session not found
            console.log("LINE# 868 - Session not found.")
            res.json({
                success: false,
                errorMsg: "Session not found."
            })
            return null
        }

        // Check the session
        return db_session({
            do: "get",
            sid: sid,
            res: res,
            callback: get_user
        })

    }) // END app.post('/cookie')

    // =========================================================================================================== Logout
    app.post('/logout', upload.none(), async (req, res) => {
        console.log("\n======================================================= /logout")

        let logged_out = kill_session_response => {
            if (kill_session_response !== null) {
                console.log("LINE# 892 - Session destroyed.")
                console.log("\n============= Logout success. =============\n\n")

                res.json({
                    success: true,
                    errorMsg: "Session removed."
                })
                return null
            }

            console.log("LINE# 902 - Session not destroyed.")
            res.json({
                success: false,
                errorMsg: "Failed to remove the session."
            })
        }

        let kill_session = async session_response => {
            if (session_response !== null) {
                console.log("LINE# 911 - About to destroy the session...")

                return db_session({
                    do: "del",
                    sid: req.cookies.sid,
                    callback: logged_out
                })
            }

            console.log("LINE# 920 - Session not found.")
            res.json({
                success: false,
                errorMsg: "Session not found."
            })
        }

        // Check if the session exists
        return db_session({
            do: "get",
            sid: req.cookies.sid,
            res: res,
            callback: kill_session
        })
    })

    // =========================================================================================================== Validate URL
    app.post('/valid-url', upload.none(), async (req, res) => {

        console.log("\n========================================== REQUEST TO /valid-url ")
        let urlToCheck = req.body.url

        let check_url = async session_response => {
            if (session_response !== null) {
                console.log("LINE# 944 - Session found, verifying the url.")

                request
                    .get(urlToCheck)
                    .on('error', function (err) {
                        console.log("LINE# 949 - ERROR on request - ", err)
                        res.json({
                            success: false,
                            errorMsg: "ERROR on request.",
                            err: err
                        })
                        return null
                    })
                    .on('response', function (response) {
                        //console.log("LINE# 958 - response.statusCode", response.statusCode)
                        if (response.statusCode === 200) {
                            console.log("LINE# 960 - URL valid.\n\n")
                            res.json({
                                success: true,
                                errorMsg: "URL valid."
                            })
                        } else {
                            console.log("LINE# 966 - URL invalid.\n\n")
                            res.json({
                                success: false,
                                errorMsg: "URL invalid."
                            })
                        }
                    })
                return null
            }

            console.log("LINE# 976 - Session not found.")
            res.json({
                success: false,
                errorMsg: "Session not found."
            })
        }

        // Check if the session exists
        return db_session({
            do: "get",
            sid: req.cookies.sid,
            res: res,
            callback: check_url
        })
    })

    // =========================================================================================================== SAVE user's changes
    app.post('/save', upload.none(), async (req, res) => {

        console.log("\n========================================== REQUEST TO /save ")

        let data_update = async data_update_response => {
            if (data_update_response !== null) {
                console.log("LINE# 999 - Data saved.")
                console.log("\n============= Save success. =============\n\n")

                res.json({
                    success: true,
                    errorMsg: "Data saving is done."
                })
                return
            }

            console.log("LINE# 1009 - Data saving failed.")
            res.json({
                success: false,
                errorMsg: "Data saving failed."
            })
        }

        let process_data = async process_data_response => {
            if (process_data_response !== null) {
                console.log("LINE# 1018 - Links found.")

                // Update the history
                let updated_history = process_data_response.history.concat(JSON.parse(req.body.history))

                return db_link({
                    do: "upd",
                    bank_id: req.body.bank_id,
                    categories: JSON.parse(req.body.categories),
                    links: JSON.parse(req.body.links),
                    history: updated_history,
                    callback: data_update
                })
            }

            console.log("LINE# 1033 - Links not found.")
            res.json({
                success: false,
                errorMsg: "Links not found."
            })
        }

        let get_data = async session_response => {
            if (session_response !== null) {
                console.log("LINE# 1042 - Session found.")

                return db_link({
                    do: "get",
                    bank_id: req.body.bank_id,
                    callback: process_data
                })
            }

            console.log("LINE# 1051 - Session not found.")
            res.json({
                success: false,
                errorMsg: "Session not found."
            })
        }

        // Check the session
        return db_session({
            do: "get",
            sid: req.cookies.sid,
            callback: get_data
        })
    })

    // =============================================================================================================================== ENDPOINTS ALL

    // ============================================================================== React router (not used yet)
    // app.all('/route/*', (req, res, next) => {
    //     console.log("LINE# 1070 - app.all()")
    //     res.sendFile(__dirname + '/build/index.html');
    // })

    // ============================================================================== Server listen to requests...
    app.listen(4000, '0.0.0.0', () => {
        console.log("LINE# 1076 - Server running on port 4000")
    })

} // ========================================================================================================================================================== END start_server(dbo)

// ============================================================================================================================================================ DEFAULT BANK

let defaultBank = {
    categories: [{
            name: "Concordia",
            content: [
                3
            ],
            state: "closed",
            order: 3
        },
        {
            name: "Social",
            content: [
                1, 2
            ],
            state: "closed",
            order: 1
        },
        {
            name: "Coding",
            content: [
                0
            ],
            state: "closed",
            order: 2
        },
        {
            name: "Coding music",
            content: [
                4
            ],
            state: "opened",
            order: 0
        }
    ],
    links: [{
            name: "Stackoverflow",
            href: "https://stackoverflow.com/",
            image: "/image_missing.png",
            comment: [{
                "insert": "The best programer ressource!"
            }],
            rating: 5
        },
        {
            name: "LinkedIn",
            href: "https://www.linkedin.com/feed/",
            image: "/image_missing.png",
            comment: [{
                "insert": "Grow your network"
            }],
            rating: 4
        },
        {
            name: "Facebook - Messages",
            href: "https://www.facebook.com/messages/",
            image: "/image_missing.png",
            comment: [{
                "insert": "Time eater"
            }],
            rating: 2
        },
        {
            name: "Trello",
            href: "https://trello.com/b/ttGHQhyo/concordia-final-project",
            image: "/image_missing.png",
            comment: [{
                "insert": "Project management"
            }],
            rating: 5
        },
        {
            name: "Trance classics - Vinyl mix",
            href: "https://www.youtube.com/watch?v=mbmQbKNJv3E",
            image: "/image_missing.png",
            comment: [{
                "insert": "Rave memories from 1999/2000..."
            }],
            rating: 5
        }
    ],
    history: []

}

let emptyBank = {
    categories: [{
        name: "Welcome!",
        content: [
            0
        ],
        state: "closed",
        order: 0
    }],
    links: [{
        name: "Demo link",
        href: "https://stackoverflow.com/",
        image: "data:image/png;base64,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",
        comment: [{
            attributes: {
                "bold": true,
            },
            "insert": "StackOverflow"
        }, {
            "insert": " is the best programer's ressource!"
        }],
        rating: 5
    }],
    history: []
}

// ============================================================================================================================================================ EOF