var xml = require('../lib/xml'),
    NodeSet = xml.NodeSet,
    Tag = xml.Tag,
    test = {};

test['Tag (constructor)'] = function(beforeExit, assert) {
    var tag = new Tag('root');

    assert.strictEqual(typeof tag, 'object');
    assert.strictEqual(tag instanceof Tag, true);
    assert.strictEqual(tag instanceof NodeSet, true);
};

test['Tag (name)'] = function(beforeExit, assert) {
    var TAG_NAME = 'root',
        tag = new Tag(TAG_NAME);

    assert.strictEqual(tag.name, TAG_NAME);
};

test['Tag (attrs)'] = function(beforeExit, assert) {
    var attrs = { id : 'item_1', name : 'Jason Xamel' },
        tag = new Tag('root', attrs);

    assert.deepEqual(tag.attrs, attrs);
};

test['Tag (parent)'] = function(beforeExit, assert) {
    var parent = new Tag('root'),
        notParent = new Tag('root'),
        tag = new Tag('xtag', parent);

    assert.strictEqual(tag.parent, parent);
    assert.notStrictEqual(tag.parent, notParent)
};

test['Tag (toJSON)'] = function(beforeExit, assert) {
    var tag = new Tag('root');

    assert.notStrictEqual(JSON.stringify(tag), JSON.stringify(NodeSet.prototype.toJSON.call(tag)));
};

module.exports = test;