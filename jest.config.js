
module.exports = {
  testURL: "http://localhost/",
  clearMocks: true,
  modulePaths: [
    'src',
    'node_modules'
  ],
  transform: {
    '.tsx?': 'ts-jest'
  },
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src'
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx'
  ],
  testRegex: '/src/.*(\.spec|/__tests__/.*)\.[tj]sx?$',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!**/*.d.ts', // no need to test only types and interfaces
    '!**/tests/*', // no need to test only types and interfaces
  ],
  // setupFiles: ['./jest.setup.js'],
}
