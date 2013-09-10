var expat = require('node-expat');

module.exports = function libexpat(options, callbacks) {
    var parser = new expat.Parser(options.encoding ? options.encoding.toUpperCase() : 'UTF-8'),
        openCdata = false,
        onText = function(chunk) {
            if ( ! openCdata && chunk.trim() !== '') {
                callbacks.text(chunk);
            }
        };

    if ( ! options.trim) {
        onText = function(chunk) {
            if ( ! openCdata) {
                callbacks.text(chunk);
            }
        };
    }

    parser.on('startElement', callbacks.tagOpen);
    parser.on('endElement', callbacks.tagClose);
    parser.on('comment', callbacks.comment);
    parser.on('end', callbacks.end);

    parser.on('startCdata', function() {
        openCdata = true;
        callbacks.cdataOpen();
    });

    parser.on('endCdata', function() {
        openCdata = false;
        callbacks.cdataClose();
    });

    parser.on('text', ! options.cdata ?
        onText :
        function(chunk) {
            if ( ! openCdata) {
                onText(chunk);
            } else {
                callbacks.cdataChunk(chunk);
            }
        });

    parser.on('error', function(error) {
        callbacks.error(new Error(error));
    });

    return function(xmlString) {
        var result = parser.write(xmlString);

        parser.end();

        return result;
    };
};