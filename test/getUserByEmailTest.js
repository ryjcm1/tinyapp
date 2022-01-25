const assert = require("chai").assert;
const { getUserByEmail } = require("../helper_functions/helpers")

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


describe("getUserByEmail function", () => {
  it("should return an user object when email matches database", () => {

    const email = "user2@example.com"

    const expectedResult = {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
  
    assert.deepEqual(getUserByEmail(email, users), expectedResult)

  })

  it("should return undefined when no email match is found in the database", () => {

    const email = "random@email.com"
  
    assert.isUndefined(getUserByEmail(email, users))
  })


})