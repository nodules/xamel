var assert = require('chai').assert,
    CData = require('../lib/xml').CData,
    test = {};

test['CData (constructor)'] = function() {
    var cdata = new CData('Hello!');

    assert.strictEqual(typeof cdata, 'object');
    assert.strictEqual(cdata instanceof CData, true);
};

test['CData (data)'] = function() {
    var DATA = 'Hello!',
        cdata = new CData(DATA);

    assert.strictEqual(cdata.getData(), DATA);
};

test['CData (toString)'] = function() {
    var DATA = 'Hello!',
        cdata = new CData(DATA);

    assert.strictEqual(String(cdata), DATA);
    assert.strictEqual('' + cdata, DATA);
};

module.exports = test;
