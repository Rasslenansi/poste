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
const bal = require('./models/bal.js');
const prest = require('./models/prest.js');

// ###[routes]###

//    ##[GET]##
// index
app.get("/", function (req,res) {
  if (req.session.admin) {
    res.render("index", {admin:req.session.admin});
  }
  else if (req.session.prest) {
    res.render("index", {prest: req.session.prest});
  }
  else {
    res.render("index");
  }
});

// index
app.get("/index", function (req,res) {
  checklog(req,res);
  res.render("index");
});

//login as admin
app.get("/admin", function (req,res) {
  rmredire(req);
  if (req.session.admin) {
    res.render("admin_profile", {admin: req.session.admin});
  }
  else {
    res.render("admin_login");
  }
});

//login of prestataire
app.get("/prest", function (req,res) {
  rmredire(req);
  if (req.session.prest) {
    bal.find({$and:[{id:req.session.id}, {relev:"false"}]}, function (error,result) {
      if (error) res.render("error", {error:error});
      if (result) {
        res.render("prest_profile", {prest:req.session.prest, bal_list:result});
      }
    });
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
    req.session.redirect = "/add_prest"
    res.render("admin_login", {ps:"Vous devez être administrateur pour acceder à cette page"});
  }
});
//ajouter un admin (page)
app.get("/add_admin", function (req,res) {
  rmredire(req);
  if (req.session.admin) {
    res.render("add_prest", {admin: req.session.admin});
  }
  else {
    req.session.redirect = "/add_admin";
    res.render("admin_login", {ps:"Vous devez être administrateur pour acceder à cette page"})
  }
});
//ajouter une Bal
app.get("/add_bal", function (req,res) {
  rmredire(req);
  if (req.session.admin) {
    res.render("add_bal");
  }
  else {
    req.session.redirect = "/add_bal";
    res.render("admin_login", {ps: "vous devez etre administrateur pour ajouter des colis"});
  }
});
//voir le profil d'un prestataire
app.get("/prest_details/:id", function (req,res) {
  rmredire(req);
  prest.findOne({_id:req.params.id}, function (error,result) {
    if (error) res.render("error", {error:error});
    if (result) {
      res.render("prest_details", {prest: result});
    }
  });
});
//voir le profil d'un admin
app.get("/admin_details/:id", function (req,res) {
  rmredire(req);
  admin.findOne({_id:req.params.id}, function (error,result) {
    if (error) res.render("error", {error:error});
    if (result) {
      res.render("admin_details", {admin: result});
    }
  });
});
//list of prestaires
app.get("/prest_list", function (req,res) {
  rmredire(req);
  if (req.session.admin){
    prest.find({}, function (error,result) {
      if (error) res.render("error", {error:error});
      res.render("prest_list", {list:result});
    });
  }else {
    res.redirect("/admin")
  }
});
//deconnection
app.get("/deconnection", function (req,res) {
  rmredire(req);
  req.session.destroy();
  res.redirect("/");
});
//show list of bals
app.get("/bal_list", function (req,res) {
  rmredire(req);
  if (req.session.admin) {
    bal.find({}, function (error, bal_list) {
      if (error) res.render("error", {error:error});
      res.render("bal_list", {bal_list:bal_list});
    });
  }else {
    req.session.redirect = "/bal_list"
    res.redirect("/admin")
  }
});
//  ##[POST]##
//login as admin
app.post("/admin_login", function (req,res) {
   var id = req.body.id;
   var pass = req.body.pass;
   admin.findOne({id: id}, function (error, admin) {
     if (error) res.render("error", {error: error});
     if (admin){
       if (bcrypt.compareSync(pass, admin.pass)) {
         req.session.admin = admin;
         if (req.session.redirect){
           res.redirect(req.session.redirect);
         }else {
           res.render("admin_profile", {admin: admin});
         }
       }
       else {
         res.render("admin_login", {error: "le mot de passe est incorrecte"});
       }
     }
     else {
       res.render("admin_login", {error: "cet ID n'existe pas"});
     }
   });
});
//login as prest
app.post("/prest_login", function (req,res) {
   var id = req.body.id;
   var pass = req.body.pass;
   prest.findOne({id: id}, function (error, prest) {
     if (error) res.render("error", {error: error});
     if (prest){
       if (bcrypt.compareSync(pass, prest.pass)) {
       req.session.prest = prest;
       bal.find({prest: prest.id, relev:false}, function (error, bal_list) {
         if (error) res.render("error", {error:error});
         if (bal_list) {
           res.render("prest_profile", {prest:prest, bal_list:bal_list});
         }
       });
     }
     else {
       res.render("prest_login", {error: "le mot de passe ou l'addresse n'est pas correcte"});
     }
   }
   else {
    res.render("prest_login", {error: "le mot de passe ou l'addresse n'est pas correcte"});
   }
   });
});
//add prest
app.post("/add_prest", function (req,res) {
  var hashedPass = bcrypt.hashSync(req.body.pass, 10);
  console.log(hashedPass);
  prest.create({
    nom: req.body.nom,
    prenom: req.body.prenom,
    id: req.body.id,
    pass: hashedPass
  }, function (error, prest) {
    if (error) {
      res.render("add_prest", {error: "cet ID est déja utilisé"});
    }
    else {
      res.redirect("/prest_details/"+prest._id);
    }
  });
});
//add admin
app.post("/add_admin", function (req,res) {
  var hashedPass = bcrypt.hashSync(req.body.pass, 10);
  console.log(hashedPass);
  admin.create({
    nom: req.body.nom,
    prenom: req.body.prenom,
    id: req.body.id,
    pass: hashedPass
  }, function (error, admin) {
    if (error) {
      res.render("add_admin", {error: "cet ID est déja utilisé"});
    }
    else {
      res.redirect("/admin_details/"+admin._id);
    }
  });
});

