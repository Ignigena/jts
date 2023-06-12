/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/(config|tests|coverage)'
  ],
  coverageReporters: ['json', 'html', 'lcovonly', 'text-summary'],
}
