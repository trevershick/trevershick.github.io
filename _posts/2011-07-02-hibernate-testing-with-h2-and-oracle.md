---
layout: post
title: Hibernate testing with H2 and Oracle
search: "yes"
tags:
- m2eclipse
- unit testing
- hibernate
---

I was working with a team that was using Hibernate with Oracle and writing 'unit tests'.  My major issue was that the tests were slow when running against Oracle. Unit tests should be as fast as possible.  There are different ways to skin this cat such as having a separate module for integration tests but I wanted to make it fairly transparent for the developers.  By default I wanted to run the tests with H2 but allow them to switch to Oracle for their tests very easily.

The solution was to use Maven profiles to add database specific configuration files to the test resources in the build.  For H2 (default) it would add src/test/h2 and src/test/oracle for Oracle.  The file names are identical in these files (spring-test-database-config.xml), so that the unit tests themselves are ignorant which one they're loading.  It seems to work like a champ.  I'll give it some time and report back though.  The gist is below that shows the changes to my pom.xml to support this scheme.  I've also included the database config files for completeness sake.

I've also included a [video] ( href="http://dl.dropbox.com/u/7812537/h2_and_oracle_unit_tests.swf.html) demonstrating how this works within Eclipse using m2eclipse which is our development environment.



{% gist 1061641 %}
