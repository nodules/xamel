var util = require('util'),
    sax = require('sax'),
    xamel = {};

/**
 * Node set
 * @constructor
 */
var NodeSet = xamel.NodeSet = function NodeSet() {
    Object.defineProperty(this, 'childs', { value : Array.apply(Array, arguments), enumerable : true });
};

/**
 * Serialize NodeSet as Array
 * @return {Array}
 */
NodeSet.prototype.toJSON = function() {
    return this.childs;
};

/**
 * evaluate to String as Array
 * @return {String}
 */
NodeSet.prototype.toString = function() {
    return this.childs.toString();
};

/**
 * Append node to node set.
 * @param {Tag|Comment|String} node
 */
NodeSet.prototype.append = function(node) {
    this.childs.push(node);
    return this;
};

/**
 * @property {Number} length
 */
NodeSet.prototype.__defineGetter__('length', function() {
    return this.childs.length;
});

/**
 * Creates node set of nodes meeting the path condition.
 * @param {String} path XPath-like expression.
 * @return {NodeSet}
 */
NodeSet.prototype.find = function(path) {
    var result = new NodeSet();
    // @todo DO IT!
    return result;
};

/**
 * @returns {Array} Child text nodes (Array of String)
 */
NodeSet.prototype.text = function() {
    return this.childs.filter(function(node) {
        return typeof node === 'string';
    });
};

/**
 * Represents XML element ("tag").
 * @param {String} name
 * @param {Object} attrs
 * @param {Object} parent
 * @constructor
 */
var Tag = xamel.Tag = function Tag(name, attrs, parent) {
    NodeSet.call(this);

    Object.defineProperty(this, 'name', { value : name, enumerable : true });
    Object.defineProperty(this, 'attrs', { value : attrs, enumerable : true });
    Object.defineProperty(this, 'parent', { value : parent });
};

// yeah, Tag is a NodeSet
util.inherits(Tag, NodeSet);

// reset .toJSON inherited from NodeSet
Tag.prototype.toJSON = undefined;

/**
 * Dummy constructor for comments to differ text nodes (String) and comments in the NodeSet.
 * @param {String} comment Comment contents
 * @constructor
 */
var Comment = xamel.Comment = function Comment(comment) {
    this.comment = comment;
};

/**
 * @return {String}
 */
Comment.prototype.toString = function() {
    return this.comment;
};

/**
 * @param {String} xml String contains source XML
 * @param {Object} options Sax-js options hash
 * @param {Function} callback function(error, result)
 * @returns {Object}
 * @see https://github.com/isaacs/sax-js
 */
xamel.xml2object = function(xml, options, callback) {
    var parser,
        target = null,
        pointer = null;

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    parser = sax.parser( ! (options.strict === false), options);

    parser.onopentag = function(node) {
        var tag = new Tag(node.name, node.attributes, pointer);

        if (target === null) {
            // @todo there is a possible bug, if comments or processing instructions will be parsed before
            target = tag;
            pointer = target;
        } else {
            pointer.append(tag);
            pointer = tag;
        }
    };

    parser.onclosetag = function(node) {
        pointer = pointer.parent;
    };

    parser.oncomment = function(comment) {
        pointer.append(new Comment(comment));
    };

    parser.onopencdata = function() {
        // @todo DO IT!
    };

    parser.oncdata = function(cdata) {
        // @todo DO IT!
    };

    parser.onclosecdata = function() {
        // @todo DO IT!
    };

    parser.ontext = function(text) {
        if (pointer !== null) {
            pointer.append(text);
        }
    };

    parser.onerror = function(error) {
        callback(error, target);
    };

    parser.onend = function() {
        callback(undefined, target);
    };

    parser.write(xml).close();
};

module.exports = xamel;