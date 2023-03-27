const mongoose = require("mongoose")

const citySchema=mongoose.Schema({
    city:String,
    user:String
},{
    versionKey:false
})

const CityModel = new mongoose.model("search",citySchema)

module.exports={
    CityModel
}