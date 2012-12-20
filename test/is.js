var xamel = require('../lib/xamel'),
    NodeSet = xamel.NodeSet,
    Tag = xamel.Tag,
    Comment = xamel.Comment,
    is = xamel.is,
    isNodeSet = xamel.isNodeSet,
    test = {};

test['isNodeSet'] = function(beforeExit, assert) {
    assert.strictEqual(isNodeSet('node'), false);
    assert.strictEqual(isNodeSet(new Comment('comment')), false);
    assert.strictEqual(isNodeSet(new Tag('node', {}, null)), false);
    assert.ok(isNodeSet(new NodeSet()));
    assert.strictEqual(isNodeSet([]), false);
};

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