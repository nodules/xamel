var assert = require('chai').assert,
    test = require('./lib/testFile').bind(module),
    xamel = require('../lib/xamel');

test(
    'performance: parse (simple.xml)',
    ['simple.xml'],
    function(files, done) {
        var xml = files[0],
            errorCount = 0,
            ITERATIONS = 1000,
            PERFORMANCE_FACTOR = Number(process.env["NODE_XAMEL_PERF_FACTOR"]) || 0.9,
            iterations = ITERATIONS,
            iterationsDone = 0,
            timeStart = Date.now(),
            totalTime,
            onParse = function(error) {
                error && ++errorCount;
                iterationsDone++;
            };

        if (process.env['TRAVIS'] === 'true') {
            console.log('   Travis-CI environment detected, skip performance test');
            return assert.ok(true);
        }

        while (iterations > 0) {
            xamel.parse(xml, { trim : true }, onParse);
            --iterations;
        }

        while (iterationsDone < ITERATIONS) {
            process.nextTick();
        }

        totalTime = Date.now() - timeStart;
        assert.ok(totalTime < (PERFORMANCE_FACTOR * ITERATIONS));

        assert.strictEqual(errorCount, 0);

        done();
    });
