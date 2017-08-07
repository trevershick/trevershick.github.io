---
layout: post
title: Permitting Root Login to Solaris
search: "yes"
tags:
 - tips
---

1. Change ```PermitRootLogin``` to ```yes``` in ```/etc/ssh/sshd_config```.
2. Comment out the ```CONSOLE=/dev/console”``` in ```/etc/default/login```.
3. Execute ```rolemod -K type=normal root```
4. Restart SSH with ```svcadm restart svc:/network/ssh:default```
5. Done.

(credit http://veereshkumarn.blogspot.com/2012/09/how-to-enable-ssh-root-login-in-solaris.html)
