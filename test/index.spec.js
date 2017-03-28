"use strict";

const babelPresetEnv = require("../lib/index.js");
const assert = require("assert");
const mapValues = require("lodash/mapValues");
const { versions: electronToChromiumData } = require("electron-to-chromium");

describe("babel-preset-env", () => {
  describe("getTargets", () => {
    it("should return the current node version with option 'current'", () => {
      assert.deepEqual(
        babelPresetEnv.getTargets({
          node: true,
        }),
        {
          node: process.versions.node,
        },
      );
    });
  });

  describe("getTargets + electron", () => {
    it("should work with a string", () => {
      assert.deepEqual(
        babelPresetEnv.getTargets({
          electron: "1.0",
        }),
        {
          chrome: 49,
        },
      );
    });

    it("should work with a number", () => {
      assert.deepEqual(
        babelPresetEnv.getTargets({
          electron: 1.0,
        }),
        {
          chrome: 49,
        },
      );
    });

    it("should preserve lower Chrome number if Electron version is more recent", () => {
      assert.deepEqual(
        babelPresetEnv.getTargets({
          electron: 1.4,
          chrome: 50,
        }),
        {
          chrome: 50,
        },
      );
    });

    it("should overwrite Chrome number if Electron version is older", () => {
      assert.deepEqual(
        babelPresetEnv.getTargets({
          electron: 1.0,
          chrome: 50,
        }),
        {
          chrome: 49,
        },
      );
    });

    Object.keys(electronToChromiumData).forEach(electronVersion => {
      it(`"should work for Electron: ${electronVersion}`, () => {
        assert.deepEqual(
          babelPresetEnv.getTargets({
            electron: electronVersion,
          }),
          {
            chrome: electronToChromiumData[electronVersion],
          },
        );
      });
    });

    it("should error if electron version is invalid", () => {
      const fixtures = ["0.19", 0.19, 999, "999"];

      fixtures.forEach(electronVersion => {
        assert.throws(
          () => {
            babelPresetEnv.getTargets({
              electron: electronVersion,
            });
          },
          Error,
        );
      });
    });
  });

  describe("getTargets + uglify", () => {
    it("should work with `true`", function() {
      assert.deepEqual(
        babelPresetEnv.getTargets({
          uglify: true,
        }),
        {
          uglify: true,
        },
      );
    });

    it("should ignore `false`", function() {
      assert.deepEqual(
        babelPresetEnv.getTargets({
          uglify: false,
        }),
        {},
      );
    });

    it("should ignore `null`", function() {
      assert.deepEqual(
        babelPresetEnv.getTargets({
          uglify: null,
        }),
        {},
      );
    });
  });

  describe("isPluginRequired", () => {
    const testTargetTypes = (
      plugin,
      targets,
      expectedNumeric,
      expectedString,
    ) => {
      const numericTargets = mapValues(targets, (t, name) => {
        return name === "browsers" ? t : parseFloat(t);
      });

      assert.strictEqual(
        babelPresetEnv.isPluginRequired(numericTargets, plugin),
        expectedNumeric,
        "numeric version test failed",
      );

      const stringTargets = mapValues(targets, t => t.toString());
      const stringExpected = typeof expectedString === "undefined"
        ? expectedNumeric
        : expectedString;

      assert.strictEqual(
        babelPresetEnv.isPluginRequired(stringTargets, plugin),
        stringExpected,
        "string version test failed",
      );
    };

    it("returns true if no targets are specified", () => {
      testTargetTypes({}, {}, true);
    });

    it("returns true if plugin feature is not implemented in one or more targets", () => {
      let targets;
      const plugin = {
        edge: false,
        firefox: 45,
        chrome: 49,
      };

      targets = {
        chrome: Number.MAX_SAFE_INTEGER,
        firefox: Number.MAX_SAFE_INTEGER,
      };
      assert(babelPresetEnv.isPluginRequired(targets, plugin) === false);

      targets = {
        edge: 12,
      };
      assert(babelPresetEnv.isPluginRequired(plugin, plugin) === true);
    });

    it("returns false if plugin feature is implemented by lower than target", () => {
      const plugin = {
        chrome: 49,
      };
      const targets = {
        chrome: Number.MAX_SAFE_INTEGER,
      };
      testTargetTypes(plugin, targets, false);
    });

    it("returns false if plugin feature is implemented is equal to target", () => {
      const plugin = {
        chrome: 49,
      };
      const targets = {
        chrome: 49,
      };
      testTargetTypes(plugin, targets, false);
    });

    it("returns true if plugin feature is implemented is greater than target", () => {
      const plugin = {
        chrome: 50,
      };
      const targets = {
        chrome: 49,
      };
      testTargetTypes(plugin, targets, true);
    });

    it("returns false if plugin feature is implemented by lower than target defined in browsers query", () => {
      const plugin = {
        chrome: 49,
      };
      const targets = {
        browsers: "chrome > 50",
      };
      testTargetTypes(plugin, targets, false);
    });

    it("returns true if plugin feature is implemented is greater than target defined in browsers query", () => {
      const plugin = {
        chrome: 52,
      };
      const targets = {
        browsers: "chrome > 50",
      };
      testTargetTypes(plugin, targets, true);
    });

    it("returns true if target's root items overrides versions defined in browsers query", () => {
      const plugin = {
        chrome: 45,
      };
      const targets = {
        browsers: "last 2 Chrome versions",
        chrome: 44,
      };
      testTargetTypes(plugin, targets, true);
    });

    it("returns true if uglify is specified as a target", () => {
      const plugin = {
        chrome: 50,
      };
      const targets = {
        chrome: 55,
        uglify: true,
      };
      testTargetTypes(plugin, targets, true);
    });

    it("returns when target is a decimal", () => {
      const plugin = {
        node: 6.9,
      };
      const targets = {
        node: "6.10",
      };
      testTargetTypes(plugin, targets, true, false);
    });
  });

  describe("transformIncludesAndExcludes", () => {
    it("should return in transforms array", () => {
      assert.deepEqual(
        babelPresetEnv.transformIncludesAndExcludes([
          "transform-es2015-arrow-functions",
        ]),
        {
          all: ["transform-es2015-arrow-functions"],
          plugins: ["transform-es2015-arrow-functions"],
          builtIns: [],
        },
      );
    });

    it("should return in built-ins array", () => {
      assert.deepEqual(
        babelPresetEnv.transformIncludesAndExcludes(["es6.map"]),
        {
          all: ["es6.map"],
          plugins: [],
          builtIns: ["es6.map"],
        },
      );
    });
  });
});
