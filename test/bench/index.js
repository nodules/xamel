var xamel = require('../../lib/xamel'),
    xmlString = require('fs').readFileSync(__dirname + '/../data/simple.xml', 'utf8'),
    count,
    executions = 0,
    TOTAL_EXECUTIONS = 10,
    total = [],
    last,
    ts;

function parse(done) {
    xamel.parse(xmlString, function(error) {
        if (error) {
            throw error;
        }

        ++count;
        last = process.hrtime(ts);

        if (last[0] < 1) {
            setImmediate(parse.bind(this, done));
        } else {
            done(count * (1 - last[1] * 1e-9));
        }
    });
};

function testRun(done) {
    count = 0;
    ts = process.hrtime()

    parse(function(count) {
        total.push(count);

        if (executions++ < TOTAL_EXECUTIONS) {
            setImmediate(testRun.bind(this, done));
        } else {
            done(Math.floor(total.reduce(function(pv, cv) {
                return pv + cv;
            }, 0) / TOTAL_EXECUTIONS));
        }
    });
};

testRun(function(result) {
    console.log('%d ops/sec, %d test runs', result, TOTAL_EXECUTIONS);
});