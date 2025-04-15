module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    'src',
    'tests'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/'
  ],
}