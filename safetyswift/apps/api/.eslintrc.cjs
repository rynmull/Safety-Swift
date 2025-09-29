module.exports = {
  root: true,
  extends: ['@safetyswift/config/eslint'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  },
  env: {
    node: true
  }
};
