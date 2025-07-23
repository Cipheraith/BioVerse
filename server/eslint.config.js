const globals = require("globals");
const js = require("@eslint/js");
const jest = require("eslint-plugin-jest");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
  {
    files: ["tests/**/*.js"],
    plugins: {
      jest,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
        ...jest.configs.recommended.rules,
        "jest/prefer-expect-assertions": "off",
    }
  },
];
