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
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(BodyParser.urlencoded());
app.use(BodyParser.json());
app.use(session({secret:"laposte"}));

var server = require('http').createServer(app);
//connect to database
mongoose.connect("mongodb://localhost:27017/laposte");

//mongoose models
const admin = require('./models/admin.js');
const colis = require('./models/colis.js');
const prest = require('./models/prest.js');

// ###[routes]###

//    ##[GET]##
// index
app.get("/", function (req,res) {
  checklog(req,res);
  res.render("index");
});

// index
app.get("/index", function (req,res) {
  checklog(req,res);
  res.render("index");
});

//login as admin
app.get("/admin", function (req,res) {
  if (req.session.admin) {
    res.render("admin_profile", {admin: req.session.admin});
  }
  else {
    res.render("admin_login");
  }
});

//login of prestataire
app.get("/prest", function (req,res) {
  if (req.session.prest) {
    res.render("prest_profile");
  }
  else {
    res.render("prest_login");
  }
});

//ajouter un prest (page)
app.get("/add_prest", function (req,res) {
  rmredire(req);
  if (req.session.admin) {
    res.render("add_admin", {admin: req.session.admin});
  }
  else {
    res.render("admin_login", {ps:"Vous devez être administrateur pour acceder à ce lien"});
  }
});

//  ##[POST]##
//login as admin
app.post("/admin_login", function (req,res) {
   var email = req.body.email;
   var pass = req.body.pass;
   admin.findOne({email: email}, function (error, admin) {
     if (error) res.render("error", {error: error});
     if (admin){
       if (bcrypt.compareSync(pass, admin.pass)) {
         req.session.admin = admin;
         res.render("admin_profile", {admin: admin});
       }
       else {
         res.render("admin_login", {error: "le mot de passe ou l'addresse n'est pas correcte"});
       }
     }
   });
});
//login as prest
app.post("/prest_login", function (req,res) {
   var email = req.body.email;
   var pass = req.body.pass;
   console.log(email);
   console.log(pass);
   prest.findOne({email: email}, function (error, prest) {
     if (error) res.render("error", {error: error});
     if (bcrypt.compareSync(pass, prest.pass)) {
       req.session.prest = prest;
       res.render("prest_profile", {prest: prest});
     }
     else {
       res.render("prest_login", {error: "le mot de passe ou l'addresse n'est pas correcte"});
     }
   });
});

// ##[Functions]##
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
  else if (req.session.admin){
    res.redirect("admin");
  }
}

//listen
server.listen(80);
console.log("listening");
