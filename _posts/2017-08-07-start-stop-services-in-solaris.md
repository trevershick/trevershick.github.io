---
layout: post
title: Finding/Starting/Stopping Services in Solaris
search: "yes"
tags:
 - tips
---

# Find Services

```
    svcs | grep <service name>
```

# Start / Stop

```
    svcadm restart <service name (ex. svc:/network/ssh:default)>
```
