# Xamel

Xamels goal is providing the easy way to extract data from XML using XPath-like expressions and map/reduce operations. Also it's designed to be fast and memory-friendly.

## Quick start

```javascript
var xamel = require('xamel');
    
xamel.parse('<data>Answer: %s<number>42</number></data>', function(err, xml) {
    var answer = xml.$('data/number').text();
    console.log( xml.$('data').text(), answer );
});
```

## NodeSets and map/reduce.

Result of `xamel.parse(…)` is NodeSet. You can think NodeSet is an array of nodes (internally, it's true). NodeSet provides all _non-mutators_ methods of the `Array.prototype`.

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

NodeSet provides a tons of the powerfull features!

### NodeSet#find(path), NodeSet#$(path)

These methods go through the tree trying to find nodes satisfing `path` expression and build a new NodeSet. 
Result is NodeSet. Check `length` property to know is something found.

Path looks like XPath, but really not it is. There is path grammar in BNF:

```bnf
<path> ::= <node-check> | <path> "/" <node-check>
<node-check> ::= "node()" | "text()" | "comment()" | "cdata()" | "*" | "element()" | <xml-tag-name>
```

As described above, valid paths are
```
*
country/state/city
country/*/city
*/*/city/text()
text()
country
element/text()
...
```

Invalid paths
```
/country        # leading '/' is not allowed
country/state/  # trailing '/' is not allowed
./state         # '.' are not supported <node-check>
```

`NodeSet#$` was designed as an alias for `NodeSet#find`, but finally slightly differs from it.
Internally `NodeSet#$` calls `NodeSet#find`, but if last check in the path equals `text()` method
returns concatenated string instead of NodeSet of strings:

```
xml.find('article/para/text()') => [ 'Text 1', 'Text of second para', ... ]
xml.$('article/para/text()') => 'Text 1Text of second para...'
```

### NodeSet#text

### NodeSet#hasAttr, NodeSet#isAttr

### NodeSet#eq

### NodeSet#get

### NodeSet#explode

## I'm well with NodeSet, but what could be its children?

### Text

### Tag

### Comment

### CData

## What the Hell? I'm simply wanna translate XML to JSON!

	JSON.stringify(nodeset);
