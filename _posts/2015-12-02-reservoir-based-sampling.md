---
layout: post

search: "yes"
title: Reservoir Sampling with Java 8 Streams
categories: [ java8  ]
tags:
- java8
- streams
- reservoir
keywords: "java8, streams, reservoir, random"
---

# Reservoir Based Sampling

I encountered a programming problem where a very large stream of data was coming through and I needed to get a decent sample of random values from the stream.  I didn't want to load it all in to memory so I opted for Reservoir based sampling.  "Reservoir Sampling is an algorithm for sampling elements from a stream of data." [gregable.com](http://gregable.com/2007/10/reservoir-sampling.html).  Using reservoir based sampling, I was able to efficiently return a set of random values pretty easily. Implemented with Java 8 Streams I was able to create a reusable generic sampler.

The results are below.

## References

* [Algorithms Every Data Scientist Should Know: Reservoir Sampling](https://blog.cloudera.com/blog/2013/04/hadoop-stratified-randosampling-algorithm/)
* [Reservoir Sampling](https://en.wikipedia.org/wiki/Reservoir_sampling)
* [Reservoir Sampling](http://gregable.com/2007/10/reservoir-sampling.html)


# implementation
<div class="iframe-container">
<script src="//repl.it/embed/B5WR/0.js"></script>
</div>
