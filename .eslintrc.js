/*eslint-env node*/

/** @type {import('@types/eslint').ESLint.Options['baseConfig']} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "jest",
    "prettier",
    "promise",
    "simple-import-sort",
    "sonarjs",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict",
    "plugin:@typescript-eslint/stylistic",
    "plugin:jest/recommended",
    "plugin:prettier/recommended",
    "plugin:promise/recommended",
    "plugin:sonarjs/recommended",
  ],
  rules: {
    "arrow-body-style": ["error", "as-needed"],
    "no-duplicate-imports": ["error"],
    "object-shorthand": ["error", "always"],
    "prettier/prettier": ["error", { endOfLine: "crlf" }],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "sonarjs/no-duplicate-string": ["off"],
  },

  overrides: [
    {
      files: "*.test.ts",
      rules: { "@typescript-eslint/no-non-null-assertion": "off" },
    },
  ],
};
