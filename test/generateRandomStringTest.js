const assert = require("chai").assert;
const { generateRandomString } = require("../helper_functions/helpers");

describe("generateRandomString function", () => {
  it("should return string value with a length of six when passed in the number six", () => {
    const expectedValue = 6;

    assert.equal(generateRandomString(6).length, expectedValue);
  });

  it("should return string value with a length of one when passed in the number one", () => {
    const expectedValue = 1;

    assert.equal(generateRandomString(1).length, expectedValue);
  });

  it("should return an empty string when passed in a number less than or equal to zero", () => {
    const expectedValue = "";

    assert.equal(generateRandomString(-1), expectedValue);
  });

});