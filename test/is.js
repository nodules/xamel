var xml = require('../lib/xml'),
    NodeSet = xml.NodeSet,
    Tag = xml.Tag,
    Comment = xml.Comment,
    is = xml.is,
    test = {};

test['is ("node()")'] = function(beforeExit, assert) {
    assert.ok(is('node()', 'node'));
    assert.ok(is('node()', new Tag('node', {}, null)));
    assert.ok(is('node()', new Comment('node')));
    assert.strictEqual(is('node()', new NodeSet('root')), false);
};

test['is ("text()")'] = function(beforeExit, assert) {
    assert.ok(is('text()', 'Text'));
    assert.strictEqual(is('text()', new Comment('Text')), false);
    assert.strictEqual(is('text()', new Tag('Text', {}, null)), false);
    assert.strictEqual(is('text()', new NodeSet('Text')), false);
};

test['is ("comment()")'] = function(beforeExit, assert) {
    assert.ok(is('comment()', new Comment('Comment')));
    assert.strictEqual(is('comment()', 'Comment'), false);
    assert.strictEqual(is('comment()', new Tag('Comment', {}, null)), false);
    assert.strictEqual(is('comment()', new NodeSet(new Comment('Comment'))), false);
};

test['is ("*")'] = function(beforeExit, assert) {
    assert.ok(is('*', new Tag('root', {}, null)));
    assert.strictEqual(is('*', new Comment('root')), false);
    assert.strictEqual(is('*', 'root'), false);
    assert.strictEqual(is('*', new NodeSet(new Tag('root', {}, null))), false);
};

test['is ("root")'] = function(beforeExit, assert) {
    assert.ok(is('root', new Tag('root', {}, null)));
    assert.strictEqual(is('root', new Comment('root')), false);
    assert.strictEqual(is('root', 'root'), false);
    assert.strictEqual(is('root', new NodeSet(new Tag('root', {}, null))), false);
};

module.exports = test;