---
title: jsoup-configuration 1.0.2 Released
layout: post
category : releases
release-date: 2016-11-12
search: "yes"
noindex: false
tags:
- jsoup
- release
keywords: "jsoup, release, jsoup-configuration"
---


[JSoup Configuration v 1.0.2 Released](http://trevershick.github.io/jsoup-configuration/)

This library was born from the need to externalize JSoup's HTML Whitelist.  Deploying code
for constant tweaks to the Whitelist's configuration was cumbersome.  This library allows
me to update the configuration outside the code (in JSON or JowliML).

### Usage

Pick your flavor, using JSON or JowliML and include the appropriate dependency.

In pom.xml, add the following:

```xml
<dependency>
    <groupId>io.shick.jsoup</groupId>
    <artifactId>jsoup-configuration-gson</artifactId>
    <version>1.0.1</version>
</dependency>
```

Then in your Java code

```java

// you can simply instantiate the parser
final Whitelist whitelist = new GsonParser().parse(json).whitelist();

// or you can get a parser by 'type', (either gson or jowli)
final Whitelist whitelist = WhitelistConfigurationParserFactory.newParser("gson").parse(json).whitelist();

// or you can append to an existing whitelist
final Whitelist whitelist = new GsonParser().parse(json).apply(Whitelist.basic());

// you can construct a new config and serialize it out too!
WhitelistConfiguration wlc = new BasicWhitelistConfiguration().enforceAttribute("a","rel","nofollow");

final String jowli = new JowliMLFormatter().format(wlc).toString();   //jowliml
final String json = new GsonFormatter().format(wlc).toString();       //json


```

Formats
----

JSON

```
{
  "tags" : ["a","b"],
  "attributes" : {
    "blockquote": ["cite"]
    },
  "enforcedAttributes": {
    "a" : {
      "rel" : "nofollow"
      }
    },
  "protocols" : {
    "a" : {
      "href":["ftp", "http", "https", "mailto"]
      }
    }
}
```

**JowliML**

The point of JowliML is to provide a very terse representation of the whitelist rules.
What you see below is the same as the above JSON but in a much more compact,
externalized configuration friendly format.


```
(all on one line)
t:a,b;
a:blockquote[cite],a[href,rel];
e:a[rel:nofollow];
p:a[href:[ftp,http,https,mailto]]
```
