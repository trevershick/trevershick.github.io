---
title: Guava Bit Me (with Hibernate)
layout: post
tags:

---

So, I'll preface this post by stating that I am a big fan of Guava and I advocate it's use.  That being said, Guava and Hibernate ( and Legacy Code ) took a bit bite out of my butt yesterday.  Fortunately I found the issue in preproduction testing prior and was able to fix it very easily, but it's a sneaky little issue that could really bite someone and they may or may not catch it.

**Also, please note -** I'm not stating that this is a defect in Guava, it was simply __unexpected__ behavior, that coupled with Hibernate caused me issues.


## TL;DR ##
OK, for the impatient or busy...

Since ``transform`` (on ``Lists``,``Sets``,etc..) returns a wrapper around the underlying ``Collection``, modifications to the **transformed collection** alter the **underlying collection**.


## Code Sample Please...##

The following code snippet, along with it's console output illustrates the behavior.  Sets ``s1`` and ``s2`` are created with some simple objects (the Noisy objects don't really do anything).  The two sets are then transformed into two sets ( ``xformed1`` and ``xformed2`` ) that contain just a string value from the objects in  ``s1`` and ``s2``.

Then using the **transformed** collections, ``xformed1.retainAll(xformed2)`` is called.  From that point ``xformed1`` has just the three elements from ``xformed2`` as expected **BUT**, ``s1`` has also been altered.

(code snippets are at the bottom)



# With Hibernate #

The exact issue I found is that one of our Hibernate domain objects exposed a child collection of objects (as in ``s1`` above) and then during the course of processing to do some matching based on the child objects, the child collection was altered in the same way ``s1`` was altered above.  This was completely unexpected and truly sneaky.

# Quickest Fix #
The quickest fix was to force the evaluation of the transform completely by wrapping ``transform`` call in ``newArrayList`` or whatever method you like.  This then created my ``String`` collection detached from the underlying collection.


<script src="https://gist.github.com/trevershick/7008154.js"></script>
