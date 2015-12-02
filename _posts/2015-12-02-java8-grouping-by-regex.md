---
layout: post

search: "yes"
title: Grouping Data by Regex with Java 8 Streams
categories: [ java8 ]
tags:
- java8
- streams
keywords: "java8, streams"
---

# The Problem

**See the bottom of the page for a REPL**

I recently needed to group a set of strings by regex.  This isn't a very hard problem but I wanted to utilize Java 8's streams to do the hard work.  The problem is easily solved via Streams ```collect``` method and ```Collectors.groupingBy```.  

So, given the following data...

{% highlight java %}
vals.add("dog");
vals.add("cat");
vals.add("fish");
vals.add("elephant");
{% endhighlight %}


I want to group this data by small words (3 letters or less).  Now, I don't have to use regex for this, but it will illustrate the point.

The first thing to do is to define what I want.

I want the above list of words to be categorized into a few groups...

{% highlight java %}
{
  3letter : [ 'dog', 'cat' ]
  4letter : [ 'fish' ]
}
{% endhighlight %}

But what about "elephant"?  I don't want to lose that, so let's put that in a 'default' group.

{% highlight java %}
{
  3letter : [ 'dog', 'cat' ]
  4letter : [ 'fish' ],
  default : [ 'elephant' ]
}
{% endhighlight %}

So let's build the grouping function.  A grouping function is a function that accepts a value and returns a 'key' for the value.  I'd like to categorize easily via regex, so I want to define my ```group -> key``` rules in the following way.

{% highlight java %}
3letter -> .{3}
4letter -> .{4}
{% endhighlight %}

Here's the function that produces the appropriate key based on a regex match. The function accepts a value via ```apply```, finds the first regex match in ```groupNameToRegex``` and returns the key from that map.

{% highlight java %}
class RegexBasedGroupingFunction<T> implements Function<T, String> {
    final Map<String, String> groupNameToRegex = new HashMap<>();

    public RegexBasedGroupingFunction(Map<String, String> groupNameToRegex) {
      if (groupNameToRegex != null) {
        this.groupNameToRegex.putAll(groupNameToRegex);
      }
    }

    @Override
    public String apply(T t) {
      return groupNameToRegex.entrySet()
          .stream()
          .filter(entry -> t.toString().matches(entry.getValue()))
          .map(entry -> entry.getKey())
          .findFirst()
          .orElse("default");
    }
}
{% endhighlight %}


So, now all that's left is to apply that function across the stream.

{% highlight java %}
Map<String,String> groupToRegex = new HashMap<>();
groupToRegex.put("3letters",".{3}");
groupToRegex.put("4letters",".{4}");

RegexBasedGroupingFunction<String> f = new RegexBasedGroupingFunction(groupToRegex);

System.out.println(vals.stream().collect(Collectors.groupingBy(f)));

{% endhighlight %}

The result is:

{%highlight java%}
Group by arbitrary regex expressions
{default=[elephant], 3letters=[dog, cat], 4letters=[fish]}
{%endhighlight%}


# REPL
<script src="//repl.it/embed/B5UH/0.js"></script>
