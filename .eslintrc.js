module.exports = {
  'env': {
    'browser': true,
    'es6': true
  },
  'extends': 'airbnb',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'plugins': [
    'react',
    'jsx',
    'jsx-a11y',
    'import',
    'react-hooks',
  ],
  'rules': {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'react/jsx-uses-vars': 2,
    'arrow-parens': ['error', 'always'],
    'function-paren-newline': ['error', 'consistent'],
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/label-has-for': 'off',
    'max-len': [2, 100, 4],
    'no-console': 'error',
    'no-continue': 'off',
    'no-plusplus': ['error', {'allowForLoopAfterthoughts': true}],
    'operator-linebreak': ['error', 'after'],
    'prefer-destructuring': 'off',
    'react/forbid-prop-types': ['error', {'forbid': ['any']}],
    'react/jsx-curly-spacing': ['error', {'when': 'never', 'children': true}],
    'react/jsx-one-expression-per-line': ['off', { 'allow': 'literal' }],
    'react/destructuring-assignment': ['off'],
    'import/order': ['error', {
      'groups': [
        ['builtin', 'external'],
        ['internal', 'parent', 'sibling', 'index']
      ],
      'newlines-between': 'always'
    }],
    'react/button-has-type': 'off',
    'jsx-a11y/label-has-associated-control': [2, {
      'controlComponents': [
        'FormGroup',
        'CheckboxFormGroup'
      ]
    }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/jsx-props-no-spreading': 'off',
    'react/no-deprecated': 'warn',
    'react/no-unescaped-entities': 'off',
    'max-classes-per-file': 'off',
    'react/jsx-curly-newline': 'off',
    'react/static-property-placement': 'off'
  }
};
