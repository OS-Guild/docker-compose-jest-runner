module.exports = {
  preset: 'ts-jest',
  rootDir: '../',
  runner: './build',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/specs/*.test.ts'],
};
