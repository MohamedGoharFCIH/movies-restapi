const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const Schema = mongoose.Schema;

const movieSchema = new Schema({
    title: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    image: { type: String },
    avarage_rate: { type: Number, default: 0 },
    description: { type: String, required: false },
    rates: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rate"
        }
    ],

});


movieSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Movie", movieSchema);