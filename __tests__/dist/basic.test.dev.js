"use strict";

/**
 * Basic test file to ensure Jest setup is working
 */
describe('Basic test suite', function () {
  test('1 + 1 equals 2', function () {
    expect(1 + 1).toBe(2);
  });
  test('true is truthy', function () {
    expect(true).toBeTruthy();
  });
});