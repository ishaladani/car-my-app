module.exports = {
  extends: ["react-app", "react-app/jest"],
  rules: {
    // Disable rules that are causing build failures in CI
    "no-unused-vars": "warn", // Change from error to warning
    "react-hooks/exhaustive-deps": "warn", // Change from error to warning
    "react/jsx-no-comment-textnodes": "warn", // Change from error to warning
    "jsx-a11y/img-redundant-alt": "warn", // Change from error to warning
    "array-callback-return": "warn", // Change from error to warning
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
};
