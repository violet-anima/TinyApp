
const express        = require("express");
const app            = express();
let PORT             = process.env.PORT || 8080; // default port is 8080
const bodyParser     = require("body-parser");
const bcrypt         = require("bcrypt");
const cookieSession  = require("cookie-session");

//----------MIDDLEWARE----------//
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  secret: "secret"
}));


//-------DATABASES-------//
let urlDatabase = {
  "b2xVn2": {
    longURL:"http://www.lighthouselabs.ca",
    shortURL:"b2xVn2",
    user_id:"6DwtSg"
  },
  "9sm5xK": {
    longURL:"http://www.google.com",
    shortURL:"9sm5xK",
    user_id:"h5DF3s"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


//-------GETS POSTS-------//
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//-------HELPER FUNCTIONS-------//
function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( let i=0; i < 6; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


function urlsForUser(id) {
  let userURLS = {};
  for(let shortURLS in urlDatabase) {
    if(urlDatabase[shortURLS].id === id) {
      userURLS[shortURLS] = urlDatabase[shortURLS];
    }
  }
  return userURLS;
}


//-------READ: Redirects to Display URLs-------//
app.get("/", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.redirect("urls_index", templateVars);
});


//-------SEARCH: Displays URLs-------//

app.get("/urls", (req, res) => {

  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };

for(let i in users){
  var loggedIn = (req.body.email === users[i].email &&
                  bcrypt.compareSync(req.body.password, encryPass)
};


  if (loggedIn == undefined) {
  res.redirect("/urls_login");

//  res.render("urls_index", templateVars);
}});









//-------Retrieves login page-------//
app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});


//-------Retrieves URL Shortener-------//
app.get("/urls/new", (req, res) => {
  let templateVars = {
  user: users[req.session.user_id],
  };
  if (users[req.session.user_id] === undefined){
    res.redirect("/urls");
  } else {
    res.render("urls_new", templateVars);
  }
});


//-------Retrieves User's URLS-------//
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    link: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id]
    };
  res.render("urls_show", templateVars);
});


//-------Creates New Shortened URL-------//
app.post("/urls", (req, res) => {
  let random = generateRandomString();
  let newObj = {};
  newObj.user_id = req.session.user_id;
  newObj.shortURL = random;
  newObj.longURL = req.body.longURL;
  urlDatabase[random] = newObj;
  let newURL = random;
  res.redirect("urls/" + newURL);
});


//-------Redirects Shortened Url to Long Url-------//
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});


//-------Displays Registration Page-------//
app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]

  };
  res.render("urls_register", templateVars);
});


//-------Registers New User and Assigns Unique ID-------//

app.post("/register", (req, res) => {
    let newObj = {};
    let random = generateRandomString();
    newObj.password = req.body.password;
    newObj.id = random;
    newObj.email = req.body.email;

  if (req.body.email === "" || req.body.password === "") {
      res.send("400.  Please enter an email and password.");
  } else {
    let authenticated;
    for(let i in users) {
      if (users[i].email === req.body.email) {
        res.statusCode = 400
        res.send("400.  This email is already registered.");
      } else{
          authenticated = true;
          users[random] = newObj;
          req.session.user_id = users[i].id;
          console.log(req.session.user_id);
          res.redirect("/urls");
        }
      }
    }
});



//-------Login-------//
app.post("/login", (req, res) => {
  req.session.user_id = undefined;
  let encryPass = bcrypt.hashSync(req.body.password, 10);
    let foundUser;
    for(let i in users){
      if (req.body.email === users[i].email && bcrypt.compareSync(req.body.password, encryPass)) {
        foundUser = true;
        req.session.user_id = users[i].id;
        res.redirect("/urls");
      } else if (foundUser == undefined) {
        res.statusCode = 403;
        res.send("403.  Password and/or Email is incorrect.");
        }
      }

});


//-------Logout-------//
app.post("/urls/logout", (req, res) => {
  req.session = undefined;
  res.redirect("/urls");
});


//-------Deletes URLs-------//
app.post("/urls/:id/delete", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  }
  if (users[req.session.user_id] === undefined){
    res.redirect("/urls");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});


//-------Updates URL-------//
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/" + req.params.id);
});


//-------LISTENS-------//
app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});


