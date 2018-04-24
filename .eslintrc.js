module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
    serviceworker: true,
  },
  rules: {
    'no-template-curly-in-string': 'off',
    'no-restricted-globals': 'off',
  },
};
