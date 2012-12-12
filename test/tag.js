var xamel = require('../lib/xamel'),
    NodeSet = xamel.NodeSet,
    Tag = xamel.Tag,
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

    // checks `name` read-only
    tag.name = 'hello';
    assert.strictEqual(tag.name, TAG_NAME);

    // checks `name` enumerable
    assert.strictEqual(Object.keys(tag).indexOf('name') > -1, true);
};

test['Tag (attrs)'] = function(beforeExit, assert) {
    var attrs = { id : 'item_1', name : 'Jason Xamel' },
        tag = new Tag('root', attrs);

    assert.deepEqual(tag.attrs, attrs);

    // checks `attrs` read-only
    tag.attrs = { id : 'item_3' };
    assert.deepEqual(tag.attrs, attrs);
    tag.attrs.name = 'Xamel Schemanzky';
    tag.attrs.displayName = 'XamelZK';
    assert.deepEqual(tag.attrs, attrs);

    // checks `attrs` enumerable
    assert.strictEqual(Object.keys(tag).indexOf('attrs') > -1, true);
};

test['Tag (parent)'] = function(beforeExit, assert) {
    var parent = new Tag('root'),
        notParent = new Tag('root'),
        tag = new Tag('xtag', null, parent);

    assert.strictEqual(tag.parent, parent);

    // checks `parent` read-only
    tag.parent = notParent;
    assert.strictEqual(tag.parent, parent);

    // checks `parent` NOT enumerable
    assert.strictEqual(Object.keys(tag).indexOf('parent'), -1);
};

test['Tag (toJSON)'] = function(beforeExit, assert) {
    var tag = new Tag('root');

    assert.notStrictEqual(JSON.stringify(tag), JSON.stringify(NodeSet.prototype.toJSON.call(tag)));
};

module.exports = test;