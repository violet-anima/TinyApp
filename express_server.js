const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");

var PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {
  "general": {"b2xVn2": "http://www.lighthouselabs.ca",
              "9sm5xK": "http://www.google.com"
             },
  "i5Nk4a":  {"b2xVn3": "http://www.lighthouselabs.ca",
              "9sm5x9": "http://www.google.com"
             }
};

const users = {};
const visitCounts = {};
const visits = {};
const creationDates = {};

app.delete("/urls/:id/delete", (req, res) => {
  let user_id = req.session.user_id;
  if (req.params.id in urlDatabase[user_id]){
    delete urlDatabase[user_id][req.params.id];
    res.redirect(`/urls/`);
  } else {
    res.status(403);
    res.send("You don't have access to that code, or it doesn't exist");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) {

    res.status(401);
    //res.send("You need to be logged in for that.");
    res.redirect('/login');

  }

  let templateVars = { user_id: req.session.user_id,
                       users: users
                     };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let uniqueVisits = Object.keys(visits).length;
  let shortURL = req.params.id;
  let user_id = req.session.user_id;
  let shortURL_exists = false;

  for (user in urlDatabase) {
    if (shortURL in urlDatabase[user]) {
      shortURL_exists = true;
    }
  }

  if (!user_id) {

    res.status(401);
    //res.send("You need to be logged in for that.");
    res.redirect('/login');

  }

  else if (urlDatabase[user_id]) {

    if (!(shortURL in urlDatabase[user_id])) {
      res.status(403);
      res.send("You do not have access to that URL.");

    }
  }

  else if (!shortURL_exists) {

    res.status(404);
    res.send("Short URL with that id does not exist.");

  }

    let templateVars = { shortURL: req.params.id,
                         urls: urlDatabase,
                         user_id: req.session.user_id,
                         users: users,
                         visitCounts: visitCounts,
                         visits: visits,
                         uniqueVisits: uniqueVisits,
                         creationDates: creationDates
                       };

    res.render("urls_show", templateVars);

});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let user_id = req.session.user_id;
  let shortURL_exists = false;

  for (user in urlDatabase) {
    if (shortURL in urlDatabase[user]) {
      shortURL_exists = true;
    }
  }

  if (!user_id) {

    res.status(401);
    res.send("You need to be logged in for that.");

  } if (!(shortURL in urlDatabase[user_id])) {

    res.status(403);
    res.send("You do not have access to that URL.");

  } if (!shortURL_exists) {

    res.status(404);
    res.send("Short URL with that id does not exist.");

  } if (req.params.id in urlDatabase[user_id]){

    urlDatabase[user_id][shortURL] = req.body.newURL;
    res.redirect(`/urls/${shortURL}`);

  }
});

app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  let uniqueVisits = Object.keys(visits).length;

  let templateVars = { urls: urlDatabase,
                       user_id: user_id,
                       users: users,
                       creationDates: creationDates,
                       visitCounts: visitCounts,
                       uniqueVisits: uniqueVisits
                     };

  if (!user_id) {
    res.status(401);
  }

  res.render("urls_index", templateVars);
});

app.put("/urls", (req, res) => {
  let user_id = req.session.user_id;

  if (user_id in users){

    let url_id = generateRandomString();
    urlDatabase[user_id][url_id] =  req.body.longURL;

    creationDates[url_id] = new Date();
    visitCounts[url_id] = 0;

    res.redirect('/urls');

  } else {

    res.status(403);
    res.send('You need to be logged in to do that.');

  }
});


app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;

  let shortURL_exists = false;

  for (user in urlDatabase) {
    if (shortURL in urlDatabase[user]) {
      shortURL_exists = true;
    }
  }
  if (!shortURL_exists) {
    res.status(404);
    res.send("That short URL does not exist");
  }

  if (!(shortURL in visits)) {
    visits[shortURL] = {};
  }
  for (let user in urlDatabase) {
    if (shortURL in urlDatabase[user]) {
      shortURL_exists = true;
      let visitor_id = (req.session.user_id || generateRandomString());


      if (!(visitor_id in visits[shortURL])) {
        visits[shortURL][visitor_id] = [];
      }

      req.session.visitor_id = visitor_id;
      visits[shortURL][visitor_id].push(new Date());

      visitCounts[shortURL] += 1;
      let longURL = urlDatabase[user][shortURL];
      res.redirect(longURL);

    }
  }
});

app.post("/login", (req, res) => {
  let user_exists = false;
  let password_good = false;
  let user_id = '';

  for (user in users){
    if (users[user].email === req.body.email) {
      user_id = users[user].id;
      user_exists = true;
      if (bcrypt.compareSync(req.body.password, users[user_id].password)){
        password_good = true;
      }
    }
  }

  if (!user_exists) {
    res.status(403);
    res.send("Email not registered");
  }

  if (!password_good) {
    res.status(403);
    res.send("Incorrect Password");
  }

  req.session.user_id = user_id;
  res.redirect('/');
});

app.get("/login", (req, res) => {
  let templateVars = { user_id: req.session.user_id,
                       users: users
                     };
  res.render("login", templateVars);
});

app.delete("/logout", (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.get("/register", (req, res) => {
  let templateVars = { user_id: req.session.user_id,
                       users: users
                     }

  res.render("register", templateVars);
})

app.put('/register', (req, res) => {
  let user_id = generateRandomString();

  for (user in users) {
    if (req.body.email in users[user]) {
      res.status(400);
      res.send('User email already registered.');
    }
  }

  if (!req.body.email || !req.body.password){
    res.status(400);
    res.send('Please fill in both email and password.');
  }

  users[user_id] = {
    "id": user_id,
    "email": req.body.email,
    "password": bcrypt.hashSync(req.body.password, 10)
  };

  urlDatabase[user_id] = {};

  req.session.user_id = user_id;
  res.redirect('/');
});

app.get("/", (req, res) => {
  let user_id = req.session.user_id;
  if (user_id in users) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  //http://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 6; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
