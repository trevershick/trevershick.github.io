---
layout: post

search: "yes"
title: My First AWS Lambda
categories: [ aws ]
tags:
- aws
- lambda
- dynamodb
keywords: "dynamodb, aws, amazon, lambda"
---

# My First Lambda

I [recently posted]({% post_url 2015-11-30-leaderboard-on-dynamodb %}) that I was building a leaderboard for my 'seisei' app.  I built the basic page and the [DynamoDB](https://aws.amazon.com/dynamodb/) tables but I needed a way to update the tables.  The prior post discussed using EMR to update the scores on a periodic basis, but I want it updated more frequently.  BTW, if you have no idea what i'm talking about, I'd suggest reviewing the [previous post]({% post_url 2015-11-30-leaderboard-on-dynamodb %}).

So, given that my templates are read directly from S3, and I'd like updates to the scores as quickly as feasible, I decided to use [Lambda](https://aws.amazon.com/lambda/) from AWS.  **Lambda is a stateless compute service that executes your *Lambda Function* in response to some sort of stimuli be it an event from S3 or an HTTP call via the API gateway**.

This means I can have S3 notify me (or my [Lambda](https://aws.amazon.com/lambda/) that is) when something is accessed, and I can make a decision to update the score or not in Lambda, and then ask [DynamoDB](https://aws.amazon.com/dynamodb/) to do the data work.

That's the gist of it.

![High Level Architecture](http://www.gliffy.com/go/publish/image/9536687/L.png)


# Setting it up

Each individual step is documented very well by Amazon in the AWS documentation.  I'll leave the details to them.  Here is my list of tasks I had to perform.

1. **Create the DynamoDB Score table** (done in previous post)
2. **Turn on server logging on my S3 bucket** -  S3 allows me to setup access logging on my bucket that is used to serve out my templates (basic .json files).  So, I [turn on logging](http://docs.aws.amazon.com/AmazonS3/latest/dev/ServerLogs.html) and specify another bucket (*log-bucket*).
3. **Create my Lambda Function** - I created my function right in the AWS console.  It was easy and the console has a quick Lambda testing function that made it super quick for me to get it working.
4. **Connect my Lambda to my S3 Log Bucket** - on my *log-bucket*, add an event rule that fires an event on create (PUT) and choose Lambda -> My Lambda.
5. **Watch it work** - access some .json files in the first bucket, wait for the access log to hit and check the DynamoDb table for the result.

# Running from the command line

Even though the AWS Lambda console is nice I quickly grew tired of it.  I wanted to be able to run my lambda from the command line.

I wrote the following driver script and it served me well.  The driver simply creates a sample event (ganked from AWS Lambda console), creates a fake context object and calls my Lambda.  All I have to do is:

{% highlight javascript %}
node on-s3-logfile.js
{% endhighlight %}

and my Lambda executes just as it would in the real Lambda environment on AWS.


## Driver Code
{%highlight javascript%}
var bucket = "xxx-json";
var filename = "logs/2015-12-01-15-21-28-F6AB73380517249C";
var event = {
  "Records": [
    {
      "eventVersion": "2.0",
      "eventTime": "1970-01-01T00:00:00.000Z",
      "requestParameters": {
        "sourceIPAddress": "127.0.0.1"
      },
      "s3": {
        "configurationId": "testConfigRule",
        "object": {
          "eTag": "0123456789abcdef0123456789abcdef",
          "sequencer": "0A1B2C3D4E5F678901",
          "key": filename,
          "size": 1024
        },
        "bucket": {
          "arn": "arn:aws:s3:::mybucket",
          "name": bucket,
          "ownerIdentity": {
            "principalId": "EXAMPLE"
          }
        },
        "s3SchemaVersion": "1.0"
      },
      "responseElements": {
        "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH",
        "x-amz-request-id": "EXAMPLE123456789"
      },
      "awsRegion": "us-east-1",
      "eventName": "ObjectCreated:Put",
      "userIdentity": {
        "principalId": "EXAMPLE"
      },
      "eventSource": "aws:s3"
    }
  ]
};


var aws = require('aws-sdk');
aws.config.update({
    region: "us-east-1"
});

var lambda = require('./logfile');


var context = {
    succeed: function(data) {
        console.log("DONE", data);
    },
    fail: function(err) {
        console.log("ERROR", err);
    }
};
lambda.handler(event, context);

{%endhighlight%}



# The Lambda

> Disclaimer - this is my first pass at this. I have not really refactored, nor even finished testing.

{%highlight javascript%}
'use strict';
var aws = require('aws-sdk'),
    dynamodb = new aws.DynamoDB(),
    s3 = new aws.S3({ apiVersion: '2006-03-01' }),
    StringDecoder = new require('string_decoder').StringDecoder,
    d = new StringDecoder('utf8');


var contextToCallBack = function(context) {
    return function(err,data) {
        if (err) { context.fail(err); }
        else { context.succeed(data); }
    };
};
var updateScores = function(slugs, cb) {
    var updates = Object.keys(slugs).map(function(slug) {
        return {
            Key: {
                slug: {
                    S: slug
                },
                type: {
                    S: 'static'
                }
            },
            TableName : 'scores',
            ExpressionAttributeNames: {
                '#c': 'score',
                '#u': 'user'
            },
            ExpressionAttributeValues: {
                ':count': { N: slugs[slug].count.toString() },
                ':uzer' : { S: slugs[slug].user }
            },
            UpdateExpression: 'ADD #c :count SET #u = :uzer'
        };
    });

    var errorToReturn = null;
    var results = [];
    var frec = function() {
        if (updates.length > 0) {
            var head = updates.splice(0,1)[0];
            debug("updating item", head);
            dynamodb.updateItem(head, function(err,data) {
                debug("updateItem returned err", err);
                debug("updateItem returned data", data);
                if (err) { errorToReturn = err;}
                results.push(head.Key.slug.S);
                frec();
            });
        } else {
            // i'm done.
            cb(errorToReturn, results);
        }
    };
    frec();
};

var loadUsersForSlugs = function(slugs, cb) {
    var params = {
        RequestItems: {
            slugs : {
                Keys : [],
                ProjectionExpression:"slug,#u",
                ExpressionAttributeNames: { "#u": "user" }
            }
        }
    };
    for (var slug in slugs) {
        params.RequestItems.slugs.Keys.push({ "slug" : {"S": slug }});
    }
    dynamodb.batchGetItem(params, function(err, data) {
        if (err) { return cb(err,null); }
        data.Responses.slugs.map(function(result) {
            var slug = result.slug.S;
            var user = result.user.S;
            slugs[slug].user = user;
        });
        cb(err, null);
    });
}

var onSlug = function(slugs, slug) {
    if (typeof(slugs[slug]) === 'undefined') {
        slugs[slug] = { count: 1 };
    } else {
        slugs[slug].count = slugs[slug].count + 1;
    }
};

var onSlugsEnd = (slugs, cb) => {
    if (Object.keys(slugs).length === 0) {
        return cb(null,null);
    }
    loadUsersForSlugs(slugs, function(err, data) {
        if (err) { return cb(err,null); }
        updateScores(slugs, cb);
    });
};

var quiet = true;
var debug = (msg, obj) => {
    if (!quiet) {
        console.log("DEBUG " + msg, obj);
    }
};

exports.quiet = (b) => { quiet = b; }
exports.handler = function(event, context) {
    debug('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    var bucket = event.Records[0].s3.bucket.name;
    var key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    var params = {
        Bucket: bucket,
        Key: key
    };
    var slugs = {};
    var stream = s3.getObject(params).createReadStream();

    stream.on('data', (data) => {
        var chunk = d.write(data);
        var myRe=/GET (?:.+)?\/([^\/]+)\.json/g;
        var tmp;
        while (tmp = myRe.exec(chunk)) {
            onSlug(slugs, tmp[1]);
        }
    })
    .on('error', (err) => {
        context.fail(err);
    })
    .on('end', () => {
        onSlugsEnd(slugs, contextToCallBack(context));
    });
};
{% endhighlight %}


# Testing My Lambda Function

## In the AWS Console

Amazon has done pretty well with the Lambda console in my opinion.  I was expecting a rather spartan experience but what I found was a Spartan that likes decorating.  That is to say that there's a built in editor (ace editor I think) and a basic testing facility that allows you to 'Save and Test' your script.  It will execute the Lambda and output console messages right there in the console and the results of your function (via the ```succeed``` or ```done``` calls on the context).

They even provided a 'sample' event template function so that when you start to test, you can select the type of event (like an S3 put event) and then you can edit the event's specifics.  It makes for a pretty simple experience for getting up and running.

<img src="/assets/img/lambda-edit.png"/>

## Via Jasmine

Testing in the console is all well and good but I wanted to be able to test my Lambdas like I test all my other code (via a command line build tool).  There's no shortage of testing blogs with node.js so i'll spare you the nitty gritty details but I will touch on a few interesting points.

### Mock ALL the Things!!!

The AWS SDK for JavaScript is loaded up as a CommonJS module just like any other node compatible module.  Since you can load it up, you can mock it.  I ultimately ended up using [Sinon](http://sinonjs.org/docs/) as my mocking framework.  I started with Jasmine's built in framework as it was the framework i'm most familiar with but ended up going with Sinon due to its *sandbox* functionality.

### Jasmine Spec
{% highlight javascript %}



var bucket = "a-bucket";
var filename = "logs/abc";
var event = {
  "Records": [
    {
      "s3": {
        "object": {
          "key": filename,
        },
        "bucket": {
          "name": bucket,
        }
      }
    }
  ]
};

var aws = require('aws-sdk');
var sinon = require('sinon');
require('jasmine-sinon');
var sandbox;

describe('logfile', () => {
    'use strict';
    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        this.s3object = { createReadStream: ()=>{} };
        this.dynamodb = createStubObject(sandbox, ["batchGetItem"]);
        this.s3 = createStubObject(sandbox, ["getObject"])
        this.s3object = createStubObject(sandbox, ["createReadStream"]);

        sandbox.stub(aws, 'S3').returns(this.s3);
        sandbox.stub(aws, 'DynamoDB').returns(this.dynamodb);

        this.s3.getObject.returns(this.s3object);


        delete require.cache[require.resolve('../logfile.js')]
        this.logfile = require('../logfile');
    });

    afterEach(()=>{
        sandbox.restore();
    });

    it('loads from S3', (done) => {
        var context = createStubObject(sandbox, ["succeed", done, "done", done, "fail", done]);
        // assemble
        var log = '91005e2a7c02dcf52e55ab04d8db7d7fa0e3c1e279880f7e705e90040df16d4d xxx-json [02/Dec/2015:02:44:04 +0000] 107.15.84.222 - 42A5D95192F2F0D7 REST.GET.OBJECT C4U6Z2.json "GET /xxx-json/C4U6Z2.json HTTP/1.1" 200 - 34 34 14 13 "-" "HTTPie/0.9.2" -';
        var batchGetItemResponse = { Responses: { slugs: [{slug:{S:'C4U6Z2'},user:{S:'y'}}]}};
        var updateItemResponse = {};

        this.s3object.createReadStream.returns(stringStream("y"));
        this.logfile.handler(event,context);
    });

    it('loads the s3 file from the event by bucket and key', (done) => {
        // assemble
        var context = createStubObject(sandbox, ["succeed", done, "done", done, "fail", done]);
        this.s3object.createReadStream.returns(stringStream(""));

        // act
        this.logfile.handler(event,context);

        // assert
        expect(this.s3.getObject.args[0][0]).toEqual({ Bucket: 'a-bucket', Key: 'logs/abc' });
        expect(this.s3.getObject.called).toBe(true);
        expect(this.s3object.createReadStream).toHaveBeenCalled();
    });


    it('exits without speaking to db if it finds no slugs', (done) => {
        // assemble
        var context = createStubObject(sandbox, ["succeed", done, "done", done, "fail", done]);
        this.s3object.createReadStream.returns(stringStream('GET /xxx-json/xxxx.logs'));

        // act
        this.logfile.handler(event,context);

        // assert
        expect(this.s3object.createReadStream.called).toBe(true);
        expect(this.dynamodb.batchGetItem.called).toBe(false);
    });

});

{% endhighlight %}

### Helper File

{% highlight javascript %}

'use strict';
var sinon = require('sinon'),
    Readable = require('stream').Readable;

beforeAll(function() {
  global.stringStream = (contents) => {
    var s = new Readable();
    s.push(contents);
    s.push(null);
    return s;
  };
});


beforeAll(() => {
    /**
     * creates a stub object like jasmine.createSpyObj
     * but creates it in a sandbox
     */
    var createStubObject = function(sandbox, methods) {
        var x = {};
        for (var i=0;i < methods.length;i++) {
            var m = methods[i];
            var f = sandbox.stub();
            if (methods.length > i+1 && typeof(methods[i+1]) === 'function') {
                f = methods[i+1];
                i++;
            }
            x[m] = f;
        };
        return x;
    };

    global.createStubObject = createStubObject;
});


{% endhighlight %}


## Difficulties

I had a few difficulties working with the Lambda service for the first time.  I encountered most of my issues upon writing unit tests for my Lambda function.  I haven't done day to day JavaScript in a a little while, so I always seem to need to relearn the testing/mocking frameworks.  However, that aside, I had some AWS specific issues during testing.

* **All in one file** - while Lambda doesn't require you to put your entire script in one file, it was the easiest for me to get off the ground.  However, being in one file made it more difficult as I had to mock all the things as opposed to mocking out sub modules with nice interfaces.
* **No Libraries** - Since i did this all in one file, I couldn't add libraries like async which would have made much of this easier.
* **Force Reload of Modules** - The sample code from Amazon has ```var aws = require('aws-sdk')``` and ```var s3 = new aws.S3()``` at the top of the file.  To mock these out for each test anew, I had to force unload the modules or else my mocks/stubs would never be reset.
* **DynamoDb API** - I feel like I spent a lot of time just figuring out how to do things with the DynamoDb API.  Luckily the cycle time is very quick since I can run the lambda function from the command line via node.


# End

This is not the best constructed post.  I'm working to improve and there's a lot of information to cover.  If something isn't working or you have a question, by all means contact me.  There are several ways to contact me on the home page.
