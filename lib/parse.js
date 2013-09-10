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
        inPath = function() {
                return true;
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

    if (buildPath) {
        inPath = function(check, changePath) {
            var joinedPath;

            check && path.push(check);
            joinedPath = path.join('/');
            check && ( ! changePath) && path.pop();

            return buildPath.test(joinedPath);
        };
    }

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
        tagOpen : function(name, attributes) {
            //console.log('tagOpen <', name, attributes);
            if ( ! inPath(name, true)) { return; }

            var tag = new Tag(name, attributes, pointer);
            pointer.append(tag);
            pointer = tag;
        },

        tagClose : function() {
            //console.log('tagClose >', pointer.name);
            if (inPath()) {
                pointer = pointer.parent;
            }
            path.pop();
        },

        comment : function(comment) {
            //console.log('comment :', comment);
            if ( ! inPath('comment()')) {
                return;
            }
            pointer.append(new Comment(comment));
        },

        cdataOpen : function() {
            //console.log('cdataOpen <', arguments);
            if ( ! options.cdata || ! inPath('cdata()', true)) {
                return;
            }
            pointer.append(new CData());
        },

        cdataChunk : function(chunk) {
            //console.log('cdataChunk :', chunk);
            if ( ! options.cdata || ! inPath()) {
                return;
            }
            pointer.childs[pointer.childs.length - 1].push(chunk);
        },

        cdataClose : function() {
            //console.log('cdataClose >', arguments);
            if ( ! options.cdata || ! inPath()) {
                return;
            }
            path.pop();
        },

        text : function(text) {
            //console.log('text :', text);
            if ( ! inPath('text()')) { return; }
            pointer.append(text);
        },

        error : function(error) {
            //console.log('error :', error);
            if ( ! firstError) {
                firstError = error;
            }
        },

        end : function() {
            //console.log('end !');
            callback(firstError, firstError ? null : target);
        }
    })(xml);
};
