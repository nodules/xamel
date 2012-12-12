var fs = require('fs');

module.exports = function testFile(name, files, test) {
    this.exports[name] = function(beforeExit, assert) {
        test.call(this, files.map(function(file) {
            return fs.readFileSync('./test/data/' + file, 'utf8');
        }), beforeExit, assert);
    }
};