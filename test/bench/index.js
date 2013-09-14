var xamel = require('../../lib/xamel'),
    fs = require('fs'),
    vow = require('vow'),
    PARSERS = fs.readdirSync(__dirname + '/../../lib/parser/')
        .map(function(parserFile) {
            return parserFile.substr(0, parserFile.lastIndexOf('.'));
        }),
    XML_SOURCE = fs.readFileSync(__dirname + '/../data/simple.xml', 'utf8'),
    TEST_TIME = process.env.TEST_TIME || 1000;

function parse(parser, ts, count) {
    var promise = vow.promise();

    xamel.parse(XML_SOURCE, { parser : parser }, function(error) {
        var tsDiff = process.hrtime(ts);

        if (error) {
            promise.reject(error);
        } else if (tsDiff[0] * 1000 + tsDiff[1] * 1e-6 < TEST_TIME) {
            setImmediate(function() {
                parse(parser, ts, count + 1)
                    .then(promise.fulfill.bind(promise))
                    .fail(promise.reject.bind(promise));
            });
        } else {
            promise.fulfill(count);
        }
    });

    return promise;
}

function testParser(parser) {
    var testRun = vow.promise();

    setImmediate(function() {
        testRun.fulfill();
    });

    return testRun
        .then(function() {
            return parse(parser, process.hrtime(), 1);
        })
        .then(function(count) {
            console.log('%s: %s ops/sec', parser, count);
        })
        .fail(function(error) {
            console.error('"%s" parser test has been failed: %s', parser, error);
        });
}

(function testAll() {
    var launch = vow.promise();

    console.log('Found parsing backends:', PARSERS.join(', '));

    PARSERS
        .reduce(function(lastPromise, parser) {
            return lastPromise.then(testParser.bind(null, parser));
        }, launch)
        .then(function() {
            console.log('done.');
        });

    launch.fulfill();
})();