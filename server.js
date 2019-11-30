let express = require('express')
let app = express()
let multer = require('multer');
let upload = multer()
let MongoClient = require('mongodb').MongoClient;
let reloadMagic = require('./reload-magic.js')

let hash = require('object-hash');
var key = require('weak-key');

reloadMagic(app)

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
                0
            ],
            state: "closed"
        }],
        links: [{
            name: "Stackoverflow",
            href: "https://stackoverflow.com/",
            comment: "The best programer ressource!",
            rating: 5
        }]
    }

    // check if the username is already taken.

    dbo.collection('users').findOne({
        username: name
    }, (err, user) => {
        if (err) {
            console.log("/signup error", err);
            res.json({
                success: false
            });
            return;
        }
        if (user !== null) {
            console.log("username already taken");
            res.json({
                success: false
            });
            return;
        }
        if (user === null) {
            console.log("username available");
            let sessionId = generateSessionId();
            res.cookie("sid", sessionId);

            // Insert a new "bank" for the user and get the id back
            dbo.collection('links').insertOne({
                defaultBank
            }, (err, linkBank) => {
                if (err) {
                    console.log("/Bank creation failed.", err)
                    res.json({
                        success: false,
                        errorMsg: "Bank creation failed"
                    })
                    return
                }

                console.log("linkBank._id", linkBank.insertedId, )
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
                            user: null
                        })
                        return
                    }

                    // Response for a new user
                    res.json({
                        success: true,
                        user: {
                            username: name,
                            categories: defaultBank.categories,
                            links: defaultBank.links
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
                success: false
            })
            return
        }
        if (user === null) {
            res.json({
                success: false
            })
            return
        }
        if (user.password === pwd) {
            res.json({
                success: true
            })
            return
        }
        res.json({
            success: false
        })
    })
})


// ========================================================================================== Cookie
app.post('/cookie', upload.none(), (req, res) => {
    let user = userData.find(u => {
        return u.username === req.body.username
    })

    if (user && user.password === req.body.password) {
        console.log("User found", user.username)

        // The user's links!
        // to get from DB

        let session = Math.floor(Math.random() * 1000000)
        console.log("session", session)
        sessions[session] = req.body.username
        res.cookie('session', session)
        res.send({
            success: true,
            user
        })
    } else {
        console.log("User NOT found")
        res.send({
            success: false,
            user: null
        })
    }
})








// ==================================================================================================== Don't touch below...

app.all('/route/*', (req, res, next) => { // needed for react router
    console.log("app.all()")
    res.sendFile(__dirname + '/build/index.html');
})


app.listen(4000, '0.0.0.0', () => {
    console.log("Server running on port 4000")
})