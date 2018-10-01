const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PresSchema = new Schema({
  nom: {type:String, required:true},
  prenom: {trype:String, required:true},
  email: {type:String, required:true},
  pass: {type:String, required:true}
});
