module.exports = {
  root: true,
  extends: ['next/core-web-vitals', '@safetyswift/config/eslint'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  }
};
