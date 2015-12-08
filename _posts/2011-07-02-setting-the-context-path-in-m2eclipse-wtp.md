---
layout: post
title: Setting the Context Path in m2eclipse WTP
search: "yes"
tags:
 - tips
---
Add the following to your pom.xml. This works from v 0.12 on up it appears.

{% highlight xml %}
<properties>
  <m2eclipse.wtp.contextRoot> the_context </m2eclipse.wtp.contextRoot>
</properties>
{% endhighlight %}
