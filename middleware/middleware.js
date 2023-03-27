const jwt = require("jsonwebtoken")
require("dotenv").config();

const { createClient } = require('redis');
const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect();

const authenticate = async (req,res,next)=>{
    let token = req.headers.authorization;
    if(token){
        let exist = await client.hGet("blacklisthm", `${token}`);
        if(exist){
            res.send({"msg":"Login again"});
        }
        else{
            jwt.verify(token, process.env.accessTokenKey, async(err, decoded)=>{
                if(err){
                    res.send({"msg":"Login Again","Error":err})
                }
                else if(decoded){
                    req.body.user = decoded.userID;
                    next();
                }
            })
        }        
    }
    else{
        res.send({"msg":"Login first"});
    }
}

const validate = async (req,res,next)=>{
    let {city} = req.query;
    let regex = /^[A-z]+$/i;
    let ans = regex.test(city);
    if(ans){
        next()
    }
    else{
        res.send({"msg":"Enter Valid City Name"})
    }
}

module.exports={
    authenticate,
    validate
}