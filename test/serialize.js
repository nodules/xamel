var test = require('./lib/testFile').bind(module),
    xamel = require('../lib/xamel');

test(
    'xamel.serialize (parse and back-serialize)',
    ['simple.xml'],
    function(files, beforeExit, assert) {
        var assertions = 0,
            sourceXML = files[0];

        xamel.parse(sourceXML, { trim : false, cdata : true }, function(error, nodeSet) {
            ++assertions;
            assert.equal(sourceXML, xamel.serialize(nodeSet));
        });

        beforeExit(function() {
            assert.strictEqual(assertions, 1);
        });
    }
);
