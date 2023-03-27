const express = require("express");
const {UserModel} = require("../models/user.model")
const userRoute = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config()

userRoute.post("/register",async (req,res)=>{
    let {email,password} = req.body;
    try {
        bcrypt.hash(password, 4, async(err, hash) => {
            if(err){
                res.send({"msg":"Something went wrong","Error":err})
            }
            else{
                let user = new UserModel({email, password : hash})
                await user.save();
                res.send("User Registered successfully");
            }
            
        });
    } catch (error) {
        res.send({"msg":"Something went wrong","Error":error.message})
    }  
})
userRoute.post("/login", async (req,res)=>{
    try {
        let {email,password} = req.body;
        let user = await UserModel.find({email});
        if(user.length > 0){
            bcrypt.compare(password, user[0].password, async (err, result) => {
                if(result){
                    let accesstoken = jwt.sign({userID:user[0]._id},process.env.accessTokenKey,{expiresIn:"1h"});
                    let refreshtoken = jwt.sign({userID:user[0]._id},process.env.refreshTokenKey,{expiresIn:"1d"});
                    res.send({"msg":"Login Successful", "access-token":accesstoken, "refresh-token":refreshtoken});    
                }
                else if(result == false){
                    res.send({"msg":"Wrong Password"})
                }
                else if(err){
                    res.send({"msg":"Something went wrong","Error":err})
                }
            });
        }
        else{
            res.send("user not exist")
        }
    } catch (error) {
        res.send({"msg":"Something went wrong","Error":error.message})
    }
})

module.exports={
    userRoute
}