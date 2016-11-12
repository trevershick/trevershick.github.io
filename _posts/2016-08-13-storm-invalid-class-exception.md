---
title: InvalidClassException Upon Storm Topology Submission
layout: post

search: "yes"
tags:
- storm
- exception
keywords: "exception, invalidclassexception, storm"
---

I started working with Storm a few days ago.  It's just a minor task but it's fun because it's something different.  
I'm a certified Hadoop developer (even though I don't use it) so getting familiar with Storm's ecosystem was trivial
but I still hit a snag that took a while to figure out.

During submission of a topology I was getting a ```InvalidClassException``` after successful submission.  Googling
lead me to check my classpath and maven dependencies and I verified that both the remote server and my local compilation were in fact
using the exact same version ```0.10.0-beta1```.  I double and triple checked, checking ```clojure``` versions, etc
with nothing obvious glaring at me...

After a few more minutes of shaking my head and swearing off Storm, it occurred to me that there was one link in the chain
that I hadn't considered.  The submission tool; the actual Storm command I was using to submit the job.  I had installed
Storm via ```brew install storm``` and even used ```storm list``` and other commands successfully against the server to which
I was submitting my topology.  But I realized that Storm is locally executing my jar file to serialize the topology (I assume
  this is what's happening), so it would be running and serializing based on whatever version my ```storm``` command
  was using.

So, I check the version and as suspected, the brew installed storm version was not ```0.10.0-beta1```.  That at least gave me hope.
Had they been the same version, I probably would have tossed back a beer, scratched my noggin for another few minutes and closed
the laptop, intent on seeking help on the following Monday.

So I uninstalled the brew version of Storm, installed the correct version locally ```0.10.0-beta1``` and used the storm
command from that distribution and voìla my topology properly submitted AND started.

Now I just need to figure out why it's having issues with Kafka ;)



The Error
----

{% highlight java %}
2016-08-12 20:18:30.855 b.s.d.worker [ERROR] Error on initialization of server mk-worker
java.lang.RuntimeException: java.io.InvalidClassException: storm.trident.planner.SubtopologyBolt; local class incompatible: stream classdesc serialVersionUI
D = -5204171388013894409, local class serialVersionUID = 4854030096591274010
        at backtype.storm.utils.Utils.javaDeserialize(Utils.java:103) ~[storm-core-0.10.0-beta1.jar:0.10.0-beta1]
{% endhighlight %}
