# Xamel [![Build Status](https://secure.travis-ci.org/nodules/xamel.png)](http://travis-ci.org/nodules/xamel)


Xamel provides an easy way to extract data from XML using XPath-like expressions 
and map/reduce operations. It's designed to be fast and memory-friendly.

## Notes about XML parsers

If you are using xamel version >=0.2.0, then you must install supported XML parser module ([sax-js](http://npm.im/sax) or [node-expat](http://npm.im/node-expat)) besides xamel itself.

Since version 0.2 xamel is no longer bundled with any XML parser. It supports [sax-js](http://npm.im/sax) and [node-expat](http://npm.im/node-expat) out of the box, but feel free to fork, implement another parser support and PR changes back!

Read [more about parsing backends](#parsing-backends).

## Quick start

Install xamel and XML parser for it:

```bash
npm install xamel sax
```

Try it!

```javascript
var xamel = require('xamel');
    
xamel.parse('<data>Answer: %s<number>42</number></data>', function(err, xml) {
    var answer = xml.$('data/number/text()');
    console.log( xml.$('data/text()'), answer );
});
```

## xamel.parse(xml, [options], callback)

 * `xml` string contains XML to parse;
 * `options` hash of parsing options, includes [sax options](https://github.com/isaacs/sax-js#arguments), incapsulates sax param `strict` as an option, and some xamel-specific options:
   * `parser` – supported XML parser name:
     * `'sax'` – sax-js (xamel tries to use it by default),
     * `'expat' – node-expat`;
   * [`buildPath`](#buildpath);
   * `cdata` – if evaluated to `true` then `parse` process CDATA sections, `false` by default;
   * `trim` – skip empty text nodes while tree building (supported for node-expat in the same way as sax-js do);
 * `callback` called when parsing done, passes error or null as the first argument and NodeSet as the second argument.

### buildPath

Lets take an example:

XML (article.xml)

```xml
<root>
    <head>
        ...
    </head>
    <body>
        <article>
            ...
        </article>
    </body>
</root>
```

Suppose, you want only `<article>` and its content as result of the `parse`, so pass the `buildPath` option to the `parse`:

```javascript
var xamel = require('xamel'),
    xmlSource = require('fs').readFileAsync('./article.xml');

xamel.parse(xmlSource, { buildPath : 'root/body/article' }, function(err, xml) {
    if (err !== null) {
        throw err;
    }

    console.dir(JSON.stringify(xml));
});
```

You can also check the [partial parsing test](https://github.com/nodules/xamel/blob/master/test/parse.js#L25).

## NodeSets and map/reduce

Result of `xamel.parse(…)` is a NodeSet. You can think of NodeSet as an array of nodes (internally it's true). 
NodeSet provides all _non-mutator_ methods of the `Array.prototype`.

### Example of key-value query concatenation

XML (query.xml)

```xml
<query>
    <key name="mark">Opel</key>
    <key name="model">Astra</key>
    <key name="year">2011</key>
</query>
```

JavaScript

```javascript
var xamel = require('xamel'),
    xmlSource = require('fs').readFileAsync('./query.xml');
    
function buildQuery(nodeset) {
    return nodeset.$('query/key').reduce(function(query, key) {
        return [query, '&', key.attr('name'), '=', key.text()].join('');
    }, '');
}
        
xamel.parse(xmlSource, function(err, xml) {
    if (err !== null) {
        throw err;
    }
    buildQuery(xml);
} );
```

## NodeSet preserves nodes' order

So processing a bad-designed xml, where order of nodes is significant, is completely possible:

XML (query.xml)

```xml
<query>
    <key>mark</key><value>Opel</value>
    <key>model</key><value>Astra</value>
    <key>year</key><value>2011</value>
</query>
```

JavaScript

```javascript
function buildQuery(nodeset) {
    return nodeset.$('query/*').reduce(function(query, tag) {
        if (tag.name === 'key') {
            return [query, '&', tag.text(), '='].join('');
        } else {
            return query + tag.text();
        }
    }, '');
}
```

## Ok, but why we need a NodeSet? Why not a regular array?

NodeSet provides some powerful methods to find, extract and process data.

### find(path), $(path)

These methods traverse the tree, trying to find nodes satisfying `path` expression. 
Result is a NodeSet. `length` property should be used to check if something is found.

Path looks pretty much similar to XPath, but it's not completely so. That's the path grammar in BNF:

```bnf
<path> ::= <node-check> | <path> "/" <node-check>
<node-check> ::= "node()" | "text()" | "comment()" | "cdata()" | "*" | "element()" | <xml-tag-name>
```

As described above, valid paths are:
```
country
country/state/city
country/*/city
*/*/city/text()
*
text()
element/text()
...
```

Invalid paths:
```
/country        # leading '/' is not allowed
country/state/  # trailing '/' is not allowed
./state         # '.' are not supported <node-check>
```

Method `NodeSet#$` was designed as an alias for `NodeSet#find`, but it slightly differs.
Internally `NodeSet#$` calls `NodeSet#find`, but method returns concatenated string instead of NodeSet, if last check in the path is `text()`:

```javascript
xml.find('article/para/text()') => [ 'Text 1', 'Text of second para', ... ]
xml.$('article/para/text()') => 'Text 1Text of second para...'
```

### text(keepArray = false)

Method returns content of text nodes in the NodeSet. Being called without an argument or with a first argument
equals `false`, it returns a string (concatenated text nodes content). If not, result is an array of strings.

```javascript
nodeset.text(true) => ['1', '2', 'test']
nodeset.text() => '12test'
nodeset.text(false) => '12test'
```

### eq(index)

Method returns child node by its index.

```xml
<article>
    <h1>Title</h1>
    <p>Lorem ipsum…</p>
</article>
```

JavaScript

```javascript
var nodeset = xml.$('article/h1'),  // $ and find return NodeSet
    title = nodeset.eq(0);          // retrieve Tag from NodeSet
    
console.log('Header level: %s', title.name[1]);  // use Tag's field
```

### hasAttr(name)

Method filters tags with attribute `name` and returns a new NodeSet.

```xml
<list>
    <item>Home</item>
    <item current="yes">Products</item>
    <item>About</item>
</list>
```

JavaScript

```javascript
var currentItemTitle = xml.find('list/item').hasAttr('current').eq(0).text();
```

### isAttr(name, value)

Filters tags with `name` attribute equals `value` and returns a new NodeSet.

```xml
<list>
    <item current="no">Home</item>
    <item current="yes">Products</item>
    <item current="no">About</item>
</list>
```

JavaScript

```javascript
var currentItemTitle = xml.find('list/item').isAttr('current', 'yes').eq(0).text();
```

### get(expr)

Method filters nodes satisfying `expr` and returns new NodeSet. 
Argument `expr` is `<node-check>` as described above in the `NodeSet#find` section.

```xml
<media>
    <!-- Music -->
    <item>Pink Floyd - The Fletchers Memorial Home</item>
    <!-- Video -->
    <item>Kids on the slope</item>
</media>
```

JavaScript

```javascript
var media = xml.$('media').eq(0);

media.get('comment()') => NodeSet contains two comments: ' Music ', ' Video '
media.get('item') => NodeSet contains two elements: <item>Pink…</item>, <item>Kids…</item>
```

It looks the same as `NodeSet#find` without traversing through the tree, 
but `nodeset.get(<CHECK>)` is a bit faster than `nodeset.find(<CHECK>)`.

Method is used internally by `NodeSet#find`.

## Types of nodes

### Text

Text nodes are represented by strings.

### Comment

Fields:
 * `comment` represents comment content as a string.

Methods:
 * `toString()` returns `comment` field value.

### Tag

Tag is a descendant of NodeSet, all `NodeSet.prototype` methods are available.

Fields:
 * `name` contains XML tag name;
 * `attrs` is a hash of attributes;
 * `parent` points to parent tag or a root NodeSet.

Methods:
 * `attr(name)` returns attribute value by name, or null if attribute isn't defined.

### CData

Methods:
 * `getData()` returns CDATA section content;
 * `toString()` similiar to `getData`;
 * `toJSON()` returns object `{ cdata : "cdata content …" }`.

## Why such complexity? I just want to translate XML to JSON!

```javascript
require('xamel').parse(xmlString, function(err, xml) {
    if (!err) {
        console.log( JSON.stringify(xml) );
    }
});
```

## Parsing backends

### Supported backends

#### [sax-js](http://npm.im/sax) – `sax`

SAX parser in JavaScript. It's pros and cons of sax-js: you can use it if you don't want or cann't deal with native Node.js addons. But you have to sacrifice holy cow of the performance.

#### [node-expat](http://npm.im/node-expat) – `expat`

SAX parser in C. Fast as thunder, but must be compiled duering installation. If your prodution enviroment consists of many machines with different archs then the binary module may be a headache.

### Benchmark

Benchmark [bundled](./test/bench/index.js) with module, you can try it in your own environment on data volumes which fits your application.

```console
$ node ./test/bench/index.js
sax: 2554 ops/sec, 10 test runs
expat: 6321 ops/sec, 10 test runs
done.
```

### How to add support for another SAX-compatible parser?

* fork xamel repository;
* add your parsing backend to [lib/parser](./lib/parser/) directory; use existing backends as the reference, it's easy;
* add description about backend to README (`parser` option values description and parser specific options in the same README section);
* create pull-request to xamel master branch.
