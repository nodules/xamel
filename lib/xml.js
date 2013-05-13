var util = require('util'),
    xml = {};

/**
 * Node set
 * If only one argument is passed and it's instance of Array,
 * then its contents will became children of NodeSet,
 * else all arguments added to new NodeSet as children.
 *
 * @param {Array|*} nodes
 * @constructor
 */
var NodeSet = xml.NodeSet = function NodeSet(nodes) {
    this.childs = (arguments.length === 1 && (Array.isArray(nodes))) ? nodes : Array.apply(Array, arguments);
};

/**
 * Serialize NodeSet as Array
 *
 * @returns {Array}
 */
NodeSet.prototype.toJSON = function() {
    return this.childs;
};

/**
 * evaluate to String as Array
 *
 * @returns {String}
 */
NodeSet.prototype.toString = function() {
    return this.childs.toString();
};

/**
 * Expose most of array instance methods to NodeSet instance,
 * mutators are not exposed to keep `childs` safe.
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
 * This method is one and only mutator of the `childs`.
 *
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
 * @returns {NodeSet|*} of children at one level deeper
 * @private
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
 *
 * @param {String|Array} expr XPath-like conditional expression.
 * @returns {NodeSet|String}
 */
NodeSet.prototype.find = function(expr) {
    var _expr = (typeof expr === 'string') ? expr.split('/') : expr,
        currentExpr = _expr.shift(),
        matched = this.get(currentExpr);

    return (_expr.length > 0 && matched.length > 0) ? matched.explode().find(_expr) : matched;
};

/**
 * Same as NodeSet#find, but automatically joins results of `text()` expression
 *
 * @param {String|Array} expr XPath-like conditional expression.
 * @returns {NodeSet|String}
 */
NodeSet.prototype.$ = function(expr) {
    var result = this.find(expr);

    return (expr.split('/').pop() === 'text()') ? result.text() : result;
};

/**
 * @param {Boolean} [keepArray=false] if `true` returns Array of strings, else concatenate it
 * @returns {Array|String} children text nodes
 */
NodeSet.prototype.text = function(keepArray) {
    var textNodes = this.filter(is.bind(null, 'text()'));

    return ( !! keepArray) ? textNodes : textNodes.join(' ');
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
 * @param {Number} index
 * @returns {Tag|Comment|String} node by `index` or `null` if `index` out of bounds
 */
NodeSet.prototype.eq = function(index) {
    return this.childs[index] || null;
};

/**
 * Represents XML element ("tag").
 *
 * @param {String} name Tag name
 * @param {Object} [attrs] Tag attributes hash
 * @param {NodeSet} [parent] Parent NodeSet
 * @constructor
 * @augments NodeSet
 */
var Tag = xml.Tag = function Tag(name, attrs, parent) {
    var _attrs = attrs || {},
        _parent = parent;

    NodeSet.call(this);

    // called with two args, there second one is parent, not the attributes hash
    if (typeof parent === 'undefined' && (attrs instanceof NodeSet)) {
        _attrs = {};
        _parent = attrs;
    }

    this.name = name;
    this.attrs = _attrs;
    this.parent = _parent;
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
 *
 * @returns {Object}
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
 * @returns {String|null} Attribute value or null if no one exists.
 */
Tag.prototype.attr = function(name) {
    return Object.prototype.hasOwnProperty.call(this.attrs, name) ? this.attrs[name] : null;
};

/**
 * Extends NodeSet#get with `..` support.
 *
 * @param {String} expr
 * @returns {NodeSet}
 */
Tag.prototype.get = function(expr) {
    return (expr === '..') ? this.parent : NodeSet.prototype.get.call(this, expr);
};

/**
 * Dummy constructor for comments to differ text nodes (String) and comments in the NodeSet.
 *
 * @param {String} comment Comment contents
 * @constructor
 */
var Comment = xml.Comment = function Comment(comment) {
    this.comment = comment;
};

/**
 * @returns {String}
 */
Comment.prototype.toString = function() {
    return this.comment;
};

/**
 * Dummy constructor for comments to differ text nodes (String) and CData in the NodeSet.
 *
 * @param {String} data CData contents
 * @constructor
 */
var CData = xml.CData = function CData(data) {
    this.data = data;
};

/**
 * @returns {String}
 */
CData.prototype.toString = function() {
    return this.data;
};

/**
 * @param {String|Comment|CData|Tag|*} node
 * @returns {Boolean}
 */
var isNode = xml.isNode = function(node) {
    return (typeof node === 'string') ||
        (node instanceof Comment) ||
        (node instanceof CData) ||
        (node instanceof Tag);
};

/**
 * Checks expression appliance to node
 *
 * @param {String} expr XPath-like expression part
 * @param {String|Comment|Tag|*} node Node to test
 * @returns {Boolean}
 */
var is = xml.is = function(expr, node) {
    return (expr === 'node()' && isNode(node)) ||
        (expr === 'text()' && (typeof node === 'string')) ||
        (expr === 'comment()' && (node instanceof Comment)) ||
        (expr === 'cdata()' && (node instanceof CData)) ||
        ((node instanceof Tag) && (expr === '*' || expr === 'element()' || expr === node.name));
};

module.exports = xml;