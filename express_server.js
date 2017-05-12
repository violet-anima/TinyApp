// SCRUD - Search
// URLS - Create
// URLS - Read: shows individual urls
// URLS - Update
// URLS - Delete
// USERS - Create Users
// USERS - Logging
// SERVER - Listening



const express        = require("express");
const app            = express();
let PORT             = process.env.PORT || 8080; // default port is 8080
//const cookieParser   = require("cookie-parser");
const bodyParser     = require("body-parser");
const bcrypt         = require("bcrypt");
const cookieSession  = require("cookie-session");


app.set("view engine", "ejs");


// Middleware

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.user_id = req.cookies.user_id;
  next();
});



function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( let i = 0; i < 6; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

let random = generateRandomString();




// Database for Urls and Users

const urlDatabase = {
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
}



// SCRUD - Search


app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user:users[req.cookies['user_id']]
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
  user:users[req.cookies['user_id']],
  }
  if (users[req.cookies['user_id']] === undefined){
    res.redirect("/urls");
  } else {
    res.render("urls_new", templateVars);
}
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    link: urlDatabase[req.params.id].longURL,
    user:users[req.cookies["user_id"]]
    };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  var random = generateRandomString();
  console.log(req.cookies);
  newObj = {};
  newObj.user_id = req.cookies.user_id;
  newObj.shortURL = random;
  newObj.longURL = req.body.longURL;
  urlDatabase[random] = newObj;
  var newURL = random;
  res.redirect("urls/" + newURL);
});


// URLS - Read: shows individual urls

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});






// URLS - Update

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});




// Create - Users

app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user:users[req.cookies['user_id']]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  var random = generateRandomString();
  var authenticated = true;
  newObj = {};
  newObj.id = random;
  newObj.email = req.body.email;
  newObj.password = req.body.password;
  if (authenticated) {
    for(i in users) {
      if (users[i].email === req.body.email) {
        authenticated = false;
      }
    }
  if (req.body.email === "" || req.body.password === "") {
    authenticated = false;
    }
    if (authenticated) {
      users[random] = newObj;
      res.cookie("user_id", random);
      res.redirect("/urls");
      console.log(users);
    } else {
      res.statusCode = 400
      res.send("This email is already registered");
      }
    }
});

// USERS - Logging

app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user:users[req.cookies['user_id']]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  var loggedIn = false;
  if (!loggedIn) {
    for(i in users){
      if (users[i].email === req.body.email && users[i].password === req.body.password)
        loggedIn = true
    }
    if (loggedIn) {
      res.cookie("user_id", users[i].id);
      res.redirect("/urls");
      console.log(users[i].id);
    } else {
      res.statusCode = 403;
      res.send("403.  Problem with email and/or password.");
   }
  }
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});



app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/" + req.params.id);
});


// SERVER - Listening

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});
