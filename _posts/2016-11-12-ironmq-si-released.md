---
title: ironmq-si 3.0.0 Released
layout: post
category : releases
release-date: 2016-11-13
search: "yes"
noindex: false
tags:
- ironmq
- spring-integration
- release
keywords: "ironmq, spring integration"
---


[IronMQ Spring Integration v 3.0.0 Released](http://trevershick.github.io/ironmq-si/)

IronMQ Spring Integration v 3.0.0 has been released.  The new version
uses the IronMQ v3 client library (and thus new API).  All dependencies have been updated including
Spring Integration.


### Iron MQ Spring Integration Extensions

This project provides Spring Integration extensions for inbound and outbound channel adapters.

### Configuring a Client Factory
Both the inbound and outbound adapters require a client factory which is responsible for creating an instance of an _io.iron.ironmq.Client_.  This project provides a default implementation of the factory and a namespace handler.

The example below shows the creation of a default client factory using SpEL to get the IronMQ projectId and token values.

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:int-ironmq="http://trevershick.github.com/schema/integration/ironmq"
  xsi:schemaLocation="http://www.springframework.org/schema/beans
      http://www.springframework.org/schema/beans/spring-beans.xsd
      http://trevershick.github.com/schema/integration/ironmq
      http://trevershick.github.com/schema/integration/ironmq/spring-integration-ironmq.xsd">

  <int-ironmq:default-client-factory
    id="clientFactory"
    ironmq-project="#{projectId}"
    ironmq-token="#{token}"
    ironmq-cloud-url="#{cloudurl}"/>

</beans>
```

### Configuring the Inbound Channel Adapter

Shown below is an example of an inbound channel adapter configuration.  I will skip the requisite beans root element and default-client-factory element as it is shown above in the docs.  The inbound queue can be defined either as a regular literal/SpEL at initialization or a SpEL expression evaluated each time receive() is called on the underlying _MessageSource_.

```xml
<int-ironmq:inbound-channel-adapter
  auto-startup="true"
  channel="ironmqInboundChannel"
  queue-name="queue1"
  client-factory="clientFactory">

  <int:poller fixed-rate="5000" />
</int-ironmq:inbound-channel-adapter>

<!-- poller polling the queue name determined by the queue-name-expression -->
<int-ironmq:inbound-channel-adapter
  auto-startup="true"
  channel="ironmqInboundChannel"
  queue-name-expression="new String('whateverQueue')"
  client-factory="clientFactory"
  reservation-in-seconds="30">

  <int:poller fixed-rate="5000" />
</int-ironmq:inbound-channel-adapter>

```


### Configuring the Outbound Channel Adapter
Shown below is an example of an outbound channel adapter configuration. As above, I will skip the requisite beans root element.  The queue-name value is a literal value below, but you can use expressions as well that will be evaluated each time receive() is called on the underlying _MessageSource_.

```xml
<!-- uses the specified queue 'queue1' -->
<int-ironmq:outbound-channel-adapter
  id="out1"
  queue-name="queue1"
  client-factory="clientFactory"
  channel="c1" />

<!-- pushes the message to the queue name based on the expression (in this case queue2) -->
<int-ironmq:outbound-channel-adapter
  id="out2"
  queue-name-expression="new String('queue2').toLowerCase()"
  client-factory="clientFactory"
  channel="c2" />

<!-- by default, the expression used is 'headers.ironmq_queue', so this -->
<!-- will send to whatever queue is identified in the message headers   -->
<int-ironmq:outbound-channel-adapter
  id="out3"
  client-factory="clientFactory"
  channel="c3" />
```

### Support or Contact

Submit any issues on the [GitHub issues page](https://github.com/trevershick/ironmq-si/issues).  I'll do my best to address any issues quickly.
