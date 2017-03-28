"use strict";

const utils = require("../lib/utils");
const assert = require("assert");

const {
  semverify,
} = utils;

describe("utils", () => {
  describe("semverify", () => {
    it("returns", () => {
      assert(semverify("1"), "1.0.0");
      assert(semverify("1.0"), "1.0.0");
      assert(semverify("1.0.0"), "1.0.0");
      assert(semverify(1), "1.0.0");
      assert(semverify(1.2), "1.2.0");
    });
  });
});
