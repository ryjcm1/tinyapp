
const express = require("express");

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const { users } = require("./data/userDatabase");
const { urlDatabase } = require("./data/urlDatabase");
const { generateRandomString } = require("./helper_functions/generateRandomString")

const req = require("express/lib/request");
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


app.set("view engine", "ejs");


app.get("/", (req, res) => {
  res.redirect("/urls")
});


app.get("/urls", (req,res) => {
  
  if(req.cookies["user_id"] === undefined){
    res.redirect('/login')
    return;
  }
  
  const cookieId = req.cookies["user_id"]
  const specificUrls = {};
  const urlKeys = Object.keys(urlDatabase);

  for(let urlKey of urlKeys){
    if(urlDatabase[urlKey].userID === cookieId){
      specificUrls[urlKey] = urlDatabase[urlKey];
    }
  }

  // console.log(specificUrls);

  const templateVars = {
    user: users[cookieId],
    urls: specificUrls
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {

  
  // console.log(cookieId);
  
  if(req.cookies["user_id"] === undefined){
    res.redirect('/login')
    return;
  }
  const cookieId = req.cookies["user_id"]

  const templateVars = { user: users[cookieId] };
  res.render("urls_new", templateVars);
});


//add to this
app.get("/urls/:shortURL", (req, res) => {
  const cookieId = req.cookies["user_id"]
  const urlObject = urlDatabase[req.params.shortURL];

  if(urlObject.userID !== cookieId){
    res.send("Not your link");
    return;
  }

  const templateVars = { user: users[cookieId], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/register", (req, res) => {
  const cookieId = req.cookies["user_id"]
  const templateVars = { user: users[cookieId], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("user_register", templateVars)
})

app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("user_login", templateVars)
})

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString(6);
  const userID = req.cookies["user_id"];

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

  let userKeys = Object.keys(users)

  for(let userKey of userKeys){
    const current = users[userKey]
    if(email === current.email && bcrypt.compareSync(password, current.password)){
      res.cookie("user_id", current.id);
      res.redirect("/urls");
      return;
    }
  }

  res.status(403).send('Invalid Email or Password.');
  //check if valid user and email
})

app.post("/logout" , (req, res) => {
  res.clearCookie('user_id');
  // console.log(users)
  res.redirect("/login");
})

app.post("/register", (req, res) => {
  const id = generateRandomString(9)
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password,10)

  if(email === "" || password === ""){
    
    res.status(404).send('Email and Password can not be empty.');
  }
  
  const newUserObject = {
    id,
    email,
    password: hashedPassword
  }

  console.log(newUserObject);

  users[id] = newUserObject;
  res.cookie("user_id", id)

  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


