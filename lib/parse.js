var sax = require('sax'),
    xml = require('./xml'),
    NodeSet = xml.NodeSet,
    Tag = xml.Tag,
    Comment = xml.Comment,
    CData = xml.CData;

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
        inPath = function(check, changePath) {
            var joinedPath;

            if ( ! buildPath) {
                return true;
            }

            check && path.push(check);
            joinedPath = path.join('/');
            check && ( ! changePath) && path.pop();

            return buildPath.test(joinedPath);
        };

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    // set sax-js option `trim` to `true` by default,
    // because it looks like commonly desired behaviour
    if (typeof options.trim === 'undefined') {
        options.trim = true;
    }

    buildPath = options.buildPath || false;

    // construct RegExp from buildPath string
    if (buildPath) {
        // for WebStorm:
        // noinspection JSValidateTypes
        buildPath = new RegExp(buildPath.split('/').reduce(function(path, check, idx) {
            var resultCheck = check
                .replace('(', '(')
                .replace(')', ')');

            if (check === '*' || check === 'element()') {
                resultCheck = '[^/()]+';
            } else if (check === 'node()') {
                resultCheck = '[^/]+';
            }

            return [ path, resultCheck ].join(idx ? '/' : '');
        }, '^'));
    }

    parser = sax.parser(options.strict !== false, options);

    parser.onopentag = function(node) {
        if ( ! inPath(node.name, true)) { return; }

        var tag = new Tag(node.name, node.attributes, pointer);
        pointer.append(tag);
        pointer = tag;
    };

    /* jshint unused:false */
    parser.onclosetag = function(node) {
        if (inPath()) {
            pointer = pointer.parent;
        }
        path.pop();
    };

    parser.oncomment = function(comment) {
        if ( ! inPath('comment()')) {
            return;
        }
        pointer.append(new Comment(comment));
    };

    parser.onopencdata = function() {
        if ( ! options.cdata || ! inPath('cdata()', true)) {
            return;
        }
        pointer.append(new CData());
    };

    parser.oncdata = function(chunk) {
        if ( ! options.cdata || ! inPath()) {
            return;
        }
        pointer.childs[pointer.childs.length - 1].push(chunk);
    };

    parser.onclosecdata = function() {
        if ( ! options.cdata || ! inPath()) {
            return;
        }
        path.pop();
    };

    parser.ontext = function(text) {
        if ( ! inPath('text()')) { return; }
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
