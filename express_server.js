const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const req = require("express/lib/request");
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/", (req, res) => {
  res.redirect("/urls")
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req,res) => {
  const cookieId = req.cookies["user_id"]
  const templateVars = {
    user: users[cookieId],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const cookieId = req.cookies["user_id"]
  const templateVars = { user: users[cookieId] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const cookieId = req.cookies["user_id"]
  const templateVars = { user: users[cookieId], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  res.redirect(urlDatabase[req.params.shortURL]);
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
  const shortURL = generateRandomString(6);
  
  urlDatabase[shortURL] = longURL

  res.redirect(`/urls/${shortURL}`)

});

app.post("/urls/:shortURL/delete", (req,res) => {
  const itemToDelete = req.params.shortURL;
  delete urlDatabase[itemToDelete];

  res.redirect("/urls");
})

app.post("/u/:shortURL/edit", (req,res) => {
  urlKey = req.params.shortURL;
  newURL = req.body.longURL;
  urlDatabase[urlKey] = newURL;
  
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let userKeys = Object.keys(users)

  for(let userKey of userKeys){
    const current = users[userKey]
    if(email === current.email && password === current.password){
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
  console.log(users)
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  const id = generateRandomString(9)
  const email = req.body.email;
  const password = req.body.password;

  if(email === "" || password === ""){
    
    res.status(404).send('Email and Password can not be empty.');
  }
  
  const newUserObject = {
    id,
    email,
    password
  }

  users[id] = newUserObject;
  res.cookie("user_id", id)

  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



const generateRandomString = (length) =>{
  const alphaNumericalString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwyxz"

  let resultString = ""
  
  for(let counter = 1; counter <= length; counter++ ){
    const letterCode = Math.floor(Math.random() * (alphaNumericalString.length - 1))
    const letter = alphaNumericalString[letterCode]
    resultString += letter;

  }

  return resultString
}