var xamel = require('../../lib/xamel'),
    xmlString = require('fs').readFileSync(__dirname + '/../data/simple.xml'),
    count,
    executions = 0,
    TOTAL_EXECUTIONS = 10,
    total = [],
    last,
    ts,
    parsers = [ 'sax', 'expat'],
    parser = 0;

function parse(done) {
    xamel.parse(xmlString.toString(), { parser : parsers[parser] }, function(error) {
        if (error) {
            throw error;
        }

        ++count;
        last = process.hrtime(ts);

        if (last[0] < 1) {
            setImmediate(function() { parse(done); });
        } else {
            done(count * (1 - last[1] * 1e-9));
        }
    });
}

function testRun(done) {
    count = 0;
    ts = process.hrtime();

    parse(function(count) {
        total.push(count);

        if (executions++ < TOTAL_EXECUTIONS) {
            setImmediate(function() { testRun(done); });
        } else {
            done(Math.floor(total.reduce(function(pv, cv) {
                return pv + cv;
            }, 0) / TOTAL_EXECUTIONS));
        }
    });
}

function testDone(result) {
    console.log('%s: %d ops/sec, %d test runs', parsers[parser], result, TOTAL_EXECUTIONS);

    if (++parser < parsers.length) {
        executions = 0;
        testRun(testDone);
    } else {
        console.log('done.');
    }
}

testRun(testDone);