/* eslint-disable no-constant-condition */
/* eslint-disable max-len */
if (!process.env.LOG_LEVEL) {
  process.env.LOG_LEVEL = 'fatal';
}
const { expect } = require('chai');
const { newDecoder } = require('../src/decoder');
const { loadJSON, readFile, loadRaw } = require('./utils');

describe('Test decoder', () => {

  function testDecoder(name) {
    const rawHex = loadRaw(`./${name}.raw`);
    const expectData = loadJSON(`./${name}.json`);
    const decoder = newDecoder(readFile(`./${name}.yaml`));
    const data = decoder.decode(rawHex);
    // console.log(JSON.stringify(data, null, 2));
    expect(data).to.deep.equal(expectData);
  }

  it('should decode tso', () => {
    testDecoder('decoder-tso');
  });

  it('should decode bigint', () => {
    testDecoder('decoder-bigint');
  });

  it('should decode non existent attribute', () => {
    testDecoder('decoder-non-existent-attribute');
  });

  it('should decode enum non existent value', () => {
    testDecoder('decoder-enum-non-existent-value');
  });

  it('should decode clime', () => {
    testDecoder('decoder-clime');
  });

  it('should error insufficient data', () => {
    const rawHex = loadRaw(`./decoder-error-insufficient-data.raw`);
    const decoder = newDecoder(readFile(`./decoder-clime.yaml`));
    try {
      decoder.decode(rawHex);
    } catch (error) {
      expect(error.message).to.equal('Insufficient data');
    }
  });

});
