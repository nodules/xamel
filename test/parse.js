var test = require('./lib/testFile').bind(module),
    assert = require('chai').assert,
    xamel = require('../lib/xamel');

[ 'sax', 'expat'].forEach(function(parser) {

    test(
        'xamel.parse (simple.xml) @' + parser,
        ['simple.xml', 'simple.json'],
        function(files, done) {
            var xml = files[0],
                json = files[1];

            xamel.parse(xml, { parser : parser }, function(error, result) {
                //console.log(JSON.stringify(result));
                assert.deepEqual(JSON.parse(json), JSON.parse(JSON.stringify(result)), 'xml & json assertion');

                done();
            });
        });

    test(
        'xamel.parse (partial tree building) @' + parser,
        ['simple.xml', 'partial.json', 'partial2.json'],
        function(files, done) {
            var xml = files.shift(),
                jsons = files,
                buildPaths = [
                    'menu/food/customer',
                    'menu/food/customer/*/text()'
                ],
                assertions = 0;

            jsons.forEach(function(json, idx) {
                xamel.parse(xml, { parser : parser, buildPath : buildPaths[idx] }, function(error, result) {
                    //console.log(JSON.stringify(result));
                    assert.deepEqual(JSON.parse(json), JSON.parse(JSON.stringify(result)), 'xml & json assertion');

                    if (++assertions === jsons.length) {
                        done();
                    }
                });
            });
        });

    test(
        'xamel.parse (cdata parsing) @' + parser,
        ['simple.xml', 'cdata.json'],
        function(files, done) {
            var xml = files[0],
                json = files[1];

            xamel.parse(xml, { parser : parser, buildPath : '*/*/*/cdata()', cdata : true }, function(error, result) {
                //console.log(JSON.stringify(result));
                assert.deepEqual(JSON.parse(json), JSON.parse(JSON.stringify(result)), 'xml & json assertion');

                done();
            });
        });

    test(
        'xamel.parse (broken xml) @' + parser,
        ['broken.xml'],
        function(files, done) {
            var xml = files[0];

            xamel.parse(xml, { parser : parser }, function(error, result) {
                assert.ok(error instanceof Error, 'error passed');
                assert.strictEqual(result, null, 'result is null');

                done();
            });
        });
});
