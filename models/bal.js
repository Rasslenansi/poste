const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BalSchema = new Schema({
  address: {type: String, required: true},
  burpro: {type: String, required: false},
  pin: {type: String, required: true},
  prest: {type: String, required:true},
  regat: {type: String, required: false},
  relv_par: {type: String, require: false},
  relev: {type: Boolean}
});
module.exports = mongoose.model('bal', BalSchema);
