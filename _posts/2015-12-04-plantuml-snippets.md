---
layout: post
title: PlantUml in Atom
search: "yes"
categories: [ atom ]
tags:
- atom
- snippets
keywords: "atom, snippets, plantuml"
---


# What is PlantUml?

According to the makers of PlantUml -
```
> PlantUML is a component that allows to quickly write :
> * Sequence diagram,
> * Usecase diagram,
> * Class diagram,
> * Activity diagram, (here is the new syntax),
> * Component diagram,
> * State diagram,
> * Deployment diagram,
> * Object diagram.
> * wireframe graphical interface
```

**I think** PlantUml is pure awesomeness.  Using it makes my life easier, and that's important.  I've been through quite a few UML tools and the main reason I love this tool is that I can author UML diagrams in plain text.  This is extremely powerful and yet simple.  The diagram below is generated from the following text.

 ![sequence diagram](http://plantuml.com/imgp/sequence.png)

{% highlight java %}
@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: another authentication Response
@enduml
{% endhighlight %}

So easy.

# Where can I use it?

PlantUML has been integrated into quite a few tools, my favorite being Confluence via [a plugin](https://marketplace.atlassian.com/plugins/de.griffel.confluence.plugins.plant-uml/server/overview).  This allows me to author UML diagrams right in the Wiki to communicate with my coworkers (i'm a remote employee).  It requires a minimal amount of effort to learn and author diagrams and because it's in confluence the diagrams are even versioned.

The only downside to the confluence plugin is the editing 'story'.  It's a painful story, but I accept that.

# Enter Atom
I use Atom as my primary editor when dealing with everything from Clojure and Clojurescript to Python, Markdown and sometimes even Java.  I love its extensibility and ease of use.

Luckily, some hard working individuals have already built plugins for PlantUml.  There are two packages specifically that I use, ```language-plantuml``` and ```plantuml-preview```.  Here is a screenshot of an editing session in Atom editing a plantuml (```.pu```) file.

![PlantUML Editing Session](/assets/img/plantuml-session.png)



# Setting up this Environment

There are four things you have to install to make this all work.
* Graphviz
* PlantUml
* ```language-plantuml``` Atom Package
* ```plantuml-preview``` Atom Package
* Configure the plugins

# Install Graphviz
I'm a Mac user, so I just use [homebrew](http://brew.sh/) to do my install.

{% highlight bash %}
brew install graphviz
{% endhighlight %}

Find the ```dot``` executable.  You will need the path later.

{% highlight bash %}
➜  ~  which dot
/usr/local/bin/dot
{% endhighlight %}

# Installing Plantuml

Download the PlantUml jar file (plantuml.jar) from SourceForge [here](http://sourceforge.net/projects/plantuml/files/plantuml.jar/download).  Then save it somewhere. I store mine in ```/usr/local/share/```.

# Installing the ```language-plantuml``` (plafue)

[https://atom.io/packages/language-plantuml](https://atom.io/packages/language-plantuml)

You can install via the UI if you wish.  Just choose 'language-plantuml' in the "Package Install" screen.  For those who want it done quickly -

{% highlight bash %}
apm install language-plantuml
{% endhighlight %}


# Installing the ```plantuml-preview``` Package

[https://atom.io/packages/plantuml-preview](https://atom.io/packages/plantuml-preview)

Once again, you can use the UI to install plantuml-preview, but I choose to use -

{% highlight bash %}
apm install plantuml-preview
{% endhighlight %}


# Configuring the Plugins
I dont' know a shortcut for this.  You'll have to simply start the atom editor and go to preferences ```command ,``` > packages > search for *plantuml* and choose settings under **plantuml-preview**.  This will open a settings view (shown below).

![settings pane](/assets/img/plantuml-settings.png)

Fill in the path values for -

* Graphviz Dot Location (the location of the dot executable we got earlier)
* PlantUml jar location (where you stored the jar)
* Java Command (probably /usr/bin/java)

# Starting your Editing Session
Create a new file ```test.pu``` and save the file.  You should see the *Language Indicator* in the lower right hand corner of the Atom editor show 'PlantUML'.  Next, in the editor type in - ```starts<tab>```.  That's 's t a r t s <the tab key>'.  This will invoke the "Start Sequence Diagram" snippet and a fairly lengthy diagram specification should materialize.

Now for the fun stuff.  Hit ```<ctrl>-<alt>-p``` to start the Plant Uml Preview.  The preview window should pop up to the right and you're on your way.  As you edit the file and save, the diagram in the preview window will be updated.

# Snippets
There are a number of snippets that are now a part of the ```language-plantuml``` package thanks to yours truly.  Hit ```<shift>-<alt>-s``` to view a list of the snippets or you can view the list in the plugin settings pane.


Happy editing, and f you have any problems or if something isn't working let me know.  If you want more snippets, fork the ```language-plantuml``` repo and do a pull request or just register an [issue](https://github.com/plafue/language-plantuml/issues).
