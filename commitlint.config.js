export default {
  extends: ["@commitlint/config-conventional"],
  // `np` / `npm version` creates a bare version commit (e.g. "0.2.1" or "v0.2.1").
  ignores: [(message) => /^v?\d+\.\d+\.\d+(-[\w.]+)?\s*$/.test(message)],
};
