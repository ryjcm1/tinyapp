
const express = require("express");

const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')

const bcrypt = require('bcryptjs');

const { users } = require("./data/userDatabase");
const { urlDatabase } = require("./data/urlDatabase");
const { getUserByEmail, generateRandomString } = require("./helper_functions/helpers")

const req = require("express/lib/request");
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  secret: "some string",
  cookie: {maxAge: 120000},
  saveUninitialized: false

}))

app.set("view engine", "ejs");


app.get("/", (req, res) => {
  res.redirect("/urls")
});


app.get("/urls", (req,res) => {
  
  if(req.session.user_id === undefined){
    res.redirect('/login')
    return;
  }
  
  const sessionID = req.session.user_id;
  const specificUrls = {};
  const urlKeys = Object.keys(urlDatabase);

  for(let urlKey of urlKeys){
    if(urlDatabase[urlKey].userID === sessionID){
      specificUrls[urlKey] = urlDatabase[urlKey];
    }
  }

  // console.log(specificUrls);

  const templateVars = {
    user: users[sessionID],
    urls: specificUrls
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {

  
  // console.log(cookieId);
  
  if(req.session.user_id === undefined){
    res.redirect('/login')
    return;
  }
  const sessionID = req.session.user_id;

  const templateVars = { user: users[sessionID] };
  res.render("urls_new", templateVars);
});


//add to this
app.get("/urls/:shortURL", (req, res) => {
  const sessionID = req.session["user_id"]
  const urlObject = urlDatabase[req.params.shortURL];

  if(urlObject.userID !== sessionID){
    res.send("Not your link");
    return;
  }

  const templateVars = { user: users[sessionID], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/register", (req, res) => {
  const sessionID = req.session["user_id"]
  const templateVars = { user: users[sessionID], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("user_register", templateVars)
})

app.get("/login", (req, res) => {
  const sessionID = req.session["user_id"]
  const templateVars = { user: users[sessionID], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("user_login", templateVars)
})

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString(6);
  const userID = req.session["user_id"];

  const newUrlObject = {
    longURL,
    userID
  }
  
  urlDatabase[id] = newUrlObject;

  res.redirect(`/urls/${id}`)

});

app.post("/urls/:shortURL/delete", (req,res) => {
  const itemToDelete = req.params.shortURL;
  delete urlDatabase[itemToDelete];
  
  res.redirect("/urls");
})

app.post("/u/:shortURL/edit", (req,res) => {
  const urlKey = req.params.shortURL;
  const newURL = req.body.longURL;
  urlDatabase[urlKey].longURL = newURL;

  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userInfo = getUserByEmail(email, users);

  if(!userInfo){
    res.status(403).send('Invalid Email.');
    return;
  }

  if(! bcrypt.compareSync(password, userInfo.password)){
    res.status(403).send('Invalid Password.');
    return;
  }

  req.session.user_id = userInfo.id;
  res.redirect("/urls");

})

app.post("/logout" , (req, res) => {
  res.clearCookie('user_id');
  // console.log(users)
  req.session = null;
  res.redirect("/login");
})

app.post("/register", (req, res) => {
  const id = generateRandomString(9)
  const email = req.body.email;
  const password = req.body.password;
  
  
  
  if(email === "" || password === ""){
    res.status(404).send('Email and Password can not be empty.');
  }
  
  const hashedPassword = bcrypt.hashSync(password,10)
  const newUserObject = {
    id,
    email,
    password: hashedPassword
  }
  
  users[id] = newUserObject;
  req.session.user_id = id;

  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


