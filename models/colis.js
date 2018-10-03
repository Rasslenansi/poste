const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ColisSchema = new Schema({
  address: {type: String, required: true},
  burpro: {type: String, required: true},
  pin: {type: String, required: true},
  prest: {type: String, required:true}
});
module.exports = mongoose.model('colis', ColisSchema);
