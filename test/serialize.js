var test = require('./lib/testFile').bind(module),
    NodeSet = require('../lib/xml').NodeSet,
    xamel = require('../lib/xamel');

test(
    'xamel.serialize (parse and back-serialize)',
    ['simple.xml'],
    function(files, beforeExit, assert) {
        var sourceXML = files[0];

        xamel.parse(sourceXML, { trim : false, cdata : true }, function(error, nodeSet) {
            assert.equal(sourceXML, xamel.serialize(nodeSet));
        });
    }
);