---
layout: post
title: The Io Language
search: "yes"
tags:
- io
- languages
---

So, as a group some people at work are reading &#8220;7 Languages in 7 Days&#8221;. 'It's a good exercise to get some fresh blood into our brains. 'Some of the languages covered are Ruby, Scala, Haskell, Io, Prolog and a couple of others. 'Today we talked about Io. 'Io is a prototype based language and it was really fun to do the exercises. 'From simple fibonacci implementation to altering fundamental constructs of the language like changing the &#8216;/' operator.

Overall I don't really think i'll be using Io in my day to day&#8230;ever. 'However it's interesting to work in a language that makes you &#8216;think' differently; i've been doing Java too long.

I'm no Io expert (only used for a day) but I will take the chance of posting some of my source code below.

return the nth number in the sequence

{% highlight io %}
Object fib := method(num,
	if (num >= 1,
		num,
		fib(num - 2) + fib(num - 1))
)

writeln("Result of fib(7) = ", fib(7) )

{% endhighlight %}

Make Divide by Zero Return 0

{% highlight io %}
writeln(3/0)
writeln(3/3)

writeln("Setting up safe divide")
Number setSlot("unsafe_divide", Number getSlot("/"))
Number setSlot("/",
	method(denom,
		writeln("Safe Dividng by ", denom)
		if(denom == 0, 0, unsafe_divide(denom))
	)
)

writeln(3/0)
writeln(3/3)
{% endhighlight %}

I have others but I won't post them all, I think the above examples are sufficient for you to some of the constructs in the language.
