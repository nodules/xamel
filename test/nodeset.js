var xamel = require('../lib/xamel'),
    NodeSet = xamel.NodeSet,
    Tag = xamel.Tag,
    Comment = xamel.Comment,
    test = {};

test['NodeSet (constructor)'] = function(beforeExit, assert) {
    var nset = new NodeSet('Hello,', 'World!'),
        ARRAY = ['Hello,', 'World!'];

    assert.strictEqual(typeof nset, 'object');
    assert.ok(nset instanceof NodeSet);
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

test['NodeSet (get)'] = function(beforeExit, assert) {
    var nset = new NodeSet(
            new Comment('the'),
            'Hello,',
            new Tag('root', {}, null),
            new Comment('wall'),
            new Tag('help', {}, null),
            'World!'),
        nsetAll = nset.get('.'),
        nsetTags = nset.get('*'),
        nsetRootTag = nset.get('root'),
        nsetText = nset.get('text()'),
        nsetComments = nset.get('comment()');

    assert.strictEqual(nsetAll.length, nset.length);
    assert.strictEqual(nsetTags.length, 2);
    assert.strictEqual(nsetRootTag.childs[0].name, 'root');
    assert.strictEqual(nsetText.join(' '), 'Hello, World!');
    assert.strictEqual(nsetComments.join(' '), 'the wall');
};

test['NodeSet (find)'] = function(beforeExit, assert) {
    // @todo
};

module.exports = test;