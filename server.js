let express = require('express')
let app = express()
let multer = require('multer');
let upload = multer()

let MongoClient = require('mongodb').MongoClient;
let ObjectId = require("mongodb").ObjectID;
let hash = require('object-hash');

let cookieParser = require('cookie-parser');
app.use(cookieParser());

let reloadMagic = require('./reload-magic.js')
reloadMagic(app)

// REQUEST!
const request = require('request');


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
        console.log("LINE# 50 - MongoClient connect error - ", err)
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

        //console.log("LINE# 77 - Request to sessions is starting.", action.sid)

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
            //console.log("LINE# 98 - Conditions met.")

            switch (action.do) {

                // ==================================================================== SET
                case "set":

                    if (action.user_id) {
                        console.log("LINE# 106 - Attempting a session SET")
                        return dbo.collection('sessions').insertOne({
                            sid: action.sid,
                            user_id: action.user_id,
                            date: action.date
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 113 - user SET error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on set user.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 122 - db_result", db_result)

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
                        console.log("LINE# 139 - Attempting a session GET")
                        return dbo.collection('sessions').findOne({
                            sid: action.sid,
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 144 - user GET error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on find user.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 153 - db_result", db_result)

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
                        console.log("LINE# 170 - Attempting a session DEL")
                        return dbo.collection('sessions').deleteOne({
                            sid: action.sid
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 175 - user DEL error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on delete user.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 184 - db_result", db_result)

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
                    console.log("LINE# 199 - Attempting nothing... You provided garbage in 'do'.")
                    return null
            } // END switch

            // Failed on conditions
        } else {
            // ==================================================================== Missing or malformed params
            console.log("LINE# 206 - Request to sessions failed on params condition.")
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

        //console.log("LINE# 220 - Request to users is starting.")

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
            //console.log("LINE# 238 - Conditions met.")

            switch (action.do) {

                // ==================================================================== SET
                case "set":

                    if (action.username && action.password && action.bank_id) {
                        console.log("LINE# 246 - Attempting a user SET")
                        return dbo.collection('users').insertOne({
                            name: action.username,
                            password: action.password,
                            bank_id: action.bank_id
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 253 - user insert error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on find user.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 262 - db_result", db_result)

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
                        console.log("LINE# 280 - Attempting a user GET")

                        return dbo.collection('users').findOne({
                            name: action.username
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 286 - user GET error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on find user.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 295 - db_result", db_result)

                            // A user is found
                            if (db_result !== null) {
                                console.log("LINE# 299 - User found.")

                                // Password match?
                                if (db_result.password === action.password) {
                                    console.log("LINE# 303 - Password match.")

                                    // go on with the provided callback
                                    return action.callback(db_result)
                                }

                                console.log("LINE# 309 - Password do not match.")
                                return null
                            }

                            console.log("LINE# 313 - User not found.")
                            return action.callback(db_result)
                        })
                    }

                    // user_id
                    else if (action.user_id) {
                        console.log("LINE# 320 - Attempting a user GET")

                        return dbo.collection('users').findOne({
                            _id: ObjectId(action.user_id)
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 326 - user GET error", err);
                                local_session_response = {
                                    success: false,
                                    errorMsg: "DBO error on find session",
                                    err: err
                                };
                                return null
                            }

                            //console.log("LINE# 335 - db_result", db_result)

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

                    console.log("LINE# 351 - Attempting nothing... DEL is not written yet.")
                    return null
                    break

                    // ==================================================================== UPD
                case "upd":

                    console.log("LINE# 358 - Attempting nothing... UPD is not written yet.")
                    return null
                    break

                    // ==================================================================== DEFAULT
                default:
                    console.log("LINE# 364 - Attempting nothing... You provided garbage in 'do'.")
                    return null
            } // END switch

            // Failed on conditions
        } else {
            // ==================================================================== Missing or malformed params
            console.log("LINE# 371 - Request to sessions failed on params condition.")
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

        //console.log("LINE# 386 - Request to links is starting.")

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
            //console.log("LINE# 400 - Conditions met.")

            switch (action.do) {

                // ==================================================================== SET
                case "set":

                    if (action.categories && action.links && action.history) {
                        console.log("LINE# 408 - Attempting a link SET")
                        return dbo.collection('links').insertOne({
                            categories: action.categories,
                            links: action.links,
                            history: action.history
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 415 - user insert error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on SET links.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 424 - db_result", db_result)

                            // go on with the provided callback
                            return action.callback(db_result)
                        })
                    }

                    // if no bank_id and all data
                    console.log("LINE# 432 - Missing data!")
                    return null

                    break;

                    // ==================================================================== GET
                case "get":

                    if (action.bank_id) {
                        console.log("LINE# 441 - Attempting a link GET")
                        return dbo.collection('links').findOne({
                            _id: ObjectId(action.bank_id)
                        }, (err, db_result) => {
                            if (err) {
                                console.log("LINE# 446 - user GET error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on GET links.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 455 - db_result", db_result)

                            // go on with the provided callback
                            return action.callback(db_result)
                        })
                    }

                    // if no bank_id
                    console.log("LINE# 463 - No bank_id.")
                    return null

                    break;

                    // ==================================================================== DEL
                case "del":

                    console.log("LINE# 471 - Attempting nothing... DEL is not written yet.")
                    return null
                    break

                    // ==================================================================== UPD
                case "upd":

                    if (action.bank_id && action.categories && action.links && action.history) {
                        console.log("LINE# 479 - Attempting a link UPD")

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
                                console.log("LINE# 491 - user GET error", err);
                                res.json({
                                    success: false,
                                    errorMsg: "DBO error on UPD links.",
                                    err: err
                                })
                                return null
                            }

                            //console.log("LINE# 500 - db_result", db_result)

                            // go on with the provided callback
                            return action.callback(db_result)
                        })
                    }

                    // if no bank_id and all data
                    console.log("LINE# 508 - Missing data!")
                    return null
                    break

                    // ==================================================================== DEFAULT
                default:
                    console.log("LINE# 514 - Attempting nothing... You provided garbage in 'do'.")
                    return null
            } // END switch

            // Failed on conditions
        } else {
            // ==================================================================== Missing or malformed params
            console.log("LINE# 521 - Request to sessions failed on params condition.")
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
                console.log("LINE# 542 - Cookie created.")
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
                    }
                });
            }

            // No response from session set??? It would be surprising...
            else {
                console.log("LINE# 563 - Cookie not created.")
                res.json({
                    success: false,
                    errorMsg: "Something when wrong with the session setting..."
                });
            }
        }

        // Set a session
        set_session = async (set_new_user_result) => {
            if (set_new_user_result !== null) {
                console.log("LINE# 574 - New user created.")
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

            console.log("LINE# 593 - New user not created.")
            return null
        }

        // Create the new user
        let set_new_user = async (set_startup_link_response) => {
            if (set_startup_link_response !== null) {
                console.log("LINE# 600 - Startup links created.")

                // Collect some infos
                collected["categories"] = set_startup_link_response.ops[0].categories
                collected["links"] = set_startup_link_response.ops[0].links

                return db_user({
                    do: "set",
                    username: usr,
                    password: pwd,
                    bank_id: set_startup_link_response.ops[0]._id,
                    callback: set_session
                })
            }

            console.log("LINE# 615 - Startup links not created.")
            return null
        }

        // If user does not exist, create it's startup links
        let set_startup_link = async user_exist_response => {
            if (user_exist_response !== null) {
                console.log("LINE# 622 - username already taken.");
                res.json({
                    success: false,
                    errorMsg: "Username already taken."
                });
                return null;
            }

            console.log("LINE# 630 - username available.");
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
                console.log("LINE# 664 - User links retreived.")
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
                        errorMsg: "No error."
                    }
                })
                return null
            }

            console.log("LINE# 682 - User links not retreived.")
            return null
        }

        let get_links = async set_session_response => {
            if (set_session_response !== null) {
                console.log("LINE# 688 - Session setted.")

                return db_link({
                    do: "get",
                    bank_id: collected.bank_id,
                    callback: logged_in
                })
            }

            console.log = ("LINE# 697 - Session not setted.")
            return null
        }

        let set_session = async get_user_response => {
            if (get_user_response !== null) {
                console.log("LINE# 703 - User valid.")

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

            console.log("LINE# 722 - User invalid.")
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
                console.log("LINE# 750 - User links found.")
                console.log("\n============= Cookie login success. =============\n\n")
                res.json({
                    success: true,
                    errorMsg: "User links found.",
                    user: {
                        username: collected.username,
                        userBank_id: collected.bank_id,
                        categories: get_links_result.categories,
                        links: get_links_result.links,
                    }
                });
            } else {
                console.log("LINE# 763 - User links not found.")
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
                console.log("LINE# 776 - User found.")

                collected["username"] = get_user_response.name
                collected["bank_id"] = get_user_response.bank_id

                return db_link({
                    do: "get",
                    bank_id: get_user_response.bank_id,
                    callback: cookie_logged
                })
            }

            // User not found
            console.log("LINE# 789 - User not found.")
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
                console.log("LINE# 801 - Session found.")
                return db_user({
                    do: "get",
                    user_id: session_response.user_id,
                    callback: get_links
                })
            }

            // Session not found
            console.log("LINE# 810 - Session not found.")
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
                console.log("LINE# 834 - Session destroyed.")
                console.log("\n============= Logout success. =============\n\n")

                res.json({
                    success: true,
                    errorMsg: "Session removed."
                })
                return null
            }

            console.log("LINE# 844 - Session not destroyed.")
            res.json({
                success: false,
                errorMsg: "Failed to remove the session."
            })
        }

        let kill_session = async session_response => {
            if (session_response !== null) {
                console.log("LINE# 853 - About to destroy the session...")

                return db_session({
                    do: "del",
                    sid: req.cookies.sid,
                    callback: logged_out
                })
            }

            console.log("LINE# 862 - Session not found.")
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
                console.log("LINE# 886 - Session found, verifying the url.")

                request
                    .get(urlToCheck)
                    .on('error', function (err) {
                        console.log("LINE# 891 - ERROR on request - ", err)
                        res.json({
                            success: false,
                            errorMsg: "ERROR on request.",
                            err: err
                        })
                        return null
                    })
                    .on('response', function (response) {
                        //console.log("LINE# 900 - response.statusCode", response.statusCode)
                        if (response.statusCode === 200) {
                            console.log("LINE# 902 - URL valid.\n\n")
                            res.json({
                                success: true,
                                errorMsg: "URL valid."
                            })
                        } else {
                            console.log("LINE# 908 - URL invalid.\n\n")
                            res.json({
                                success: false,
                                errorMsg: "URL invalid."
                            })
                        }
                    })
                return null
            }

            console.log("LINE# 918 - Session not found.")
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
                console.log("LINE# 941 - Data saved.")
                console.log("\n============= Save success. =============\n\n")

                res.json({
                    success: true,
                    errorMsg: "Data saving is done."
                })
                return
            }

            console.log("LINE# 951 - Data saving failed.")
            res.json({
                success: false,
                errorMsg: "Data saving failed."
            })
        }

        let process_data = async process_data_response => {
            if (process_data_response !== null) {
                console.log("LINE# 960 - Links found.")

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

            console.log("LINE# 975 - Links not found.")
            res.json({
                success: false,
                errorMsg: "Links not found."
            })
        }

        let get_data = async session_response => {
            if (session_response !== null) {
                console.log("LINE# 984 - Session found.")

                return db_link({
                    do: "get",
                    bank_id: req.body.bank_id,
                    callback: process_data
                })
            }

            console.log("LINE# 993 - Session not found.")
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
    //     console.log("LINE# 1012 - app.all()")
    //     res.sendFile(__dirname + '/build/index.html');
    // })

    // ============================================================================== Server listen to requests...
    app.listen(4000, '0.0.0.0', () => {
        console.log("LINE# 1018 - Server running on port 4000")
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
            comment: [{
                "insert": "The best programer ressource!"
            }],
            rating: 5
        },
        {
            name: "LinkedIn",
            href: "https://www.linkedin.com/feed/",
            comment: [{
                "insert": "Grow your network"
            }],
            rating: 4
        },
        {
            name: "Facebook - Messages",
            href: "https://www.facebook.com/messages/",
            comment: [{
                "insert": "Time eater"
            }],
            rating: 2
        },
        {
            name: "Trello",
            href: "https://trello.com/b/ttGHQhyo/concordia-final-project",
            comment: [{
                "insert": "Project management"
            }],
            rating: 5
        },
        {
            name: "Trance classics - Vinyl mix",
            href: "https://www.youtube.com/watch?v=mbmQbKNJv3E",
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
        name: "Welcome new user!",
        content: [
            0
        ],
        state: "closed",
        order: 0
    }],
    links: [{
        name: "This is a demo link",
        href: "https://stackoverflow.com/",
        comment: [{
            "insert": "The best programer ressource!"
        }],
        rating: 5
    }],
    history: []
}

// ============================================================================================================================================================ EOF