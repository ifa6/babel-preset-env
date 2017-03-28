export const _extends = Object.assign ||
  function(target) {
    for (let i = 1; i < arguments.length; i++) {
      const source = arguments[i];
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

const patchSpecifiedRe = /^\d+\.\d+\.\d+$/;

// Convert version to a semver value.
// 2.5 -> 2.5.0; 1 -> 1.0.0;
export const semverify = version => {
  if (typeof version === "string" && patchSpecifiedRe.test(version)) {
    return version;
  }

  const isInt = version % 1 === 0;
  const stringified = version.toString();
  const strEnd = isInt ? ".0.0" : ".0";

  return stringified + strEnd;
};
