const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminSchema = new Schema({
  nom: {type:String, required:true},
  prenom: {type:String, required:true},
  id: {type:String, required:true},
  pass: {type:String, required:true},
  etablissement: {type:String, required:true}
});
module.exports = mongoose.model('admin', AdminSchema);
