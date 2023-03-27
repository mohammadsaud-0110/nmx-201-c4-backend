const express = require("express");
const {connection} = require("./config/mongoose")
require("dotenv").config()
const {userRoute} = require("./routes/user.route")
const {authenticate, validate} = require("./middleware/middleware")
const {weatherRoute} = require("./routes/weather.route")
const jwt = require("jsonwebtoken")

const winston=require("winston")
const expressWinston = require("express-winston");
require('winston-mongodb');

const app = express();
app.use(express.json());


const { createClient } = require('redis');
const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect();

app.use(expressWinston.logger({
    statusLevels: true,
    transports: [
      new winston.transports.MongoDB({
        level: "error",
        json: true,
        db: process.env.loggerDB
      })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
      )
  }));

app.get("/",(req,res)=>{
    res.send("Weather App homepage")
})

app.use("/user",userRoute)

app.get("/refreshToken", async(req,res)=>{
    try {
        let rtoken = req.headers.authorization;
        jwt.verify(rtoken, process.env.refreshTokenKey, async(err, decoded)=>{
            if(err){
                res.send({"msg":"Login Again","Error":err})
            }
            else if(decoded){
                let accesstoken = jwt.sign({userID:user[0]._id},process.env.accessTokenKey,{expiresIn:"1h"});
                res.send({"msg":"New access token","Access=token":accesstoken});
            }
        })
    } catch (error) {
        res.send({"msg":"Something went wrong","Error":error.message});
    }
    
})

app.get("/logout", async(req,res)=>{
    let token = req.headers.authorization;
    let exist = await client.hGet("blacklisthm", `${token}`);
    if(exist){
        res.send({"msg":"User already logged out"});
    }
    else{
        await client.hSet("blacklisthm", `${token}`, "1");
        res.send({"msg":"User logged out successfully"});
    }
})
 
app.use(authenticate);

app.use(validate);

app.use("/weather",weatherRoute);


app.listen(process.env.portNo,async()=>{
    try {
        await connection;
        console.log("Connected to DB");
        console.log("server port : 3300"+process.env.portNo)
    } catch (error) {
        console.log("Failed to connet to DB");
        console.log(error.message)
    }
})