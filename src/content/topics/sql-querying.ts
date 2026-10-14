import type { Topic } from '../../types';

// Running dataset (same customers/orders as the sql-joins animation, plus a few extra columns):
// customers: 1 Asha (Bengaluru, phone set), 2 Ravi (Pune, phone NULL), 3 Meera (Delhi, phone '')
// orders: 101 Asha paid 50000 · 102 Asha cancelled 20000 SAVE10 · 103 Ravi paid 75000 SAVE10 · 104 guest (NULL) paid 30000
// payments: 1→101 pay_A1 · 2→103 pay_B7 · 3→103 pay_B7 (duplicate) · 4→104 pay_C3

const topic: Topic = {
  id: 'sql-querying',
  phase: 'api-sql',
  order: 3,
  title: 'SQL for Testers: Querying and Checking Data',
  subtitle:
    'SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, NULL handling, aggregates and GROUP BY/HAVING on one small e-commerce dataset, the logical order a query runs in, and the everyday QA queries (counts by status, duplicates, missing fields) that interviewers ask you to write on the spot.',
  estimatedMinutes: 90,
  sources: [
    'SQLBolt — interactive lessons 1–12, incl. "Order of execution of a Query"',
    'PostgreSQL 17 docs — SQL Commands: SELECT (Description: the order clauses are processed in; LIMIT without ORDER BY; GROUP BY functional dependency)',
    'PostgreSQL 17 docs — 9.2 Comparison Functions and Operators (= NULL, IS NULL, IS DISTINCT FROM), Conditional Expressions (COALESCE, NULLIF), Aggregate Functions',
    'MySQL 8.0 Reference Manual — B.3.4.3 Problems with NULL Values; 14.19.3 MySQL Handling of GROUP BY (ONLY_FULL_GROUP_BY, ANY_VALUE, alias in HAVING)',
    'Mode / ThoughtSpot SQL Tutorial — basic and intermediate SQL (WHERE, logical operators, aggregates, GROUP BY, HAVING)',
    'LearnSQL.com — "Software Testing SQL Interview Questions" (what testers are asked: WHERE vs HAVING, MIN/MAX checks, JOIN basics)',
    'Glassdoor software QA / manual tester interview reports (2024–2025): SQL rounds with counts, DISTINCT, duplicates and multi-table queries even for manual roles',
    'AlgoMaster / LeetCode 176–177 discussion — ties and NULLs in "Nth highest" style questions',
  ],
  tags: ['sql', 'select', 'where', 'null', 'coalesce', 'group-by', 'having', 'aggregates', 'database-testing', 'interview-sql'],
  cheatSheet: [
    'Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. So a SELECT alias is unknown in WHERE but fine in ORDER BY.',
    'WHERE filters rows before grouping; HAVING filters groups after aggregation. An aggregate like COUNT(*) > 1 belongs in HAVING.',
    'NULL means "unknown": col = NULL and col <> NULL are never TRUE. Use IS NULL / IS NOT NULL; WHERE keeps only TRUE rows, so UNKNOWN rows vanish silently.',
    'col <> \'X\' also drops NULL rows. Write col IS NULL OR col <> \'X\', COALESCE(col, \'\') <> \'X\', or (Postgres) col IS DISTINCT FROM \'X\' (MySQL: NOT col <=> \'X\').',
    'COUNT(*) counts rows; COUNT(col) counts non-NULL values; COUNT(DISTINCT col) counts distinct non-NULL values. SUM/AVG/MIN/MAX skip NULLs; SUM over zero rows is NULL (wrap in COALESCE).',
    'NULL is not \'\' (empty string). "Missing phone" usually means phone IS NULL OR phone = \'\'.',
    'AND binds tighter than OR: a = 1 OR b = 2 AND c = 3 means a = 1 OR (b = 2 AND c = 3). Always add brackets.',
    'BETWEEN is inclusive and a bare date means midnight: for timestamps use created_at >= \'2026-03-01\' AND created_at < \'2026-03-06\'.',
    'LIMIT without a unique ORDER BY returns an unpredictable subset; add a tie-breaker (ORDER BY created_at DESC, id DESC). SQL Server uses TOP; standard SQL is FETCH FIRST n ROWS ONLY.',
    'Duplicates: GROUP BY the business key HAVING COUNT(*) > 1; then join back (or use ROW_NUMBER) to see the full duplicate rows.',
    'Every non-aggregated SELECT column must be in GROUP BY (Postgres always; MySQL 5.7.5+ with ONLY_FULL_GROUP_BY on by default).',
    'Integer division: in Postgres 1/4 = 0; MySQL\'s / returns a decimal. Multiply by 100.0 first for percentages.',
  ],
  sections: [
    {
      heading: 'Databases for testers: tables, keys and the running dataset',
      body: `**Intuition:** a relational database is a set of spreadsheets (tables) that point at each other through ID columns. When you test an e-commerce app, the UI is only a window onto these tables, so reading them directly tells you what the app *really* saved.

**The vocabulary interviewers expect**
- **Table** = one kind of thing (customers, orders). **Row** = one record. **Column** = one attribute with a data type (int, varchar/text, decimal, timestamp, boolean).
- **Primary key (PK)**: the column that uniquely identifies a row (\`orders.id\`). Never NULL, never duplicated.
- **Foreign key (FK)**: a column that points at a PK in another table (\`orders.customer_id\` → \`customers.id\`).
- **SQL command families:** DQL (\`SELECT\`), DML (\`INSERT\`, \`UPDATE\`, \`DELETE\`), DDL (\`CREATE\`, \`ALTER\`, \`DROP\`, \`TRUNCATE\`), DCL (\`GRANT\`, \`REVOKE\`), TCL (\`COMMIT\`, \`ROLLBACK\`). This topic is all DQL; changing data is in the next topic.

**Why testers query the database**
| Situation | What you check with SQL |
|---|---|
| Placed an order in the UI | the order row exists with the right status, total, customer |
| API returned 201 | the record was actually persisted (not just echoed back) |
| A report/dashboard number looks off | recount from the source tables |
| Need test data | find a customer with no orders, a cancelled order, a used coupon |
| After a migration or data fix | NULLs in mandatory columns, duplicates, invalid statuses |

**The running dataset.** Every query in this topic runs on these rows, so you can predict each result by hand. Money is stored in **paise** (₹1 = 100 paise) as an integer, a common way to avoid decimal rounding bugs. Order 104 is a **guest checkout** (no customer), Ravi's phone is unknown (NULL) and Meera saved an empty phone (\`''\`).

**In interviews, say:** "I use SQL to verify what the UI or API claims, to find test data quickly, and to check data quality, usually with a read-only account on the QA database."`,
      diagram: `customers                                    orders
+----+-------+-----------------+-----------+------------+
| id | name  | email           | city      | phone      |
+----+-------+-----------------+-----------+------------+
| 1  | Asha  | asha@shop.test  | Bengaluru | 9845012345 |
| 2  | Ravi  | ravi@shop.test  | Pune      | NULL       |
| 3  | Meera | meera@shop.test | Delhi     | ''         |
+----+-------+-----------------+-----------+------------+

orders (customer_id -> customers.id)
+-----+-------------+-----------+-------------+-------------+------------------+
| id  | customer_id | status    | total_paise | coupon_code | created_at       |
+-----+-------------+-----------+-------------+-------------+------------------+
| 101 | 1           | paid      | 50000       | NULL        | 2026-03-01 10:15 |
| 102 | 1           | cancelled | 20000       | SAVE10      | 2026-03-02 18:40 |
| 103 | 2           | paid      | 75000       | SAVE10      | 2026-03-05 09:05 |
| 104 | NULL(guest) | paid      | 30000       | NULL        | 2026-03-06 21:30 |
+-----+-------------+-----------+-------------+-------------+------------------+`,
      code: [
        {
          language: 'sql',
          title: 'Create and load the dataset (runs on PostgreSQL and MySQL 8)',
          code: `CREATE TABLE customers (
  id    INT PRIMARY KEY,
  name  VARCHAR(50)  NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  city  VARCHAR(50),
  phone VARCHAR(15)               -- nullable on purpose
);

CREATE TABLE orders (
  id          INT PRIMARY KEY,
  customer_id INT REFERENCES customers(id),  -- NULL = guest checkout
  status      VARCHAR(20) NOT NULL,
  total_paise INT NOT NULL,                   -- 50000 paise = Rs 500.00
  coupon_code VARCHAR(20),
  created_at  TIMESTAMP NOT NULL
);

INSERT INTO customers VALUES
  (1, 'Asha',  'asha@shop.test',  'Bengaluru', '9845012345'),
  (2, 'Ravi',  'ravi@shop.test',  'Pune',      NULL),
  (3, 'Meera', 'meera@shop.test', 'Delhi',     '');

INSERT INTO orders VALUES
  (101, 1,    'paid',      50000, NULL,     '2026-03-01 10:15:00'),
  (102, 1,    'cancelled', 20000, 'SAVE10', '2026-03-02 18:40:00'),
  (103, 2,    'paid',      75000, 'SAVE10', '2026-03-05 09:05:00'),
  (104, NULL, 'paid',      30000, NULL,     '2026-03-06 21:30:00');`,
        },
      ],
      keyPoints: [
        'PK = unique + not NULL; FK = pointer to another table\'s PK (may be NULL if the column allows it).',
        'Testers mostly need SELECT; ask for a read-only DB user so a typo cannot change data.',
        'Store and compare money as integers (paise/cents) to avoid floating-point surprises.',
      ],
      source: 'SQLBolt — Introduction to SQL; LearnSQL.com — Software Testing SQL Interview Questions',
    },
    {
      heading: 'SELECT, expressions and aliases',
      body: `**Intuition:** \`SELECT\` picks the columns you want to see, \`FROM\` says which table. Think "show me these columns from that table".

**Mechanics**
- \`SELECT *\` returns every column. Fine for a quick look; in saved checks and automation list the columns, so a new column does not break your comparison.
- Columns can be **expressions**: \`total_paise / 100.0\` converts to rupees. \`AS\` gives the result column a name (an **alias**). A **table alias** (\`FROM orders o\`) shortens column references (\`o.status\`) and is essential once you join tables.
- String literals use **single quotes** (\`'paid'\`). Double quotes are for identifiers in standard SQL/Postgres; MySQL uses backticks for identifiers.
- Integer division trap: in PostgreSQL (and SQL Server) \`75050 / 100\` is \`750\` (integer), while MySQL's \`/\` returns \`750.5000\`. Divide by \`100.0\` to get decimals everywhere.

**Worked example: show paid orders in rupees**

| id | status | total_rupees |
|---|---|---|
| 101 | paid | 500.00 |
| 103 | paid | 750.00 |
| 104 | paid | 300.00 |

**Common mistake:** comparing the rupee value shown in the UI (\`₹750.00\`) with \`total_paise\` directly. Convert one side first, and agree with the developer on which column is the source of truth (stored total vs recalculated from items).

**In interviews, say:** "I avoid \`SELECT *\` in automated checks; I select the exact columns I assert on, and I alias computed columns so the result is readable."`,
      code: [
        {
          language: 'sql',
          title: 'Columns, expressions and aliases',
          code: `-- every column of every order (quick exploration only)
SELECT * FROM orders;

-- chosen columns, a computed column and aliases
SELECT o.id,
       o.status,
       o.total_paise / 100.0 AS total_rupees   -- 100.0 forces decimal division
FROM orders AS o                               -- table alias "o"
WHERE o.status = 'paid';                       -- single quotes for text
-- id  | status | total_rupees
-- 101 | paid   | 500.00
-- 103 | paid   | 750.00
-- 104 | paid   | 300.00

-- string building: || in Postgres/standard, CONCAT() works in both
SELECT CONCAT(name, ' <', email, '>') AS display_name
FROM customers;
-- Asha <asha@shop.test>, Ravi <ravi@shop.test>, Meera <meera@shop.test>`,
        },
      ],
      keyPoints: [
        'Aliases (AS) name computed columns; table aliases shorten references.',
        'Single quotes = text; double quotes (Postgres) or backticks (MySQL) = identifiers.',
        'Use 100.0, not 100, to avoid integer division in Postgres.',
      ],
      source: 'SQLBolt — Lesson 1 SELECT queries, Lesson 9 Queries with expressions; PostgreSQL 17 docs — Mathematical Operators',
    },
    {
      heading: 'Filtering with WHERE: AND/OR, IN, BETWEEN and LIKE',
      body: `**Intuition:** \`WHERE\` is a bouncer at the door: each row is checked against the condition, and only rows for which it is **TRUE** get in.

**The operators you will use daily**
| Operator | Example | Notes |
|---|---|---|
| \`=\`, \`<>\` (or \`!=\`), \`<\`, \`>=\` | \`total_paise >= 50000\` | \`<>\` is standard; \`!=\` works in both MySQL and Postgres |
| \`AND\`, \`OR\`, \`NOT\` | \`status = 'paid' AND total_paise > 40000\` | **AND is evaluated before OR**: use brackets |
| \`IN (…)\` | \`city IN ('Pune', 'Delhi')\` | shorthand for several ORs |
| \`BETWEEN a AND b\` | \`total_paise BETWEEN 30000 AND 50000\` | **inclusive** on both ends |
| \`LIKE\` | \`email LIKE '%@shop.test'\` | \`%\` = any run of characters, \`_\` = exactly one character |
| \`IS NULL\` | \`coupon_code IS NULL\` | the only correct NULL test (next section) |

**Two traps that cause real bugs in QA checks**
1. **Precedence.** \`status = 'paid' OR status = 'cancelled' AND total_paise > 40000\` means \`paid OR (cancelled AND > 40000)\`, so it returns all three paid orders (101, 103, 104) rather than the intended 101 and 103.
2. **BETWEEN on timestamps.** \`created_at BETWEEN '2026-03-01' AND '2026-03-05'\` stops at \`2026-03-05 00:00:00\`, so order 103 (09:05 that day) is missed. Use a half-open range: \`>= '2026-03-01' AND < '2026-03-06'\`.

**Case sensitivity of LIKE:** in PostgreSQL \`LIKE\` is case-sensitive (use \`ILIKE\` or \`LOWER(email) LIKE …\`); in MySQL it follows the column collation, which is usually case-insensitive. A check that passes on one database can fail on the other.

**In interviews, say:** "I always bracket mixed AND/OR conditions and use half-open ranges for dates, because those are the two filters I've seen produce wrong counts."`,
      code: [
        {
          language: 'sql',
          title: 'WHERE in practice (results from the running dataset)',
          code: `-- 1. Precedence trap: AND binds first
SELECT id FROM orders
WHERE status = 'paid' OR status = 'cancelled' AND total_paise > 40000;
-- 101, 103, 104   (all paid orders, any amount)

SELECT id FROM orders
WHERE (status = 'paid' OR status = 'cancelled') AND total_paise > 40000;
-- 101, 103        (what was meant)

-- 2. IN as a list of ORs
SELECT name FROM customers WHERE city IN ('Pune', 'Delhi');
-- Ravi, Meera

-- 3. Dates: BETWEEN with a bare date stops at midnight
SELECT id FROM orders
WHERE created_at BETWEEN '2026-03-01' AND '2026-03-05';
-- 101, 102        (103 at 09:05 on 5 March is missed)

SELECT id FROM orders
WHERE created_at >= '2026-03-01' AND created_at < '2026-03-06';
-- 101, 102, 103   (half-open range, correct)

-- 4. LIKE patterns: % = many chars, _ = exactly one
SELECT name FROM customers WHERE email LIKE '%@shop.test';   -- all 3
SELECT name FROM customers WHERE name LIKE '_avi';           -- Ravi`,
        },
      ],
      keyPoints: [
        'WHERE keeps a row only when the condition is TRUE (not FALSE, not UNKNOWN).',
        'AND before OR: bracket every mixed condition.',
        'BETWEEN is inclusive; for timestamps prefer >= start AND < next day.',
        'LIKE is case-sensitive in Postgres, collation-dependent in MySQL.',
      ],
      source: 'SQLBolt — Lessons 2–3 Queries with constraints; Mode SQL Tutorial — Logical operators; PostgreSQL 17 docs — Pattern Matching (LIKE, ILIKE)',
    },
    {
      heading: 'ORDER BY, LIMIT and DISTINCT',
      body: `**Intuition:** \`ORDER BY\` sorts the final result, \`LIMIT\` cuts it to the first *n* rows, and \`DISTINCT\` removes repeated result rows.

**ORDER BY**
- Default is ascending (\`ASC\`); add \`DESC\` for highest/newest first. Several keys are allowed: \`ORDER BY status, total_paise DESC\`.
- **Where NULLs go differs by database.** PostgreSQL treats NULL as larger than any value: last in \`ASC\`, first in \`DESC\` (change with \`NULLS FIRST\`/\`NULLS LAST\`). MySQL puts NULLs first in \`ASC\` and last in \`DESC\`. A "sorted by customer" check can pass on one and fail on the other.

**LIMIT (and its cousins)**
| Database | First 2 rows | Skip 2, take 2 |
|---|---|---|
| PostgreSQL / MySQL / SQLite | \`LIMIT 2\` | \`LIMIT 2 OFFSET 2\` |
| SQL Server | \`SELECT TOP 2 …\` | \`OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY\` |
| Standard SQL / Oracle 12c+ / Postgres | \`FETCH FIRST 2 ROWS ONLY\` | \`OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY\` |

The PostgreSQL docs warn that \`LIMIT\` without an \`ORDER BY\` giving a **unique** order returns an unpredictable subset, which can change between runs. That is a classic source of flaky DB checks: "the latest order" must be \`ORDER BY created_at DESC, id DESC LIMIT 1\` (the \`id\` breaks ties).

**DISTINCT** applies to the **whole selected row**, not one column. \`SELECT DISTINCT customer_id\` returns 3 rows here (1, 2 and NULL): for DISTINCT, all NULLs count as one value. Using \`DISTINCT\` to "fix" unexpected duplicates hides bugs; find out *why* rows repeat first.

**In interviews, say:** "Whenever I use LIMIT I add an ORDER BY with a tie-breaker, otherwise the result is not deterministic."`,
      code: [
        {
          language: 'sql',
          title: 'Sorting, top-N and DISTINCT',
          code: `-- two most valuable orders
SELECT id, total_paise FROM orders
ORDER BY total_paise DESC
LIMIT 2;
-- 103 | 75000
-- 101 | 50000

-- the latest order, deterministic even if two share a timestamp
SELECT id, created_at FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 1;
-- 104 | 2026-03-06 21:30:00

-- NULL position differs: Postgres -> 101,102,103,104  MySQL -> 104,101,102,103
SELECT id, customer_id FROM orders ORDER BY customer_id;

-- portable fix: sort a "is it NULL?" flag first (FALSE < TRUE)
SELECT id, customer_id FROM orders
ORDER BY (customer_id IS NULL), customer_id;   -- NULLs last on both

-- DISTINCT works on the whole row
SELECT DISTINCT status FROM orders;              -- paid, cancelled (2 rows)
SELECT DISTINCT customer_id FROM orders;         -- 1, 2, NULL (3 rows)
SELECT DISTINCT customer_id, status FROM orders; -- 4 rows: (1,paid) (1,cancelled) (2,paid) (NULL,paid)`,
        },
      ],
      keyPoints: [
        'ORDER BY is the only thing that guarantees row order.',
        'NULL sort position: Postgres last in ASC, MySQL first in ASC.',
        'LIMIT/TOP/FETCH FIRST without a unique ORDER BY is non-deterministic.',
        'DISTINCT de-duplicates whole rows and treats NULLs as equal.',
      ],
      source: 'PostgreSQL 17 docs — SELECT: LIMIT clause and ORDER BY (NULLS FIRST/LAST); MySQL 8.0 Manual — Problems with NULL Values; SQLBolt — Lesson 4 Filtering and sorting',
    },
    {
      heading: 'NULL handling: IS NULL, COALESCE and three-valued logic',
      body: `**Intuition:** NULL is not zero and not an empty string; it means "we don't know". Asking "is unknown equal to 5?" can only be answered with "unknown". SQL calls this third answer **UNKNOWN**, and \`WHERE\` throws UNKNOWN rows away just like FALSE ones.

**Three-valued logic in one table**
| Expression | Result | Why |
|---|---|---|
| \`NULL = NULL\` | UNKNOWN | two unknowns are not known to be equal |
| \`coupon_code = NULL\` | UNKNOWN for every row | so \`WHERE coupon_code = NULL\` returns 0 rows |
| \`coupon_code IS NULL\` | TRUE / FALSE | the correct test |
| \`coupon_code <> 'SAVE10'\` | UNKNOWN when coupon is NULL | so rows without a coupon disappear |
| \`TRUE AND UNKNOWN\` | UNKNOWN | |
| \`TRUE OR UNKNOWN\` | TRUE | one TRUE is enough for OR |
| \`50000 + NULL\` | NULL | arithmetic with NULL gives NULL |

**Tools for NULLs**
- \`IS NULL\` / \`IS NOT NULL\` for tests.
- \`COALESCE(a, b, …)\` returns the first non-NULL argument: \`COALESCE(coupon_code, 'NONE')\`, \`COALESCE(SUM(x), 0)\`.
- \`NULLIF(a, b)\` returns NULL when a = b: \`NULLIF(phone, '')\` turns empty strings into NULL so one test covers both.
- NULL-safe equality: \`a IS NOT DISTINCT FROM b\` (Postgres, SQL standard), \`a <=> b\` (MySQL).

**NULL vs empty string.** Ravi's phone is NULL (never captured), Meera's is \`''\` (captured as blank). A requirement like "phone is mandatory" must be checked against **both**. (Oracle is the odd one out: it stores \`''\` as NULL.)

**Worked example: "orders that did not use SAVE10"**. The obvious \`WHERE coupon_code <> 'SAVE10'\` returns **0 rows**, because 101 and 104 have a NULL coupon. The correct answer is 101 and 104.

**In interviews, say:** "NULL comparisons give UNKNOWN, and WHERE keeps only TRUE, so I use IS NULL, and when a column is nullable I think about which side of the filter NULLs should fall on."`,
      code: [
        {
          language: 'sql',
          title: 'NULL tests on the running dataset',
          code: `SELECT id FROM orders WHERE coupon_code = NULL;        -- 0 rows (never TRUE)
SELECT id FROM orders WHERE coupon_code IS NULL;       -- 101, 104

-- "orders not using SAVE10": the naive filter loses NULL rows
SELECT id FROM orders WHERE coupon_code <> 'SAVE10';   -- 0 rows!
SELECT id FROM orders
WHERE coupon_code IS NULL OR coupon_code <> 'SAVE10';  -- 101, 104
-- Postgres only:  WHERE coupon_code IS DISTINCT FROM 'SAVE10'
-- MySQL only:     WHERE NOT (coupon_code <=> 'SAVE10')

-- replace NULL for display
SELECT id, COALESCE(coupon_code, 'NONE') AS coupon FROM orders;
-- 101 NONE | 102 SAVE10 | 103 SAVE10 | 104 NONE

-- "phone missing" must cover NULL and ''
SELECT name FROM customers WHERE phone IS NULL;               -- Ravi
SELECT name FROM customers WHERE phone = '';                  -- Meera
SELECT name FROM customers WHERE NULLIF(phone, '') IS NULL;   -- Ravi, Meera`,
        },
      ],
      keyPoints: [
        'Any comparison with NULL is UNKNOWN; WHERE drops UNKNOWN.',
        'Negative filters (<>, NOT IN) silently exclude NULL rows.',
        'COALESCE picks the first non-NULL; NULLIF turns a value into NULL.',
        'NULL and \'\' are different in MySQL and Postgres; check both for "missing".',
      ],
      source: 'PostgreSQL 17 docs — 9.2 Comparison Functions and Operators, Conditional Expressions; MySQL 8.0 Manual — Problems with NULL Values',
    },
    {
      heading: 'Aggregates: COUNT, SUM, AVG, MIN, MAX',
      body: `**Intuition:** an aggregate squeezes many rows into one number, the way a cashier totals a bill. Without \`GROUP BY\`, the whole table is one bill.

**The rules that make or break a check**
| Function | Counts / uses | NULL behaviour |
|---|---|---|
| \`COUNT(*)\` | every row | counts rows even if all columns are NULL |
| \`COUNT(col)\` | rows where \`col\` is not NULL | skips NULLs |
| \`COUNT(DISTINCT col)\` | distinct non-NULL values | skips NULLs |
| \`SUM(col)\`, \`AVG(col)\` | non-NULL values | skip NULLs; **SUM of zero rows is NULL, not 0** |
| \`MIN(col)\`, \`MAX(col)\` | non-NULL values | skip NULLs; work on text and dates too |

On our orders: \`COUNT(*) = 4\`, \`COUNT(customer_id) = 3\` (guest order skipped), \`COUNT(DISTINCT customer_id) = 2\`, \`COUNT(coupon_code) = 2\`.

**The AVG trap.** If three products have ratings 5, 3 and NULL, \`AVG(rating)\` is 4, not 2.67, because NULL is skipped rather than treated as 0. Whether that is right is a **requirement question**: should an unrated product drag the average down? Ask.

**The empty-SUM trap.** \`SELECT SUM(total_paise) FROM orders WHERE status = 'refunded'\` returns NULL, and a test that does \`expect(row.sum).toBe(0)\` fails. Use \`COALESCE(SUM(total_paise), 0)\`.

**MIN/MAX as test oracles.** Interviewers like "how would you verify the price filter?": compare \`MIN(price)\`/\`MAX(price)\` for the category with the UI's slider limits.

**In interviews, say:** "COUNT(*) counts rows, COUNT(column) counts known values. I pick deliberately, because the difference is exactly the NULLs."`,
      code: [
        {
          language: 'sql',
          title: 'One-row summaries of the orders table',
          code: `SELECT COUNT(*)                    AS all_orders,       -- 4
       COUNT(customer_id)          AS with_customer,    -- 3 (guest skipped)
       COUNT(DISTINCT customer_id) AS customers,        -- 2 (Asha, Ravi)
       COUNT(coupon_code)          AS used_coupon,      -- 2
       SUM(total_paise)            AS gross_paise,      -- 175000
       AVG(total_paise)            AS avg_paise,        -- 43750
       MIN(created_at)             AS first_order,      -- 2026-03-01 10:15
       MAX(total_paise)            AS biggest           -- 75000
FROM orders;

-- SUM over no rows is NULL; COALESCE makes it 0
SELECT SUM(total_paise)              AS raw,      -- NULL
       COALESCE(SUM(total_paise), 0) AS safe      -- 0
FROM orders
WHERE status = 'refunded';

-- percentage of orders with a coupon
SELECT 100.0 * COUNT(coupon_code) / COUNT(*) AS coupon_pct  -- 50.0
FROM orders;
-- COUNT(coupon_code) / COUNT(*) alone is 0 in Postgres (integer division)`,
        },
      ],
      keyPoints: [
        'COUNT(*) vs COUNT(col): the difference is the NULL rows.',
        'Aggregates other than COUNT(*) ignore NULLs.',
        'SUM/AVG/MAX of zero rows is NULL; COUNT of zero rows is 0.',
      ],
      source: 'PostgreSQL 17 docs — Aggregate Functions; MySQL 8.0 Manual — Problems with NULL Values; SQLBolt — Lesson 10 Queries with aggregates',
    },
    {
      heading: 'GROUP BY and HAVING: counts by status and per customer',
      body: `**Intuition:** \`GROUP BY status\` sorts the rows into buckets (one per status) and then runs the aggregate once per bucket. \`HAVING\` is a \`WHERE\` for buckets.

**Rules**
1. Every column in \`SELECT\` that is not inside an aggregate must appear in \`GROUP BY\`. PostgreSQL enforces this (it allows columns that are functionally dependent on a grouped primary key). MySQL enforces it through \`ONLY_FULL_GROUP_BY\`, on by default since 5.7.5; with it switched off, MySQL silently returns an arbitrary value from each group, which makes checks non-deterministic. \`ANY_VALUE(col)\` is MySQL's explicit opt-out.
2. **WHERE vs HAVING:** \`WHERE\` removes rows *before* grouping and cannot use aggregates; \`HAVING\` removes groups *after* aggregation. Put plain row filters in \`WHERE\` (cheaper, clearer) and aggregate conditions in \`HAVING\`.
3. All NULLs form **one group** (the guest order gets its own NULL bucket).

**Worked example: order counts by status (a typical dashboard reconciliation)**
| status | orders | gross_paise |
|---|---|---|
| cancelled | 1 | 20000 |
| paid | 3 | 155000 |

**Worked example: customers with more than one order**: only \`customer_id = 1\` (Asha, 2 orders).

**MySQL extension:** MySQL lets \`HAVING\` refer to a \`SELECT\` alias (\`HAVING order_count > 1\`); PostgreSQL rejects it. Repeat the aggregate (\`HAVING COUNT(*) > 1\`) to stay portable.

**In interviews, say:** "WHERE filters rows, HAVING filters groups. If the condition has COUNT or SUM in it, it goes in HAVING."`,
      code: [
        {
          language: 'sql',
          title: 'Group, aggregate, filter groups',
          code: `-- counts and money per status
SELECT status, COUNT(*) AS orders, SUM(total_paise) AS gross_paise
FROM orders
GROUP BY status
ORDER BY status;
-- cancelled | 1 | 20000
-- paid      | 3 | 155000

-- orders per customer; the guest order forms its own NULL group
SELECT customer_id, COUNT(*) AS orders
FROM orders
GROUP BY customer_id;
-- 1 | 2      2 | 1      NULL | 1

-- customers with more than one order (aggregate condition -> HAVING)
SELECT customer_id, COUNT(*) AS orders
FROM orders
WHERE customer_id IS NOT NULL        -- row filter -> WHERE
GROUP BY customer_id
HAVING COUNT(*) > 1;                 -- group filter -> HAVING
-- 1 | 2

-- ERROR in Postgres / MySQL with ONLY_FULL_GROUP_BY:
-- SELECT customer_id, status, COUNT(*) FROM orders GROUP BY customer_id;
-- "status" is neither grouped nor aggregated`,
        },
      ],
      keyPoints: [
        'Non-aggregated SELECT columns must be in GROUP BY.',
        'WHERE = before grouping, no aggregates; HAVING = after grouping, aggregates allowed.',
        'NULLs group together into one bucket.',
        'Alias in HAVING works in MySQL only; repeat the aggregate for portability.',
      ],
      source: 'MySQL 8.0 Manual — MySQL Handling of GROUP BY; PostgreSQL 17 docs — SELECT: GROUP BY and HAVING clauses; SQLBolt — Lesson 11 Queries with aggregates (Pt. 2)',
    },
    {
      heading: 'Logical query processing order: why an alias fails in WHERE',
      body: `**Intuition:** you *write* a query starting with \`SELECT\`, but the database *thinks* about it starting with \`FROM\`. It is like cooking: you announce the dish first, but you start by getting ingredients (FROM), throwing away bad ones (WHERE), sorting them into bowls (GROUP BY), and only then plating (SELECT).

**The logical order** (what each clause can "see" depends on it)
| Step | Clause | Can use SELECT aliases? | Can use aggregates? |
|---|---|---|---|
| 1 | FROM / JOIN | no | no |
| 2 | WHERE | no | no |
| 3 | GROUP BY | no (Postgres and MySQL allow it as an extension) | no |
| 4 | HAVING | no (MySQL allows it as an extension) | yes |
| 5 | SELECT (expressions, aliases created here) | — | yes |
| 6 | DISTINCT | — | — |
| 7 | ORDER BY | **yes** | yes |
| 8 | LIMIT / OFFSET | — | — |

**What this explains**
- \`WHERE total_rupees > 400\` fails ("column does not exist" in Postgres, "Unknown column … in 'where clause'" in MySQL), because the alias is born at step 5. Repeat the expression in WHERE or wrap the query in a subquery.
- \`WHERE COUNT(*) > 1\` fails: groups do not exist yet at step 2.
- \`ORDER BY total_rupees\` works: sorting happens after SELECT.
- \`LIMIT\` runs last, after sorting, so "top 2" is computed on sorted data.

This is the **logical** order that defines the result. The optimizer is free to execute it physically in another order (using indexes, pushing filters down) as long as the result is the same.

**In interviews, say:** "FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. That's why aliases aren't visible in WHERE but are in ORDER BY." The interactive animation below steps through a real query clause by clause.`,
      diagram: `  written order               logical (evaluation) order
  -------------               --------------------------
  SELECT  ....        (5)     1  FROM / JOIN   build the row set
  FROM    ....        (1)     2  WHERE         keep rows where TRUE
  WHERE   ....        (2)     3  GROUP BY      make buckets
  GROUP BY ...        (3)     4  HAVING        keep buckets where TRUE
  HAVING  ....        (4)     5  SELECT        compute columns, aliases
  ORDER BY ...        (7)     6  DISTINCT      drop duplicate rows
  LIMIT   ....        (8)     7  ORDER BY      sort (aliases visible)
                              8  LIMIT         cut to n rows`,
      code: [
        {
          language: 'sql',
          title: 'Alias visibility follows the logical order',
          code: `-- FAILS: total_rupees is created in SELECT (step 5), WHERE runs at step 2
SELECT id, total_paise / 100.0 AS total_rupees
FROM orders
WHERE total_rupees > 400;

-- Fix 1: repeat the expression (or filter on the raw column)
SELECT id, total_paise / 100.0 AS total_rupees
FROM orders
WHERE total_paise > 40000;                 -- 101, 103

-- Fix 2: filter outside a subquery, where the alias already exists
SELECT *
FROM (SELECT id, total_paise / 100.0 AS total_rupees FROM orders) AS t
WHERE t.total_rupees > 400;                -- 101, 103

-- WORKS: ORDER BY (step 7) runs after SELECT
SELECT id, total_paise / 100.0 AS total_rupees
FROM orders
ORDER BY total_rupees DESC;                -- 103, 101, 104, 102`,
        },
      ],
      keyPoints: [
        'FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT.',
        'Aliases are invisible in WHERE; visible in ORDER BY.',
        'Aggregates are not allowed in WHERE; use HAVING.',
        'Logical order defines the answer; the physical plan may differ.',
      ],
      source: 'PostgreSQL 17 docs — SELECT (Description: processing order); SQLBolt — Lesson 12 Order of execution of a Query; Itzik Ben-Gan — Logical Query Processing',
    },
    {
      heading: 'Everyday QA queries: duplicates, counts by status, missing and invalid data',
      body: `**Intuition:** most SQL a tester writes is a handful of patterns. Learn the patterns and you can answer "write a query to…" interview questions without memorising each one.

**The pattern library**
| Question | Pattern |
|---|---|
| Are there duplicates? | \`GROUP BY key HAVING COUNT(*) > 1\` |
| Show the full duplicate rows | join back to the duplicate keys, or \`ROW_NUMBER() OVER (PARTITION BY key ORDER BY id)\` > 1 |
| Counts per status/type | \`GROUP BY status\` |
| Mandatory field missing | \`WHERE col IS NULL OR col = ''\` |
| Invalid values | \`WHERE status NOT IN ('pending','paid','cancelled','refunded')\` (careful if status can be NULL) |
| Out-of-range | \`WHERE total_paise <= 0 OR quantity > 10\` |
| Latest N | \`ORDER BY created_at DESC, id DESC LIMIT n\` |
| Freshness | \`MAX(created_at)\` vs now |

**Worked example: double-charged payments.** A customer complains about a double charge for order 103. The \`payments\` table stores the gateway reference (unique per real charge):

| id | order_id | amount_paise | gateway_ref |
|---|---|---|---|
| 1 | 101 | 50000 | pay_A1 |
| 2 | 103 | 75000 | pay_B7 |
| 3 | 103 | 75000 | pay_B7 |
| 4 | 104 | 30000 | pay_C3 |

\`GROUP BY gateway_ref HAVING COUNT(*) > 1\` returns \`pay_B7 | 2\`. Choosing the **right key** is the actual skill: grouping by \`order_id\` would also flag legitimate split payments, and grouping by every column would miss duplicates that differ only by \`id\` or timestamp. The bug report should say "two rows (ids 2 and 3) for one gateway charge; missing UNIQUE constraint on gateway_ref".

**In interviews, say:** "To find duplicates I first decide what makes a record unique for the business, group by that, keep groups with count above one, then join back to see the rows."`,
      code: [
        {
          language: 'sql',
          title: 'Duplicate detection and data-quality checks',
          code: `-- 1. Which gateway charges were recorded more than once?
SELECT gateway_ref, COUNT(*) AS copies
FROM payments
GROUP BY gateway_ref
HAVING COUNT(*) > 1;
-- pay_B7 | 2

-- 2. Show the full duplicate rows (portable: join back)
SELECT p.*
FROM payments p
JOIN (SELECT gateway_ref FROM payments
      GROUP BY gateway_ref HAVING COUNT(*) > 1) d
  ON d.gateway_ref = p.gateway_ref
ORDER BY p.gateway_ref, p.id;
-- 2 | 103 | 75000 | pay_B7
-- 3 | 103 | 75000 | pay_B7

-- 3. Only the extra copies (window function: Postgres, MySQL 8+)
SELECT id, gateway_ref
FROM (SELECT id, gateway_ref,
             ROW_NUMBER() OVER (PARTITION BY gateway_ref ORDER BY id) AS rn
      FROM payments) t
WHERE rn > 1;                                   -- 3 | pay_B7

-- 4. Data-quality sweep on customers and orders
SELECT name FROM customers WHERE phone IS NULL OR phone = '';  -- Ravi, Meera
SELECT id FROM orders
WHERE status NOT IN ('pending', 'paid', 'cancelled', 'refunded')
   OR total_paise <= 0;                                        -- none`,
        },
      ],
      keyPoints: [
        'Pick the business key first; duplicates are defined by it.',
        'HAVING COUNT(*) > 1 finds keys; join back or ROW_NUMBER to list rows.',
        'A found duplicate is also a missing-constraint finding.',
      ],
      source: 'LearnSQL.com — Software Testing SQL Interview Questions; Glassdoor software QA tester interview reports; PostgreSQL 17 docs — Window Functions',
    },
    {
      heading: 'Writing queries safely and across dialects',
      body: `**Intuition:** your query is a test tool, so it needs the same care as a test: it must be correct, repeatable, and must not damage the environment.

**Safety habits**
- Use a **read-only** DB user for verification; changes go through a separate, deliberate step (next topic).
- On big tables, look before you scan: \`LIMIT 50\` while exploring, filter on indexed columns (ids, dates), avoid \`LIKE '%x%'\` on millions of rows in shared environments.
- In automation, pass values as **parameters** (\`$1\` in node-postgres, \`?\` in mysql2), never by string-concatenating user input; it avoids SQL injection and quoting bugs.
- Make results deterministic: \`ORDER BY\` with a tie-breaker before you compare lists.
- Compare like with like: money in minor units, timestamps in the same time zone (many apps store UTC and display IST, so an order at 01:30 IST belongs to the previous UTC day).

**Dialect differences that bite testers**
| Need | PostgreSQL | MySQL 8 | SQL Server |
|---|---|---|---|
| First n rows | \`LIMIT n\` | \`LIMIT n\` | \`TOP n\` |
| Case-insensitive match | \`ILIKE\` | \`LIKE\` (default collations) | \`LIKE\` (default collations) |
| Concatenate | \`a || b\`, \`CONCAT\` | \`CONCAT\` (\`||\` is OR by default) | \`a + b\`, \`CONCAT\` |
| NULL-safe equals | \`IS NOT DISTINCT FROM\` | \`<=>\` | \`IS NOT DISTINCT FROM\` (2022+) |
| Integer division 7/2 | 3 | 3.5000 | 3 |
| Current time | \`now()\` | \`NOW()\` | \`SYSDATETIME()\` |
| Quote an identifier | \`"order"\` | backticks | \`[order]\` |

**In interviews, say:** "I've used MySQL/Postgres; the SQL is mostly the same, and I watch out for LIMIT vs TOP, case sensitivity, NULL ordering and integer division."`,
      code: [
        {
          language: 'sql',
          title: 'A safe, repeatable verification query',
          code: `-- Verify the 5 newest paid orders of one customer, in rupees, in IST.
-- Read-only, bounded, deterministic and parameter-ready ($1 = customer id).
SELECT o.id,
       o.total_paise / 100.0 AS total_rupees,
       o.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' AS created_ist
FROM orders o
WHERE o.customer_id = $1                 -- in mysql2 this placeholder is ?
  AND o.status = 'paid'
ORDER BY o.created_at DESC, o.id DESC    -- tie-breaker for determinism
LIMIT 5;
-- with $1 = 1:  101 | 500.00 | 2026-03-01 15:45  (stored 10:15 UTC)

-- MySQL equivalent of the time-zone conversion:
-- CONVERT_TZ(o.created_at, '+00:00', '+05:30')`,
        },
      ],
      keyPoints: [
        'Read-only user, bounded queries, parameters instead of string building.',
        'Normalise units and time zones before comparing with the UI.',
        'Know the handful of dialect differences rather than memorising whole dialects.',
      ],
      source: 'PostgreSQL 17 docs — Date/Time Functions (AT TIME ZONE); MySQL 8.0 Manual — Date and Time Functions (CONVERT_TZ); node-postgres docs — Queries (parameterized query)',
    },
  ],
  codeChallenges: [
    {
      id: 'sql-querying-cc-1',
      title: 'Fix the daily order health-check script',
      context:
        'A manual tester wrote these four checks to run every morning on the QA database. Check 1 always reports 0, check 2 misses orders, check 3 throws an error, and check 4 never finds anything. Use the running dataset (orders 101–104).',
      task: 'Rewrite each query so it answers the question in its comment correctly on PostgreSQL and MySQL. Write the expected result on the running dataset next to each fix.',
      starter: {
        language: 'sql',
        code: `-- 1. How many orders were placed WITHOUT a coupon?
SELECT COUNT(coupon_code) FROM orders WHERE coupon_code = NULL;

-- 2. Orders placed on 5 March 2026 (created_at is a TIMESTAMP)
SELECT id FROM orders
WHERE created_at BETWEEN '2026-03-05' AND '2026-03-05';

-- 3. Customers with more than one order
SELECT customer_id, COUNT(*) AS order_count
FROM orders
WHERE order_count > 1
GROUP BY customer_id;

-- 4. Orders that did NOT use coupon SAVE10
SELECT id FROM orders WHERE coupon_code != 'SAVE10';`,
      },
      hints: [
        'Two of the bugs are about NULL: a comparison with NULL is never TRUE, and COUNT(column) skips NULLs.',
        'A bare date in a timestamp comparison means midnight. Think of a half-open range.',
        'Which clause runs before SELECT creates the alias, and which clause filters groups?',
      ],
      solution: {
        language: 'sql',
        code: `-- 1. Use IS NULL, and COUNT(*) because COUNT(coupon_code) of NULLs is 0
SELECT COUNT(*) AS no_coupon
FROM orders
WHERE coupon_code IS NULL;                         -- 2 (orders 101, 104)

-- 2. Half-open range covers the whole day
SELECT id FROM orders
WHERE created_at >= '2026-03-05'
  AND created_at <  '2026-03-06';                  -- 103

-- 3. Aggregate condition goes in HAVING; skip guest orders explicitly
SELECT customer_id, COUNT(*) AS order_count
FROM orders
WHERE customer_id IS NOT NULL
GROUP BY customer_id
HAVING COUNT(*) > 1;                               -- 1 | 2

-- 4. Keep the NULL-coupon rows on purpose
SELECT id FROM orders
WHERE coupon_code IS NULL
   OR coupon_code <> 'SAVE10';                     -- 101, 104`,
      },
      explanation: `**Fixes**
1. \`coupon_code = NULL\` is UNKNOWN for every row, so the query returned 0 whatever the data. Even with \`IS NULL\`, \`COUNT(coupon_code)\` would still be 0 because it counts only non-NULL coupon values. \`COUNT(*)\` counts the rows.
2. \`BETWEEN '2026-03-05' AND '2026-03-05'\` matches only the instant \`2026-03-05 00:00:00\`. A half-open range \`>= day AND < next day\` covers the whole day and is index-friendly (wrapping the column in \`DATE(created_at)\` also works but can stop index use).
3. The alias \`order_count\` does not exist when WHERE runs, and aggregates cannot be used in WHERE at all. Group filters belong in HAVING. Excluding NULL customers states the intent (guest orders are not "a customer").
4. \`!= 'SAVE10'\` is UNKNOWN for NULL coupons, so 101 and 104 vanished and the result was empty. Include NULLs explicitly (or use \`IS DISTINCT FROM\` in Postgres, \`NOT (coupon_code <=> 'SAVE10')\` in MySQL).

**Testing lesson:** a check that always returns 0 or "no rows" looks like a pass. Validate your checks against data where you *know* the answer.`,
      followUps: [
        {
          q: 'How would you prove your fixed check 1 is right and not just returning a different wrong number?',
          a: 'Run it against data with a known answer. Insert (or find) one order with a NULL coupon and one with a coupon, count by hand, and confirm the query matches. Also cross-check with an independent query: COUNT(*) minus COUNT(coupon_code) over the whole table must equal the result, here 4 − 2 = 2.',
        },
        {
          q: 'What if the business says an empty string coupon also means "no coupon"?',
          a: 'Then the filter must cover both: WHERE coupon_code IS NULL OR coupon_code = \'\', or NULLIF(coupon_code, \'\') IS NULL. I would also raise it as a data-consistency issue: two representations of "no coupon" invite bugs, so the app should store one of them (usually NULL) and a CHECK constraint could enforce it.',
        },
      ],
    },
    {
      id: 'sql-querying-cc-2',
      title: 'Dashboard numbers that do not match the admin panel',
      context:
        'Your team compares the admin dashboard tiles against SQL. The person who wrote these queries ran them on PostgreSQL. The coupon share shows 0%, "latest 3 orders" differs between runs, and the duplicate-payment check errors out. Tables: orders (running dataset) and payments (id, order_id, amount_paise, gateway_ref, with a duplicated pay_B7).',
      task: 'Find every defect, fix the queries, and state what each fixed query returns on the sample data.',
      starter: {
        language: 'sql',
        code: `-- Tile 1: share of orders that used a coupon (%)
SELECT COUNT(coupon_code) / COUNT(*) * 100 AS coupon_pct
FROM orders;

-- Tile 2: latest 3 orders
SELECT id, status, created_at
FROM orders
LIMIT 3;

-- Tile 3: duplicate payments
SELECT order_id, gateway_ref, COUNT(*)
FROM payments
GROUP BY order_id;

-- Tile 4: revenue from refunded orders (expected 0 today)
SELECT SUM(total_paise) AS refunded_paise
FROM orders
WHERE status = 'refunded';`,
      },
      hints: [
        'What is 2 / 4 when both sides are integers in PostgreSQL?',
        'Which clause guarantees the order of rows, and what happens if two orders share a created_at?',
        'Every non-aggregated column must be grouped, and the grouping key must be the thing that is supposed to be unique.',
      ],
      solution: {
        language: 'sql',
        code: `-- Tile 1: force decimal arithmetic before dividing
SELECT ROUND(100.0 * COUNT(coupon_code) / COUNT(*), 1) AS coupon_pct
FROM orders;                                     -- 50.0

-- Tile 2: explicit, deterministic order
SELECT id, status, created_at
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 3;                                         -- 104, 103, 102

-- Tile 3: group by the business key that must be unique
SELECT gateway_ref, COUNT(*) AS copies,
       MIN(order_id) AS order_id                 -- same order in each copy
FROM payments
GROUP BY gateway_ref
HAVING COUNT(*) > 1;                             -- pay_B7 | 2 | 103

-- Tile 4: SUM of zero rows is NULL; the tile should show 0
SELECT COALESCE(SUM(total_paise), 0) AS refunded_paise
FROM orders
WHERE status = 'refunded';                       -- 0`,
      },
      explanation: `**Fixes**
1. \`COUNT(coupon_code) / COUNT(*)\` is \`2 / 4\`, which PostgreSQL evaluates as integer division = **0**, then \`* 100\` = 0. Multiplying by \`100.0\` first makes it decimal (50.0). In MySQL the original would have shown 50.0000, which is why the bug "only happens on prod" if prod and QA use different engines.
2. \`LIMIT\` without \`ORDER BY\` returns whatever order the plan produces; it can change between runs. \`ORDER BY created_at DESC, id DESC\` makes "latest" explicit and stable even when timestamps tie.
3. \`gateway_ref\` was neither grouped nor aggregated (error in Postgres, and in MySQL with ONLY_FULL_GROUP_BY), and grouping by \`order_id\` would flag legitimate split payments while still missing the point. A gateway charge is identified by \`gateway_ref\`; \`HAVING COUNT(*) > 1\` keeps only real duplicates.
4. With no refunded orders, \`SUM\` returns NULL, which the dashboard or an automated assertion may render as blank or fail on. \`COALESCE(…, 0)\` returns the expected 0.

**Review lesson:** dashboard reconciliation bugs are usually *definition* bugs (what is counted, which key, which time zone), so write each tile's definition next to its query.`,
      followUps: [
        {
          q: 'The dashboard shows 51 orders "today" but your query says 47. What do you check first?',
          a: 'The definition of "today": the dashboard may use IST while the DB stores UTC, so the day boundaries differ by 5h30m. Then the filters: does the tile include cancelled or test orders, guest orders, or only paid ones? Then freshness: is the dashboard reading a replica, cache or nightly aggregate? I would recount with the exact same definition before raising a bug.',
        },
        {
          q: 'How would you make tile 3 impossible to regress?',
          a: 'Recommend a UNIQUE constraint on payments.gateway_ref so the database itself rejects the second insert, and add an automated check (API or DB) that replays the same gateway webhook twice and asserts there is still one payment row. The query stays as a monitoring check for legacy data.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'sql-querying-iq-01',
      difficulty: 'easy',
      question: 'What is the difference between WHERE and HAVING? Give an example from an e-commerce app.',
      whatInterviewerLooksFor: [
        'Says WHERE filters rows before grouping and HAVING filters groups after aggregation',
        'Knows aggregates cannot appear in WHERE',
        'Gives a concrete query, not just definitions',
        'Mentions that row filters belong in WHERE for clarity and performance',
      ],
      modelAnswer: `**Short answer:** WHERE filters individual rows *before* \`GROUP BY\`; HAVING filters the groups *after* the aggregates are computed. So aggregate conditions (\`COUNT(*) > 1\`, \`SUM(total) > 100000\`) go in HAVING, and plain column conditions go in WHERE.

**Example: customers with more than one paid order**
- \`WHERE status = 'paid'\` throws away cancelled orders row by row.
- \`GROUP BY customer_id\` makes one bucket per customer.
- \`HAVING COUNT(*) > 1\` keeps only buckets with two or more rows.

Writing \`WHERE COUNT(*) > 1\` is an error because, in the logical order (FROM → WHERE → GROUP BY → HAVING → SELECT), groups do not exist yet when WHERE runs.

**Could I put \`status = 'paid'\` in HAVING instead?** In some databases it works if status is grouped, but it is the wrong place: WHERE reduces rows before grouping, which is clearer and cheaper.

**How I use it in testing:** reconciling a dashboard tile like "customers with repeat purchases this month": WHERE for the month and status, HAVING for the count.`,
      followUps: [
        {
          q: 'Can you use HAVING without GROUP BY?',
          a: 'Yes. Then the whole result is treated as one group. For example SELECT COUNT(*) FROM orders HAVING COUNT(*) > 0 returns one row only if the table has orders. It is rare in practice, but it shows that HAVING is about groups, not about the GROUP BY keyword.',
        },
        {
          q: 'Can you use a SELECT alias in HAVING?',
          a: 'In MySQL, yes, as an extension (HAVING order_count > 1). PostgreSQL rejects it because HAVING is evaluated before SELECT creates the alias. For portable SQL I repeat the aggregate: HAVING COUNT(*) > 1.',
        },
      ],
      pitfalls: [
        'Saying "HAVING is the same as WHERE but slower"',
        'Putting an aggregate in WHERE',
        'Only reciting a definition without an example',
      ],
    },
    {
      id: 'sql-querying-iq-02',
      difficulty: 'medium',
      question: 'Write a query to find duplicate records in a table. Then show me the duplicate rows themselves.',
      context: 'One of the most frequently reported SQL tasks in tester interviews (Glassdoor QA/manual-tester reports, LearnSQL and GeeksforGeeks question lists). Use a payments table with a gateway_ref column.',
      whatInterviewerLooksFor: [
        'Asks or states what makes a record a duplicate (the business key)',
        'Uses GROUP BY + HAVING COUNT(*) > 1 correctly',
        'Can list the full rows (join back or ROW_NUMBER)',
        'Connects the finding to a missing UNIQUE constraint or an idempotency bug',
      ],
      modelAnswer: `**Step 1: define "duplicate".** In a payments table the real-world charge is identified by \`gateway_ref\`, so two rows with the same \`gateway_ref\` are a duplicate even though their \`id\` differs. (For customers it might be \`LOWER(email)\`.)

**Step 2: find duplicate keys**
- \`SELECT gateway_ref, COUNT(*) FROM payments GROUP BY gateway_ref HAVING COUNT(*) > 1;\` gives \`pay_B7 | 2\`.

**Step 3: show the rows.** Join the keys back to the table:
- \`SELECT p.* FROM payments p JOIN (SELECT gateway_ref FROM payments GROUP BY gateway_ref HAVING COUNT(*) > 1) d ON d.gateway_ref = p.gateway_ref ORDER BY p.gateway_ref, p.id;\`

Or, on Postgres/MySQL 8, number the copies: \`ROW_NUMBER() OVER (PARTITION BY gateway_ref ORDER BY id)\` and keep \`rn > 1\` to see only the extra copies (useful before a cleanup).

**Step 4: report it like a tester.** "Payments 2 and 3 share gateway_ref pay_B7 for order 103: the customer was recorded as charged twice. Probable cause: the payment webhook is not idempotent and there is no UNIQUE constraint on gateway_ref." Then I'd add a test that sends the same webhook twice.

**Watch out:** \`SELECT DISTINCT\` hides duplicates instead of finding them, and grouping by every column misses duplicates that differ only by id or timestamp.`,
      followUps: [
        {
          q: 'How would you delete the duplicates but keep one copy?',
          a: 'First in a transaction and after previewing the rows. Postgres: DELETE FROM payments p USING payments q WHERE p.gateway_ref = q.gateway_ref AND p.id > q.id; keeps the lowest id per gateway_ref. MySQL: DELETE p FROM payments p JOIN payments q ON p.gateway_ref = q.gateway_ref AND p.id > q.id. Check the affected row count matches the preview before COMMIT.',
        },
        {
          q: 'Emails Asha@shop.test and asha@shop.test both exist. Does your query catch them?',
          a: 'Not if I group by the raw column on a case-sensitive database like Postgres. I would group by LOWER(TRIM(email)) to catch case and whitespace variants. On MySQL with a case-insensitive collation, a plain GROUP BY email already treats them as equal, which is another dialect difference worth knowing.',
        },
      ],
      pitfalls: [
        'Using SELECT DISTINCT to "find" duplicates',
        'GROUP BY on all columns including the primary key, which makes every group size 1',
        'Writing WHERE COUNT(*) > 1',
      ],
    },
    {
      id: 'sql-querying-iq-03',
      difficulty: 'easy',
      question: 'What is the difference between COUNT(*), COUNT(column) and COUNT(DISTINCT column)?',
      whatInterviewerLooksFor: [
        'COUNT(*) counts rows, COUNT(col) skips NULLs, COUNT(DISTINCT col) counts unique non-NULL values',
        'Gives numbers on a concrete dataset',
        'Relates it to a real bug (e.g. LEFT JOIN counts, optional columns)',
      ],
      modelAnswer: `**Definitions**
- \`COUNT(*)\` counts **rows**, whatever they contain.
- \`COUNT(col)\` counts rows where \`col\` **is not NULL**.
- \`COUNT(DISTINCT col)\` counts **different non-NULL values** of \`col\`.

**On our orders table** (101 and 102 by customer 1, 103 by customer 2, 104 guest with \`customer_id\` NULL):
| Expression | Result |
|---|---|
| \`COUNT(*)\` | 4 |
| \`COUNT(customer_id)\` | 3 |
| \`COUNT(DISTINCT customer_id)\` | 2 |

So "how many customers ordered?" is 2, "how many orders?" is 4, and "how many orders belong to a registered customer?" is 3. Picking the wrong one gives a wrong but plausible number, which is the worst kind of bug in a report.

**Where it matters in testing**
- Optional columns: \`COUNT(coupon_code)\` = orders that used a coupon.
- With a LEFT JOIN, a customer with no orders still produces one row, so \`COUNT(*)\` says 1 while \`COUNT(o.id)\` correctly says 0.
- Note \`SELECT DISTINCT customer_id\` returns 3 rows (NULL is one distinct value) while \`COUNT(DISTINCT customer_id)\` is 2: DISTINCT keeps the NULL, COUNT ignores it.

\`COUNT(1)\` is the same as \`COUNT(*)\`; there is no performance difference in modern databases.`,
      followUps: [
        {
          q: 'Is COUNT(*) slower than COUNT(id)?',
          a: 'No meaningful difference in MySQL or PostgreSQL; both have to count the rows that pass the filter, and COUNT(*) is the idiomatic form. COUNT(id) on a NOT NULL primary key gives the same number. The difference is semantic, not performance: COUNT(col) skips NULLs, so use it only when that is what you mean.',
        },
        {
          q: 'What does COUNT return when no rows match? And SUM?',
          a: 'COUNT returns 0 for zero rows. SUM, AVG, MIN and MAX return NULL for zero rows, which is a common cause of failing automated assertions that expect 0. Wrap them in COALESCE(SUM(x), 0) when the business expects a zero.',
        },
      ],
      pitfalls: [
        'Saying COUNT(column) counts distinct values',
        'Believing COUNT(*) skips NULL rows',
        'Claiming COUNT(1) is faster than COUNT(*)',
      ],
    },
    {
      id: 'sql-querying-iq-04',
      difficulty: 'medium',
      question: 'Why does WHERE phone = NULL return no rows? How do you handle NULLs when validating data?',
      whatInterviewerLooksFor: [
        'Explains NULL as unknown and three-valued logic (UNKNOWN)',
        'Uses IS NULL / IS NOT NULL and COALESCE correctly',
        'Distinguishes NULL from empty string',
        'Mentions the negative-filter trap (<> and NOT IN)',
      ],
      modelAnswer: `**Why:** NULL means "unknown". Any comparison with an unknown, including \`NULL = NULL\`, gives **UNKNOWN**, not TRUE. \`WHERE\` keeps only rows where the condition is TRUE, so \`phone = NULL\` never keeps anything. The correct test is \`phone IS NULL\`.

**How I handle NULLs when validating**
1. **Test with IS NULL / IS NOT NULL.** For "mandatory phone", also check empty strings: \`WHERE phone IS NULL OR phone = ''\` (or \`NULLIF(phone, '') IS NULL\`). In our data Ravi has NULL and Meera has \`''\`; both violate the rule.
2. **Watch negative filters.** \`coupon_code <> 'SAVE10'\` drops NULL-coupon orders because the comparison is UNKNOWN. I add \`OR coupon_code IS NULL\`, or use \`IS DISTINCT FROM\` (Postgres) / \`NOT (a <=> b)\` (MySQL).
3. **Aggregates skip NULLs.** \`AVG(rating)\` ignores unrated products and \`SUM\` of no rows is NULL, so I use \`COALESCE(SUM(x), 0)\` where the business expects 0, and I confirm with the BA whether NULLs should count as zero.
4. **Display:** \`COALESCE(coupon_code, 'NONE')\` when comparing to a UI that shows "None".

**Testing angle:** NULL handling is a great source of bugs: forms that save \`''\` vs NULL inconsistently, APIs returning \`null\` vs omitting the field, reports that silently exclude NULL rows. I include NULL/empty cases in my test data on purpose.`,
      followUps: [
        {
          q: 'What does NOT IN do when the list contains a NULL?',
          a: 'x NOT IN (1, NULL) means x <> 1 AND x <> NULL. The second part is UNKNOWN, so the whole condition is never TRUE and the query returns no rows. That is why "customers not in the orders table" via NOT IN (SELECT customer_id FROM orders) returns nothing when a guest order has a NULL customer_id. NOT EXISTS avoids it.',
        },
        {
          q: 'How do NULLs behave in ORDER BY and GROUP BY?',
          a: 'GROUP BY and DISTINCT treat all NULLs as one group. In ORDER BY the position varies: PostgreSQL sorts NULLs last in ascending order and first in descending; MySQL does the opposite. Postgres supports NULLS FIRST/LAST; a portable trick is ORDER BY (col IS NULL), col.',
        },
      ],
      pitfalls: [
        'Saying NULL equals zero or an empty string',
        'Using = NULL or != NULL',
        'Forgetting that <> and NOT IN silently exclude NULL rows',
      ],
    },
    {
      id: 'sql-querying-iq-05',
      difficulty: 'medium',
      question: 'In what order does the database process a SELECT query? Why can\'t I use a column alias in WHERE?',
      whatInterviewerLooksFor: [
        'Gives the logical order FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT',
        'Explains alias visibility from that order',
        'Distinguishes logical order from the physical execution plan',
        'Offers fixes (repeat expression, subquery/CTE)',
      ],
      modelAnswer: `**Logical order:** FROM (and JOINs) → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT/OFFSET.

**Why the alias fails:** aliases are created in the SELECT step. WHERE runs earlier, so when it is evaluated the alias does not exist yet. Postgres reports "column … does not exist", MySQL "Unknown column … in 'where clause'".

**Example**
- Fails: \`SELECT total_paise / 100.0 AS rupees FROM orders WHERE rupees > 400\`.
- Works: \`… WHERE total_paise > 40000\` (repeat or rewrite the expression).
- Works: \`SELECT * FROM (SELECT total_paise / 100.0 AS rupees FROM orders) t WHERE t.rupees > 400\` (filter outside, where the alias exists).
- Works: \`ORDER BY rupees\`, because ORDER BY runs after SELECT.

**What else the order explains**
- Aggregates can't be in WHERE (groups don't exist yet) → use HAVING.
- LIMIT applies after ORDER BY, so "top 3" is taken from sorted rows.
- DISTINCT applies to the selected columns, after they are computed.

**Logical vs physical:** this order defines the *result*. The optimizer may execute differently (use an index, push a filter into a join), but it must return the same rows. That's why I reason with the logical order and check performance with EXPLAIN only when needed.`,
      followUps: [
        {
          q: 'Where do window functions like ROW_NUMBER fit in that order?',
          a: 'They are computed after WHERE, GROUP BY and HAVING, as part of the SELECT step, and before ORDER BY and LIMIT. So you cannot filter on a window function in WHERE; you wrap the query in a subquery or CTE and filter rn = 1 outside, which is exactly the pattern for "latest order per customer".',
        },
        {
          q: 'MySQL accepted my alias in HAVING. Is the order different there?',
          a: 'No, it is a MySQL extension that resolves select aliases in HAVING (and GROUP BY). It is convenient but not portable: the same query fails in PostgreSQL. In an interview I mention the extension but write the portable version.',
        },
      ],
      pitfalls: [
        'Claiming SELECT runs first because it is written first',
        'Saying ORDER BY cannot use aliases',
        'Confusing the logical order with the optimizer\'s physical plan',
      ],
    },
    {
      id: 'sql-querying-iq-06',
      difficulty: 'medium',
      question: 'Write a query that shows, for the last 7 days, the number of orders and the revenue per status, but only for statuses with more than 10 orders. Highest revenue first.',
      whatInterviewerLooksFor: [
        'Correct skeleton: WHERE date range, GROUP BY status, HAVING COUNT(*) > 10, ORDER BY revenue DESC',
        'Half-open date range relative to "now", awareness of time zones',
        'Money handled in minor units or converted carefully',
        'Talks through the query clause by clause',
      ],
      modelAnswer: `**Thinking aloud (interviewers want this):** "Rows first: only orders from the last 7 days → WHERE. Buckets: per status → GROUP BY. Bucket filter: more than 10 orders → HAVING. Then sort."

**PostgreSQL**
- \`SELECT status, COUNT(*) AS orders, SUM(total_paise) / 100.0 AS revenue_rupees\`
- \`FROM orders\`
- \`WHERE created_at >= now() - INTERVAL '7 days'\`
- \`GROUP BY status\`
- \`HAVING COUNT(*) > 10\`
- \`ORDER BY revenue_rupees DESC;\`

**MySQL:** same, with \`WHERE created_at >= NOW() - INTERVAL 7 DAY\`.

**Decisions I'd state**
- "Last 7 days" is ambiguous: a rolling 168 hours (above) or the last 7 calendar days (\`>= CURRENT_DATE - 6\`)? I would ask, and also confirm the time zone; if the DB stores UTC and the business day is IST, boundaries shift by 5h30m.
- Money: summing integer paise and converting once at the end avoids rounding drift.
- HAVING repeats \`COUNT(*)\` rather than the alias, so it works on Postgres too. ORDER BY may use the alias.
- If cancelled orders should not count as revenue, that filter belongs in WHERE, or I'd use \`SUM(CASE WHEN status = 'paid' THEN total_paise ELSE 0 END)\` if I need both numbers.

**Validation of my own query:** run it on a small known dataset (or with \`> 0\` instead of \`> 10\`) and check each number by hand.`,
      followUps: [
        {
          q: 'How would you also show statuses with zero orders in that period?',
          a: 'Grouping can only return statuses that have rows. I would start from a list of all statuses, either a statuses lookup table or a VALUES list, and LEFT JOIN the filtered orders to it, using COUNT(o.id) so empty statuses show 0. Of course with HAVING COUNT > 10 they would be filtered again, so that requirement and this one conflict and need clarifying.',
        },
        {
          q: 'Your query and the dashboard differ by 3 orders. What would you look at?',
          a: 'Definitions first: rolling vs calendar days, time zone of the boundary, whether test or cancelled orders are excluded. Then data source: is the dashboard reading a replica, a cache, or a nightly aggregate table? I would list the 3 differing order ids by comparing both sources rather than arguing about totals.',
        },
      ],
      pitfalls: [
        'Putting COUNT(*) > 10 in WHERE',
        'Using BETWEEN with bare dates on a timestamp column',
        'Not asking what "last 7 days" means',
      ],
    },
    {
      id: 'sql-querying-iq-07',
      difficulty: 'hard',
      question: 'After a data migration, you are asked to sanity-check the new orders table before release. Which SQL checks do you run?',
      context: 'The app moved from an old order service to a new one. About 2 million orders were copied. The release is in two days.',
      whatInterviewerLooksFor: [
        'Structured checklist: completeness, uniqueness, validity, consistency, referential integrity',
        'Compares source vs target (counts and sums per segment), not just "looks fine"',
        'Uses aggregates to compare big tables cheaply',
        'Thinks about NULLs, time zones, money precision and statuses',
        'Reports findings with numbers and examples',
      ],
      modelAnswer: `I organise checks by data-quality dimension and compare **source vs target**.

**1. Completeness (nothing lost)**
- Row counts per day and per status in both systems: \`SELECT DATE(created_at), status, COUNT(*) … GROUP BY 1, 2\`. Matching totals can hide offsetting errors; per-segment counts don't.
- Money checksum: \`SUM(total_paise)\` per day in both.

**2. Uniqueness**
- \`GROUP BY id HAVING COUNT(*) > 1\` and the same on business keys (order number, gateway reference).

**3. Validity**
- Mandatory columns: \`COUNT(*) - COUNT(col)\` for each NOT NULL-by-business column; also \`= ''\`.
- Allowed values: \`status NOT IN (…)\`; ranges: \`total_paise <= 0\`, future \`created_at\`.

**4. Consistency / transformation**
- Time zone: compare \`MIN/MAX(created_at)\` and spot-check orders near midnight; a 5h30m shift is the classic migration bug.
- Money: rupees (decimal) → paise (int) conversions; check rows where \`total_paise % 100\` looks wrong or totals differ by a factor of 100.

**5. Referential integrity** (with the joins I'd use next): orders whose \`customer_id\` points to no customer; items with no order.

**6. Sampling:** pick 20 random orders, including edge cases (guest, cancelled, coupon, refund) and compare field by field in the UI, API and DB.

**Reporting:** a table of check → expected → actual → example ids. I'd automate the queries so they can be re-run after the final migration on release day.`,
      followUps: [
        {
          q: 'Counts match exactly but the business says revenue is off. What next?',
          a: 'Compare sums per segment (day, status, payment method) between source and target to narrow down where it differs, then list individual orders whose totals differ by joining on the order number. Typical causes: rounding when converting decimals to integer paise, currency or tax fields mapped wrongly, refunds stored as negative rows in one system and as a status in the other.',
        },
        {
          q: 'The table has 2 million rows. How do you keep your checks from hurting the shared database?',
          a: 'Run aggregates rather than SELECT * exports, filter on indexed columns like created_at, run heavy checks off-peak or against a read replica or snapshot, and batch by date range. I would also ask the DBA for EXPLAIN on the heaviest query once.',
        },
      ],
      pitfalls: [
        'Only comparing total row counts',
        'Eyeballing a few rows in the UI and calling it done',
        'Ignoring NULLs, time zones and money units',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'sql-querying-drill-1',
      question:
        'Predict the number of rows each query returns on the running dataset before running it: (a) `SELECT id FROM orders WHERE coupon_code = NULL` (b) `SELECT id FROM orders WHERE coupon_code <> \'SAVE10\'` (c) `SELECT DISTINCT customer_id FROM orders` (d) `SELECT COUNT(DISTINCT customer_id) FROM orders` (e) `SELECT status, COUNT(*) FROM orders GROUP BY status` (f) `SELECT id FROM orders WHERE status = \'paid\' OR status = \'cancelled\' AND total_paise > 40000`',
      assumptions: [
        'orders: 101 (cust 1, paid, 50000, coupon NULL), 102 (cust 1, cancelled, 20000, SAVE10), 103 (cust 2, paid, 75000, SAVE10), 104 (cust NULL, paid, 30000, coupon NULL)',
        'Standard SQL three-valued logic (PostgreSQL or MySQL 8)',
      ],
      steps: [
        { label: '(a) = NULL', calc: 'coupon_code = NULL is UNKNOWN for every row → WHERE keeps none → 0 rows' },
        { label: '(b) <> SAVE10', calc: '101: NULL <> SAVE10 = UNKNOWN; 102: FALSE; 103: FALSE; 104: UNKNOWN → 0 rows' },
        { label: '(c) DISTINCT customer_id', calc: 'values 1, 1, 2, NULL → distinct {1, 2, NULL}; DISTINCT treats NULLs as one value → 3 rows' },
        { label: '(d) COUNT(DISTINCT)', calc: 'distinct non-NULL values {1, 2} → one row containing 2' },
        { label: '(e) GROUP BY status', calc: 'buckets paid (101,103,104) and cancelled (102) → 2 rows: paid 3, cancelled 1' },
        { label: '(f) precedence', calc: 'paid OR (cancelled AND > 40000): 101 T, 102 cancelled but 20000 → F, 103 T, 104 T → 3 rows' },
      ],
      answer: `| Query | Rows | Result |
|---|---|---|
| (a) | 0 | — |
| (b) | 0 | — (101, 104 lost to NULL) |
| (c) | 3 | 1, 2, NULL |
| (d) | 1 | 2 |
| (e) | 2 | paid 3, cancelled 1 |
| (f) | 3 | 101, 103, 104 |`,
      insight:
        'Most "wrong count" bugs come from three things: NULL comparisons, DISTINCT vs COUNT(DISTINCT) treating NULL differently, and AND/OR precedence. Predicting row counts before running a query is the fastest way to catch a check that is silently wrong.',
      followUps: [
        {
          q: 'How would you change (b) so it returns the orders without SAVE10, and how many rows then?',
          a: 'WHERE coupon_code IS NULL OR coupon_code <> \'SAVE10\' (or IS DISTINCT FROM in Postgres, NOT (coupon_code <=> \'SAVE10\') in MySQL). It returns 2 rows, orders 101 and 104, because both have no coupon at all.',
        },
        {
          q: 'What would (c) return if you wrote SELECT COUNT(*) FROM (SELECT DISTINCT customer_id FROM orders) t?',
          a: '3, because the inner DISTINCT keeps NULL as one of the distinct values and COUNT(*) counts rows, including the NULL row. That differs from COUNT(DISTINCT customer_id) = 2, a nice demonstration of how the two treat NULL differently.',
        },
      ],
    },
    {
      id: 'sql-querying-drill-2',
      question:
        'Write, step by step, a query for this requirement: "List registered customers (by customer_id) who placed at least 2 orders in March 2026 (IST is not a concern; timestamps are stored in local time), show their order count and their PAID amount in rupees, and sort by paid amount, highest first." Then predict the output on the running dataset.',
      assumptions: [
        'orders table as in the running dataset; all four orders are in March 2026',
        'Paid amount counts only status = \'paid\'; cancelled orders still count toward the 2-order minimum',
        'Guest orders (customer_id NULL) are not registered customers',
      ],
      steps: [
        { label: '1. FROM + row filter', calc: 'FROM orders WHERE customer_id IS NOT NULL AND created_at >= \'2026-03-01\' AND created_at < \'2026-04-01\' → rows 101, 102, 103' },
        { label: '2. GROUP BY', calc: 'GROUP BY customer_id → customer 1: {101, 102}; customer 2: {103}' },
        { label: '3. Aggregates', calc: 'COUNT(*) → 2 and 1; paid sum uses a conditional: SUM(CASE WHEN status = \'paid\' THEN total_paise ELSE 0 END) → 50000 and 75000' },
        { label: '4. HAVING', calc: 'HAVING COUNT(*) >= 2 → only customer 1 survives (customer 2 has 1 order)' },
        { label: '5. SELECT + ORDER BY', calc: 'SELECT customer_id, COUNT(*) AS orders, SUM(CASE …) / 100.0 AS paid_rupees … ORDER BY paid_rupees DESC' },
        { label: '6. Predict', calc: 'one row: customer_id 1 | orders 2 | paid_rupees 500.00' },
      ],
      answer: `Final query:
- \`SELECT customer_id, COUNT(*) AS orders,\`
- \`       SUM(CASE WHEN status = 'paid' THEN total_paise ELSE 0 END) / 100.0 AS paid_rupees\`
- \`FROM orders\`
- \`WHERE customer_id IS NOT NULL AND created_at >= '2026-03-01' AND created_at < '2026-04-01'\`
- \`GROUP BY customer_id\`
- \`HAVING COUNT(*) >= 2\`
- \`ORDER BY paid_rupees DESC;\`

Output: **1 row: \`1 | 2 | 500.00\`** (Asha). Ravi has only one order; the guest order is excluded.`,
      insight:
        'Build queries in logical order: rows (FROM/WHERE) → buckets (GROUP BY) → numbers (aggregates) → bucket filter (HAVING) → presentation (SELECT/ORDER BY). Putting status = \'paid\' in WHERE would have been a bug here: it would remove the cancelled order and Asha would fail the 2-order rule.',
      followUps: [
        {
          q: 'Why not just add AND status = \'paid\' to the WHERE clause?',
          a: 'Because the requirement counts all orders toward the minimum but sums only paid ones. Filtering in WHERE would drop order 102, Asha would have one order and fail HAVING, and the result would be empty. Conditional aggregation (SUM of CASE) lets one pass compute both numbers.',
        },
        {
          q: 'How would you show the customer name instead of the id?',
          a: 'Join customers: FROM orders o JOIN customers c ON c.id = o.customer_id, then GROUP BY c.id, c.name (grouping by id avoids merging two customers who share a name). The inner join also makes the IS NOT NULL filter redundant, because guest orders find no customer.',
        },
      ],
    },
    {
      id: 'sql-querying-drill-3',
      question:
        'The admin dashboard for 5 March 2026 shows: "Orders: 2, Paid revenue: ₹1,050.00, Coupon usage: 50%". Using the running dataset (timestamps stored in UTC, dashboard in IST, UTC+5:30), reconcile each tile with SQL and decide whether each is a bug.',
      assumptions: [
        'orders.created_at is stored in UTC; the dashboard day is 5 March in IST = 2026-03-04 18:30 UTC to 2026-03-05 18:30 UTC',
        'Dashboard definitions (from the BA): Orders = all statuses; Paid revenue = sum of paid totals; Coupon usage = orders with a coupon / all orders that day',
        'Order times in UTC: 101 = 03-01 10:15, 102 = 03-02 18:40, 103 = 03-05 09:05, 104 = 03-06 21:30',
      ],
      steps: [
        { label: '1. Define the window', calc: 'WHERE created_at >= \'2026-03-04 18:30\' AND created_at < \'2026-03-05 18:30\'' },
        { label: '2. Which orders fall in it?', calc: '101 no, 102 no (03-02), 103 yes (09:05 UTC = 14:35 IST on 5 Mar), 104 no (03-06) → only order 103' },
        { label: '3. Orders tile', calc: 'SELECT COUNT(*) … → 1, dashboard says 2 → mismatch' },
        { label: '4. Revenue tile', calc: 'SELECT COALESCE(SUM(total_paise), 0) … WHERE status = \'paid\' → 75000 paise = ₹750.00; dashboard ₹1,050.00 = 75000 + 30000 → it also counted order 104' },
        { label: '5. Coupon tile', calc: 'SELECT 100.0 * COUNT(coupon_code) / COUNT(*) → 100 * 1 / 1 = 100.0%; dashboard says 50% = 1 of 2 orders → consistent with including 104' },
        { label: '6. Diagnose', calc: 'Order 104 is 2026-03-06 21:30 UTC = 7 Mar 03:00 IST, so neither UTC nor IST puts it on 5 March. Dashboard likely uses a wrong window (e.g. "last 2 days" or a date-only cast) → bug' },
      ],
      answer: `| Tile | Dashboard | SQL (IST day) | Verdict |
|---|---|---|---|
| Orders | 2 | 1 (order 103) | bug |
| Paid revenue | ₹1,050.00 | ₹750.00 | bug (includes order 104) |
| Coupon usage | 50% | 100% | bug, follows from the wrong window |

All three tiles are consistent with the dashboard including order 104 by mistake. Bug report: "5 March (IST) dashboard includes order 104 created 2026-03-06 21:30 UTC; expected 1 order / ₹750.00 / 100%. Query and order ids attached."`,
      insight:
        'Reconcile dashboards tile by tile with the written definition, and when several tiles are wrong, look for one shared cause (here the time window). Listing the exact order ids that differ turns an argument about totals into a reproducible bug.',
      followUps: [
        {
          q: 'How would you write the IST window in PostgreSQL without converting by hand?',
          a: 'Convert the stored UTC timestamps to IST and compare dates: WHERE (created_at AT TIME ZONE \'UTC\' AT TIME ZONE \'Asia/Kolkata\')::date = DATE \'2026-03-05\'. For large tables a better form keeps the column bare so an index can be used: compute the two UTC boundary timestamps once and use created_at >= start AND created_at < end.',
        },
        {
          q: 'If the developer says "the dashboard reads a nightly summary table", what changes in your testing?',
          a: 'I would test the summary job separately: compare the summary rows with a recount from the orders table for several days, including days with late or cancelled orders, and check when the job runs relative to midnight IST. A stale or wrongly windowed summary would explain differences that the live tables don\'t show.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'sql-querying-mcq-01',
      difficulty: 'easy',
      question: 'A tester writes this check to list orders that have no coupon (101 and 104 really have none). How many rows come back?',
      code: { language: 'sql', code: `SELECT id FROM orders\nWHERE coupon_code = NULL;` },
      options: ['0 rows', '2 rows (101 and 104)', '4 rows', 'It raises a syntax error'],
      correct: [0],
      explanation:
        'Comparing anything with NULL using = yields UNKNOWN, and WHERE keeps only rows where the condition is TRUE, so no row qualifies. It is valid syntax, which is why the bug is silent. The intended query is WHERE coupon_code IS NULL, which returns 101 and 104.',
      followUps: [
        { q: 'Why is this bug dangerous in an automated check?', a: 'Because "0 rows" usually means "no problems found". A check like "count orders with no coupon code that got a discount" written with = NULL will always pass, giving false confidence until a customer reports the issue.' },
      ],
    },
    {
      id: 'sql-querying-mcq-02',
      difficulty: 'easy',
      question: 'You need "categories whose total stock is above 100". Which clause holds the condition SUM(stock) > 100?',
      options: ['WHERE', 'HAVING', 'ORDER BY', 'GROUP BY'],
      correct: [1],
      explanation:
        'HAVING filters groups after aggregation, so it can test SUM(stock). WHERE runs before grouping and cannot contain aggregates. GROUP BY only defines the buckets, and ORDER BY sorts but never removes rows.',
      followUps: [
        { q: 'Where would you put "only active products"?', a: 'In WHERE, because it is a per-row condition (is_active = true) that should remove rows before they are summed. Putting it in HAVING would not even be allowed unless is_active were grouped, and it would be less clear.' },
      ],
    },
    {
      id: 'sql-querying-mcq-03',
      difficulty: 'easy',
      question: 'Guest order 104 has a NULL customer_id. What does SELECT DISTINCT on that column produce?',
      code: { language: 'sql', code: `SELECT DISTINCT customer_id\nFROM orders;\n-- customer_id values: 1, 1, 2, NULL` },
      options: ['3 rows: 1, 2 and NULL', '2 rows: 1 and 2', '4 rows: 1, 1, 2, NULL', '1 row: the number 2'],
      correct: [0],
      explanation:
        'DISTINCT removes repeated result rows and treats all NULLs as one value, so the result is 1, 2 and a single NULL. "2 rows" is what COUNT(DISTINCT customer_id) counts, because COUNT ignores NULLs. A single number would require an aggregate.',
      followUps: [
        { q: 'How would you get only registered customers?', a: 'Add WHERE customer_id IS NOT NULL. Then DISTINCT returns 1 and 2. That also documents the intent that guest orders are not customers.' },
      ],
    },
    {
      id: 'sql-querying-mcq-04',
      difficulty: 'medium',
      question: 'The intent is "paid or cancelled orders above ₹400". Which orders does the query actually return?',
      code: {
        language: 'sql',
        code: `-- 101 paid 50000 | 102 cancelled 20000 | 103 paid 75000 | 104 paid 30000\nSELECT id FROM orders\nWHERE status = 'paid' OR status = 'cancelled' AND total_paise > 40000;`,
      },
      options: ['101 and 103', '101, 103 and 104', '101, 102, 103 and 104', 'Only 103'],
      correct: [1],
      explanation:
        'AND has higher precedence than OR, so the filter is paid OR (cancelled AND > 40000). All paid orders pass whatever their amount (101, 103, 104), and the cancelled order 102 fails the amount test. 101 and 103 is what the query was meant to return and needs brackets around the OR.',
      followUps: [
        { q: 'Write the corrected WHERE clause in two ways.', a: 'WHERE (status = \'paid\' OR status = \'cancelled\') AND total_paise > 40000, or more readably WHERE status IN (\'paid\', \'cancelled\') AND total_paise > 40000. Both return 101 and 103.' },
      ],
    },
    {
      id: 'sql-querying-mcq-05',
      difficulty: 'medium',
      question: 'A tester wants orders that did NOT use coupon SAVE10 and expects 101 and 104. What does the query return, and why?',
      code: { language: 'sql', code: `-- coupons: 101 NULL | 102 SAVE10 | 103 SAVE10 | 104 NULL\nSELECT id FROM orders\nWHERE coupon_code <> 'SAVE10';` },
      options: [
        'No rows, because NULL <> \'SAVE10\' is UNKNOWN and WHERE keeps only TRUE',
        '101 and 104, because NULL is different from SAVE10',
        'An error, because <> cannot compare against a column that contains NULL values',
        'All four rows, because <> ignores NULLs',
      ],
      correct: [0],
      explanation:
        'A comparison with NULL is UNKNOWN, not TRUE, so 101 and 104 are discarded; 102 and 103 are FALSE. Many beginners expect "NULL is different from SAVE10" to be TRUE, but SQL cannot know what the unknown value is. The fix is coupon_code IS NULL OR coupon_code <> \'SAVE10\'. No error is raised.',
      followUps: [
        { q: 'Which NULL-safe operators exist for this?', a: 'Standard SQL and PostgreSQL: coupon_code IS DISTINCT FROM \'SAVE10\', which treats NULL as a comparable value and returns TRUE here. MySQL uses the NULL-safe equality operator, so NOT (coupon_code <=> \'SAVE10\').' },
      ],
    },
    {
      id: 'sql-querying-mcq-06',
      difficulty: 'medium',
      question: 'What are the three values returned?',
      code: { language: 'sql', code: `-- customer_id values: 1, 1, 2, NULL\nSELECT COUNT(*), COUNT(customer_id), COUNT(DISTINCT customer_id)\nFROM orders;` },
      options: ['4, 3, 2', '4, 4, 3', '3, 3, 2', '4, 3, 3'],
      correct: [0],
      explanation:
        'COUNT(*) counts all 4 rows. COUNT(customer_id) skips the NULL guest order, giving 3. COUNT(DISTINCT customer_id) counts distinct non-NULL values {1, 2}, giving 2. "4, 3, 3" wrongly counts NULL as a distinct value (that is what SELECT DISTINCT would show).',
      followUps: [
        { q: 'Which of the three answers "how many customers have ordered"?', a: 'COUNT(DISTINCT customer_id) = 2. COUNT(customer_id) counts orders that have a customer (3), and COUNT(*) counts all orders including the guest checkout (4).' },
      ],
    },
    {
      id: 'sql-querying-mcq-07',
      difficulty: 'medium',
      question: 'created_at is a TIMESTAMP. Order 103 was placed at 2026-03-05 09:05. Why is it missing from the result?',
      code: { language: 'sql', code: `SELECT id FROM orders\nWHERE created_at BETWEEN '2026-03-01' AND '2026-03-05';` },
      options: [
        'BETWEEN excludes the upper bound',
        'The bare date \'2026-03-05\' means 2026-03-05 00:00:00, so later times that day are outside the range',
        'BETWEEN only works on DATE columns, so timestamps are compared as text',
        'The database ignores the time part and should have included 103; it is a DB bug',
      ],
      correct: [1],
      explanation:
        'BETWEEN is inclusive on both ends, but the literal date is converted to midnight, so 09:05 on 5 March is greater than the upper bound. BETWEEN works fine on timestamps, and nothing is compared as text. The robust form is created_at >= \'2026-03-01\' AND created_at < \'2026-03-06\'.',
      followUps: [
        { q: 'Why is the half-open range better than DATE(created_at) BETWEEN …?', a: 'Both give the right rows, but wrapping the column in a function can stop the database from using an index on created_at, which matters on big order tables. The half-open range keeps the column bare and also avoids end-of-day precision issues like 23:59:59.999.' },
      ],
    },
    {
      id: 'sql-querying-mcq-08',
      difficulty: 'medium',
      question: 'Requirement: "list customers whose phone is missing". Ravi\'s phone is NULL and Meera\'s is \'\' (empty string). Select ALL queries that return exactly Ravi and Meera.',
      options: [
        'SELECT name FROM customers WHERE phone IS NULL OR phone = \'\';',
        'SELECT name FROM customers WHERE NULLIF(phone, \'\') IS NULL;',
        'SELECT name FROM customers WHERE phone = NULL OR phone = \'\';',
        'SELECT name FROM customers WHERE COALESCE(phone, \'\') = \'\';',
        'SELECT name FROM customers WHERE phone IS NULL;',
      ],
      correct: [0, 1, 3],
      explanation:
        'Option 1 tests both representations explicitly. NULLIF turns \'\' into NULL so a single IS NULL catches both, and COALESCE turns NULL into \'\' so a single = \'\' catches both. Option 3 only finds Meera because phone = NULL is never TRUE, and option 5 only finds Ravi because \'\' is not NULL in MySQL or PostgreSQL.',
      followUps: [
        { q: 'Would your answer change on Oracle?', a: 'Yes. Oracle stores an empty string as NULL, so Meera\'s phone would already be NULL and IS NULL alone finds both. That is a good example of why testers should know which database a check will run on.' },
      ],
    },
    {
      id: 'sql-querying-mcq-09',
      difficulty: 'medium',
      question: 'An automated DB check "verify the latest order belongs to the test user" passes locally and fails randomly in CI. The query is SELECT customer_id FROM orders LIMIT 1. What is the most likely cause?',
      options: [
        'Without ORDER BY the database may return any row, and the choice can change with data volume and plan',
        'LIMIT 1 is not supported by the CI database driver',
        'The CI database sorts rows by primary key ascending, which is guaranteed behaviour',
        'LIMIT returns the most recently inserted row only in MySQL',
      ],
      correct: [0],
      explanation:
        'SQL tables are unordered; LIMIT without a unique ORDER BY returns an unpredictable subset, as the PostgreSQL docs warn. Locally it may look like insertion order by accident. No database guarantees primary-key or insertion order without ORDER BY. The fix is ORDER BY created_at DESC, id DESC LIMIT 1, and ideally filtering by the id the test created.',
      followUps: [
        { q: 'Even with ORDER BY, why is "the latest order" a weak oracle in CI?', a: 'Other tests running in parallel can create orders at the same time, so the latest one may belong to another worker. The test should capture its own order id (from the UI or API response) and query WHERE id = that value.' },
      ],
    },
    {
      id: 'sql-querying-mcq-10',
      difficulty: 'medium',
      question: 'Select ALL statements about aggregate functions that are true in PostgreSQL and MySQL.',
      options: [
        'SUM, AVG, MIN and MAX ignore NULL values',
        'SUM over zero matching rows returns NULL, not 0',
        'COUNT(*) skips rows in which every column is NULL',
        'AVG treats NULL as 0, so AVG of (5, 3, NULL) is 2.67',
      ],
      correct: [0, 1],
      explanation:
        'Aggregates other than COUNT(*) skip NULLs, and when no rows match, SUM/AVG/MIN/MAX return NULL (COUNT returns 0). COUNT(*) counts every row regardless of content. AVG of (5, 3, NULL) is 4, because the NULL is skipped rather than counted as 0; whether that is the desired business rule is a separate question.',
      followUps: [
        { q: 'How do you make a "refunds today" check return 0 instead of NULL?', a: 'Wrap the aggregate: COALESCE(SUM(amount_paise), 0). Then an assertion expecting 0 passes on days without refunds, and a non-zero value still shows real refunds.' },
      ],
    },
    {
      id: 'sql-querying-mcq-11',
      difficulty: 'hard',
      question: 'This query fails with "column total_rupees does not exist" (Postgres) / "Unknown column" (MySQL). Which change fixes it while keeping the same meaning?',
      code: {
        language: 'sql',
        code: `SELECT id, total_paise / 100.0 AS total_rupees\nFROM orders\nWHERE total_rupees > 400\nORDER BY total_rupees DESC;`,
      },
      options: [
        'Replace the WHERE condition with WHERE total_paise / 100.0 > 400 and keep ORDER BY total_rupees',
        'Move the condition to HAVING total_rupees > 400 so it runs after SELECT',
        'Remove ORDER BY total_rupees, because ORDER BY cannot use aliases either',
        'Quote the alias in WHERE as \'total_rupees\' so it is treated as a column name',
      ],
      correct: [0],
      explanation:
        'WHERE runs before SELECT creates the alias, so repeating the expression (or wrapping the query in a subquery) fixes it; ORDER BY runs after SELECT, so the alias is fine there. HAVING is evaluated before SELECT in standard SQL and Postgres rejects the alias there; only MySQL tolerates it. Single quotes make a string literal, so the condition would compare text, not the column.',
      followUps: [
        { q: 'What is the subquery version of the fix?', a: 'SELECT * FROM (SELECT id, total_paise / 100.0 AS total_rupees FROM orders) t WHERE t.total_rupees > 400 ORDER BY t.total_rupees DESC. The alias is now a real column of the derived table t, so the outer WHERE can see it.' },
      ],
    },
    {
      id: 'sql-querying-mcq-12',
      difficulty: 'hard',
      question: 'The same query is run on MySQL 8 and PostgreSQL. Where does guest order 104 (customer_id NULL) appear in each result?',
      code: { language: 'sql', code: `SELECT id, customer_id\nFROM orders\nORDER BY customer_id;   -- ascending` },
      options: [
        'MySQL: first; PostgreSQL: last',
        'MySQL: last; PostgreSQL: first',
        'First in both, because NULL is the smallest value',
        'It is excluded from both, because NULL cannot be sorted',
      ],
      correct: [0],
      explanation:
        'MySQL sorts NULLs first in ascending order (last with DESC). PostgreSQL treats NULL as larger than any value, so it comes last in ascending order (first with DESC). NULL rows are never dropped by ORDER BY. In Postgres you can control it with NULLS FIRST/LAST; a portable trick is ORDER BY (customer_id IS NULL), customer_id.',
      followUps: [
        { q: 'How could this difference break a UI sorting test?', a: 'If the test computes the expected order with a SQL query on one engine and the app sorts in the other (or in code with its own NULL rule), lists with empty values will mismatch at the start or end. The test should define the expected NULL position from the requirement, not from whatever the database returns.' },
      ],
    },
    {
      id: 'sql-querying-mcq-13',
      difficulty: 'hard',
      question: 'Select ALL queries that PostgreSQL accepts (customers.id is the primary key; orders has no other relevant keys).',
      options: [
        'SELECT status, COUNT(*) FROM orders GROUP BY status;',
        'SELECT customer_id, status, COUNT(*) FROM orders GROUP BY customer_id;',
        'SELECT c.id, c.name, COUNT(o.id) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id;',
        'SELECT status, COUNT(*) AS n FROM orders GROUP BY status HAVING n > 1;',
      ],
      correct: [0, 2],
      explanation:
        'Option 1 is a plain grouped count. Option 3 is accepted because c.name is functionally dependent on the grouped primary key c.id. Option 2 fails because status is neither grouped nor aggregated (MySQL with ONLY_FULL_GROUP_BY also rejects it). Option 4 uses a SELECT alias in HAVING, which MySQL allows as an extension but PostgreSQL rejects.',
      followUps: [
        { q: 'What happens to option 2 on MySQL with ONLY_FULL_GROUP_BY turned off?', a: 'It runs and returns an arbitrary status from each customer\'s group. The result looks plausible but is non-deterministic, which is why that mode is on by default since MySQL 5.7.5. If any value really is acceptable, ANY_VALUE(status) says so explicitly.' },
      ],
    },
    {
      id: 'sql-querying-mcq-14',
      difficulty: 'expert',
      question: 'On PostgreSQL this "coupon usage %" tile shows 0 although 2 of the 4 orders used a coupon. What does it return on MySQL 8?',
      code: { language: 'sql', code: `SELECT COUNT(coupon_code) / COUNT(*) * 100 AS coupon_pct\nFROM orders;` },
      options: [
        '50.0000, because MySQL\'s / operator always returns a decimal result',
        '0, the same as PostgreSQL, because both counts are integers',
        '0.5, because MySQL ignores the * 100',
        'An error, because COUNT values cannot be divided',
      ],
      correct: [0],
      explanation:
        'In PostgreSQL integer / integer is integer division, so 2 / 4 = 0 and 0 * 100 = 0. MySQL\'s / always performs decimal division, giving 0.5000 * 100 = 50.0000. The * 100 is not ignored and dividing counts is legal. The portable fix is 100.0 * COUNT(coupon_code) / COUNT(*).',
      followUps: [
        { q: 'Why does this kind of bug often appear only "in production"?', a: 'Because QA and prod may differ in engine, or a query is developed in a MySQL client and later reused in Postgres-based reporting. Integer-division and NULL-ordering differences pass quietly in one place and break the number in another, so cross-engine checks should use explicit decimals.' },
      ],
    },
    {
      id: 'sql-querying-mcq-15',
      difficulty: 'expert',
      question: 'Select ALL statements that follow from SQL\'s logical query processing order.',
      options: [
        'A SELECT alias can be used in ORDER BY because ORDER BY is evaluated after SELECT',
        'An aggregate such as COUNT(*) can be used in HAVING but not in WHERE',
        'LIMIT 3 is applied before ORDER BY, so "top 3" queries need a subquery',
        'A window function such as ROW_NUMBER() cannot be filtered in WHERE of the same query',
        'DISTINCT is applied before WHERE, so WHERE sees each value only once',
      ],
      correct: [0, 1, 3],
      explanation:
        'The order is FROM → WHERE → GROUP BY → HAVING → SELECT (window functions here) → DISTINCT → ORDER BY → LIMIT. So aliases are visible to ORDER BY, aggregates exist from GROUP BY/HAVING onward, and window results are only available after WHERE, needing a wrapping subquery to filter. LIMIT runs last, after sorting, and DISTINCT runs after WHERE, not before.',
      followUps: [
        { q: 'Write "latest order per customer" using ROW_NUMBER given that constraint.', a: 'SELECT * FROM (SELECT o.*, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) AS rn FROM orders o WHERE customer_id IS NOT NULL) t WHERE rn = 1. The inner query computes the window, the outer WHERE filters it; on our data it returns 102 for Asha and 103 for Ravi.' },
      ],
    },
  ],
};

export default topic;
