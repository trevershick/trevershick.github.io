---
layout: default
title: Archive
---
{% for post in site.posts %}
[{{ post.title }}] ({{post.url}}) {{ post.date | date: '%d' }} {{ post.date | date: '%b' }}, {{ post.date | date: '%Y'}}
{% endfor %}
