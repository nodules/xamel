# Xamel

Xamels goal is providing the easy way to extract data from XML using XPath-like expressions 
and map/reduce operations. Also it's designed to be fast and memory-friendly.

## Quick start

```javascript
var xamel = require('xamel');
    
xamel.parse('<data>Answer: %s<number>42</number></data>', function(err, xml) {
    var answer = xml.$('data/number').text();
    console.log( xml.$('data').text(), answer );
});
```

## NodeSets and map/reduce.

Result of `xamel.parse(…)` is NodeSet. You can think NodeSet is an array of nodes (internally, it's true). 
NodeSet provides all _non-mutators_ methods of the `Array.prototype`.

### Example of key-value query concatenation.

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

## NodeSet keeps source nodes order

So processing of a bad-designed xml, where order means, possible:

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

## O-o-ok, but why we needs for the NodeSet? Gi'me a regular Array!

NodeSet provides some powerful methods to find, extract and process data from XML.

### find(path), $(path)

These methods go through the tree trying to find nodes satisfing `path` expression and build a new NodeSet. 
Result is NodeSet. Check `length` property to know is something found.

Path looks like XPath, but really not it is. There is path grammar in BNF:

```bnf
<path> ::= <node-check> | <path> "/" <node-check>
<node-check> ::= "node()" | "text()" | "comment()" | "cdata()" | "*" | "element()" | <xml-tag-name>
```

As described above, valid paths are
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

Invalid paths
```
/country        # leading '/' is not allowed
country/state/  # trailing '/' is not allowed
./state         # '.' are not supported <node-check>
```

Method `NodeSet#$` was designed as an alias for `NodeSet#find`, but finally slightly differs from it.
Internally `NodeSet#$` calls `NodeSet#find`, but method returns concatenated string instead of NodeSet, if last check in the path equals `text()`:

```javascript
xml.find('article/para/text()') => [ 'Text 1', 'Text of second para', ... ]
xml.$('article/para/text()') => 'Text 1Text of second para...'
```

### text(keepArray = false)

Method returns content of text nodes in the NodeSet. If it called without argument or first arg 
equals `false` result is string (concatenated text nodes content), else result is array of strings.

```javascript
nodeset.text(true) => ['1', '2', 'test']
nodeset.text() => '12test'
nodeset.text(false) => '12test'
```

### eq(index)

Method returns NodeSet child node by its index.

```xml
<article>
    <h1>Title</h1>
    <p>Lorem ipsum…</p>
</article>
```

JavaScript

```javascript
var nodeset = xml.$('article/h1'),  // $ and find returns NodeSet
    title = nodeset.eq(0);          // retrieve Tag from NodeSet
    
console.log('Header level: %s', title.name[1]);  // use field of Tag
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

Methods filters nodes satisfying `expr` and returns new NodeSet. 
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

It looks same as `NodeSet#find` without traversing through the tree, 
but call `nodeset.get(<CHECK>)` is a bit faster than `nodeset.find(<CHECK>)`.

Method is used internally by `NodeSet#find`.

## Types of nodes

### Text

Text nodes is represented by strings.

### Comment

Fields:
 * `comment` represents comment content as string.

Methods:
 * `toString()` returns `comment` field value.

### Tag

Tag is descendant of NodeSet, all `NodeSet.prototype` methods is available.

Fields:
 * `name` contains XML tag name;
 * `attrs` is a hash of attributes;
 * `parent` points to parent tag or root nodeset.

Methods:
 * `attr(name)` returns attribute value by name or null if attribute isn't defined.

## What the hell? I'm simply wanna translate XML to JSON!

```javascript
    require('xamel').parse(xmlString, function(err, xml) {
        if (!err) {
            console.log( JSON.stringify(xml) );
        }
    });
```
