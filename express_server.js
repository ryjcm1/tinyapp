const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect("/urls")
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req,res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  
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
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
})

app.post("/logout" , (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// const generateRandomString = () =>{
//   let resultString = ""
  
//   for(let counter = 0; counter <= 5; counter++ ){
//     const isUpperCase = Math.random() > 0.5 ? true : false;
//     const letterCode = 65 + Math.floor(Math.random() * 25);
//     const letter = String.fromCharCode(letterCode);

//     if(isUpperCase){
//       resultString += letter
//     }else{
//       resultString += letter.toLowerCase()
//     }

//   }

//   return resultString;
// }

const generateRandomString = () =>{
  const alphaNumericalString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwyxz"

  let resultString = ""
  
  for(let counter = 0; counter <= 5; counter++ ){
    const letterCode = Math.floor(Math.random() * (alphaNumericalString.length - 1))
    const letter = alphaNumericalString[letterCode]
    resultString += letter;

  }

  return resultString
}