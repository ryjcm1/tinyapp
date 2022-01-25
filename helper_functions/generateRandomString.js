
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

module.exports = { generateRandomString };