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
let dbo = undefined
let url = "mongodb+srv://Bes7weB:bmowi6R4jOiVe8LDzI2q@cluster0-8e3qb.gcp.mongodb.net/test?retryWrites=true&w=majority"
MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, db) => {
    if (err) {
        console.log(err)
    }
    dbo = db.db("BookMarker")
})

// ==================================================================================================== GLOBAL SERVER VARIABLES
let sessions = []

// ==================================================================================================== FUNCTIONS
let generateSessionId = () => {
    return "" + Math.floor(Math.random() * 10000000000);
};

// ==================================================================================================== ENDPOINTS

// ========================================================================================== Signup
app.post('/signup', upload.none(), (req, res) => {
    console.log("======================================================= /signup")

    let name = req.body.username
    let pwd = hash({
        passwordHashed: req.body.password
    }) // has to be an object

    // Initial link category for a new user
    let defaultBank = {
        categories: [{
                name: "Concordia",
                content: [
                    3
                ],
                state: "closed"
            },
            {
                name: "Social",
                content: [
                    1, 2
                ],
                state: "closed"
            },
            {
                name: "Coding",
                content: [
                    0
                ],
                state: "closed"
            },
            {
                name: "Coding music",
                content: [
                    4
                ],
                state: "opened"
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
                    "insert": "Project manager"
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
        ]

    }

    // check if the username is already taken.
    dbo.collection('users').findOne({
        username: name
    }, (err, user) => {
        if (err) {
            console.log("/signup error", err);
            res.json({
                success: false,
                errorMsg: "DBO error on find user"
            });
            return;
        }

        // The username is taken
        if (user !== null) {
            console.log("username already taken");
            res.json({
                success: false,
                errorMsg: "Username already taken"
            });
            return;
        }

        // The username is available
        if (user === null) {
            console.log("username available");

            // Insert a new "bank" for the user and get the id back
            dbo.collection('links').insertOne({
                categories: defaultBank.categories,
                links: defaultBank.links
            }, (err, linkBank) => {
                if (err) {
                    console.log("/Bank creation failed.", err)
                    res.json({
                        success: false,
                        errorMsg: "Bank creation failed"
                    })
                    return
                }

                // Insert the user in DB
                dbo.collection('users').insertOne({
                    username: name,
                    password: pwd,
                    bankId: linkBank.insertedId
                }, (err, user) => {
                    if (err) {
                        console.log("/signup error", err)
                        res.json({
                            success: false,
                            errorMsg: "DBO error on insert user"
                        })
                        return
                    }

                    // Set the session cookie
                    let sessionId = generateSessionId();
                    res.cookie("sid", sessionId);
                    sessions[sessionId] = user.insertedId

                    // ========================= Success response
                    res.json({
                        success: true,
                        user: {
                            username: user.username,
                            categories: defaultBank.categories,
                            links: defaultBank.links,
                            errorMsg: "No error"
                        }
                    })
                }) // END user insert

            }) // END links insert

        } // END if user === null
    })
})

// ========================================================================================== Login
app.post('/login', upload.none(), (req, res) => {
    console.log("======================================================= /login")

    let name = req.body.username
    let pwd = hash({
        passwordHashed: req.body.password
    }) // has to be an object

    dbo.collection('users').findOne({
        username: name
    }, (err, user) => {
        if (err) {
            console.log("/login error", err)
            res.json({
                success: false,
                errorMsg: "DBO error on find user"
            })
            return
        }

        // User not found
        if (user === null) {
            res.json({
                success: false,
                errorMsg: "User not found"
            })
            return
        }

        // User found and password match
        if (user.password === pwd) {

            // Set the session cookie
            let sessionId = generateSessionId();
            res.cookie("sid", sessionId);
            sessions[sessionId] = user._id

            // Retreive user's bank
            dbo.collection('links').findOne({
                _id: ObjectId(user.bankId)
            }, (err, userBank) => {
                if (err) {
                    console.log("Error retreiving the user's bank", err)
                    res.json({
                        success: false,
                        errorMsg: "DBO error on find user's link bank"
                    })
                    return
                }

                // ========================= Success response
                res.json({
                    success: true,
                    user: {
                        username: user.username,
                        categories: userBank.categories,
                        links: userBank.links,
                        errorMsg: "No error"
                    }
                })
                return
            })



        } else {
            // Password does not match
            res.json({
                success: false,
                errorMsg: "Password does not match"
            })
        }
    })
})


// ========================================================================================== Cookie
app.post('/cookie', upload.none(), (req, res) => {
    console.log("======================================================= /cookie")

    // Get the cookie sid
    let sid = req.cookies.sid

    // Check in active sessions
    if (sessions[sid]) {

        let userId = sessions[sid]

        dbo.collection('users').findOne({
            _id: ObjectId(userId)
        }, (err, user) => {
            if (err) {
                console.log("/cookie error", err)
                res.json({
                    success: false,
                    errorMsg: "DBO error on find user"
                })
                return
            }

            // User not found
            if (user === null) {
                res.json({
                    success: false,
                    errorMsg: "User not found"
                })
                return
            }

            // Retreive user's bank
            dbo.collection('links').findOne({
                _id: ObjectId(user.bankId)
            }, (err, userBank) => {
                if (err) {
                    console.log("Error retreiving the user's bank", err)
                    res.json({
                        success: false,
                        errorMsg: "DBO error on find user's link bank"
                    })
                    return
                }

                // ========================= Success response
                res.json({
                    success: true,
                    user: {
                        username: user.username,
                        categories: userBank.categories,
                        links: userBank.links,
                        errorMsg: "No error"
                    }
                })
                return
            })
        })



        // ===========================================

    } else {
        res.send({
            success: false,
            errorMsg: "Session not found"
        })
    }


})

// ========================================================================================== Logout
app.post('/logout', upload.none(), (req, res) => {
    console.log("======================================================= /logout")

    // Get the cookie sid
    let sid = req.cookies.sid

    // Check in active sessions
    if (sessions[sid]) {

        // Just remove the session id from the active sessions
        delete sessions[sid]

        res.send({
            success: true,
            errorMsg: "Session removed"
        })

    } else {
        res.send({
            success: false,
            errorMsg: "Session not found"
        })
    }


})

// ========================================================================================== Validate URL
app.post('/valid-url', upload.none(), (req, res) => {

    console.log("========================================== REQUEST TO /valid-url ")
    let urlToCheck = req.body.url

    request
        .get(urlToCheck)
        .on('error', function (err) {
            console.log("ERROR on request - ", err)
            res.send({
                success: false,
                errorMsg: "ERROR on request - " + err
            })
            return
        })
        .on('response', function (response) {
            console.log("response.statusCode", response.statusCode)
            if (response.statusCode === 200) {
                res.send({
                    success: true,
                    errorMsg: "URL valid"
                })
            } else {
                res.send({
                    success: false,
                    errorMsg: "URL invalid"
                })
            }
        })

})



// ==================================================================================================== Don't touch below...

app.all('/route/*', (req, res, next) => { // needed for react router
    console.log("app.all()")
    res.sendFile(__dirname + '/build/index.html');
})


app.listen(4000, '0.0.0.0', () => {
    console.log("Server running on port 4000")
})