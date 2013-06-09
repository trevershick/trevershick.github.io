---
title: Updating Oracle BLOB with SQL
layout: post
category : tips
---

Use 'utl_raw.cast_to_raw' to convert a string to the blob (see below).

{% highlight sql %}
update act_ge_bytearray set bytes_ = utl_raw.cast_to_raw('<?xml version="1.0" encoding="UTF-8"?>
<definitions id="LOAProcessDefinition"
	xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:activiti="http://activiti.org/bpmn"
	targetNamespace="http://www.activiti.org/bpmn2.0"></definitions>') where deployment_id_ = 5701 and name_ = 'oops.bpmn20.xml';
{% endhighlight %}

