module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    mapboxgl: 'writable',
    webkitSpeechRecognition: 'writable'
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    "no-shadow": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
      }
    ],
    'class-methods-use-this': 0,
    "import/no-unresolved": 0,
    "new-cap": [2, 
      {"newIsCapExceptions" : ["webkitSpeechRecognition"]}
    ]
  },
  settings: {
    'import/resolver': [
      { 'node': {} }, // чтобы избежать ошибки path в конфиге weback
      'webpack',
    ]
  },
  overrides: [ // чтобы избежать ошибки в файлах тестов
    {
      "files": [
        "**/*.test.js",
      ],
      "env": {
        "jest": true
      }
    }
  ]
};
