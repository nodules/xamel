# Xamel

Xamel goal is providing the easy way to extract data from XML using XPath-like expressions and map/reduce operations. Also it's designed to be fast and memory-friendly.

## Quick start

	var xamel = require('xamel');
    
    xamel.parse('<data>Answer: %s<number>42</number></data>', function(err, xml) {
    	var answer = xml.$('data/number').text();
        console.log( xml.$('data').text(), answer );
    });
    
## NodeSets and map/reduce.

Result of `xamel.parse(…)` is NodeSet. You can think NodeSet is an array of nodes (internally, it's true). NodeSet provides all _non-mutators_ methods of the `Array.prototype`.

### Example of key-value query concatenation.

XML (query.xml)
	
    <?xml version="1.0">
    <query>
    	<key name="mark">Opel</key>
        <key name="model">Astra</key>
        <key name="year">2011</key>
    </query>
    
JavaScript

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
    
## NodeSet keeps source nodes order

So processing of a bad-designed xml, where order means, possible:

XML (query.xml)
	
    <?xml version="1.0">
    <query>
    	<key>mark</key><value>Opel</value>
        <key>model</key><value>Astra</value>
        <key>year</key><value>2011</value>
    </query>
    
JavaScript

	function buildQuery(nodeset) {
    	return nodeset.$('query/*').reduce(function(query, tag) {
			if (tag.name === 'key') {
            	return [query, '&', tag.text(), '='].join('');
            } else {
            	return query + tag.text();
            }
        }, '');
    }
    
## O-o-ok, but why we needs for the NodeSet? Gi'me a regular Array!

NodeSet provides a tons of the powerfull features!

### NodeSet#find, NodeSet#$

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