const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const user = require('../app/models/user')
const config = require('../config/database')

module.exports = passport=>{
    const opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt")
    opts.secretOrKey = config.secret
    passport.use(new JwtStrategy(opts, (jwt_payload, done)=>{
        user.findOne({id: jwt_payload.id}, (err,user)=>{
            if(err){
                return done(err, false);
            }
            if (user){
                done(null,user)
            }else{
                done(null, false)
            }
        })
    }))
}