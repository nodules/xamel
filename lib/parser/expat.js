var expat = require('node-expat');

module.exports = function libexpat(options, callbacks) {
    var parser = new expat.Parser(options.encoding ? options.encoding.toUpperCase() : 'UTF-8'),
        trim = options.trim,
        openCdata = false;

    parser.on('startElement', callbacks.tagOpen);
    parser.on('endElement', callbacks.tagClose);
    parser.on('comment', callbacks.comment);
    parser.on('close', callbacks.end);

    parser.on('startCdata', function() {
        openCdata = true;
        callbacks.cdataOpen();
    });

    parser.on('endCdata', function() {
        openCdata = false;
        callbacks.cdataClose();
    });

    parser.on('text', function(chunk) {
        if ( ! openCdata) {
            if ( ! trim) {
                callbacks.text(chunk);
            } else if (chunk.trim() !== '') {
                callbacks.text(chunk);
            }
        } else {
            callbacks.cdataChunk(chunk);
        }
    });

    parser.on('error', callbacks.error);

    return function(xmlString, keepOpen) {
        var result = parser.write(xmlString);

        if ( ! keepOpen) {
            parser.end();
        }

        return result;
    };
};