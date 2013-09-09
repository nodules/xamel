var xml = require('./xml'),
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
    var parser = require('./parser/' + (options.parser || 'sax')),
        path = [],
        buildPath,
        target = new NodeSet(),
        pointer = target,
        firstError = null,
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

    parser(options, {
        tagOpen : function(node) {
            if ( ! inPath(node.name, true)) { return; }

            var tag = new Tag(node.name, node.attributes, pointer);
            pointer.append(tag);
            pointer = tag;
        },

        tagClose : function() {
            if (inPath()) {
                pointer = pointer.parent;
            }
            path.pop();
        },

        comment : function(comment) {
            if ( ! inPath('comment()')) {
                return;
            }
            pointer.append(new Comment(comment));
        },

        cdataOpen : function() {
            if ( ! options.cdata || ! inPath('cdata()', true)) {
                return;
            }
            pointer.append(new CData());
        },

        cdataChunk : function(chunk) {
            if ( ! options.cdata || ! inPath()) {
                return;
            }
            pointer.childs[pointer.childs.length - 1].push(chunk);
        },

        cdataClose : function() {
            if ( ! options.cdata || ! inPath()) {
                return;
            }
            path.pop();
        },

        text : function(text) {
            if ( ! inPath('text()')) { return; }
            pointer.append(text);
        },

        error : function(error) {
            if ( ! firstError) {
                firstError = error;
            }
        },

        end : function() {
            callback(firstError, firstError ? null : target);
        }
    })(xml).close();
};
