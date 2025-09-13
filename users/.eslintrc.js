module.exports = {
  parser: '@typescript-eslint/parser', // Usa el parser de TS
  extends: [
    'airbnb-base',          // reglas de Airbnb
    'plugin:@typescript-eslint/recommended', // buenas prácticas de TS
    'plugin:prettier/recommended', // integra Prettier con ESLint
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error', // Marca errores de Prettier como ESLint
    'import/extensions': 'off',   // No exigir extensión en imports TS
    'class-methods-use-this': 'off', // NestJS no siempre usa this
    '@typescript-eslint/no-explicit-any': 'warn', // Aviso si usas any
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts', '.js'],
      },
    },
  },
};
