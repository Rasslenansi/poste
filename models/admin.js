const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminSchema = new Schema({
  nom: {type:String, required:true},
  prenom: {type:String, required:true},
  email: {type:String, required:true},
  pass: {type:String, required:true}
});
