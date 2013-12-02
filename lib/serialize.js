var XMLWriter = require('xml-writer'),
    xml = require('./xml'),
    NodeSet = xml.NodeSet,
    Tag = xml.Tag,
    XML_TYPE = xml.XML_TYPE;

/**
 * @param {XMLWriter} xw
 * @param {Comment|CData|String} node
 */
function writeXMLAtomicType(xw, node) {
    var type = xml.getXMLType(node);

    switch (type) {
    case XML_TYPE.COMMENT:
        xw.writeComment(node.toString());
        break;
    case XML_TYPE.CDATA:
        xw.writeCData(node.toString());
        break;
    case XML_TYPE.TEXT:
        xw.text(node);
        break;
    default:
        throw new Error('Can not perform atomic write for XML type "' + type + '".');
    }
}

/**
 * @param {XMLWriter} xw
 * @param {NodeSet} nset
 * @private
 */
function processNodeSet(xw, nset) {
    var idx, node;

    function writeAttr(attr) {
        xw.writeAttribute(attr, node.attr(attr));
    }

    for(idx = 0, node = nset.eq(0); node !== null; idx++, node = nset.eq(idx)) {
        if (node instanceof Tag) {
            xw.startElement(node.name);
            Object
                .keys(node.attrs)
                .forEach(writeAttr);
            processNodeSet(xw, node);
            xw.endElement();
        } else {
            writeXMLAtomicType(xw, node);
        }
    }
}

/**
 * @param {NodeSet} nset
 * @param {Object} options
 */
function serialize(nset, options) {
    if ( ! (nset instanceof NodeSet)) {
        throw new Error( 'Only NodeSet can be serialized.');
    }

    if (typeof options !== 'object' || options === null) {
        options = {};
    }

    var xw = new XMLWriter();

    if (options.header !== false) {
        xw.startDocument();
    }

    processNodeSet(xw, nset);

    return xw.toString();
}

module.exports = {
    serialize : serialize
};
