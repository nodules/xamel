var sax = require('sax'),
    xml = require('./xml'),
    NodeSet = xml.NodeSet,
    Tag = xml.Tag,
    Comment = xml.Comment;

/**
 * @param {String} xml String contains source XML
 * @param {Object} options Sax-js options hash
 *      @param {String} options.buildPath
 * @param {Function} callback function(error, result)
 * @returns {Object}
 * @see https://github.com/isaacs/sax-js
 */
module.exports = function parse(xml, options, callback) {
    var parser,
        path = [],
        buildPath,
        target = new NodeSet(),
        pointer = target,
        inPath = function(tagName) {
            if ( ! buildPath) {
                return true;
            }

            if (tagName) {
                path.push(tagName);
            }

            return path.join('/').indexOf(buildPath) === 0;
        };

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    buildPath = options.buildPath || false;

    parser = sax.parser( ! (options.strict === false), options);

    parser.onopentag = function(node) {
        if ( ! inPath(node.name)) { return; }

        var tag = new Tag(node.name, node.attributes, pointer);
        pointer.append(tag);
        pointer = tag;
    };

    parser.onclosetag = function(node) {
        if (inPath()) {
            pointer = pointer.parent;
        }
        path.pop();
    };

    parser.oncomment = function(comment) {
        if ( ! inPath()) { return; }
        pointer.append(new Comment(comment));
    };

    parser.onopencdata = function() {
        if ( ! inPath()) { return; }
        // @todo DO IT!
    };

    parser.oncdata = function(cdata) {
        if ( ! inPath()) { return; }
        // @todo DO IT!
    };

    parser.onclosecdata = function() {
        if ( ! inPath()) { return; }
        // @todo DO IT!
    };

    parser.ontext = function(text) {
        if ( ! inPath()) { return; }
        pointer.append(text);
    };

    parser.onerror = function(error) {
        callback(error, target);
    };

    parser.onend = function() {
        callback(null, target);
    };

    parser.write(xml).close();
}