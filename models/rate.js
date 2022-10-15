var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const rateSchema = new Schema({

   rate: Number,
   movie: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Movie"
      }
   ]
});


rateSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Rate", rateSchema);