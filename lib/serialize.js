/* jshint unused:false */
var xml = require('./xml'),
    NodeSet = xml.NodeSet,
    Tag = xml.Tag,
    Comment = xml.Comment;

/**
 * @param {Object} obj
 * @param {Object} [options]
 * @returns {String}
 */
function serializeObject(obj, options) {
    return '';
}

/**
 * @param {NodeSet} nset
 * @param {Object} [options]
 * @returns {String}
 */
function serializeNodeSet(nset, options) {
    return '';
}

/**
 * @param {NodeSet|*} ref
 * @param {Object} [options]
 * @returns {String}
 */
module.exports = function serialize(ref, options) {
    var opts = options || {};

    return (ref instanceof NodeSet) ? serializeNodeSet(ref, opts) : serializeObject(ref, opts);
};