//update admin information
app.post("/update_admin", function (req,res) {
  admin.findOneAndUpdate({_id:req.session.admin._id}, {$set:{
    nom: req.body.nom,
    prenom: req.body.prenom,
    etablissement: req.body.etablissement
  }},{new: true}, function (error,result) {
    if (error) res.render("error", {error: error});
    if (result) {
      req.session.admin = result;
      res.render("admin_profile", {admin: req.session.admin});
    }
    else {
      res.render("error", {error:"a problem occured"});
    }
  });
});
//ajouter bal
app.post("/add_bal", function (req,res) {
  bal.create({
    address: req.body.address,
    burpro: req.body.burpro,
    pin: req.body.pin,
    prest: req.body.prest,
    regat: req.body.regat,
    relv_par: req.body.regat,
    relev: false
  },function (error,bal) {
    if (error) res.render("error", {error: error});
    if (bal) {
      res.render("resume_bal", {bal: bal});
    }
  });
});

// ##[Functions]##
//function to stop redirect
function rmredire(req) {
  if (req.session.redirect){
    delete req.session.redirect;
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

//permenant test
app.get("/test", function (req,res) {
  res.render("test");
});
app.post("/test", function (req,res) {
  var id = req.body.id;
  var nom = req.body.nom;
  var prenom = req.body.prenom;
  var pass = bcrypt.hashSync(req.body.pass, 10);
  var etablissement = req.body.etablissement;
  admin.create({
    id : id,
    nom : nom,
    prenom : prenom,
    pass : pass,
    etablissement : etablissement
  }, function (error, admin) {
    if (admin) {
      res.render("test", {ps:"success"});
    }
    else {
      res.render("test", {ps:"Failed"});
    }
  });
});

//listen
server.listen(80);
console.log("listening");

//socket and picking up bals
var io = require('socket.io')(server);
io.sockets.on("connection", function (socket) {
  socket.on("relever", function (data) {
    var id = data.id;
    var pin = data.pin;
    bal.findOne({_id:id, pin:pin}, function (error,boite) {
      if (boite) {
        bal.findOneAndUpdate({_id:id}, {$set:{relev:true}}, function (error,result) {
          if (result) {socket.emit("success", result._id)}
        });
      }
      else {
        socket.emit("fail", id);
      }
    });
  });
})
