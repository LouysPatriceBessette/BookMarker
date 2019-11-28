let express = require('express')
let app = express()
let multer = require('multer');
let upload = multer()
let reloadMagic = require('./reload-magic.js')
var key = require('weak-key');

reloadMagic(app)

app.use('/', express.static('build')); // Needed for the HTML and JS files
app.use('/', express.static('public')); // Needed for local assets


// The users data!
let userData = require('./_userData.js')
//console.log(userData[0].username)

// Sessions
let sessions = []

// ================================================================================ login endpoint
app.post('/login', upload.none(), (req,res) => {
    let user = userData.find(u => {
        return u.username === req.body.username
    })
    
    if(user && user.password === req.body.password){
        console.log("User found", user.username)

        // The user's links!
        let links = require('./_links.js')
        let bank = links[user.id]

        let session = Math.floor(Math.random()*1000000)
        console.log("session",session)
        //res.send({success:true,user,bank,session})
        sessions[session] = req.body.username 
        res.cookie('session', session)

        let safe_user = {userId:user.id,username:user.username}
        res.cookie('user', JSON.stringify(safe_user))
        res.cookie('bank', JSON.stringify(bank))
        res.send({success:true,user:safe_user,bank})
    }else{
        console.log("User NOT found")
        res.send({success:false,user:null})
    }
})

// ================================================================================ cookie endpoint
app.post('/cookie', upload.none(), (req,res) => {
    let user = userData.find(u => {
        return u.username === req.body.username
    })
    
    if(user && user.password === req.body.password){
        console.log("User found", user.username)

        // The user's links!
        let links = require('./_links.js')
        let bank = links[user.id]

        let session = Math.floor(Math.random()*1000000)
        console.log("session",session)
        //res.send({success:true,user,bank,session})
        sessions[session] = req.body.username 
        res.cookie('session', session)
        res.send({success:true,user,bank})
    }else{
        console.log("User NOT found")
        res.send({success:false,user:null})
    }
})

// ================================================================================ signin endpoint
app.post('/signin', upload.none(), (req,res) => {
    
    let user = userData.find(u => {
        return u.username === req.body.username
    })

    if(typeof(user) === "undefined" && req.body.username !== "" && req.body.password !== ""){
        
        let newUser = {
            username: req.body.username,
            password: req.body.password,
            accessLevel: 10
            //id: ???
        }
        userData.push(newUser)
        console.log("User added", newUser.username)
        console.log(userData)
        res.send({success:true,user:newUser})
    }else{
        console.log("User NOT found")
        res.send({success:false,user:null})
    }
})






// ================================================================================ Don't touch below...

app.all('/route/*', (req, res, next) => { // needed for react router
    console.log("app.all()")
    res.sendFile(__dirname + '/build/index.html');
})


app.listen(4000, '0.0.0.0', () => { console.log("Server running on port 4000") })
