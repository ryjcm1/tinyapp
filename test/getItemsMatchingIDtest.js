const assert = require("chai").assert;
const { getItemsMatchingID } = require("../helper_functions/helpers");

const randomList = {
  b6UTxQ: {
    userID: "aJ48lW",
    name: "bags of apples",
    price: "41 dollars"
  },
  i3BoGr: {
    userID: "B5s1Hs",
    name: "backpack",
    price: "80 dollars"
  },
  m66TCa: {
    userID: "aJ48lW",
    name: "bags of apples",
    price: "41 dollars"
  },
}

describe("getItemsMatchingID function", () => {
  it("should return of list of items with the same id", () => {

    const id = "B5s1Hs";
    const expectedResult = {
      i3BoGr: {
        userID: "B5s1Hs",
        name: "backpack",
        price: "80 dollars"
      }
    };

    assert.deepEqual(getItemsMatchingID(id, randomList), expectedResult)
  })

  it("should return an empty list when not item matches id", () => {

    const id = "Hjh1Hs";

    assert.isEmpty(getItemsMatchingID(id, randomList))
  })

  it("should return an empty list when entered database is empty", () => {

    const id = "adadad";
    const db = {};

    assert.isEmpty(getItemsMatchingID(id, db))
  })
})