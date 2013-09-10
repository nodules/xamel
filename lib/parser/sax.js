var sax = require('sax');

module.exports = function saxJS(options, callbacks) {
    var parser = sax.parser(options.strict !== false, options);

    parser.onopentag = function(node) {
        callbacks.tagOpen(node.name, node.attributes);
    };

    parser.onclosetag = callbacks.tagClose;
    parser.oncomment = callbacks.comment;
    parser.onopencdata = callbacks.cdataOpen;
    parser.oncdata = callbacks.cdataChunk;
    parser.onclosecdata = callbacks.cdataClose;
    parser.ontext = callbacks.text;
    parser.onend = callbacks.end;

    parser.onerror = function(error) {
        callbacks.error(error);
        parser.resume();
    };

    return function(xmlString, keepOpen) {
        parser.write(Buffer.isBuffer(xmlString) ? xmlString.toString('utf8') : xmlString);

        return keepOpen ? parser : parser.close();
    };
};