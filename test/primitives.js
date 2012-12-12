var xamel = require('../lib/xamel'),
    NodeSet = xamel.NodeSet,
    Tag = xamel.Tag,
    Comment = xamel.Comment,
    test = {};

/* *
 * NodeSet
 */
test['NodeSet (constructor)'] = function(beforeExit, assert) {
    var nset = new NodeSet('Hello,', 'World!'),
        ARRAY = ['Hello,', 'World!'];

    assert.strictEqual(typeof nset, 'object');
    assert.strictEqual(nset instanceof NodeSet, true);
    assert.deepEqual(nset.childs, ARRAY);
};

test['NodeSet (append)'] = function(beforeExit, assert) {
    var nset = new NodeSet(),
        TEXT = 'hello';

    assert.strictEqual(nset.childs.length, 0);
    nset.append(TEXT);
    assert.strictEqual(nset.childs.length, 1);
    assert.strictEqual(nset.childs[0], TEXT);
};

test['NodeSet (length)'] = function(beforeExit, assert) {
    var nset = new NodeSet(),
        TEXT = 'hello',
        COUNT = parseInt(Math.random() * 100) + 50,
        i = 0;

    assert.strictEqual(nset.length, 0);
    for (; i < COUNT; i++) {
        nset.append(TEXT);
    }
    assert.strictEqual(nset.length, COUNT);
};

test['NodeSet (text)'] = function(beforeExit, assert) {
    var nset = new NodeSet(),
        TEXTS = ['Hello,', 'Brave', 'New', 'World!'];

    nset.append(new Tag('root', {}, nset));
    TEXTS.forEach(function(text) {
        nset.append(text);
    });
    nset.append(new Comment('Jason Xamel'));

    assert.strictEqual(nset.text().join(' '), TEXTS.join(' '));
    assert.deepEqual(nset.text(), TEXTS);
};

test['NodeSet (toJSON)'] = function(beforeExit, assert) {
    var nset = new NodeSet('Hello,', 'World!');

    assert.strictEqual(JSON.stringify(nset), JSON.stringify(nset.childs));
};

test['NodeSet (toString)'] = function(beforeExit, assert) {
    var nset = new NodeSet('Hello,', 'World!');

    assert.strictEqual(nset.toString(), nset.childs.toString());
};

module.exports = test;