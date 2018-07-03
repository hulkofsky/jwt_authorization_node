const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const morgan = require('morgan')
const passport = require('passport')
const config = require('./config/database')
const User = require('./app/models/user')
const jwt = require('jsonwebtoken')
const randToken = require('rand-token')
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//log requests to console
app.use(morgan('dev'))

//initialize passport
app.use(passport.initialize())

//connect to db
mongoose.connect(config.database)

//bring in password strategy
require('./config/passport')(passport)

//create API group Routes
const apiRoutes = express.Router()
let refreshTokens = {}
//register new users
apiRoutes.post('/register',(req,res)=>{
    if(!req.body.email||!req.body.password){
        res.json({success: false, message: 'Pls enter email and password to register'})
    }else{
        const newUser = new User({
            email: req.body.email,
            password: req.body.password
        })

        //save the new user
        newUser.save(err=>{
            if(err){
                console.log(err);
                return res.json({success: false, message: 'that email already exists'})
            }
            res.json({success: true, message: 'Succesfully created new user'})
        })
    }
})

//authenticate the user and get a JWT
apiRoutes.post('/authenticate', (req,res)=>{
    User.findOne({
        email: req.body.email
    }, (err, user)=>{
        if(err) throw err
        if(!user) {
            res.send({success: false, message: 'Authentication failed. User not found.'})
        }else{
            //check if passwords match
            user.comparePassword(req.body.password, (err, isMatch)=>{
                if (isMatch && !err) {
                    //create a token
                    const token = jwt.sign(user.toJSON(), config.secret, {
                        expiresIn: 10000 //in seconds
                    })
                    const refreshToken = randToken.uid(256)
                    refreshTokens[refreshToken] = req.body.email
                    res.json({success: true, token: 'JWT ' + token, refreshToken: refreshToken})
                }else{
                    console.log(err);
                    res.json({success: false, message: 'Authentication failed. Passwords did not match'})
                }
            })
        }
    })
})

apiRoutes.post('/token', (req,res,next)=>{
    const email = req.body.email
    const refreshToken = req.body.refreshToken
    if((refreshToken in refreshTokens) && (refreshTokens[refreshToken]==email)) {
        const user = {
            'email': email,
        }
        const token = jwt.sign(user, config.secret, {expiresIn: 300})
        res.json({success: true, token: 'JWT '+token})
    } else {
        console.log(refreshTokens)
        res.json({success: false, message: 'Authentification failed!'})
    }
})

//protect dashboard route with jwt
apiRoutes.get('/profile', passport.authenticate('jwt', {session: false}), (req,res)=>{
    res.send('Success! User Id is: ' + req.user._id + '.')
})

//set url for API group routes
app.use('/api', apiRoutes)

//home route
app.get('/', (req,res)=>{
    res.send('some homepage text')
})

app.listen(port)
console.log(`Server is runnig on ${port}`)