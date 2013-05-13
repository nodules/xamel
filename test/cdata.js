var CData = require('../lib/xml').CData,
    test = {};

test['CData (constructor)'] = function(beforeExit, assert) {
    var cdata = new CData('Hello!');

    assert.strictEqual(typeof cdata, 'object');
    assert.strictEqual(cdata instanceof CData, true);
};

test['CData (data)'] = function(beforeExit, assert) {
    var DATA = 'Hello!',
        cdata = new CData(DATA);

    assert.strictEqual(cdata.getData(), DATA);
};

test['CData (toString)'] = function(beforeExit, assert) {
    var DATA = 'Hello!',
        cdata = new CData(DATA);

    assert.strictEqual(String(cdata), DATA);
    assert.strictEqual('' + cdata, DATA);
};

module.exports = test;