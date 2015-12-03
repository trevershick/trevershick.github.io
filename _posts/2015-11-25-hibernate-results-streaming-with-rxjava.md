---
layout: post
title: "Hibernate Results Streaming with RxJava"
date: 2015-11-25
#image: '/assets/img/'
description:
tags:
  rxjava
categories:
  rxjava
search: "yes"
twitter_text: "Hibernate Streaming with RxJava"
---


I recently came across some code that was loading millions of rows into memory from hibernate which it then proceeded to iterate over.  I knew there had to be a better way.  I had done something similar via callbacks earlier but it always felt like a dirty hack and callbacks are not easily composable, nor easily understood for some of the guys I worked with.

I wanted something that was easy to understand from a readability standpoint and a solution that was flexible.  I was familiar already with [RxJava](https://github.com/ReactiveX/RxJava) and I liked it.  It is great for readability and is very composable, however I hadn't used it for anything meaningful yet.  This is my first real attempt to do some good with it.

All the code examples you will need are contained within this post, but if you prefer, you can fork my repo or gank it at https://github.com/trevershick/example-rxjava-hibernate .

<iframe src="https://ghbtns.com/github-btn.html?user=trevershick&repo=example-rxjava-hibernate&type=fork&count=true&size=large" frameborder="0" scrolling="0" width="158px" height="30px"></iframe>


First, because readability was key, I will start with the calling code since it is where we really see the most benefit.  The example below shows the client code getting a reference of an ```Observable<Pet>``` from the streamer class and retrieving the first 5 results via [```take(5)```](http://reactivex.io/documentation/operators/take.html).  It then turns right around and gets all results in a list.  I've included this just to show you that it can be done.  I'm not condoning this when reading a lot of data, but in some cases it's what you need to do.

{% highlight java %}
QueryStreamer<Pet> petStreamer =
  new QueryStreamer<>(sessionFactory, Pet.class);

  // since the result set is just a stream
  // i can control from the client side how many i want
  // and perform a number of functions easily due to RxJava
  System.out.println("Take 5 ---------------------------");
  petStreamer.stream(Restrictions.isNotNull("name"))
    .take(5)
    .forEach(System.out::println);

  System.out.println("Collect All ----------------------");
  petStreamer.stream(Restrictions.isNotNull("name"))
    .toList()
    .forEach(System.out::println);

{% endhighlight %}

Easy to understand isn't it?  The actual ```Observable``` implementation is less understandable when you're first seeing it but begins to feel more natural quickly.

{% highlight java %}

import org.hibernate.*;
import rx.*;

public class QueryStreamer<T> {

    private final SessionFactory factory;
    private final int fetchSize;
    private final Class<T> clazz;

    public QueryStreamer(SessionFactory factory, Class<T> what) {
        this(factory, what, 20);
    }

    public QueryStreamer(SessionFactory factory, Class<T> what, int fetchSize) {
        this.factory = factory;
        this.fetchSize = fetchSize;
        this.clazz = what;
    }

    public Observable<T> stream(Criterion criteria) {
      final StatelessSession session = factory.openStatelessSession();

      return Observable.create(new Observable.OnSubscribe<T>() {
          @Override
          public void call(final Subscriber<? super T> subscriber) {
            try {
                // call start on the subscriber, part of the rx java contract
                subscriber.onStart();
                ScrollableResults results = session.createCriteria(clazz)
                    .add(criteria)
                    .setReadOnly(true)
                    .setFetchSize(fetchSize)
                    .scroll(ScrollMode.FORWARD_ONLY);
                while (results.next() && !subscriber.isUnsubscribed()) {
                  // notify the subscriber of a result
                  subscriber.onNext(clazz.cast(results.get(0)));
                }
                // another part of the contract, tell the subscriber
                // we're done sending it data
                subscriber.onCompleted();
                results.close();
            }
            catch (Exception e) {
              // oops, when something bad happens, let the
              // subscribe know
              subscriber.onError(e);
            } finally {
              session.close();
            }
          }
        });
    }
}

{% endhighlight %}

Essentially what's happening here is that a new ```Observable``` instance is being created.  When a subscriber *subscribes* to the observable, the ```call``` method is invoked at which time we:
* notify the subscriber we've started via the ```subscriber.onStart``` call.
* start the hibernate query

Then, for each result we get from Hibernate, we call ```subscriber.onNext(...)``` with that result *if* the subscriber is still subscribed.  In the case of our ```take(5)``` scenario above, the subscriber becomes *unsubscribed* after the fifth record is returned.

Finally, we notify the subscriber we're done sending it data via the ```subscriber.onCompleted``` call.

That's it.  No real magic from our perspective.  RxJava handles all the magic and details of subscription and aggregation, etc...

Again, project files can be found at https://github.com/trevershick/example-rxjava-hibernate .

<iframe src="https://ghbtns.com/github-btn.html?user=trevershick&repo=example-rxjava-hibernate&type=fork&count=true&size=large" frameborder="0" scrolling="0" width="158px" height="30px"></iframe>
