// models/User.js
const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  EmployeeName: {
    type: String,
    required: true,
  },
  Position:{
    type:Number,
    required:true,
  }
});

module.exports = mongoose.model('Data', dataSchema);
