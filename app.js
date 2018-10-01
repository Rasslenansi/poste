//required dependencies
const express = require('express');
const http = require('http');
const session = require('express-session');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const BodyParser = require('body-parser');

// declare app and requirements
app = express();
app.set("view-engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(BodyParser.urlencoded());
app.use(BodyParser.json());
app.use(session({secret:"laposte"}));

//connect to database
mongoose.connect("mongodb://localhost:27017/laposte");

//function to stop redirect
function rmredire(req) {
  if (req.session.redire){
    delete req.session.redire;
  }
}
//function to check user
function checklog(req, res) {
  if (req.session.prest) {
    res.redirect("prest");
  }
  else if (res.session.admin){
    res.redirect("admin");
  }
}

//routes
app.get("/", function (req,res) {
  res.render("index")
});
