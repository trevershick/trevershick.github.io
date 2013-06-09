---

layout: post 
title: Create a Defect in Rally from a Screenshot Automator Service 
tags: 
 - rally 
 - ruby 
---
We use Rally at work for managing our development efforts. The tool itself is
OK but something as simple as creating a defect can take too long. Some defects
were going unreported because it was too cumbersome to enter even very minor
cosmetic bugs. A couple of years ago I used a Rally tool for creating defects
from screenshots and this was great but apparently it's no longer
maintained. In lieu of creating an entire application I decided to glue
together the actions via Apple's Automator application, some AppleScript
and Ruby.

The first thing I did was to use the excellent Rally APIs via the
rally_rest_api gem for Ruby. This allows you pretty much full access to all of
your information in Rally, even uploading screenshots. I created a simple
script called createdefect.rb that uses the API, creates a defect in a project
and attaches the screenshot. The script itself takes only three arguments at
this point : the defect title, the file name to attach and the Rally project.
Here's an example:

	./createdefect.rb 'This is my defect' '~/Desktop/bug01.png' 'Rizzo'
	
This creates a defect in the project 'Rizzo (new SSO)' with the given
title and attachment. The project doesn't have to match exactly, a
downcase.start_with? predicate is used to locate the project.
With Ruby script working, I wanted a way to invoke it using a shortcut key or
through the services menu on my Mac. I had used Automator before so I figured I
could get it done that way. I created a Service Workflow in automator that
invoked the ruby script. Before invocation however, I needed to get some input
from the user (me) to pass to the script.

**First** - the title. I wrote an apple script to get feedback from the user using
the 'display dialog' commands in AppleScript. Unfortunately, it
wasn't until after completion that I noticed that a simple 'Ask for
Text' action exists in Automator. Oh well.

**Second** - the project. I found a nice forum post (sorry i lost the link) that
shows how to use the 'choose from list' applescript function. This
allowed me to supply a list of projects from which to choose.

**Third** - the image. This is built in to Automator. When you create an automator
service, you define the type of input that is accepted. I chose 'image files'.

So, the entire automator workflow essentially goes like this:

1. accept image file(s)
2. Set 'ImageFile' variable to the input.
3. Run AppleScript to get the Defect Title via a dialog box
4. Set 'Title' variable to AppleScript output
5. Run AppleScript to allow the user to choose the project
6. Set 'RallyProject' to the user choice
7. Get Variable ('Title')
8. Get Variable ('RallyProject')
9. Get Variable ('ImageFile')
10. Run Shell Script 
	/Users/trevershick/bin/createdefect.rb &#8220;$1&#8221; &#8220;$3&#8221; &#8220;$2&#8221; | grep &#8220;defect created&#8221;
11. Run AppleScript to display the created defect number



# Automator

![](/images/tumblr_ma2dre2iY71qbb5om.png)



# Workflow Results (in screenshots)

## Invoke the Service
![](/images/tumblr_ma2dgl1bnG1qbb5om.png)

## Provide a Defect Title
![](/images/tumblr_ma2dgvwVHd1qbb5om.png)

## Choose a Project
![](/images/tumblr_ma2dg50kBL1qbb5om.png)

## Defect Confirmation
![](/images/tumblr_ma2dqov2Ub1qbb5om.png)

## Result in Rally
![](/images/tumblr_ma2dfwrrrX1qbb5om.png)





# Issues

I had several issues working with Ruby and the Automator. Mainly I had issues
because I use rvm and when Automator executes shell scripts, it doesn't
have the benefit of rvm. I worked around this issue by using the stock Ruby
install on the mac to test/run the createdefect.rb script which also required
gems be installed globally on the mac. Perhaps I could have worked around this
by invoking rvm or by installing rvm as the root user but I simply didn't
care enough to do that. The stock ruby install works fine.


# Code
{% gist 3682539 %}
