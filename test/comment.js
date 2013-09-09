var assert = require('chai').assert,
    Comment = require('../lib/xml').Comment,
    test = {};

test['Comment (constructor)'] = function() {
    var comment = new Comment('Hello!');

    assert.strictEqual(typeof comment, 'object');
    assert.strictEqual(comment instanceof Comment, true);
};

test['Comment (comment)'] = function() {
    var TEXT = 'Hello!',
        comment = new Comment(TEXT);

    assert.strictEqual(comment.comment, TEXT);
};

test['Comment (toString)'] = function() {
    var TEXT = 'Hello!',
        comment = new Comment(TEXT);

    assert.strictEqual(String(comment), TEXT);
    assert.strictEqual('' + comment, TEXT);
};

module.exports = test;
