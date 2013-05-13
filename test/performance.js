var util = require('util'),
    test = require('./lib/testFile').bind(module),
    xamel = require('../lib/xamel');

test(
    'performance: xml2object (simple.xml)',
    ['simple.xml'],
    function(files, beforeExit, assert) {
        var xml = files[0],
            errorCount = 0,
            ITERATIONS = 1000,
            PERFORMANCE_FACTOR = Number(process.env["NODE_XAMEL_PERF_FACTOR"]) || .75,
            iterations = ITERATIONS,
            iterationsDone = 0,
            timeStart = Date.now(),
            totalTime;

        if (process.env['TRAVIS'] === 'true') {
            console.log('   Travis-CI environment detected, skip performance test');
            return assert.ok(true);
        }

        while (iterations > 0) {
            xamel.parse(xml, { trim : true }, function(error, result) {
                error && ++errorCount;
                iterationsDone++;
            });
            --iterations;
        }

        while (iterationsDone < ITERATIONS) {
            process.nextTick();
        }

        totalTime = Date.now() - timeStart;
        console.log('   performance: ' + ITERATIONS + ' in ' + (Date.now() - timeStart) + 'ms');
        assert.ok(totalTime < (PERFORMANCE_FACTOR * ITERATIONS));

        assert.strictEqual(errorCount, 0);
    });