---
title: ldap-test-utils 2.0.0 Released
layout: post
category : releases
release-date: 2016-11-15
search: "yes"
noindex: false
tags:
- ldap
- junit
- release
keywords: "junit, release, ldap"
---


[LDAP Test Utils v 2.0.0 Released](http://trevershick.github.io/ldap-test-utils/)


Updates in 2.0.0
----------------
* Update to Java 1.8
* Update spring-ldap-core to 2.2.0.RELEASE
* Update unboundid-ldapsdk to 3.2.0

Getting Started
---------------

*Note* - I don't have this code deployed in a Maven repository anywhere.  Thus, you'll have to download it and build it yourself.  If you have an internal repository yourself, you can deploy it there.

*JUnit users can use the supplied JUnit ``Rule`` (see further down)*

1. Import the dependency into your POM.
2. Create your test class
3. Annotate your test class (optional)
4. Create an instance of ``LdapServerResource`` in your setup code
5. Tear down the instance of ``LdapServerResource`` in your tear down code.
6. Run your test

The Dependency
--------------

	<dependency>
		<groupId>com.trevershick.test</groupId>
		<artifactId>ldap-test-utils</artifactId>
		<version>1.0.0-SNAPSHOT</version>
		<scope>test</scope>
	</dependency>

## Example Tests


### Default Configuration (no annotations)

Calling ``new LdapServerResource()`` with no constructor arguments forces the use of defaults.  All default values can be found in the ``LdapConfiguration`` annotation.

	public class DefaultAnnotationsTest {
		private LdapServerResource server;

		@Before
		public void startup() throws Exception {
			server = new LdapServerResource().start();
		}

		@After
		public void shutdown() { server.stop(); }


		@Test
		public void testStartsUpWithDefaults() throws Exception {
			LdapContextSource s = new LdapContextSource();
			s.setPassword(LdapConfiguration.DEFAULT_PASSWORD);
			...
		}
	}

### Configuration via Annotations

The following example shows how to use annotations to alter the default configuration.


	package com.chickenshick.test.ldap;
	@LdapConfiguration(
		bindDn = "cn=Directory Manager",
		password = "mypass",
		port = 11111,
		base = @LdapEntry(dn = "dc=myroot",
			objectclass = { "top", "domain" })
	)
	public class BasicCustomAnnotationsTest {

	private LdapServerResource server;

	@Before
	public void startup() throws Exception {
		server = new LdapServerResource(this).start();
	}

	@After
	public void shutdown() {
		server.stop();
	}

### Creating LDAP Entries via Annotations

By using the ``LdapEntry`` annotation, you can add entries to the LDAP server upon startup.  The example test below will add an *organizationalUnit* with the DN *ou=Groups,dc=root* to the LDAP DIT.

	@LdapConfiguration(
			entries={
				@LdapEntry(dn="ou=Groups,dc=root",objectclass="organizationalUnit",attributes={@LdapAttribute(name="ou",value="Groups")})
			}
	)
	public class CustomEntriesAnnotationsTest {
		...
	}

### Creating LDAP Entries via LDIF Files

Alternately, you can use LDIF files to add entries (or schema changes).  The example below shows a test that will use the ``test.ldif`` file in the root of the classpath.

	@LdapConfiguration(
			ldifs = @Ldif("/test.ldif")
	)
	public class LdifLoadTest {
		...
	}


## Example JUnit Test

	package com.github.trevershick.test.ldap.junit4;


	@LdapConfiguration(useRandomPortAsFallback=true)
	public class Junit4DefaultAnnotationsTest {

		/**
		 * Initializes the server
		 */
		@Rule
		public LdapServerRule rule = new LdapServerRule(this);

		@Test
		public void testStartsUpWithDefaults() throws Exception {
			LdapTemplate t = new LdapTemplate();
			...
		}
	}

## Useful Configuration Attributes
### useRandomPortAsFallback
By default, the LdapServer is configured to bind to port 10389.  This is fine if you're running the tasks on your machine manually.  However, if running in a CI environment with multiple LDAP tests running concurrently you could run into a BindException.  By default, ``LdapServerResource`` does NOT fallback to a random port.  If it can't bind to 10389 (or your configured port #) then it throws a ``BindException``.

You can alter this configuration option by specifying ``useRandomPortAsFallback=true`` on the ``@LdapConfiguration`` annotation.

The following test illustrates this feature.

	package com.github.trevershick.test.ldap;


	@LdapConfiguration(useRandomPortAsFallback=true)
	public class FallBackToRandomTest {

		@Test
		public void wontFallbackToRandom() throws Exception {
			LdapServerResource s1 = new LdapServerResource().start();
			assertEquals(LdapConfiguration.DEFAULT_PORT, s1.port());

			LdapServerResource s2 = new LdapServerResource(this).start();
			assertTrue(s2.isStarted());
			assertTrue(s2.port() != LdapConfiguration.DEFAULT_PORT);

			s1.stop();
			s2.stop();
		}
	}
