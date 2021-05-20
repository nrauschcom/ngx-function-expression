module.exports = {
  "root": true,
  "env": {
    "browser": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.spec.json",
    "sourceType": "module"
  },
  "plugins": [
    "@angular-eslint/eslint-plugin",
    "@angular-eslint/eslint-plugin-template",
    "@typescript-eslint",
    "@typescript-eslint/tslint"
  ],
  rules: {
    "no-unused-vars": "off"
  }
};
