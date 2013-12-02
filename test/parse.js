var test = require('./lib/testFile').bind(module),
    xamel = require('../lib/xamel');

test(
    'xamel.parse (simple.xml)',
    ['simple.xml', 'simple.json'],
    function(files, beforeExit, assert) {
        var xml = files[0],
            json = files[1],
            assertions = 0;

        xamel.parse(xml, function(error, result) {
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
    ['simple.xml', 'partial.json', 'partial2.json'],
    function(files, beforeExit, assert) {
        var xml = files.shift(),
            jsons = files,
            buildPaths = [
                'menu/food/customer',
                'menu/food/customer/*/text()'
            ],
            assertions = 0;

        jsons.forEach(function(json, idx) {
            xamel.parse(xml, { buildPath : buildPaths[idx] }, function(error, result) {
                assertions += 1;
                //console.log(JSON.stringify(result));
                assert.deepEqual(JSON.parse(json), JSON.parse(JSON.stringify(result)), 'xml & json assertion');
            });
        });

        beforeExit(function() {
            assert.equal(jsons.length, assertions, 'async assertions done');
        });
    });

test(
    'xamel.parse (cdata parsing)',
    ['simple.xml', 'cdata.json'],
    function(files, beforeExit, assert) {
        var xml = files[0],
            json = files[1],
            assertions = 0;

        xamel.parse(xml, { buildPath : '*/*/*/cdata()', cdata : true }, function(error, result) {
            assertions += 1;
            //console.log(JSON.stringify(result));
            assert.deepEqual(JSON.parse(json), JSON.parse(JSON.stringify(result)), 'xml & json assertion');
        });

        beforeExit(function() {
            assert.equal(1, assertions, 'async assertions done');
        });
    });

test(
    'xamel.parse (broken xml)',
    ['broken.xml'],
    function(files, beforeExit, assert) {
        var xml = files[0],
            assertions = 0;

        xamel.parse(xml, function(error, result) {
            assertions += 1;
            assert.ok(error instanceof Error, 'error passed');
            assert.strictEqual(result, null, 'result is null');
        });

        beforeExit(function() {
            assert.equal(1, assertions, 'callback called only one time');
        });
    });
