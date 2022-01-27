const getUserByEmail = (email, database) => {
  // lookup magic...

  if (email.length <= 0) {
    return undefined;
  }

  let dbKeys = Object.keys(database);

  for (let dbKey of dbKeys) {
    let user = database[dbKey];

    if (user.email === email) {
      return user;
    }
  }
  
  return undefined;
  
};


const generateRandomString = (length) =>{
  const alphaNumericalString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwyxz";

  let resultString = "";
  
  for (let counter = 1; counter <= length; counter++) {
    const letterCode = Math.floor(Math.random() * (alphaNumericalString.length - 1));
    const letter = alphaNumericalString[letterCode];
    resultString += letter;

  }

  return resultString;
};


const getItemsMatchingID = (id, database) => {
  const userSpecificUrls = {};

  const objectKeys = Object.keys(database);

  for( let objectKey of objectKeys){
    if(database[objectKey].userID === id){
      userSpecificUrls[objectKey] = database[objectKey];
    }
  }

  return userSpecificUrls;
}


module.exports = { getUserByEmail, generateRandomString, getItemsMatchingID};