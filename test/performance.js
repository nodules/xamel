var util = require('util'),
    test = require('./lib/testFile').bind(module),
    xamel = require('../lib/xamel');

test(
    'performance: xml2object (simple.xml)',
    ['simple.xml'],
    function(files, beforeExit, assert) {
        var xml = files[0],
            errorCount = 0,
            ITERATIONS = 10000,
            EXPECTED_EXECUTION_TIME = .4,
            iterations = ITERATIONS,
            iterationsDone = 0,
            timeStart = Date.now(),
            totalTime;

        while (iterations > 0) {
            xamel.xml2object(xml, { trim : true }, function(error, result) {
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
        assert.ok(totalTime < (EXPECTED_EXECUTION_TIME * ITERATIONS));

        assert.strictEqual(errorCount, 0);
    });