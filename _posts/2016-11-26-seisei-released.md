---
title: Seisei 0.1.2 Released
layout: post
category : releases
release-date: 2016-11-26
search: "yes"
noindex: false
tags:
- seisei
- json
- release
keywords: "seisei, json, release"
---


[Seisei v 0.1.2 Released](http://seisei.shick.io)

# New Features
v0.1.2 - currently installed at [seisei.shick.io](seisei.shick.io) - AutoComplete for all directives has been added.

v0.1.1 - the 0.1.1 release introduces the use of [Java Faker](https://github.com/DiUS/java-faker) to expand the capabilities of Seisei.  The examples have all been updated as well and the 'samples' UI is now collapsed by default.

# Description
Seisei is a simple tool that allows you to specify a JSON template and statically or dynamically publish an endpoint that has CORS disabled which you can then use any way you see fit (within reason).  It's currently deployed at http://seisei.shick.io and is free for general use.

# Motivation
I use this project as a means for learning.  It's written in Clojure on the backend and was originally Javascript/RiotJS on the front end.  I recently converted it to [ClojureScript](https://github.com/clojure/clojurescript) and [Om](https://github.com/omcljs/om) on the front end.  It's a non trivial application that's nice to use for testing technologies as it has...
* More than basic REST interface to the server (not just Todo)
* 3rd party components to integrate (Ace Editor)
* Multiple State / Reloading issues (renaming of template requires updates to template list, etc.)
* Modal Dialogs
* OAuth

... so it's more than just a todo list application that affords me many challenges when learning something new.

# Screen Shot
## Basic
![Screen Shot](https://raw.githubusercontent.com/trevershick/seisei/master/ss.png)

## AutoComplete
![AutoComplete Screen Shot](https://trevershick.github.io/images/autocomplete.png)


# Seisei Front End Architecture with [Om](https://github.com/omcljs/om)

I do not profess to be a wizard or any sort of higher order master of ze web.  I've worked with a lot of different front end techs over the years and one thing Flux got right was a single direction data flow.  I've implemented that data flow with [Om](https://github.com/omcljs/om) ([React](https://facebook.github.io/react/)) and [```core.async```](https://github.com/clojure/core.async) for the dispatcher.

![Front End Architecture](http://www.gliffy.com/go/publish/image/9498269/L.png)

# High Level Architecture

![High Level Architecture](http://www.gliffy.com/go/publish/image/9536687/L.png)
