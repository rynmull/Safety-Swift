module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  env: {
    es2020: true,
    node: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: ['dist', '.next', 'node_modules']
};
