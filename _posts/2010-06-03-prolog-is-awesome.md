--- 
layout: post
title: Prolog is Awesome!
categories: [ languages, prolog ]
---

So one chapter of the 7 languages in 7 weeks book was Prolog. Yeah, it's an
older language but it s really fun. Since i ve been doing imperative style
programming for so long it was quite literally mind-bending. It kept me up late
playing like I used to with Java way back in the late 90s, in other words it
was freakin  fun. At any rate, I won t regurgitate any summaries of Prolog
(there are plenty), but i will leave some code examples.

The example listed below was a totally simple program designed to return the
smallest integer from a list (totally basic I know), but what i m also
including here is the unit test and command line version too just for the hell
of it.


# file d2_2.pl

{% highlight prolog %}
smallest([L,R],S) :- L<R -> S=L;S=R,!.
smallest([H|T], S) :- smallest(T,ST), smallest([H,ST], S),!.
smallest([S],S).
{% endhighlight %}


# file test_d2_2.pl
{% highlight prolog %}
assert(Source,Expected,Expected) :-
write('\nOK - For '), write(Source),
'url':'{{site.url}}{{item.url}}' write(' expected '),write(Expected), write('
and'),
write(' received '),write(Expected), !.

assert(Source,Expected,Received) :-
write('\nFAIL - For '), write(Source),
write(' expected '),write(Expected), write(' but'),
write(' received '),write(Received), !.

assert_smallest(List,Expected) :-
smallest(List,Received), assert(List,Expected,Received).

test_smallest :-
write('Begin Tests------------------------------------------------'),
assert_smallest([3,1,2],1),
assert_smallest([-66,32,123,1223,10003,1,2],-66),
assert_smallest([0],0),
assert_smallest([-1,0],-1),
write('\n-----------------------------------------------------------\n').

:- include(d2_2).
:- initialization(test_smallest).
{% endhighlight %}


# file cmd_d2_2.pl

{% highlight prolog %}
iargs(R) :-
        argument_list(S),
        iargs(S,R).

iargs([],[]).
iargs([H|T],R) :-
        iargs(T,TR),
        number_atom(HASINT,H),
        append([HASINT],TR,R).



q :-
        iargs(S),
        smallest(S,SM),
        write('Smallest of '),
        write(S),
        write(' is '),
        write(SM),
        write('\n').

:- include(d2_2).
:- initialization(q).
{%endhighlight%}

So, yeah, i know that's totally simple but for people just starting out it
might prove useful.

I think for Prolog to be a tool that I would choose I d have to be using it for
months first. It s kind of the chicken and the egg problem unfortunately. If i
had a lot of spare time between work/child/running I would work on building
stuff with Prolog but i m not sure that will happen. If i do write something
however I will post it.


Oh, BTW, this wasn't the only Prolog thing we did. We did the standard
fibonacci and factorial problems as well as the standard map coloring problem
(couldn t write that myself - need more practice.) but i won t include the code
here.
