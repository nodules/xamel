var xamel = require('../lib/xamel'),
    NodeSet = xamel.NodeSet,
    Tag = xamel.Tag,
    Comment = xamel.Comment,
    fs = require('fs'),
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
        nsetAll = nset.get('node()'),
        nsetTags = nset.get('*'),
        nsetRootTag = nset.get('root'),
        nsetText = nset.get('text()'),
        nsetComments = nset.get('comment()');

    assert.strictEqual(nsetAll.length, nset.length);
    nsetAll.forEach(function(node, idx) {
        assert.strictEqual(node, nset.childs[idx]);
    });
    assert.strictEqual(nsetTags.length, 2);
    nsetTags.forEach(function(tag) {
            assert.ok(tag instanceof Tag);
        });
    assert.strictEqual(nsetRootTag.length, 1);
    assert.strictEqual(nsetRootTag.childs[0].name, 'root');
    assert.strictEqual(nsetText.length, 2);
    assert.strictEqual(nsetText.join(' '), 'Hello, World!');
    nsetText.forEach(function(text) {
            assert.ok(typeof text === 'string');
        });
    assert.strictEqual(nsetComments.length, 2);
    assert.strictEqual(nsetComments.join(' '), 'the wall');
    nsetComments.forEach(function(comment) {
            assert.ok(comment instanceof Comment);
        });
};

test['NodeSet (find)'] = function(beforeExit, assert) {
    var xmlSource = fs.readFileSync('./test/data/simple.xml', 'utf8'),
        assertions = 0;

    // @todo improve this test
    xamel.xml2object(xmlSource, { trim : true }, function(error, xml) {
        ++assertions;
        assert.strictEqual(error, null);

        assert.strictEqual(
            xml.find('menu/food/name/text()').join(', '),
            [   'Belgian Waffles',
                'Strawberry Belgian Waffles',
                'Berry-Berry Belgian Waffles',
                'French Toast',
                'Homestyle Breakfast' ].join(', ')
            );
    });

    beforeExit(function() {
        assert.strictEqual(assertions, 1);
    });
};

/**
 * @param {NodeSet} nset
 * @param {Number} count of children to generate
 * @param {Function} generator (index, nset) returns node
 */
function generateChilds(nset, count, generator) {
    var i = 0;

    for (; i < count; i++) {
        nset.append(generator(i, nset));
    }
}

test['NodeSet (explode)'] = function(beforeExit, assert) {
    var nset = new NodeSet('Hello', 'World', new Comment('test'), new Tag('xxx', {}, null)),
        tag = new Tag('comments', {}, null),
        nsetExploded;

    generateChilds(tag, 100, function(i) {
        return new Tag('comment', { id : i }, tag);
    });

    nsetExploded = nset.append(tag).explode();

    assert.strictEqual(nsetExploded.length, tag.length);

    nsetExploded.forEach(function(child, idx) {
        assert.strictEqual(child, tag.childs[idx]);
    });
};

test['NodeSet (hasAttr)'] = function(beforeExit, assert) {
    var TAG_ONE = 'one',
        TAG_TWO = 'two',
        nset = new NodeSet(
            new Tag(TAG_ONE, { one : 'true' }, null),
            new Tag(TAG_TWO, { two : 'true' }, null)),
        nsetOne = nset.hasAttr('one'),
        nsetTwo = nset.hasAttr('two');

    assert.strictEqual(nsetOne.length, 1);
    assert.strictEqual(nsetTwo.length, 1);

    assert.strictEqual(nsetOne.childs[0].name, TAG_ONE);
    assert.strictEqual(nsetTwo.childs[0].name, TAG_TWO);
};

test['NodeSet (isAttr)'] = function(beforeExit, assert) {
    var TAG_ONE = 'one',
        TAG_TWO = 'two',
        nset = new NodeSet(
                new Tag(TAG_ONE, { id : 1 }, null),
                new Tag(TAG_TWO, { id : 2 }, null)),
        nsetOne = nset.isAttr('id', 1),
        nsetTwo = nset.isAttr('id', 2);

    assert.strictEqual(nsetOne.length, 1);
    assert.strictEqual(nsetTwo.length, 1);

    assert.strictEqual(nsetOne.childs[0].name, TAG_ONE);
    assert.strictEqual(nsetTwo.childs[0].name, TAG_TWO);
};

module.exports = test;