---
title: Generate GRANT statements from Oracle DB
layout: post
category: tips
---

Generate 'grant' statements like the following directly from the oracle database itself. This can be usedful for migrations.

	grant DELETE, INSERT, SELECT, UPDATE on PARTY_EULA_ACCEPTANCE to X_USER;
	grant DELETE, INSERT, SELECT, UPDATE on BUSINESS_CATEGORY_TYPE to X_USER;
	grant DELETE, INSERT, SELECT, UPDATE on X_STATUS to X_USER;
	grant DELETE, INSERT, SELECT, UPDATE on X_STATUS to X_USER;
	grant DELETE, INSERT, SELECT, UPDATE on ACT_CY_PROCESS_SOLUTION to X_USER;


### The SQL

	SELECT
	        'grant ' || 
	    LISTAGG(privilege, ', ') WITHIN GROUP (ORDER BY grantee) || ' on ' || table_name || ' to ' || grantee || ';'
	FROM
	    ALL_TAB_PRIVS
	WHERE
	    table_schema = 'X' and table_name not like 'BIN$%'
	GROUP BY
	    grantee,table_name;