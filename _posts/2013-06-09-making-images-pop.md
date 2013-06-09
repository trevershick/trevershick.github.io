---
title: Use jQuery to Popup Images in Dialog
tags:
 - tips
layout: post
---

Soon after recreating my blog using Jekyll and Github pages, i realized that my images on the main page were too large for the view.  Instead of fixing the images (as i assume i may include even larger images in the future), i decided to put in a simple hack that the Confluence Wiki inspired.  

# Example
<style>
@keyframes xxx {
    from {
        box-shadow: none;
        -webkit-box-shadow: none;
        -moz-box-shadow: none; }
    50% {
        box-shadow: 0px 0px 20px #9DD5F1;
        -webkit-box-shadow: 0px 0px 20px #9DD5F1;
        -moz-box-shadow: 0px 0px 20px #9DD5F1; }
    to {
            box-shadow: none;
            -webkit-box-shadow: none;
            -moz-box-shadow: none; 
            }
}
@-webkit-keyframes xxx {
  from {
      box-shadow: none;
      -webkit-box-shadow: none;
      -moz-box-shadow: none; }
  50% {
      box-shadow: 0px 0px 20px #9DD5F1;
      -webkit-box-shadow: 0px 0px 20px #9DD5F1;
      -moz-box-shadow: 0px 0px 20px #9DD5F1; }
  to {
          box-shadow: none;
          -webkit-box-shadow: none;
          -moz-box-shadow: none; 
          }
}
 
.pulsate-on-hover {
    -moz-animation-duration: 3s;
    -webkit-animation-duration: 3s;
    -moz-animation-name: xxx;
    -webkit-animation-name: xxx;
    -moz-animation-iteration-count: infinite;
    -webkit-animation-iteration-count: infinite;
    animation-name: xxx;
    animation-iteration-count: infinite;
    animation-duration: 3s;
}
 
.xpulsate-on-hover:hover {
    box-shadow: 0px 0px 20px #9DD5F1;
    -webkit-box-shadow: 0px 0px 20px #9DD5F1;
    -moz-box-shadow: 0px 0px 20px #9DD5F1;
}
</style>
<span class="thumbnail">
<img class="pulsate-on-hover" width="100" src="{{site.url}}/images/2013-06-07-gitlog.png" alt="My Example Image"/>
</span>

I figured i'd limit the image size, then popup a full size view in a jQuery dialog.

## Limit the image size

{% highlight css %}
div.post img {
  max-width:650px;
}
{% endhighlight %}

## Add jQuery and jQuery UI

{% highlight html %}
<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>   
{% endhighlight %}

## Add JavaScript on click handler

Put this right before the end of your body tag.  This code adds a delegate to the body that handles the click event for 'img' tags.  It then creates an 'img' element, sets the src and appends it to a new 'div' element.  This it calls .dialog() on and sets the dialog title to the 'alt' attribute of the image.

{% highlight javascript %}
$(function(){
    $("body").delegate("img","click", function() {
        var i = $("<img/>").attr("src", $(this).attr("src"));
        var d = $("<div/>").append(i);
        d.dialog({ show: {effect: 'fade', speed: 500}, width: 'auto',title:$(this).attr("alt")});
    });
});
{% endhighlight %}


## Change the cursor for the images

This can be done via CSS or jQuery, your choice.

{% highlight javascript %}
$("img").each(function(){
    $(this).css("cursor","pointer");
});
{% endhighlight %}

I have no images in my theme, so this works well.  This may cause issues for you however, so you could add a class (like 'popup') to the images.   You'd simply have to change the 'delegate' method call to :

{% highlight javascript %}
$("body").delegate("img.popup","click", function() { ... });
{% endhighlight %}

