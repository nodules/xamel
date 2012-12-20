var util = require('util'),
    sax = require('sax'),
    xamel = {};

/**
 * Node set
 * If only one argument is passed and it's instance of Array,
 * then its contents will became children of NodeSet,
 * else all arguments added to new NodeSet as children.
 * @param {Array|*} nodes
 * @constructor
 */
var NodeSet = xamel.NodeSet = function NodeSet(nodes) {
    this.childs = (arguments.length === 1 && (Array.isArray(nodes))) ? nodes : Array.apply(Array, arguments);
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
 * Expose most of array instance methods to NodeSet instance,
 * mutators are not exposed to keep childs safe.
 */
[
    'join', 'indexOf', 'lastIndexOf', 'forEach', 'map', 'reduce',
    'reduceRight', 'filter', 'some', 'every', 'concat', 'slice'
].forEach(function(methodName) {
    NodeSet.prototype[methodName] = function() {
        return Array.prototype[methodName].apply(this.childs, arguments);
    };
});

/**
 * Append node to node set.
 * This method is one and only mutator of the childs,
 * it must not be used outside the xamel.js.
 * @param {Tag|Comment|String} node
 * @private
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
 * @param {String} expr XPath-like expression part
 * @returns {NodeSet} NodeSet of nodes `expr` can applied for.
 */
NodeSet.prototype.get = function(expr) {
    return new NodeSet(this.filter(is.bind(null, expr)));
};

/**
 * @returns {NodeSet} of children at one level deeper
 */
NodeSet.prototype.explode = function() {
    return this.reduce(function(result, tag) {
            if (tag instanceof NodeSet) {
                result.childs = result.childs.concat(tag.childs);
            }
            return result;
        }, new NodeSet());
};

/**
 * Creates node set of nodes meeting the path.
 * @param {String|Array} expr XPath-like conditional expression.
 * @return {NodeSet}
 */
NodeSet.prototype.find = function(expr) {
    var _expr = (typeof expr === 'string') ? expr.split('/') : expr,
        matched = this.get(_expr.shift());

    return (_expr.length > 0 && matched.length > 0) ? matched.explode().find(_expr) : matched;
};

/**
 * @returns {Array} Child text nodes (Array of String)
 */
NodeSet.prototype.text = function() {
    // @todo maybe method must go deeper and find all descendant text nodes?
    return this.filter(is.bind(null, 'text()'));
};

/**
 * @param {String} name Attribute name.
 * @returns {NodeSet} of tags in the ctx which have attribute `name`
 */
NodeSet.prototype.hasAttr = function(name) {
    return new NodeSet(this.filter(function(node) {
        return (node instanceof Tag) && node.attr(name) !== null;
    }));
};

/**
 * @param {String} name Element ("tag") attribute name.
 * @param {String|null} value Attribute value or null if attribute must absent.
 * @returns {NodeSet} of tags which attribute `name` equals `value`.
 */
NodeSet.prototype.isAttr = function(name, value) {
    return new NodeSet(this.filter(function(node) {
        return (node instanceof Tag) && node.attr(name) === value;
    }));
};

/**
 * Represents XML element ("tag").
 * @param {String} name Tag name
 * @param {Object} attrs Tag attributes hash
 * @param {NodeSet} parent Parent NodeSet
 * @constructor
 */
var Tag = xamel.Tag = function Tag(name, attrs, parent) {
    NodeSet.call(this);

    this.name = name;
    this.attrs = attrs;
    this.parent = parent;
};

/**
 * Yeah, Tag is NodeSet
 */
util.inherits(Tag, NodeSet);

/**
 * Custom Tag#toJSON()
 * * doesn't expose `parent` property to JSON;
 * * expose non-empty `attrs` and `childs` properties;
 * * if Tag has only one text child, expose it as `text` instead of `childs` array.
 * @return {Object}
 */
Tag.prototype.toJSON = function() {
    var jsonTag = { name : this.name };

    if (typeof this.attrs === 'object' && Object.keys(this.attrs).length > 0) {
        jsonTag.attrs = this.attrs;
    }

    if (this.length === 1 && typeof this.childs[0] === 'string') {
        jsonTag.text = this.childs[0];
    } else if (this.length > 0) {
        jsonTag.childs = this.childs;
    }

    return jsonTag;
};

/**
 * @param {String} name Attribute name
 * @return {String|null} Attribute value or null if no one exists.
 */
Tag.prototype.attr = function(name) {
    return Object.prototype.hasOwnProperty.call(this.attrs, name) ? this.attrs[name] : null;
};

/**
 * Extends NodeSet#get with `..` support.
 * @param {String} expr
 * @return {NodeSet}
 */
Tag.prototype.get = function(expr) {
    return (expr === '..') ? this.parent : NodeSet.prototype.get.call(this, expr);
};

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
 * @param {NodeSet|*} nodeset
 * @returns {Boolean} is nodeset constructed by NodeSet
 */
var isNodeSet = xamel.isNodeSet = function(nodeset) {
    return (nodeset instanceof NodeSet) && nodeset.constructor === NodeSet;
};

/**
 * @param {String|Comment|Tag|*} node
 * @returns {Boolean}
 */
var isNode = xamel.isNode = function(node) {
    return (typeof node === 'string') ||
        (node instanceof Comment) ||
        (node instanceof Tag);
};

/**
 * Checks expression appliance to node
 * @param {String} expr XPath-like expression part
 * @param {String|Comment|Tag|*} node Node to test
 * @returns {Boolean}
 */
var is = xamel.is = function(expr, node) {
    return (expr === 'node()' && isNode(node)) ||
        (expr === 'text()' && (typeof node === 'string')) ||
        (expr === 'comment()' && (node instanceof Comment)) ||
        ((node instanceof Tag) && (expr === '*' || expr === 'element()' || expr === node.name));
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
        target = new NodeSet(),
        pointer = target;

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    parser = sax.parser( ! (options.strict === false), options);

    parser.onopentag = function(node) {
        var tag = new Tag(node.name, node.attributes, pointer);
        pointer.append(tag);
        pointer = tag;
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
        pointer.append(text);
    };

    parser.onerror = function(error) {
        callback(error, target);
    };

    parser.onend = function() {
        callback(null, target);
    };

    parser.write(xml).close();
};

module.exports = xamel;