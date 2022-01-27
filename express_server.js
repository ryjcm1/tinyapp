
/*---------------
  dependencies
---------------*/

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs');
const { userDatabase, urlDatabase} = require("./data/database");
const { getUserByEmail, generateRandomString, getItemsMatchingID } = require("./helper_functions/helpers");

const app = express();
const PORT = 8080; // default port 8080


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  secret: generateRandomString(6),
  maxAge: 60000*60*24, //24hrs
  saveUninitialized: false

}));
app.use(methodOverride('_method'))

app.set("view engine", "ejs");


/*-------------
      GET
-------------*/


app.get("/", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
    return;
  }
  res.redirect("/urls");

});


app.get("/urls", (req,res) => {
  
  if (req.session.user_id === undefined) {
    res.status(403).send('Login or Register first');
    return;
  }
  
  const sessionID = req.session.user_id;
  const specificUrls = getItemsMatchingID(sessionID, urlDatabase);

  const templateVars = {
    user: userDatabase[sessionID],
    urls: specificUrls
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  
  if (req.session.user_id === undefined) {
    res.redirect('/login');
    return;
  }
  const sessionID = req.session.user_id;

  const templateVars = { user: userDatabase[sessionID] };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const sessionID = req.session["user_id"];
  const urlObject = urlDatabase[req.params.shortURL];

  if (urlObject.userID !== sessionID) {
    res.status(403).send("Insufficient permission.")
    return;
  }

  const currentURL = req.params.shortURL;
  const templateVars = { user: userDatabase[sessionID], shortURL: currentURL, longURL: urlDatabase[currentURL].longURL, accessLog: urlDatabase[currentURL].accessLog, accessedBy: urlDatabase[currentURL].accessedBy, created: urlDatabase[currentURL].created} ;
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const userInput = req.params.shortURL;
  if(urlDatabase[userInput] === undefined){
    res.status(400).send("Invalid short URL.")
    return;
  }

  //creates guestId if not logged in already 
  if(!req.session.user_id && !req.session.guestUser){
    req.session["guestUser"] = generateRandomString(9)
  }

  //display current user whether they are logged in or not
  const currentUser = req.session.user_id || req.session.guestUser;

  //adds in current user id if it is unique
  if(!urlDatabase[userInput].accessedBy.includes(currentUser)){
    urlDatabase[userInput].accessedBy.push(currentUser);
  }

  //adds to access log
  const accesslogEntry = {
    id: currentUser,
    time: new Date().toLocaleString("en-US", { timeZone: "America/New_York"})
  }
  urlDatabase[userInput].accessLog.push(accesslogEntry);

  res.redirect(urlDatabase[userInput].longURL);
});


app.get("/register", (req, res) => {
  const sessionID = req.session["user_id"];
  const templateVars = { user: userDatabase[sessionID], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("user_register", templateVars);
});


app.get("/login", (req, res) => {
  const sessionID = req.session["user_id"];
  const templateVars = { user: userDatabase[sessionID], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};

  res.render("user_login", templateVars);
});


/*-------------
      POST
-------------*/


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString(6);
  const userID = req.session["user_id"];
  const created = new Date().toLocaleString("en-US", { timeZone: "America/New_York"});
  const accessLog = []; //will be populated with strings
  const accessedBy = []; //will be populated with objects

  const newUrlObject = {
    longURL,
    userID,
    created,
    accessLog,
    accessedBy
  };
  
  urlDatabase[id] = newUrlObject;

  res.redirect(`/urls/${id}`);

});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (email === "" || password === "") {
    res.status(404).send('Email and Password can not be empty.');
  }
  
  const userInfo = getUserByEmail(email, userDatabase);
  
  if (!userInfo) {
    res.status(403).send('Invalid Email.');
    return;
  }
  
  if (!bcrypt.compareSync(password, userInfo.password)) {
    res.status(403).send('Invalid Password.');
    return;
  }
  
  req.session.user_id = userInfo.id;
  res.redirect("/urls");
  
});


app.post("/logout" , (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (email === "" || password === "") {
    return res.status(404).send('Email and Password can not be empty.');
  }

  if(getUserByEmail(email, userDatabase)){
    return res.status(400).send("This email is already in use.")
  }

  const id = generateRandomString(9);
  const hashedPassword = bcrypt.hashSync(password,10);
  const newUserObject = {
    id,
    email,
    password: hashedPassword
  };
  
  userDatabase[id] = newUserObject;
  req.session.user_id = id;
  
  res.redirect("/urls");
});


/*------------------------------
  Method Override DELETE & PUT
------------------------------*/


//method-Override
app.delete("/urls/:shortURL/delete", (req,res) => {
  const itemToDelete = req.params.shortURL;
  delete urlDatabase[itemToDelete];
  
  res.redirect("/urls");
});


//method-Override
app.put("/u/:shortURL/edit", (req,res) => {
  const newURL = req.body.longURL;
  if (newURL.length < 1) {
    res.status(403).send('URL cannot be empty.');
    return;
  }

  const urlKey = req.params.shortURL;
  urlDatabase[urlKey].longURL = newURL;

  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


