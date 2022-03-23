
const mongoose = require('mongoose');


let CatModel = {};

const CatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  bedsOwned: {
    type: Number,
    min: 0,
    required: true,
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },

});

CatModel = mongoose.model('Cat', CatSchema);

// We only want to export the cat model, so we can overwrite the entire exports object.
module.exports = CatModel;
