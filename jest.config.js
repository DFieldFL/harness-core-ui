process.env.TZ = 'GMT'
const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  globals: {
    'ts-jest': {
      isolatedModules: true
    },
    __DEV__: false
  },
  setupFiles: ['<rootDir>/scripts/jest/setup-file.js', 'fake-indexeddb/auto'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/navigation/*/routes.ts',
    '!src/**/__tests__/**',
    '!src/services/**',
    '!src/**/YamlBuilder.tsx',
    '!src/**/*mock*.{ts,tsx}',
    '!src/**/*Mock*.{ts,tsx}'
  ],
  coverageReporters: ['lcov', 'json-summary'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': 'ts-jest',
    '^.+\\.ya?ml$': '<rootDir>/scripts/jest/yaml-transform.js'
  },
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '\\.s?css$': 'identity-obj-proxy',
    'monaco-editor': '<rootDir>/node_modules/react-monaco-editor',
    '\\.(jpg|jpeg|png|gif|svg|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/scripts/jest/file-mock.js',
    ...pathsToModuleNameMapper(compilerOptions.paths)
  },
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 30,
      functions: 30,
      lines: 50
    }
  },
  transformIgnorePatterns: ['node_modules/(?!(date-fns|lodash-es)/)']
}
