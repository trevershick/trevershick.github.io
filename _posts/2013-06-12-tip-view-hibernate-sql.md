---
title: Show Hibernate SQL via Log4j
tags:
 - tips
layout: post
---

Don't use showSql=true in Hibernate.  This is NOT the appropriate way to do this.
Instead, use your log4j configuration to turn on logging for Hibernate.

Set the following categories to **TRACE** and you'll be set.

# Configuration

{% highlight properties %}
log4j.logger.org.hibernate.SQL=TRACE
log4j.logger.org.hibernate.type=TRACE
{% endhighlight %}

# Results

{% highlight console %}

main 2013-06-12 17:17:52,174 DEBUG [org.hibernate.SQL]: - insert into INBOUND_MESSAGE (MSG_ID, CREATED_TS, CREATED_BY, UPDATED_TS, UPDATED_BY, DATA, PROCESSED, SOURCE) values (null, ?, ?, ?, ?, ?, ?, ?)
main 2013-06-12 17:17:52,175 DEBUG [org.hibernate.type.EnumType]: - Binding 'N' to parameter: 6
main 2013-06-12 17:17:52,175 DEBUG [org.hibernate.type.EnumType]: - Binding 'MDMException' to parameter: 7
main 2013-06-12 17:17:52,195 DEBUG [org.hibernate.SQL]: - select count(*) as y0_ from INBOUND_MESSAGE this_ where this_.PROCESSED=?
main 2013-06-12 17:17:52,196 DEBUG [org.hibernate.type.EnumType]: - Binding 'Y' to parameter: 1
main 2013-06-12 17:17:52,203 DEBUG [org.hibernate.SQL]: - select this_.MSG_ID as MSG1_1_0_, this_.CREATED_TS as CREATED2_1_0_, this_.CREATED_BY as CREATED3_1_0_, this_.UPDATED_TS as UPDATED4_1_0_, this_.UPDATED_BY as UPDATED5_1_0_, this_.DATA as DATA1_0_, this_.PROCESSED as PROCESSED1_0_, this_.SOURCE as SOURCE1_0_ from INBOUND_MESSAGE this_ where this_.PROCESSED=? limit ?
main 2013-06-12 17:17:52,203 DEBUG [org.hibernate.type.EnumType]: - Binding 'Y' to parameter: 1
main 2013-06-12 17:17:52,205 DEBUG [org.hibernate.type.EnumType]: - Returning 'Y' as column PROCESSED1_0_
main 2013-06-12 17:17:52,205 DEBUG [org.hibernate.type.EnumType]: - Returning 'MDMException' as column SOURCE1_0_
{% endhighlight %}
