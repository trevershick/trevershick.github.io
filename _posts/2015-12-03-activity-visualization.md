---
layout: post
title: Blogging Activity Visualization
search: "yes"
categories: [ d3 ]
tags:
- d3
- visualization
keywords: "d3, graph, visualization"
---

I am NOT a consistent blogger, but lately I've been doing some work.  Tonight I thought it might be fun to visualize (with D3) my activity like you can see on [github](http://www.github.com/trevershick).  I found a great [calendar view](http://bl.ocks.org/mbostock/4063318) on the D3 sample sites and used it as a basis.  I tore it down a little bit and reassembled parts to brush back up on D3.  Here's the result.

<p>
<p id="big" style="padding: 0;width:90%;overflow-x:hidden"/>
</p>


# Fiddle

<p style="overflow-x:scroll">
<iframe style="width:100%" height="300" src="//jsfiddle.net/trevershick/1k7pe4v2/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
</p>



# How it Works (kind of)

I am NOT tearing down the entire implementation.  If you want to learn how it works, I suggest you did what I did.  I will provide some information.  Ultimately, the D3 visualization binds data like the following in various forms to years, months and days within the visualization.

{% highlight javascript %}
{
  '2016-10-10': { c : 3, titles: ['a', 'b'] },
  '2016-12-10': { c : 2, titles: ['z'] }
}
{% endhighlight %}


The data is not supplied in this format however.  The data for this thing gets loaded from a JSON file in the following format, and is then transformed via ```d3.nest()``` goodness.

{%highlight json%}

{"data":[
    {
        Category: "java8"
        Date: "2015-12-02"
        Tags: "java8 and streams"
        Title: "Grouping Data by Regex with Java 8 Streams"
        Url: "http://trevershick.github.io/java8/2015/12/02/java8-grouping-by-regex.html"
    }
]}

{% endhighlight %}







## Generating the Activity JSON File

I use Jekyll for the web site, so I created a Jekyll template for generating this JSON file.  Jekyll makes creating this sort of thing very simple.  Just plop a file in your root (or wherever) and stick a "front matter" header on it.  Easy peasy.

{% highlight python %}
{% raw %}
<< activity.json >>
---
layout: null
---
{"data":
[
    {% for post in site.posts %}
    {
        "Tags"      : "{{ post.tags | array_to_sentence_string }}",
        "Url"       : "{{ site.baseurl }}{{ post.url }}",
        "Date"      : "{{post.date | date: "%Y-%m-%d"}}",
        "Category"  : "{{post.categories}}",
        "Title"     : "{{ post.title | escape }}"
    },
    {% endfor %}
    {}
]}
{% endraw %}
{% endhighlight %}

## Embedding the Visualization in the Page

Next, I load the script files (D3 and d3-activity-vis) in the page.  Instantiate the ActivityViz component with a D3 target selector of #big and a start and end range for years.

{% highlight html %}
<p id="big" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js"></script>
<script src="/js/d3-activity-vis.js"></script>
<script>
var activityView = new ActivityViz("#big", 2012, 2016);
d3.json("/activity.json", function(error, csv) {
  if (error) throw error;
  activityView.refresh(csv.data);
});
</script>

{% endhighlight %}


## The Rest...
...is D3 magic..  You'll have to read the [source code](/js/d3-activity-vis.js) yourself.



<style>
#big svg {
  shape-rendering: crispEdges;
}
.RdYlGn .q1-11{fill:rgb(253,174,97)}
.RdYlGn .q2-11{fill:rgb(166,217,106)}
.RdYlGn .q3-11{fill:rgb(0,104,55)}
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js"></script>
<script src="/js/d3-activity-vis.js"></script>

<script>
var activityView = new ActivityViz("#big", 2012, 2016);
d3.json("/activity.json", function(error, csv) {
  if (error) throw error;
  activityView.refresh(csv.data);
});

</script>
