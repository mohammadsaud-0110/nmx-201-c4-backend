const express = require("express");
const weatherRoute = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const {CityModel} = require("../models/city.model")
require("dotenv").config();

const { createClient } = require('redis');
const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect();

weatherRoute.get("/", async (req,res)=>{
    let {city} = req.query;
    let exist = await client.hGetAll("weatherhm");
    // await client.hGetAll('key');
    if(exist){
        res.send(exist[`${city}`]);
    }
    else{
        let data = await fetch(`http://api.weatherapi.com/v1/current.json?key=${process.env.apiKey}&q=${city}&aqi=no`).then((res)=>{return res.json()});
        await client.hSet("weatherhm", `${city}`, `${data}` , { EX: 10, NX: true });
        let payload = {
            city: `${city}`,
            user: `${req.body.user}`
        }
        let ncity = new CityModel(payload);
        await ncity.save();
        res.send(data);
    }
})

module.exports={
    weatherRoute
}