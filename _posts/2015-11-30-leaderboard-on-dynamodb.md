---
layout: post

search: "yes"
title: Building a Leaderboard on DynamoDb
categories: [ dynamodb, aws ]
tags:
- aws
- dynamodb
keywords: "leaderboard, dynamodb, scoreboard, aws, amazon"
---

# Building a Leaderboard on DynamoDb

I periodically work on a [pet project "seisei"](http://seisei.elasticbeanstalk.com) which affords me many opportunities to learn different technologies.  My latest was a migration from RiotJS on the front end to Om and ClojureScript.  The backend was already written in Clojure, and I have worked with React in production, so it was really a no brainer.  If you're interested, the [source code](http://github.com/trevershick/seisei) is available, but please keep in mind I am not a Clojure expert, just an avid fan.

The *seisei* application allows users to create JSON templates with generated data via macro expressions and then publish the template as either static files on S3 or dynamic endpoints within the application itself.  

The application isn't very social at all.  You can share the endpoints but you can't find templates or fork templates or anything like you can with JSFiddle or others of it's ilk.  I thought it might be nice to start adding those features.

The first problem that I attacked was a so-called *leaderboard*.  For *seisei* this is really just tracking usage counts on templates.  While it might seem pointless, I found it intriguing enough to attempt.

## "This should be easy."

So, had I built this application on top of a SQL database or even MongoDB or some other NoSQL solution this would probably be a lot easier than it was.  However, the solution is architected on top of DynamoDb and runs inside Elastic Beanstalk. "Why would you do that?" you may ask.  Well, building in AWS was aligned with my goals of education, and there it stays.

**It should still be easy!**

Yes, I agree.  It should still be easy and it wasn't all that terrible but I had to think about the problem differently than if I had built on top of SQL.  Doing a leaderboard in SQL is simple.  ```UPDATE scores SET score = score + 1 WHERE template='ABC';  SELECT score,template FROM scores ORDER BY score DESC LIMIT 10;```.  Done.  I'm going to choose to ignore how easy this is.  I also will proceed ignoring the problems with SQL databases and how they're not cool any more ;).


## Two parts of the problem
As noted in the SQL example above, there are two things that need to be done to provide a leaderboard.

1. Track a score, or metric value. For me it's the number of times a template is accessed.
2. Query for the top 'n' values for the metric.

Tracking accesses on the templates should be easy enough, and it's not the focus of this post.  **This post will focus on the retrieval of the top 'n' values.**  In another post I'll outline how I track the accesses to the static templates in S3 and the dynamic templates served up by the application itself.

## Querying for the Top 'n' Values
Getting data into DynamoDb is one problem but how do we get the data into a form where we can do a simple query to get the top ten values by template type (dynamic/static)?

### My First Attempt - EMR
The first thing I tried was using EMR, and more specifically Amazon's Data Pipeline and Hive.  Once I figured out the mechanics of Data Pipeline the problem was fairly simple.

**Possible Structure(s)in DynamoDb**

With EMR, I can have a number of different structures (examples below).  If I'm tackling this problem as a 'big data' sort of problem with ETL via EMR then the input format can be widely varied.


| slug | access_time      | type   |
|------|------------------|--------|
| ABC  | 2015-10-10 12:01 | static |
| ABC  | 2015-10-10 15:01 | dynamic|
| ABC  | 2015-10-10 17:01 | static |
| DEF  | 2015-10-10 09:01 | dynamic|
| GHI  | 2015-10-09 07:01 | static |

With Data Pipeline, all I had to do was define a Pipeline job with a Hive Activity, Data Input from Dynamo and Data Output to Dynamo.  The Hive Activity allows me to run aggregations via SQL like queries and then Pipeline will push the data back into DynamoDb.

**Hive Activity 'Script'**
```
INSERT OVERWRITE TABLE ${output1} SELECT type, slug, count(access_time) AS cnt FROM ${input1} WHERE type='dynamic' GROUP BY slug ORDER BY cnt DESC LIMIT 10;
```
(this would be run twice, once for dynamic, once for static)

**Hive Input/Output**
(You can see an example input output definition at the bottom of this post) The input is essentially the *accesses* table and the output would be a new table called *leaderboard*.  Hive does all the heavy lifting in this case.
> This is a rudimentary pipeline I setup.  If I were to build using EMR I would probably be pulling data into daily or hourly buckets stored in S3 and aggregated daily, monthly, annually so that I could show Point in Time leaderboards and perform further analytics on the data such as stagnation,etc...

*While this would work..* **EMR is just too darned expensive and slow for me**.  My monthly bill shot up $10 just with me playing around today.  Since I'm not making any money off this effort, i'm not going to deal with this cost.  **Also**, the latency involved is just too great.  I want closer to real time updates for my leaderboard.

> Keep in mind I understand that 'at scale' EMR would probably work better and be more cost effective, and YES I did setup my pipeline with Spot Instances too.


### Failed Ideas (non EMR)

So without using EMR for the top 'n' values aggregation, how can I do this without expensive DynamoDb scans?  After much thought and experimentation with table structures, I 'fixed' my old way of thinking about DynamoDb and started really looking into Global Secondary Indexes.

Global secondary indexes provide you with the ability to add another index on top of a table that uses a DIFFERENT hash and sort key.  Why is this important?  I'll show you in a little bit.  Let me first show you some thoughts I had and why they wouldn't work.

**Composite Key**

| type | type_score | score | slug |
|------|------------|-------|------|
| static | 000037_ABC | 37 | ABC |
| static | 000034_DEF | 34 | DEF |
| dynamic | 003003_GGG | 3003 | GGG |

Success(es) - query works, hash key = type, sort key = type_score. I can query where type = 'static' sort on type_score desc.

Failure(s) - terrible hash key, how do i update this table?  You can't update a key, so you have to delete the record an reinsert.  I suppose you could use a filter.

**JSON Object**

The idea here is to store the ten leaders in a hash table using a 'gating' value on the row to only update the row if the new score was greater than the gate value.

| type | gate | leaders  |
|------|------------|-------|----------|
| static | 3 | ABC,37,user1*DEF,3,user2 |

Successes - easily queryable, one record to read.
Failure(s) - updating this is a nightmare.  The contention would be horrible. I know there are others.

**Others**
I think i threw about 2 or 3 other implementations out.  I won't bother you with them.  Suffice it to say that I'm fairly ashamed of them, it was purely out of desperation that I even gave them more than a passing thought.


### My current answer

**Global Secondary Indexes**

I ended up with the following structure.

|slug | type | score | user |
|-----|------|-------|------|
| ABC  | static | 37 | trever |
| DEF  | static | 33 | trever |
| GGG  | static | 99 | jim |

The hashkey is 'slug' which has pretty good hashing and i've used it elsewhere as a key.  The range key is 'type'. This allows easy updates as I can identify the rows easily.

However, I can't do a sort on score here.  What I needed was to be able to query ```WHERE type='static' ORDER BY score DESC```.

To do this, I created a Global Secondary Index on 'scores' (the table).  The hash key is the type and the sort key is the score.  This allows me to do the query without scans and sort by the index in descending fashion, then I can limit the results to 'n'.  Shown below is a JavaScript example of the query parameters.

```
var params = {
    TableName : "scores",
    IndexName: "type-score-index",
    KeyConditionExpression: "#n = :n",
    ConsistentRead: false,
    ExpressionAttributeNames: {
      "#n": "type"
    },
    ExpressionAttributeValues: {
        ":n" : {
          "S":"dynamic"
        }
    },
     ScanIndexForward: false,
     Limit: 3,
     Select: 'ALL_ATTRIBUTES'
};
```


> Note - I know this is a really crappy hash key.  I don't know how this is going to react with the GSI. I'll need to research the behavior some more.




If you stuck with me this far, you must be bored or desperate.  Thank you for your attention.  Your comments are always appreciated.  If you have a better way to do this, PLEASE tell me.  I did not find many answers on the interwebs (which really surprised me).




# Data Pipeline Example

```
{
  "objects": [
    {
      "schedule": {
        "ref": "DefaultSchedule"
      },
      "enableDebugging": "true",
      "name": "Aggregate Counts Cluster",
      "id": "EmrClusterId_42cHr",
      "releaseLabel": "emr-4.2.0",
      "masterInstanceType": "m3.xlarge",
      "type": "EmrCluster",
      "terminateAfter": "1 Hour"
    },
    {
      "period": "1 days",
      "name": "Every 1 day",
      "id": "DefaultSchedule",
      "type": "Schedule",
      "startAt": "FIRST_ACTIVATION_DATE_TIME"
    },
    {
      "schedule": {
        "ref": "DefaultSchedule"
      },
      "dataFormat": {
        "ref": "DynamoDBDataFormatId_wBcn7"
      },
      "name": "Templates",
      "id": "DataNodeId_zUOc4",
      "type": "DynamoDBDataNode",
      "tableName": "templates"
    },
    {
      "output": {
        "ref": "DataNodeId_iMCxe"
      },
      "input": {
        "ref": "DataNodeId_zUOc4"
      },
      "schedule": {
        "ref": "DefaultSchedule"
      },
      "name": "Calculate Template Counts",
      "hiveScript": "INSERT OVERWRITE TABLE ${output1} SELECT user, count(slug) FROM ${input1} GROUP BY user",
      "id": "ActivityId_A13NA",
      "runsOn": {
        "ref": "EmrClusterId_42cHr"
      },
      "type": "HiveActivity"
    },
    {
      "column": [
        "user string",
        "slug string"
      ],
      "name": "Templates In Format",
      "id": "DynamoDBDataFormatId_wBcn7",
      "type": "DynamoDBDataFormat"
    },
    {
      "failureAndRerunMode": "CASCADE",
      "schedule": {
        "ref": "DefaultSchedule"
      },
      "resourceRole": "DataPipelineDefaultResourceRole",
      "role": "DataPipelineDefaultRole",
      "pipelineLogUri": "s3://xxx-logs/",
      "scheduleType": "cron",
      "name": "Default",
      "id": "Default"
    },
    {
      "column": [
        "user string",
        "count bigint"
      ],
      "name": "Template Counts",
      "id": "DynamoDBDataFormatId_PRg3t",
      "type": "DynamoDBDataFormat"
    },
    {
      "schedule": {
        "ref": "DefaultSchedule"
      },
      "dataFormat": {
        "ref": "DynamoDBDataFormatId_PRg3t"
      },
      "name": "Templates Count",
      "id": "DataNodeId_iMCxe",
      "type": "DynamoDBDataNode",
      "tableName": "template_counts"
    }
  ],
  "parameters": []
}
```
