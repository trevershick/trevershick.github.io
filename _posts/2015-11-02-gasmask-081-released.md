---
title: Gas Mask v0.8.1-trevershick Released
layout: post
category : releases
release-date: 2013-10-19
search: "yes"

---


[Gask Mask 0.8.1-trevershick Fork released](https://github.com/trevershick/gasmask/releases)

# Note

The intent is to roll this into the main product.  For distribution until then, I have the fork release in my github fork.

# Fixed

* [Host file replacement not working](2ndalpha/gasmask#70) - Fixed the replacement of /etc/hosts when VI is used to change your hosts file.   Also, the JunOS Pulse VPN client makes a backup copy of the hosts file and replaces it after disconnecting.  If you had a host file selected, JunOS would replace it and Gas Mask didn't reestablish the selected hosts file. This issue has also been fixed.

# Feature

* [Active Host Name in Menu Bar](2ndalpha/gasmask#65) - add the active hostfile name into the status bar
