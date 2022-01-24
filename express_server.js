const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = longURL

  res.redirect("/urls")

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const generateRandomString = () =>{
  let resultString = ""
  
  for(let counter = 0; counter <= 5; counter++ ){
    const isUpperCase = Math.random() > 0.5 ? true : false;
    const letterCode = 65 + Math.floor(Math.random() * 25);
    const letter = String.fromCharCode(letterCode);

    if(isUpperCase){
      resultString += letter
    }else{
      resultString += letter.toLowerCase()
    }

  }

  return resultString;
}