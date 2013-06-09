---
title: A very nice Git Log
layout: post
tags:
- tip
- git

---



![](/images/2013-06-07-gitlog.png "Git Log Screenshot")
Originally found [here](https://coderwall.com/p/euwpig)
{% highlight java %}

git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"

{% endhighlight %}

