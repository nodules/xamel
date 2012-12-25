var util = require('util'),
    test = require('./lib/testFile').bind(module),
    xamel = require('../lib/xamel');

test(
    'xamel.parse (simple.xml)',
    ['simple.xml', 'simple.json'],
    function(files, beforeExit, assert) {
        var xml = files[0],
            json = files[1],
            assertions = 0;

        xamel.parse(xml, { trim : true }, function(error, result) {
            assertions += 1;
            //console.log(JSON.stringify(result));
            assert.deepEqual(JSON.parse(json), JSON.parse(JSON.stringify(result)), 'xml & json assertion');
        });

        beforeExit(function() {
            assert.equal(1, assertions, 'async assertions done');
        });
    });

test(
    'xamel.parse (partial tree building)',
    ['simple.xml', 'partial.json'],
    function(files, beforeExit, assert) {
        var xml = files[0],
            json = files[1],
            assertions = 0;

        xamel.parse(xml, { trim : true, buildPath : 'menu/food/customer' }, function(error, result) {
            assertions += 1;
            //console.log(JSON.stringify(result));
            assert.deepEqual(JSON.parse(json), JSON.parse(JSON.stringify(result)), 'xml & json assertion');
        });

        beforeExit(function() {
            assert.equal(1, assertions, 'async assertions done');
        });
    });