import type { Topic } from '../../types';

// Running dataset (identical customers/orders to the sql-joins animation in src/viz/widgets/sql-joins):
// customers: 1 Asha (Bengaluru), 2 Ravi (Pune), 3 Meera (Delhi, never ordered)
// orders: 101 Asha paid 50000 · 102 Asha cancelled 20000 · 103 Ravi paid 75000 · 104 guest (customer_id NULL) paid 30000
// products: 1 Wireless Mouse 55000 (stock 25) · 2 Notebook Pack 25000 (100) · 3 Steel Bottle 20000 (40) · 4 Phone Case 15000 (60)
// order_items: 101→2×P2 · 102→1×P3 · 103→1×P1 + 1×P3 · 104→2×P4

const topic: Topic = {
  id: 'sql-joins-validation',
  phase: 'api-sql',
  order: 4,
  title: 'SQL Joins, Subqueries and Data Validation for Testers',
  subtitle:
    'INNER/LEFT/RIGHT/FULL/SELF joins on one customers-and-orders dataset, the NULL and LEFT JOIN + WHERE traps, IN/EXISTS/correlated subqueries, Nth-highest salary, orphan and duplicate checks, constraints, INSERT/UPDATE/DELETE inside transactions, and how to verify a UI or API order against the database and clean up test data safely.',
  estimatedMinutes: 110,
  sources: [
    'PostgreSQL 17 docs — 7.2 Table Expressions (joined tables), Subquery Expressions (EXISTS, IN, NOT IN and NULL), 5.5 Constraints, Appendix A Error Codes (23502, 23503, 23505, 23514), BEGIN / ROLLBACK / TRUNCATE',
    'MySQL 8.0 Reference Manual — JOIN clause, 15.3.3 Statements That Cause an Implicit Commit, TRUNCATE TABLE, FOREIGN KEY constraints, CHECK constraints (enforced from 8.0.16), mysql client --safe-updates (sql_safe_updates)',
    'Mode / ThoughtSpot SQL Tutorial — SQL Joins: filtering in the ON clause vs WHERE with LEFT JOIN',
    'SQLBolt — Lessons 6–8 (multi-table queries with JOINs, OUTER JOINs, a short note on NULLs), Lessons 13–15 (INSERT, UPDATE, DELETE)',
    'GeeksforGeeks — "SQL query to find the Nth largest value in a column using LIMIT and OFFSET" (DISTINCT vs row ranking)',
    'LeetCode 176/177 Second / Nth Highest Salary and AlgoMaster write-up (ties, NULL when fewer than N values)',
    'LearnSQL.com — Software Testing SQL Interview Questions; Glassdoor QA/manual tester interview reports 2024–2025 (joins across 3–4 tables, self join, DISTINCT)',
    'Playwright docs — expect.poll (polling a non-UI value); node-postgres docs — parameterized queries',
  ],
  tags: ['sql', 'joins', 'left-join', 'subqueries', 'exists', 'transactions', 'constraints', 'data-validation', 'test-data', 'interview-sql'],
  cheatSheet: [
    'A join pairs every left row with every matching right row: one-to-many joins multiply rows (Asha + 2 orders = 2 rows). INNER = matches only; LEFT = all left rows (+ NULLs); RIGHT = all right rows; FULL = both; CROSS = every pair.',
    'On our data: INNER 3 rows, LEFT 4, RIGHT 4, FULL 5, CROSS 12, NOT EXISTS (never ordered) 1 (Meera).',
    'NULL never equals anything, so a NULL join key (guest order) never matches; outer joins add NULL-padded rows for the unmatched side.',
    'LEFT JOIN + WHERE right_table.col = \'x\' silently becomes an INNER JOIN. Filters on the optional (right) table go in ON; filters on the preserved (left) table go in WHERE.',
    'After a LEFT JOIN count with COUNT(right.id), not COUNT(*): a customer with no orders still has one NULL-padded row.',
    '"Rows with no match" = LEFT JOIN … WHERE right.pk IS NULL, or NOT EXISTS. Avoid NOT IN on a nullable column: one NULL makes it return nothing.',
    'Nth highest distinct value: DENSE_RANK() = N, or SELECT DISTINCT … ORDER BY … DESC LIMIT 1 OFFSET N-1. Plain LIMIT/OFFSET without DISTINCT breaks on ties.',
    'Orphans: child LEFT JOIN parent WHERE parent.id IS NULL (and child.fk IS NOT NULL). Also check headers without lines and totals ≠ sum of items.',
    'Constraint errors: unique 23505 / MySQL 1062, foreign key 23503 / 1452 (child) or 1451 (delete parent), not null 23502 / 1048, check 23514 / 3819.',
    'Change data safely: SELECT with the same WHERE first → BEGIN → UPDATE/DELETE → check rows affected → COMMIT or ROLLBACK. Autocommit is ON by default in MySQL and psql.',
    'TRUNCATE/DROP/ALTER cause an implicit COMMIT in MySQL (no rollback); PostgreSQL DDL is transactional. Uncommitted changes are invisible to the app under test.',
    'Validate UI → DB by the id the test created (never "latest row"), compare in minor units, poll until the async write lands, then clean up children before parents.',
  ],
  sections: [
    {
      heading: 'Joins by example: customers and orders',
      body: `**Intuition:** a join is like matching guests to tables at a wedding using the seat number on their card. Picture every customer paired with every order, then cross out the pairs whose \`o.customer_id\` is not the customer's \`id\`. INNER keeps what is left. OUTER joins also bring back people (or orders) that found no partner, filling the empty side with NULL.

**The data** (the same rows the animation below uses): Asha has two orders (one cancelled), Ravi one, **Meera none**, and order **104 is a guest checkout** with \`customer_id\` NULL.

| Join | What it keeps | Rows here | Result rows |
|---|---|---|---|
| INNER JOIN | matching pairs only | 3 | Asha-101, Asha-102, Ravi-103 |
| LEFT JOIN | every customer; order columns NULL if none | 4 | + Meera-NULL |
| RIGHT JOIN | every order; customer columns NULL if none | 4 | + NULL-104 |
| FULL OUTER JOIN | both sides | 5 | + Meera-NULL + NULL-104 |
| CROSS JOIN | every pair, no condition | 12 | 3 × 4 |
| anti-join (NOT EXISTS) | customers with no matching order | 1 | Meera |

**Things the Venn-diagram picture hides**
- **Rows multiply.** Asha appears twice in the INNER result. A join is not a set intersection: for one-to-many relationships the "one" side is repeated, so \`SUM\` over its columns after the join double-counts.
- **RIGHT JOIN = LEFT JOIN with the tables swapped.** Most teams write only LEFT JOIN, so the table you want to keep in full is always written first.
- **MySQL has no FULL OUTER JOIN.** Emulate it with a LEFT JOIN \`UNION\` a RIGHT JOIN (or the anti-join half).
- \`JOIN\` alone means \`INNER JOIN\`; \`LEFT JOIN\` = \`LEFT OUTER JOIN\`.

**In interviews, say:** "INNER returns only matches, LEFT keeps all rows of the left table with NULLs where nothing matched. Before writing a join I check the relationship (one-to-many?) because that tells me whether rows will multiply."`,
      diagram: `customers                         orders
+----+-------+-----------+        +-----+-------------+-----------+-------------+
| id | name  | city      |        | id  | customer_id | status    | total_paise |
+----+-------+-----------+        +-----+-------------+-----------+-------------+
| 1  | Asha  | Bengaluru |        | 101 | 1           | paid      | 50000       |
| 2  | Ravi  | Pune      |        | 102 | 1           | cancelled | 20000       |
| 3  | Meera | Delhi     |        | 103 | 2           | paid      | 75000       |
+----+-------+-----------+        | 104 | NULL(guest) | paid      | 30000       |
                                  +-----+-------------+-----------+-------------+
 ON o.customer_id = c.id
   Asha  --> 101, 102   (one customer, two rows: fan-out)
   Ravi  --> 103
   Meera --> (none)     kept by LEFT / FULL with NULL order columns
   (none)--> 104        kept by RIGHT / FULL with NULL customer columns`,
      code: [
        {
          language: 'sql',
          title: 'Every join type on the running dataset',
          code: `-- INNER: 3 rows
SELECT c.name, o.id AS order_id, o.status
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id;
-- Asha 101 paid | Asha 102 cancelled | Ravi 103 paid

-- LEFT: 4 rows (Meera kept, order columns NULL)
SELECT c.name, o.id AS order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;
-- Asha 101 | Asha 102 | Ravi 103 | Meera NULL

-- RIGHT: 4 rows (guest order kept, customer columns NULL)
SELECT c.name, o.id AS order_id
FROM customers c
RIGHT JOIN orders o ON o.customer_id = c.id;
-- Asha 101 | Asha 102 | Ravi 103 | NULL 104

-- FULL OUTER: 5 rows (PostgreSQL, SQL Server; not MySQL)
SELECT c.name, o.id AS order_id
FROM customers c
FULL OUTER JOIN orders o ON o.customer_id = c.id;

-- MySQL emulation of FULL OUTER JOIN
SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
UNION ALL
SELECT c.name, o.id FROM customers c RIGHT JOIN orders o ON o.customer_id = c.id
WHERE c.id IS NULL;                      -- only the unmatched orders

-- CROSS: 12 rows (3 customers x 4 orders), no ON clause
SELECT c.name, o.id FROM customers c CROSS JOIN orders o;`,
        },
      ],
      keyPoints: [
        'Counts on this data: INNER 3, LEFT 4, RIGHT 4, FULL 5, CROSS 12.',
        'One-to-many joins repeat the "one" side; watch SUMs after a join.',
        'Prefer LEFT over RIGHT; MySQL needs UNION to emulate FULL OUTER.',
      ],
      source: 'PostgreSQL 17 docs — 7.2.1.1 Joined Tables; MySQL 8.0 Manual — JOIN Clause; SQLBolt — Lessons 6–7 Multi-table queries with JOINs, OUTER JOINs',
    },
    {
      heading: 'NULL in joins and the LEFT JOIN + WHERE trap',
      body: `**Intuition:** a LEFT JOIN promises "every customer stays". A WHERE clause that tests a column of the right table can quietly break that promise, because the rows it was supposed to keep have NULL in that column, and NULL never passes a test.

**Rule 1: NULL keys never match.** Guest order 104 has \`customer_id\` NULL. \`NULL = 1\` is UNKNOWN, so 104 matches nobody. That is correct here, but when a join key is nullable by mistake, rows silently disappear from INNER JOIN reports.

**Rule 2: ON decides matching, WHERE filters the joined result.**
- Requirement: "every customer with their number of **paid** orders (0 if none)". Expected: Asha 1, Ravi 1, **Meera 0**.
- \`LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'paid'\` → Meera's NULL-padded row has \`o.status = NULL\`, the test is UNKNOWN, and WHERE drops her. The LEFT JOIN has become an INNER JOIN, and the report shows 2 customers instead of 3.
- Fix: move the condition into ON: \`LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'\`. Now cancelled orders simply do not match, and Meera stays with NULLs.

**Rule 3: count the right table's key.** On the NULL-padded row \`COUNT(*)\` counts 1; \`COUNT(o.id)\` counts 0. \`SUM(o.total_paise)\` is NULL for Meera, so wrap it: \`COALESCE(SUM(o.total_paise), 0)\`.

**Tempting half-fix:** \`WHERE o.status = 'paid' OR o.id IS NULL\`. It works on this sample, but a customer whose only orders are cancelled has real (non-NULL) order rows that all fail, so they vanish instead of showing 0. Only the ON placement is correct.

| Where the filter goes | Meera (no orders) | Customer with only cancelled orders |
|---|---|---|
| \`WHERE o.status = 'paid'\` | dropped | dropped |
| \`WHERE o.status = 'paid' OR o.id IS NULL\` | kept | **dropped** |
| \`ON … AND o.status = 'paid'\` | kept, 0 | kept, 0 |

**In interviews, say:** "Filters on the optional side of a LEFT JOIN go in ON; filters on the preserved side go in WHERE; and I count the right table's primary key." Step through the animation with the paid filter in WHERE and then in ON to watch Meera disappear and come back.`,
      code: [
        {
          language: 'sql',
          title: 'The trap and the fix, with results',
          code: `-- BUG: the WHERE turns the LEFT JOIN into an INNER JOIN
SELECT c.name, COUNT(o.id) AS paid_orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid'                -- NULL = 'paid' is UNKNOWN for Meera
GROUP BY c.id, c.name;
-- Asha 1 | Ravi 1                     (Meera missing)

-- FIX: filter the optional side inside ON
SELECT c.name,
       COUNT(o.id)                   AS paid_orders,   -- not COUNT(*)
       COALESCE(SUM(o.total_paise), 0) AS paid_paise
FROM customers c
LEFT JOIN orders o
       ON o.customer_id = c.id
      AND o.status = 'paid'            -- part of the match rule
GROUP BY c.id, c.name
ORDER BY c.id;
-- Asha  1 | 50000
-- Ravi  1 | 75000
-- Meera 0 | 0

-- A filter on the preserved side is fine in WHERE
SELECT c.name, o.id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.city <> 'Pune';                -- Asha 101 | Asha 102 | Meera NULL`,
        },
      ],
      keyPoints: [
        'NULL join keys never match (NULL = anything is UNKNOWN).',
        'Right-table filter in WHERE = INNER JOIN in disguise; put it in ON.',
        'COUNT(o.id), not COUNT(*), after a LEFT JOIN; COALESCE the SUM.',
        '"OR o.id IS NULL" is a half-fix that loses customers with only non-matching rows.',
      ],
      source: 'Mode / ThoughtSpot SQL Tutorial — SQL Joins Where vs. On; PostgreSQL 17 docs — 7.2.1.1 Joined Tables (ON vs WHERE for outer joins)',
    },
    {
      heading: 'Self joins and multi-table joins (and the fan-out bug)',
      body: `**Intuition:** a self join is a table holding hands with itself under two nicknames. It answers "row related to another row of the same kind": a category and its parent category, an employee and their manager.

**Self join: category tree**
| id | name | parent_id |
|---|---|---|
| 1 | Electronics | NULL |
| 2 | Accessories | 1 |
| 3 | Stationery | NULL |
| 4 | Phone Cases | 2 |

\`categories child LEFT JOIN categories parent ON parent.id = child.parent_id\` gives 4 rows (top-level categories show a NULL parent). With INNER JOIN you get only the 2 children. Classic interview variant: "employees who earn more than their manager" (\`e JOIN employees m ON m.id = e.manager_id WHERE e.salary > m.salary\`).

**Multi-table joins: walk the foreign keys.** Order → items → products: \`orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id\`. Each JOIN adds one hop. Interviewers (Glassdoor reports for QA roles) often ask for 3–4 table joins; draw the key arrows first, then write one JOIN per arrow.

**The fan-out bug.** Order 103 has two items. Join customers → orders → order_items and then \`SUM(o.total_paise)\`: Ravi's 75000 is counted **once per item**, giving 150000. Report totals that are "exactly double for some customers" are almost always this. Fixes: sum at the right grain (sum items, not header totals, after joining items), or aggregate items in a subquery first and join the result.

**In interviews, say:** "Before aggregating across a join I ask what one row represents after the join. If it is one row per order item, header-level amounts are repeated."`,
      code: [
        {
          language: 'sql',
          title: 'Self join, 3-table join and fan-out',
          code: `-- Self join: each category with its parent (4 rows)
SELECT child.name AS category, parent.name AS parent
FROM categories child
LEFT JOIN categories parent ON parent.id = child.parent_id;
-- Electronics NULL | Accessories Electronics | Stationery NULL | Phone Cases Accessories

-- 3 tables: what was in each order (5 item rows)
SELECT o.id AS order_id, p.name, oi.quantity, oi.unit_price_paise
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
ORDER BY o.id, p.id;
-- 101 Notebook Pack 2 25000 | 102 Steel Bottle 1 20000
-- 103 Wireless Mouse 1 55000 | 103 Steel Bottle 1 20000 | 104 Phone Case 2 15000

-- FAN-OUT BUG: header total repeated per item
SELECT c.name, SUM(o.total_paise) AS spend
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.id, c.name;
-- Asha 70000 | Ravi 150000   (Ravi really spent 75000)

-- FIX: aggregate at the item grain
SELECT c.name, SUM(oi.quantity * oi.unit_price_paise) AS spend
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.id, c.name;
-- Asha 70000 | Ravi 75000`,
        },
      ],
      keyPoints: [
        'Self join = same table, two aliases; LEFT keeps rows without a parent.',
        'Multi-table joins: one JOIN per foreign-key arrow.',
        'Know the grain after a join; header amounts repeat per child row.',
      ],
      source: 'SQLBolt — Lesson 6 Multi-table queries with JOINs; PostgreSQL 17 docs — Table Expressions; Glassdoor QA/manual tester interview reports (self join, 3–4 table joins)',
    },
    {
      heading: 'Subqueries: IN, EXISTS, NOT EXISTS and correlated subqueries',
      body: `**Intuition:** a subquery is a question inside a question: "show customers **who are in** the list of people who paid". The inner query produces a value or a list; the outer query uses it.

**Kinds of subquery**
| Kind | Example | Returns |
|---|---|---|
| Scalar | \`(SELECT MAX(total_paise) FROM orders)\` | one value |
| IN list | \`WHERE c.id IN (SELECT customer_id FROM orders WHERE status = 'paid')\` | a column of values |
| EXISTS | \`WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)\` | TRUE/FALSE per outer row |
| Correlated | inner query refers to the outer row (\`o2.customer_id = o.customer_id\`) | re-evaluated per outer row (logically) |
| Derived table | \`FROM (SELECT …) AS t\` | a temporary table |

**EXISTS vs IN.** Both answer "is there a match?" and both return each outer row at most once (unlike a join, which would repeat Asha). EXISTS only cares whether any row exists, so \`SELECT 1\` inside is conventional. Modern optimizers usually plan IN and EXISTS the same way; pick the one that reads best.

**The NOT IN NULL trap.** "Customers who never ordered" with \`WHERE c.id NOT IN (SELECT customer_id FROM orders)\` returns **0 rows**: the list is (1, 1, 2, NULL), and for Meera \`3 <> NULL\` is UNKNOWN, so NOT IN is never TRUE. The PostgreSQL docs spell this out: NOT IN yields NULL, not TRUE, when the list contains a NULL and there is no match. \`NOT EXISTS\` is NULL-safe; or filter the subquery with \`WHERE customer_id IS NOT NULL\`.

**Correlated example: orders above that customer's own average.** Asha's average is (50000 + 20000) / 2 = 35000, so 101 qualifies; Ravi's only order equals his average; guest order 104 has no customer, the inner comparison never matches, the average is NULL and 104 is excluded. Result: **101**.

**In interviews, say:** "For 'rows without a match' I use NOT EXISTS or a LEFT JOIN with IS NULL, never NOT IN on a nullable column."`,
      code: [
        {
          language: 'sql',
          title: 'Subqueries on the running dataset',
          code: `-- customers with at least one paid order (each once, no fan-out)
SELECT name FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o
              WHERE o.customer_id = c.id AND o.status = 'paid');
-- Asha, Ravi

-- customers who never ordered
SELECT name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
-- Meera

SELECT name FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders);           -- 0 rows! (NULL in list)

SELECT name FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders
                 WHERE customer_id IS NOT NULL);            -- Meera

-- scalar subquery: the biggest order
SELECT id FROM orders
WHERE total_paise = (SELECT MAX(total_paise) FROM orders);  -- 103

-- correlated: orders above the same customer's average
SELECT o.id, o.customer_id, o.total_paise
FROM orders o
WHERE o.total_paise > (SELECT AVG(o2.total_paise)
                       FROM orders o2
                       WHERE o2.customer_id = o.customer_id);
-- 101 | 1 | 50000`,
        },
      ],
      keyPoints: [
        'IN/EXISTS return each outer row once; joins can repeat it.',
        'NOT IN + a NULL in the list = no rows. Use NOT EXISTS.',
        'Correlated subqueries reference the outer row; NULL keys never correlate.',
      ],
      source: 'PostgreSQL 17 docs — Subquery Expressions (EXISTS, IN, NOT IN); SQLBolt — SQL Topic: Subqueries',
    },
    {
      heading: 'Nth highest salary and other ranking questions',
      body: `**Intuition:** "second highest" sounds trivial until two people share the top salary. The question is really testing whether you think about **ties, NULLs and missing values**, which is exactly a tester's mindset.

**Data:** \`employees\`: Anil 90000, Bina 90000, Chetan 80000, Divya 70000. The 2nd highest **distinct** salary is **80000**; the 3rd is 70000.

**Four ways, and how they treat ties**
| Approach | 2nd highest here | Notes |
|---|---|---|
| \`MAX(salary) WHERE salary < (SELECT MAX(salary) …)\` | 80000 | only for N = 2; simple and portable |
| \`SELECT DISTINCT salary … ORDER BY salary DESC LIMIT 1 OFFSET N-1\` | 80000 | DISTINCT is essential |
| \`ORDER BY salary DESC LIMIT 1 OFFSET 1\` (no DISTINCT) | **90000** | wrong when the top is tied |
| \`DENSE_RANK() OVER (ORDER BY salary DESC) = N\` | 80000 | general N; also returns *who* earns it |

**RANK vs DENSE_RANK vs ROW_NUMBER** (salaries 90000, 90000, 80000, 70000):
| | Anil | Bina | Chetan | Divya |
|---|---|---|---|---|
| ROW_NUMBER | 1 | 2 | 3 | 4 |
| RANK | 1 | 1 | 3 | 4 |
| DENSE_RANK | 1 | 1 | 2 | 3 |

With RANK there is *no* rank 2, so \`RANK() = 2\` returns nothing. Window functions need MySQL 8.0+ (or any modern PostgreSQL).

**Edge cases to state out loud:** fewer than N distinct salaries (LeetCode's version wants NULL, not zero rows: wrap the query as a scalar subquery \`SELECT (…) AS second_highest\`); NULL salaries (Postgres puts NULLs **first** in DESC order, so add \`WHERE salary IS NOT NULL\`); "per department" (add \`PARTITION BY department_id\`).

**QA translation:** the same pattern finds "the second most expensive product in a category" to check a sort, or "the latest order per customer" (\`ROW_NUMBER() … = 1\`).`,
      code: [
        {
          language: 'sql',
          title: 'Second / Nth highest salary, tie-safe',
          code: `-- 1. Second highest only (portable)
SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);       -- 80000

-- 2. Nth highest with DISTINCT + OFFSET (N = 2 -> OFFSET 1)
SELECT DISTINCT salary
FROM employees
WHERE salary IS NOT NULL               -- Postgres sorts NULLs first in DESC
ORDER BY salary DESC
LIMIT 1 OFFSET 1;                                          -- 80000

-- 3. DENSE_RANK: general N, ties handled, shows who
SELECT name, salary
FROM (SELECT name, salary,
             DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
      FROM employees) ranked
WHERE rnk = 2;                                             -- Chetan 80000

-- 4. Returns NULL instead of no row when N is too big (N = 5)
SELECT (SELECT DISTINCT salary FROM employees
        ORDER BY salary DESC LIMIT 1 OFFSET 4) AS fifth_highest;   -- NULL

-- 5. Per department: 2nd highest in each
SELECT department_id, name, salary
FROM (SELECT e.*, DENSE_RANK() OVER (PARTITION BY department_id
                                     ORDER BY salary DESC) AS rnk
      FROM employees e) t
WHERE rnk = 2;`,
        },
      ],
      keyPoints: [
        'Ask: distinct values or rows? Ties change the answer.',
        'DENSE_RANK has no gaps; RANK skips numbers after ties.',
        'Handle NULL salaries and "fewer than N values" explicitly.',
      ],
      source: 'GeeksforGeeks — Nth largest value using LIMIT and OFFSET; LeetCode 176/177 and AlgoMaster write-up (ties, NULL result); PostgreSQL 17 docs — Window Functions',
    },
    {
      heading: 'Orphan records, duplicates and integrity checks',
      body: `**Intuition:** an orphan is a child whose parent is gone: an order item pointing at an order that does not exist, an order pointing at a deleted customer. Orphans break screens (a "view order" page that crashes), reports (items counted without an order) and cleanups.

**How orphans happen**
- No foreign key constraint (MyISAM tables, FKs dropped "for performance", data split across microservice databases).
- A multi-step write that was not in one transaction and failed half-way.
- Manual fixes or test-data scripts deleting parents before children.
- Soft-deleted parents: the row exists but is marked deleted, so the app treats children as orphans.

**The checks (all are LEFT JOIN … IS NULL or NOT EXISTS)**
| Check | Finds |
|---|---|
| items without an order | \`order_items oi LEFT JOIN orders o … WHERE o.id IS NULL\` |
| orders whose customer is missing | \`… WHERE o.customer_id IS NOT NULL AND c.id IS NULL\` (guest orders are valid) |
| orders without any item | \`orders o LEFT JOIN order_items oi … WHERE oi.order_id IS NULL\` |
| header total ≠ sum of lines | \`GROUP BY o.id HAVING o.total_paise <> COALESCE(SUM(lines), 0)\` |
| duplicate business keys | \`GROUP BY key HAVING COUNT(*) > 1\` |

Note the business rule in the second check: \`customer_id IS NULL\` is a legal guest checkout, not an orphan. Integrity checks always encode a rule; confirm it with the BA or developer.

On the running dataset all four checks return **no rows** (101: 2 × 25000 = 50000; 102: 20000; 103: 55000 + 20000 = 75000; 104: 2 × 15000 = 30000). Make each check fail once on purpose, for example by inserting an item for order 999 in a scratch copy, to prove it can detect a problem.

**In interviews, say:** "Orphans are children whose parent key doesn't exist. I find them with a LEFT JOIN to the parent where the parent id is NULL, and I recommend a foreign key so the database prevents them."`,
      code: [
        {
          language: 'sql',
          title: 'Integrity sweep for the order domain',
          code: `-- 1. Order items whose order does not exist
SELECT oi.*
FROM order_items oi
LEFT JOIN orders o ON o.id = oi.order_id
WHERE o.id IS NULL;

-- 2. Orders pointing at a customer that does not exist (guests excluded)
SELECT o.id, o.customer_id
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
WHERE o.customer_id IS NOT NULL
  AND c.id IS NULL;

-- 3. Orders with no items at all
SELECT o.id
FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id);

-- 4. Header total does not match the sum of its lines
SELECT o.id, o.total_paise,
       COALESCE(SUM(oi.quantity * oi.unit_price_paise), 0) AS lines_paise
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.total_paise
HAVING o.total_paise <> COALESCE(SUM(oi.quantity * oi.unit_price_paise), 0);
-- all four: 0 rows on the running dataset`,
        },
      ],
      keyPoints: [
        'Orphan = child FK value with no parent row.',
        'Exclude legal NULL foreign keys (guest orders) from orphan checks.',
        'Prove a check can fail before trusting its "0 rows".',
      ],
      source: 'PostgreSQL 17 docs — 5.5.5 Foreign Keys; MySQL 8.0 Manual — FOREIGN KEY Constraints; LearnSQL.com — Software Testing SQL Interview Questions',
    },
    {
      heading: 'Constraints: what the database guarantees and how to test it',
      body: `**Intuition:** constraints are rules the database enforces no matter which app, script or API writes the data. Validation in the UI can be bypassed (an API call, a second browser tab, a race); a constraint cannot.

| Constraint | Guarantees | Negative test | PostgreSQL | MySQL 8 |
|---|---|---|---|---|
| PRIMARY KEY | unique, not NULL id | insert an existing id | 23505 | 1062 |
| UNIQUE | no duplicate values (NULLs allowed, usually many) | sign up twice with one email | 23505 unique_violation | 1062 Duplicate entry |
| FOREIGN KEY | child points to an existing parent | order for customer 99 | 23503 foreign_key_violation | 1452 |
| FK on delete parent | parent with children can't be deleted (default) | delete Asha | 23503 | 1451 |
| NOT NULL | value required | status NULL | 23502 not_null_violation | 1048 |
| CHECK | rule on values | total_paise = -500 | 23514 check_violation | 3819 (enforced from 8.0.16; earlier versions parsed and ignored CHECK) |
| DEFAULT | value when omitted | omit created_at | row gets the default | row gets the default |

**What a tester does with this**
- Read the schema (or \`information_schema.table_constraints\`) to learn the real rules, then compare them with the requirements: "email must be unique" but no UNIQUE constraint = a race-condition bug waiting to happen (two simultaneous sign-ups both pass the app's "email exists?" check).
- Write negative tests at the API level that should produce a clean 409/400, not a 500 with a raw SQL error leaking to the client.
- FK actions matter: \`ON DELETE CASCADE\` deletes children automatically (check nothing important is lost), \`SET NULL\` leaves them parent-less on purpose, the default (\`NO ACTION\`/\`RESTRICT\`) blocks the delete.
- A **nullable FK is legal**: guest order 104 passes the FK because NULL is not checked.

**In interviews, say:** "Primary key: unique and not null, one per table. Unique key: unique but can allow NULL, many per table. Foreign key: keeps references valid. I check that business rules like unique email are enforced in the DB, not only in the UI."`,
      code: [
        {
          language: 'sql',
          title: 'Negative constraint tests (each statement should fail)',
          code: `-- UNIQUE(email): duplicate sign-up
INSERT INTO customers (id, name, email, city)
VALUES (4, 'Asha K', 'asha@shop.test', 'Pune');
-- PG: 23505 duplicate key value violates unique constraint
-- MySQL: ERROR 1062 Duplicate entry 'asha@shop.test'

-- FOREIGN KEY: customer 99 does not exist
INSERT INTO orders (id, customer_id, status, total_paise)
VALUES (105, 99, 'paid', 1000);              -- PG 23503 / MySQL 1452

-- NOT NULL: status is required
INSERT INTO orders (id, customer_id, status, total_paise)
VALUES (106, 1, NULL, 1000);                 -- PG 23502 / MySQL 1048

-- CHECK (total_paise >= 0)
INSERT INTO orders (id, customer_id, status, total_paise)
VALUES (107, 1, 'paid', -500);               -- PG 23514 / MySQL 3819

-- FK blocks deleting a parent that has children (default action)
DELETE FROM customers WHERE id = 1;          -- PG 23503 / MySQL 1451

-- This one SUCCEEDS: a NULL foreign key is not checked (guest checkout)
INSERT INTO orders (id, customer_id, status, total_paise)
VALUES (108, NULL, 'paid', 1000);

-- List the constraints on a table (works in both)
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'orders';`,
        },
      ],
      keyPoints: [
        'PK = unique + not NULL; UNIQUE allows NULLs; FK keeps references valid.',
        'Test that rules are enforced in the DB, not only the UI.',
        'Expect a clean 4xx from the API, not a leaked SQL error.',
        'MySQL enforced CHECK only from 8.0.16.',
      ],
      source: 'PostgreSQL 17 docs — 5.5 Constraints, Appendix A PostgreSQL Error Codes; MySQL 8.0 Manual — CHECK Constraints, FOREIGN KEY Constraints, Server Error Message Reference',
    },
    {
      heading: 'INSERT, UPDATE, DELETE and transactions for safe test data',
      body: `**Intuition:** a transaction is a "draft mode" for data changes. You make changes, look at them, and then either publish (\`COMMIT\`) or throw them away (\`ROLLBACK\`). Without it, every statement is published the moment it runs.

**Autocommit.** MySQL and the psql client run in **autocommit** mode by default: each statement is its own transaction and commits immediately. An \`UPDATE products SET stock = 0;\` without WHERE is instantly permanent for every product. Start a transaction explicitly: \`BEGIN;\` (both) or \`START TRANSACTION;\` (both; the usual MySQL form).

**The safe-change routine**
1. Run a \`SELECT\` with the **exact WHERE** you plan to use; note the row count and old values.
2. \`BEGIN;\`
3. Run the \`UPDATE\`/\`DELETE\`; check "rows affected" equals step 1.
4. \`SELECT\` again to verify the new values.
5. \`COMMIT;\` if correct, \`ROLLBACK;\` if not.

MySQL can also guard you: \`SET sql_safe_updates = 1;\` (or \`mysql --safe-updates\`) rejects UPDATE/DELETE that has neither a key column in WHERE nor a LIMIT.

**DELETE vs TRUNCATE vs DROP**
| | DELETE | TRUNCATE | DROP |
|---|---|---|---|
| Removes | chosen rows (WHERE) | all rows | the table itself |
| Type | DML | DDL | DDL |
| Rollback | yes | **PostgreSQL: yes; MySQL: no** (implicit commit) | PostgreSQL: yes; MySQL: no |
| Triggers | fire per row | do not fire DELETE triggers | — |
| Auto-increment | continues | MySQL resets it; Postgres only with RESTART IDENTITY | gone |
| Referenced by FK | per-row checks | rejected (MySQL InnoDB; Postgres unless CASCADE) | rejected unless CASCADE |

**MySQL implicit commits:** DDL statements (\`CREATE\`, \`ALTER\`, \`DROP\`, \`TRUNCATE\`, …) commit the current transaction before they run, so anything you did before them can no longer be rolled back. PostgreSQL DDL is transactional.

**The visibility catch for UI testing.** Uncommitted changes are visible only inside *your* session. The app under test uses its own connections and will not see them (no dirty reads at the default isolation levels: READ COMMITTED in Postgres, REPEATABLE READ in MySQL InnoDB). So "set stock to 0 in a transaction, test the UI, roll back" does not work; you must commit the setup and restore afterwards.`,
      code: [
        {
          language: 'sql',
          title: 'Change test data with a preview, a transaction and a check',
          code: `-- 1. Preview: same WHERE as the change
SELECT id, name, stock FROM products WHERE id = 1;   -- Wireless Mouse | 25

-- 2-5. Change inside a transaction
BEGIN;                                   -- MySQL: START TRANSACTION;
UPDATE products SET stock = 0 WHERE id = 1;          -- expect "1 row affected"
SELECT id, stock FROM products WHERE id = 1;         -- 0 (visible to me only)
COMMIT;                                  -- now the app can see it
-- ... run the "out of stock" UI test ...
UPDATE products SET stock = 25 WHERE id = 1;         -- restore captured value

-- A rehearsal you throw away: DELETE then ROLLBACK
BEGIN;
DELETE FROM order_items WHERE order_id = 104;        -- 1 row
SELECT COUNT(*) FROM order_items;                    -- 4
ROLLBACK;
SELECT COUNT(*) FROM order_items;                    -- 5 again

-- INSERT with explicit columns (robust to new columns)
INSERT INTO products (id, name, price_paise, stock)
VALUES (90, 'QA Run 42 Test Lamp', 99900, 3);

-- MySQL guard rail for ad-hoc sessions
SET sql_safe_updates = 1;   -- UPDATE ... without key-WHERE or LIMIT now errors`,
        },
      ],
      keyPoints: [
        'Autocommit is on by default: start a transaction before risky changes.',
        'Preview with SELECT, compare rows affected, then COMMIT or ROLLBACK.',
        'MySQL: TRUNCATE/DDL commit implicitly; Postgres DDL can roll back.',
        'The app never sees your uncommitted changes.',
      ],
      source: 'SQLBolt — Lessons 13–15 Inserting, Updating, Deleting rows; MySQL 8.0 Manual — Statements That Cause an Implicit Commit, TRUNCATE TABLE, mysql client --safe-updates; PostgreSQL 17 docs — BEGIN, ROLLBACK, TRUNCATE',
    },
    {
      heading: 'Validating UI and API data against the database',
      body: `**Intuition:** the UI saying "Order placed!" is a claim. The database row is the evidence. A good DB check confirms the claim **field by field**, for the exact record your test created.

**A repeatable recipe**
1. **Capture the identity** from the UI or API response: order id, confirmation number, or a unique value you entered (e.g. an email with a run id). Never assume "the latest row" is yours.
2. **Map fields and transformations** before writing queries:

| UI shows | DB column | Transformation |
|---|---|---|
| Order #105 | orders.id | strip "#" |
| ₹765.00 | orders.total_paise | × 100 → 76500 |
| Paid | orders.status | lower-case 'paid' |
| 14 Mar 2026, 3:45 PM | orders.created_at | UTC in DB, IST in UI |
| 2 × Phone Case | order_items.quantity | per product row |

3. **Check every table the action should touch**: header (orders), lines (order_items), payment (payments, exactly one row), side effects (stock decremented, coupon usage incremented), and also what should *not* change (another customer's cart).
4. **Wait for asynchronous writes**: payment webhooks and queues may update status seconds later. Poll with a timeout (\`expect.poll\` in Playwright) instead of a fixed sleep.
5. **Compare exact types**: node-postgres returns BIGINT and NUMERIC columns as **strings** by default, so \`expect(row.total_paise).toBe(76500)\` fails against \`'76500'\` if the column is BIGINT; convert explicitly.

**API → DB** follows the same idea: after \`POST /orders\` returns 201 with an id, query by that id; after \`DELETE\`, assert the row is gone (or soft-deleted, \`deleted_at IS NOT NULL\`), and that children were handled per the rules.

**In interviews, say:** "I take the order id from the confirmation, query the order, its items and payment by that id, compare amounts in paise and status, check stock was decremented, and poll briefly because the payment status is updated asynchronously."`,
      code: [
        {
          language: 'typescript',
          title: 'Playwright test: place an order in the UI, verify it in PostgreSQL',
          code: `import { test, expect } from '@playwright/test';
import { Client } from 'pg';

test('order placed in the UI is stored correctly', async ({ page }) => {
  // ...UI steps that add items, apply SAVE10 and pay (omitted)...
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByRole('heading', { name: 'Thank you' })).toBeVisible();
  const label = await page.getByTestId('order-number').innerText(); // "#105"
  const orderId = Number(label.replace('#', ''));

  const db = new Client({ connectionString: process.env.QA_DB_URL });
  await db.connect();
  try {
    // payment status is set by an async webhook: poll, don't sleep
    await expect.poll(async () => {
      const r = await db.query('SELECT status FROM orders WHERE id = $1', [orderId]);
      return r.rows[0]?.status;
    }, { timeout: 15_000 }).toBe('paid');

    const order = await db.query(
      'SELECT customer_id, total_paise, coupon_code FROM orders WHERE id = $1', [orderId]);
    expect(order.rows[0]).toMatchObject({ customer_id: 1, coupon_code: 'SAVE10' });
    expect(Number(order.rows[0].total_paise)).toBe(76500);   // BIGINT arrives as string

    const items = await db.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1 ORDER BY product_id',
      [orderId]);
    expect(items.rows).toEqual([
      { product_id: 1, quantity: 1 },
      { product_id: 4, quantity: 2 },
    ]);
  } finally {
    await db.end();          // always release the connection
  }
});`,
        },
        {
          language: 'sql',
          title: 'The same checks as plain SQL (for a manual run)',
          code: `SELECT o.id, o.customer_id, o.status, o.total_paise, o.coupon_code,
       COUNT(DISTINCT oi.product_id)               AS lines,
       SUM(oi.quantity * oi.unit_price_paise)       AS items_paise,
       (SELECT COUNT(*) FROM payments p
         WHERE p.order_id = o.id)                   AS payment_rows
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = 105
GROUP BY o.id, o.customer_id, o.status, o.total_paise, o.coupon_code;
-- expect: 105 | 1 | paid | 76500 | SAVE10 | 2 | 85000 | 1`,
        },
      ],
      keyPoints: [
        'Query by the id your test created, never "the latest row".',
        'Write the UI-to-column mapping and transformations first.',
        'Check header, lines, payment, side effects and non-effects.',
        'Poll for async updates; watch driver types (BIGINT as string).',
      ],
      source: 'Playwright docs — Assertions: expect.poll; node-postgres docs — Queries (parameterized), Data types (int8/numeric parsed as strings)',
    },
    {
      heading: 'Test data setup and cleanup that survives parallel runs',
      body: `**Intuition:** test data is like borrowing a meeting room: book it under your own name, use it, and leave it the way you found it, so the next person (or the next parallel worker) is not surprised.

**Ways to set up data, best first**
| Approach | When | Watch out |
|---|---|---|
| Through the app's API | most UI/API tests | slower than SQL but respects business rules |
| Direct SQL inserts | states the API can't create (expired coupon, legacy record) | bypasses app logic, so fill every column the app expects |
| Seed scripts / fixtures per environment | shared reference data (products, categories) | treat as read-only in tests |
| DB snapshot / container per run | full isolation in CI | needs infra; fastest reset |
| Transaction + ROLLBACK | DB-only tests in the same connection | does **not** work for UI tests (the app uses other connections) |

**Rules that keep cleanup safe**
- **Tag everything you create** with a unique run id: \`qa.run42.asha@shop.test\`, product names starting with \`QA Run 42\`. Cleanup deletes only tagged rows.
- **Careful with LIKE wildcards**: \`_\` matches any one character, so \`LIKE 'qa_run42%'\` also matches \`qaXrun42…\`. Use separators that are not wildcards (dots) or \`ESCAPE\`.
- **Delete children before parents** (payments → order_items → orders → customers), or rely on documented \`ON DELETE CASCADE\`.
- **Make cleanup idempotent**: it should succeed when the data is already gone, and run in \`afterAll\`/teardown *and* at the start of the next run (crashed runs leave leftovers).
- **Never "restore" with hard-coded values for all rows**: capture old values first, restore only the rows you changed.
- **Parallel workers**: each worker creates its own customer and orders; never share a mutable "test user".

**In interviews, say:** "I create data through the API with a unique run id, verify via SQL by id, and clean up only rows with that tag, children first, in an idempotent teardown."`,
      code: [
        {
          language: 'sql',
          title: 'Tagged setup and idempotent cleanup (children first)',
          code: `-- Setup: a dedicated customer for run 42
INSERT INTO customers (id, name, email, city)
VALUES (9042, 'QA Run 42', 'qa.run42.buyer@shop.test', 'Pune');

-- Cleanup: only rows belonging to run 42, children before parents
BEGIN;
DELETE FROM payments
WHERE order_id IN (SELECT o.id FROM orders o
                   JOIN customers c ON c.id = o.customer_id
                   WHERE c.email LIKE 'qa.run42.%@shop.test');
DELETE FROM order_items
WHERE order_id IN (SELECT o.id FROM orders o
                   JOIN customers c ON c.id = o.customer_id
                   WHERE c.email LIKE 'qa.run42.%@shop.test');
DELETE FROM orders
WHERE customer_id IN (SELECT id FROM customers
                      WHERE email LIKE 'qa.run42.%@shop.test');
DELETE FROM customers WHERE email LIKE 'qa.run42.%@shop.test';
-- sanity check before committing: nothing else touched
SELECT COUNT(*) FROM customers WHERE email LIKE 'qa.run42.%';   -- 0
COMMIT;
-- Running it again deletes 0 rows and still succeeds (idempotent).
-- Note: '.' is not a LIKE wildcard; '_' and '%' are.`,
        },
      ],
      keyPoints: [
        'Prefer API setup; use SQL for states the API cannot create.',
        'Tag test data with a run id and clean up only tagged rows.',
        'Children before parents; idempotent; also clean at start of run.',
        'Rollback-based isolation works only within one DB connection.',
      ],
      source: 'Playwright docs — Test fixtures / global setup and teardown; PostgreSQL 17 docs — Pattern Matching (LIKE, ESCAPE); MySQL 8.0 Manual — FOREIGN KEY referential actions',
    },
  ],
  codeChallenges: [
    {
      id: 'sql-joins-validation-cc-1',
      title: 'Repair the "customers and paid orders" validation report',
      context:
        'The product owner wants every customer listed with their number of paid orders, including customers with none, plus a list of customers who never ordered. A tester wrote two checks; the first shows only 2 customers and the second returns nothing, yet the tester marked both "pass". Use the running dataset (Meera never ordered; guest order 104 has customer_id NULL).',
      task: 'Fix both queries so that check 1 returns Asha 1, Ravi 1, Meera 0 and check 2 returns Meera. Keep them correct even if two customers share a name.',
      starter: {
        language: 'sql',
        code: `-- Check 1: every customer with number of PAID orders (0 must show)
SELECT c.name, COUNT(*) AS paid_orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid'
GROUP BY c.name;

-- Check 2: customers who never placed an order
SELECT name
FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders);`,
      },
      hints: [
        'What value does o.status have on Meera\'s row after the LEFT JOIN, and what does WHERE do with UNKNOWN?',
        'On a NULL-padded row, what do COUNT(*) and COUNT(o.id) return?',
        'Order 104 puts a NULL into the NOT IN list. What is 3 <> NULL?',
      ],
      solution: {
        language: 'sql',
        code: `-- Check 1
SELECT c.id, c.name,
       COUNT(o.id) AS paid_orders          -- counts matched orders only
FROM customers c
LEFT JOIN orders o
       ON o.customer_id = c.id
      AND o.status = 'paid'                -- optional-side filter in ON
GROUP BY c.id, c.name                      -- id keeps namesakes apart
ORDER BY c.id;
-- 1 Asha 1 | 2 Ravi 1 | 3 Meera 0

-- Check 2 (NULL-safe)
SELECT c.id, c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o
                  WHERE o.customer_id = c.id);
-- 3 Meera`,
      },
      explanation: `**Fixes**
1. **WHERE on the right table** removed Meera's NULL-padded row (\`NULL = 'paid'\` is UNKNOWN), silently turning the LEFT JOIN into an INNER JOIN. Moving \`o.status = 'paid'\` into ON makes it part of the match rule, so Meera stays.
2. **COUNT(*) → COUNT(o.id)**: once Meera is back, \`COUNT(*)\` would report 1 for her because her padded row is still a row. \`COUNT(o.id)\` counts only real orders, so she gets 0.
3. **GROUP BY c.name → GROUP BY c.id, c.name**: grouping by name merges two different customers called "Asha" into one line.
4. **NOT IN → NOT EXISTS**: the subquery list is (1, 1, 2, NULL). For Meera, \`3 NOT IN (…)\` includes \`3 <> NULL\` = UNKNOWN, so the condition is never TRUE and the query returns nothing. NOT EXISTS checks each row with \`=\` and is NULL-safe.

**Testing lesson:** both original checks "passed" because an empty or short result looked plausible. Always know the expected answer on a small dataset before trusting a check.`,
      followUps: [
        {
          q: 'Is WHERE o.status = \'paid\' OR o.id IS NULL an acceptable fix for check 1?',
          a: 'It works on this sample but is wrong in general. A customer whose only orders are cancelled has real order rows, all of which fail the status test and are not NULL, so the customer disappears instead of showing 0. Putting the filter in ON is correct for every case.',
        },
        {
          q: 'How would you write check 2 with a join instead of NOT EXISTS?',
          a: 'SELECT c.id, c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL. Test the right table\'s primary key (never NULL in a real row) rather than a nullable column, otherwise a real order with a NULL in that column would look like "no order".',
        },
      ],
    },
    {
      id: 'sql-joins-validation-cc-2',
      title: 'Make an unsafe test-data script safe',
      context:
        'Before testing the "out of stock" banner, a tester ran this script in a MySQL client with autocommit on, against the shared QA database. Afterwards every product showed stock 25, Asha\'s real order history was gone (or the delete failed on foreign keys, depending on the table), and all customers disappeared from the admin panel. All customer emails end with @shop.test.',
      task: 'Rewrite the script so it changes only the intended product, restores its original value, and cleans up only data created by this test run. State the expected row counts.',
      starter: {
        language: 'sql',
        code: `-- make the mouse out of stock for the UI test
UPDATE products SET stock = 0;

-- ... run the UI test manually ...

-- restore
UPDATE products SET stock = 25;

-- clean up the test orders and test users
DELETE FROM orders WHERE customer_id = 1;
DELETE FROM customers WHERE email LIKE '%test%';`,
      },
      hints: [
        'Which rows does an UPDATE without WHERE touch, and when does it commit in autocommit mode?',
        'How do you know the original stock of each product, and was it really 25 for all of them?',
        'Which rows did the test actually create? How would you recognise them, and which tables reference orders?',
      ],
      solution: {
        language: 'sql',
        code: `-- 1. Preview and capture the original value
SELECT id, stock FROM products WHERE id = 1;          -- 1 | 25

-- 2. Change exactly one row, verify, then commit (the app must see it)
START TRANSACTION;
UPDATE products SET stock = 0 WHERE id = 1;          -- 1 row affected
SELECT id, stock FROM products WHERE id = 1;          -- 1 | 0
COMMIT;

-- ... run the UI test ...

-- 3. Restore only that row to the captured value
UPDATE products SET stock = 25 WHERE id = 1;         -- 1 row affected

-- 4. Clean up only this run's data (tagged emails), children first
START TRANSACTION;
DELETE p FROM payments p
  JOIN orders o    ON o.id = p.order_id
  JOIN customers c ON c.id = o.customer_id
 WHERE c.email LIKE 'qa.run42.%@shop.test';
DELETE oi FROM order_items oi
  JOIN orders o    ON o.id = oi.order_id
  JOIN customers c ON c.id = o.customer_id
 WHERE c.email LIKE 'qa.run42.%@shop.test';
DELETE o FROM orders o
  JOIN customers c ON c.id = o.customer_id
 WHERE c.email LIKE 'qa.run42.%@shop.test';
DELETE FROM customers WHERE email LIKE 'qa.run42.%@shop.test';
SELECT COUNT(*) FROM customers;                       -- 3: real ones untouched
COMMIT;`,
      },
      explanation: `**Fixes**
1. **UPDATE without WHERE** set stock 0 on every product, and in autocommit mode it was permanent immediately. The fix targets \`WHERE id = 1\`, previews with the same WHERE, and checks "1 row affected". Turning on \`sql_safe_updates\` (or \`mysql --safe-updates\`) for ad-hoc sessions makes MySQL reject UPDATE/DELETE that has neither a key in WHERE nor a LIMIT.
2. **Hard-coded restore** wrote 25 into every product, destroying the real stock values (Notebook Pack had 100, Phone Case 60). Capture the old value first and restore only the changed row.
3. **DELETE FROM orders WHERE customer_id = 1** deleted Asha's real orders, not test orders; with FKs it fails because order_items reference them, without FKs it creates orphans. The fix deletes only orders of tagged test customers, **children first** (payments and order_items, then orders, then customers).
4. **LIKE '%test%'** matched every customer, because all emails end with \`@shop.test\`. A run-specific tag (\`qa.run42.\`) is unambiguous; dots are not LIKE wildcards, unlike \`_\`.
5. The final transaction includes a sanity \`SELECT\` before \`COMMIT\`, so a wrong row count can still be rolled back.

**Note:** the stock change is committed on purpose: the app runs on its own connections and cannot see uncommitted data, so "change, test, roll back" would not work for a UI test.`,
      followUps: [
        {
          q: 'The bad UPDATE already ran with autocommit on. How do you recover?',
          a: 'There is no ROLLBACK for a committed statement. Stop further changes, tell the team, and restore from what exists: a recent backup or snapshot of the QA database, a seed script for reference data, or binlog/point-in-time recovery if the DBA has it enabled. Then reseed the affected table and record the incident so safe-update settings or read-only users get introduced.',
        },
        {
          q: 'How would you avoid direct SQL for this test altogether?',
          a: 'Use an admin API or a test-only endpoint to set the product\'s stock, or create a dedicated test product with stock 0 tagged with the run id. The test then never touches shared products, can run in parallel, and cleanup removes only its own product.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'sql-joins-validation-iq-01',
      difficulty: 'easy',
      question: 'Explain the different types of joins with an example. When would you use a LEFT JOIN instead of an INNER JOIN?',
      whatInterviewerLooksFor: [
        'Correct definitions of INNER, LEFT, RIGHT, FULL (and CROSS/SELF)',
        'A concrete two-table example with expected rows',
        'Knows unmatched rows get NULLs and that rows can multiply',
        'Chooses LEFT JOIN when the "no match" rows matter',
      ],
      modelAnswer: `**Setup:** customers (Asha, Ravi, Meera) and orders (101 & 102 Asha, 103 Ravi, 104 guest with no customer).

| Join | Keeps | Rows |
|---|---|---|
| INNER | only matching customer–order pairs | 3 (Asha×2, Ravi) |
| LEFT | all customers; order columns NULL if none | 4 (+ Meera, NULL) |
| RIGHT | all orders; customer columns NULL if none | 4 (+ guest order 104) |
| FULL OUTER | everything from both | 5 |
| CROSS | every combination | 12 |
| SELF | a table joined to itself | e.g. category → parent category |

**When LEFT instead of INNER:** whenever the rows **without** a match are part of the answer or are what I'm testing for:
- a report of "all customers and their order count" must show Meera with 0;
- finding customers who never ordered (\`LEFT JOIN … WHERE o.id IS NULL\`);
- finding orphan records (items whose order is missing).

**Two things I keep in mind as a tester**
- Joins can **multiply rows**: Asha appears twice because she has two orders, so sums over customer-level columns after a join can double-count.
- With a LEFT JOIN, a condition on the right table belongs in ON, not WHERE, or the LEFT JOIN behaves like an INNER JOIN.`,
      followUps: [
        {
          q: 'What is a self join? Give a real example.',
          a: 'Joining a table to itself under two aliases to relate rows of the same entity. Example: categories with a parent_id; categories child LEFT JOIN categories parent ON parent.id = child.parent_id lists each category with its parent, and the LEFT keeps top-level categories with a NULL parent. Another classic is employees and their managers.',
        },
        {
          q: 'Why might a join return more rows than either table has?',
          a: 'Because of one-to-many or many-to-many relationships: each left row is repeated once per matching right row. A CROSS JOIN, or a join on a non-unique column by mistake, returns rows multiplied out. If a customer-orders join returns more rows than orders, the join key is probably wrong.',
        },
      ],
      pitfalls: [
        'Describing joins only as Venn diagrams with no row counts',
        'Saying LEFT JOIN returns "only the left table"',
        'Not knowing that unmatched columns become NULL',
      ],
    },
    {
      id: 'sql-joins-validation-iq-02',
      difficulty: 'medium',
      question: 'Write a query to find customers who have never placed an order. Give me more than one way.',
      context: 'Frequently asked in QA and SDET SQL rounds (LearnSQL and GeeksforGeeks question lists; Glassdoor tester reports mention join/subquery tasks of this kind).',
      whatInterviewerLooksFor: [
        'LEFT JOIN … IS NULL and NOT EXISTS solutions',
        'Tests IS NULL on the right table\'s primary key',
        'Knows the NOT IN + NULL trap',
        'Can explain which one they prefer and why',
      ],
      modelAnswer: `**1. LEFT JOIN + IS NULL (anti-join via outer join)**
- \`SELECT c.id, c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;\`
- Customers with no order get a NULL-padded row; keeping only those gives Meera. I test \`o.id\` (the primary key, never NULL in a real row), not a nullable column.

**2. NOT EXISTS**
- \`SELECT c.id, c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);\`
- Reads like the requirement and is NULL-safe. This is my default.

**3. NOT IN, with care**
- \`WHERE c.id NOT IN (SELECT customer_id FROM orders)\` returns **nothing** if any order has \`customer_id\` NULL (our guest order 104), because \`3 <> NULL\` is UNKNOWN.
- Safe only with \`WHERE customer_id IS NOT NULL\` inside the subquery.

**4. Set operation (Postgres EXCEPT; MySQL 8.0.31+)**
- \`SELECT id FROM customers EXCEPT SELECT customer_id FROM orders;\` (returns ids only).

**What I'd say about choice:** NOT EXISTS and the LEFT JOIN usually get the same efficient anti-join plan; I prefer NOT EXISTS for readability and NULL safety. In testing, this query is how I find a "new customer" for first-order coupon tests.`,
      followUps: [
        {
          q: 'Now find customers who have orders, but none of them paid.',
          a: 'SELECT c.id, c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = \'paid\'). On our data that is nobody, because Asha has paid order 101. It is a good test-data finder for "retry payment" scenarios.',
        },
        {
          q: 'Why exactly does NOT IN return nothing here?',
          a: 'NOT IN (1, 1, 2, NULL) expands to id <> 1 AND id <> 1 AND id <> 2 AND id <> NULL. The last comparison is UNKNOWN for every id, and TRUE AND UNKNOWN is UNKNOWN, so no row ever gets TRUE and WHERE discards them all. The PostgreSQL docs describe exactly this behaviour.',
        },
      ],
      pitfalls: [
        'Using INNER JOIN with WHERE o.id IS NULL (always empty)',
        'Using NOT IN on a nullable column without noticing the trap',
        'Testing a nullable right-table column instead of its primary key',
      ],
    },
    {
      id: 'sql-joins-validation-iq-03',
      difficulty: 'medium',
      question: 'Find the second highest salary from an employees table. Now make it work for the Nth highest.',
      context: 'Probably the most widely reported SQL question in tester interviews (LeetCode 176/177, GeeksforGeeks lists, many Glassdoor QA reports). Data: Anil 90000, Bina 90000, Chetan 80000, Divya 70000.',
      whatInterviewerLooksFor: [
        'Asks or handles ties (distinct salaries vs rows)',
        'At least two correct approaches (subquery with MAX, DISTINCT + LIMIT/OFFSET, DENSE_RANK)',
        'Knows RANK vs DENSE_RANK',
        'Handles edge cases: fewer than N values, NULL salaries',
      ],
      modelAnswer: `**Clarify first:** "Second highest *distinct* salary? With Anil and Bina both on 90000, is the answer 80000?" Usually yes.

**Second highest**
- \`SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);\` → 80000. Simple and portable, but only for N = 2.

**Nth highest, LIMIT/OFFSET**
- \`SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET N-1;\` (OFFSET 1 for N = 2) → 80000.
- Without DISTINCT, OFFSET 1 returns Bina's 90000, which is wrong. (In a MySQL stored function, LIMIT takes a variable, not an expression like N-1, so compute it first.)

**Nth highest, window function (MySQL 8+, Postgres)**
- \`SELECT name, salary FROM (SELECT name, salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees) t WHERE rnk = 2;\` → Chetan 80000.
- DENSE_RANK gives 1, 1, 2, 3; RANK gives 1, 1, 3, 4, so RANK = 2 finds nobody. ROW_NUMBER ignores ties entirely.

**Edge cases I'd mention**
- N greater than the number of distinct salaries: return NULL rather than no row by wrapping it as a scalar subquery.
- NULL salaries: Postgres sorts NULLs first in DESC, so add \`WHERE salary IS NOT NULL\`.
- Per department: \`PARTITION BY department_id\`.

**QA use:** the same pattern verifies "sort by price" pages or finds the second most expensive product for a test.`,
      followUps: [
        {
          q: 'Write it without LIMIT and without window functions, for any N.',
          a: 'Use a correlated count: SELECT DISTINCT e1.salary FROM employees e1 WHERE N - 1 = (SELECT COUNT(DISTINCT e2.salary) FROM employees e2 WHERE e2.salary > e1.salary). For N = 2, exactly one distinct salary (90000) is higher than 80000, so it returns 80000. It works on old databases but is slower on large tables.',
        },
        {
          q: 'What changes if the interviewer wants all employees who earn the second highest salary?',
          a: 'The DENSE_RANK version already returns every employee with rnk = 2, so ties at that level all appear. With the MAX or LIMIT version I would use it as a subquery: SELECT name FROM employees WHERE salary = (second-highest query).',
        },
      ],
      pitfalls: [
        'ORDER BY salary DESC LIMIT 1 OFFSET 1 without DISTINCT',
        'Using RANK and getting an empty result on ties',
        'Not asking about ties at all',
      ],
    },
    {
      id: 'sql-joins-validation-iq-04',
      difficulty: 'medium',
      question: 'A tester clicks Place order and sees confirmation #105. Which database checks prove that purchase was persisted properly, table by table?',
      whatInterviewerLooksFor: [
        'Identifies the record by the id/confirmation captured from the UI',
        'Checks all affected tables (order, items, payment, stock, coupon)',
        'Handles transformations (paise, time zone, status casing)',
        'Thinks about async updates and negative side effects',
        'Mentions automating it with parameterised queries',
      ],
      modelAnswer: `**1. Identify the record.** Take the order number from the confirmation page (e.g. #105), not "the latest order", because other testers or parallel tests create orders too.

**2. Check the header** (\`orders\`): customer_id is the logged-in user, status is \`paid\` (or \`pending\` until the payment webhook arrives), total equals the UI total converted to paise (₹765.00 → 76500), coupon_code is SAVE10, created_at matches the UI time after UTC→IST conversion.

**3. Check the lines** (\`order_items\` joined to \`products\`): one row per product, correct quantities and unit prices captured at purchase time; the sum of lines minus the discount equals the header total.

**4. Check side effects:** exactly one \`payments\` row with the order's amount and a unique gateway reference; product stock decremented by the quantities; coupon usage count incremented; cart emptied.

**5. Check non-effects:** no duplicate order from a double click, other customers' carts and stock for other products unchanged.

**6. Handle timing:** payment status is often updated asynchronously, so I poll with a timeout instead of checking once.

**Automation:** in Playwright I read the order number from the page, query with parameters (\`WHERE id = $1\`) using a read-only DB user, poll the status with \`expect.poll\`, and compare numbers carefully because some drivers return BIGINT as strings. If DB access isn't allowed in CI, I verify the same fields through the order API instead.`,
      followUps: [
        {
          q: 'The DB shows total 85000 but the UI showed ₹765.00. Whose bug is it?',
          a: '85000 is the item sum before the 10% SAVE10 discount (8500). Either the backend did not apply the coupon when saving, or the header stores the pre-discount amount and a separate discount column holds 8500. I would check the discount column and the payment row: if the customer was charged 76500 but the order says 85000, it is a backend persistence bug affecting invoices and refunds.',
        },
        {
          q: 'You do not have DB access in the CI environment. What now?',
          a: 'Verify through the next best source of truth: the order-details API (GET /orders/105) or the admin UI, checking the same fields. I would ask for a read-only DB user or a test-only query endpoint for critical flows, and keep DB-level checks for environments where access exists.',
        },
      ],
      pitfalls: [
        'Querying "the latest order" instead of the specific id',
        'Only checking that a row exists',
        'Ignoring units, time zones and async status updates',
      ],
    },
    {
      id: 'sql-joins-validation-iq-05',
      difficulty: 'hard',
      question: 'What are orphan records? How do you find them, and why do they appear?',
      whatInterviewerLooksFor: [
        'Defines orphan as a child row whose parent key does not exist',
        'Writes a LEFT JOIN … IS NULL or NOT EXISTS query',
        'Excludes legitimate NULL foreign keys',
        'Explains root causes and the fix (FK constraint, transactions)',
      ],
      modelAnswer: `**Definition:** an orphan is a child row whose foreign-key value points at a parent row that does not exist, e.g. an \`order_items\` row with \`order_id = 999\` when there is no order 999.

**Finding them**
- Items without an order: \`SELECT oi.* FROM order_items oi LEFT JOIN orders o ON o.id = oi.order_id WHERE o.id IS NULL;\`
- Orders without a customer: \`… LEFT JOIN customers c ON c.id = o.customer_id WHERE o.customer_id IS NOT NULL AND c.id IS NULL;\` The \`IS NOT NULL\` excludes guest orders, which are valid by design.
- Equivalent with NOT EXISTS.

Related integrity checks I run in the same sweep: parents without children (orders with no items), header totals not matching line sums, and duplicate business keys.

**Why they appear**
- No foreign key constraint: legacy tables, MyISAM, FKs removed for bulk-load speed, or data split across microservice databases where an FK is impossible.
- Non-atomic writes: the order insert failed after items were written, outside a transaction.
- Deletes in the wrong order by scripts or manual fixes (including test-data cleanup).
- Soft deletes: the parent is flagged deleted and the app treats the children as orphaned.

**Impact and fix:** broken pages, wrong reports, failing exports. I'd report the count and sample ids, and recommend an FK with the right ON DELETE action, writing parent and children in one transaction, and a scheduled integrity check for cross-service data.`,
      followUps: [
        {
          q: 'The parent lives in a different microservice database. How do you check for orphans?',
          a: 'A SQL join is not possible across databases, so I export the child keys and the parent keys (or call the parent service\'s API in batches) and compare the sets in a script or a staging warehouse. Many teams run this as a scheduled reconciliation job. I would also test the event flow that should prevent orphans, such as "customer deleted" events cascading correctly.',
        },
        {
          q: 'ON DELETE CASCADE is set. Can orphans still happen, and what would you test?',
          a: 'Not for that relationship inside one database, but cascade can delete more than expected, such as order history when a customer is removed, which may violate audit or legal retention rules. I would test that deleting a parent removes exactly the intended children and that business rules (e.g. customers with orders cannot be deleted, only anonymised) are enforced.',
        },
      ],
      pitfalls: [
        'Using INNER JOIN, which can never show orphans',
        'Treating every NULL foreign key as an orphan',
        'Not mentioning prevention (constraints, transactions)',
      ],
    },
    {
      id: 'sql-joins-validation-iq-06',
      difficulty: 'medium',
      question: 'What is the difference between DELETE, TRUNCATE and DROP? How do you change test data safely?',
      whatInterviewerLooksFor: [
        'DELETE = DML with WHERE; TRUNCATE = remove all rows (DDL); DROP = remove the table',
        'Rollback differences between MySQL and PostgreSQL',
        'Describes the preview → transaction → verify → commit/rollback routine',
        'Knows the app cannot see uncommitted changes',
      ],
      modelAnswer: `**DELETE** removes the rows matching a WHERE (all rows if WHERE is missing). It is DML, row by row, fires DELETE triggers, checks foreign keys per row, and can be rolled back inside a transaction.

**TRUNCATE** removes **all** rows at once, much faster, without per-row triggers. It is DDL: in **MySQL** it causes an implicit commit, so it cannot be rolled back, and it resets AUTO_INCREMENT; in **PostgreSQL** it is transactional (can be rolled back) and keeps sequences unless \`RESTART IDENTITY\`. Both refuse to truncate a table referenced by foreign keys (Postgres unless \`CASCADE\`).

**DROP TABLE** removes the table definition and its data. Same rollback split: implicit commit in MySQL, transactional in Postgres.

**My safe routine for changing data**
1. \`SELECT\` with exactly the WHERE I'll use; note row count and old values.
2. \`BEGIN;\` / \`START TRANSACTION;\` (autocommit is on by default).
3. \`UPDATE\`/\`DELETE\`; check rows affected matches the preview.
4. \`SELECT\` again; \`COMMIT\` if right, \`ROLLBACK\` if not.
5. In MySQL ad-hoc sessions, \`SET sql_safe_updates = 1\`.

**Catch for UI tests:** my uncommitted changes are visible only in my session; the app uses other connections and won't see them. So for UI preconditions I commit the change, run the test, and restore the captured value (or create dedicated tagged test data and delete it afterwards).`,
      followUps: [
        {
          q: 'In MySQL you ran START TRANSACTION, an UPDATE, then TRUNCATE on another table, then ROLLBACK. What is rolled back?',
          a: 'Nothing. TRUNCATE is DDL and causes an implicit commit before it executes, which commits the UPDATE too, and TRUNCATE itself cannot be rolled back. The ROLLBACK has no open transaction to undo. In PostgreSQL the same sequence would roll back both statements.',
        },
        {
          q: 'When would you prefer TRUNCATE over DELETE in test automation?',
          a: 'For resetting whole scratch tables in a dedicated test database between suites, where speed matters and no one else uses the data. Never on a shared QA database, and only in dependency order or with CASCADE where foreign keys exist. For per-test cleanup, a targeted DELETE of tagged rows is safer.',
        },
      ],
      pitfalls: [
        'Saying TRUNCATE can always be rolled back (or never)',
        'Running UPDATE/DELETE without previewing the WHERE',
        'Thinking a rolled-back setup is visible to the app during a UI test',
      ],
    },
    {
      id: 'sql-joins-validation-iq-07',
      difficulty: 'hard',
      question: 'A "customers and their paid orders" report uses a LEFT JOIN, but customers with zero paid orders are missing. What is wrong and how do you fix it?',
      context: 'The query: SELECT c.name, COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = \'paid\' GROUP BY c.name.',
      whatInterviewerLooksFor: [
        'Spots that WHERE on the right table removes NULL-padded rows',
        'Moves the condition into ON',
        'Fixes COUNT(*) → COUNT(o.id) and grouping by name',
        'Explains with three-valued logic and shows expected output',
        'Mentions how they would test the report (known dataset)',
      ],
      modelAnswer: `**Diagnosis.** The LEFT JOIN produces a row for Meera (no orders) with all order columns NULL. Then \`WHERE o.status = 'paid'\` evaluates \`NULL = 'paid'\` → UNKNOWN, and WHERE keeps only TRUE rows, so Meera's row is removed. Any filter on the right table in WHERE turns the LEFT JOIN into an INNER JOIN. (PostgreSQL's planner literally plans it as an inner join.)

**Fix**
- Move the condition into ON: \`LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'\`. Now "paid" is part of the matching rule: cancelled orders don't match, and customers with no paid order keep their NULL-padded row.
- Count the right table's key: \`COUNT(o.id)\`. \`COUNT(*)\` would show 1 for Meera because the padded row is still a row.
- Group by \`c.id, c.name\` so two customers with the same name aren't merged.
- If the report shows money, \`COALESCE(SUM(o.total_paise), 0)\`.

**Expected result on our data:** Asha 1, Ravi 1, Meera 0.

**Why not \`WHERE o.status = 'paid' OR o.id IS NULL\`?** It brings Meera back but loses a customer whose only orders are cancelled: those rows are real (not NULL) and fail the status test.

**How I'd test the report:** build a small dataset that covers each case: customer with paid orders, with only cancelled orders, with none, and a guest order, and compare against hand-calculated expectations.`,
      followUps: [
        {
          q: 'When is a condition on the right table in WHERE actually correct?',
          a: 'When you deliberately want the anti-join: WHERE o.id IS NULL keeps only customers without a match. Or when you really want an inner join and just wrote LEFT out of habit; then write INNER JOIN so the intent is clear to the next reader.',
        },
        {
          q: 'Does the same trap exist with RIGHT and FULL joins?',
          a: 'Yes, mirrored. With a RIGHT JOIN, a WHERE condition on the left table drops the NULL-padded right rows. With a FULL JOIN, a WHERE on either side removes the padded rows of the other, turning it into a LEFT, RIGHT or INNER join depending on which side you filtered.',
        },
      ],
      pitfalls: [
        'Blaming the data rather than the query',
        'Adding OR o.id IS NULL and calling it fixed',
        'Keeping COUNT(*) after the fix (Meera shows 1)',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'sql-joins-validation-drill-1',
      question:
        'Predict the row count of each query on the running dataset before checking the answer: (a) customers INNER JOIN orders (b) customers LEFT JOIN orders (c) customers RIGHT JOIN orders (d) customers FULL OUTER JOIN orders (e) customers CROSS JOIN orders (f) LEFT JOIN … WHERE o.status = \'paid\' (g) LEFT JOIN … ON o.customer_id = c.id AND o.status = \'paid\' (h) `SELECT * FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)`. All joins use ON o.customer_id = c.id.',
      assumptions: [
        'customers: 1 Asha, 2 Ravi, 3 Meera',
        'orders: 101 (cust 1, paid), 102 (cust 1, cancelled), 103 (cust 2, paid), 104 (cust NULL, paid)',
        'NULL = anything is UNKNOWN; WHERE keeps only TRUE',
      ],
      steps: [
        { label: 'Match table', calc: 'Asha ↔ 101, 102; Ravi ↔ 103; Meera ↔ none; 104 ↔ none (NULL key)' },
        { label: '(a) INNER', calc: '3 matched pairs → 3' },
        { label: '(b) LEFT', calc: '3 pairs + Meera padded → 4' },
        { label: '(c) RIGHT', calc: '3 pairs + order 104 padded → 4' },
        { label: '(d) FULL', calc: '3 pairs + Meera + 104 → 5' },
        { label: '(e) CROSS', calc: '3 × 4 → 12' },
        { label: '(f) LEFT + WHERE paid', calc: 'LEFT rows: Asha-101 paid ✓, Asha-102 cancelled ✗, Ravi-103 paid ✓, Meera-NULL UNKNOWN ✗ → 2' },
        { label: '(g) LEFT + ON paid', calc: 'Asha matches only 101; Ravi 103; Meera no paid match → padded → 3' },
        { label: '(h) NOT IN', calc: 'list (1, 1, 2, NULL): for every id, id <> NULL is UNKNOWN → 0' },
      ],
      answer: `| Query | Rows |
|---|---|
| (a) INNER | 3 |
| (b) LEFT | 4 |
| (c) RIGHT | 4 |
| (d) FULL | 5 |
| (e) CROSS | 12 |
| (f) LEFT + WHERE paid | 2 (Meera lost) |
| (g) LEFT + ON paid | 3 (Asha-101, Ravi-103, Meera-NULL) |
| (h) NOT IN | 0 |`,
      insight:
        'Draw the match table first; every join count follows from it. The two surprises (f and h) are both NULL + three-valued logic: a WHERE on the optional side and a NULL inside NOT IN silently delete rows. Step through the animation with each join type to confirm.',
      followUps: [
        {
          q: 'Asha gets a third order (cancelled). Which counts change?',
          a: 'Every query that pairs Asha with all her orders gains one row: INNER 4, LEFT 5, RIGHT 5, FULL 6, CROSS 15 (3 × 5). (f) stays 2 and (g) stays 3, because the new order is not paid. (h) stays 0 while order 104 still has a NULL customer_id.',
        },
        {
          q: 'How many rows does an anti-join with NOT EXISTS return, and why does it differ from (h)?',
          a: 'One row, Meera. NOT EXISTS checks, for each customer, whether any order row satisfies o.customer_id = c.id. The guest order\'s NULL makes that comparison UNKNOWN, which simply means "not a match", so it never poisons the result the way a NULL in a NOT IN list does.',
        },
      ],
    },
    {
      id: 'sql-joins-validation-drill-2',
      question:
        'A finance tester suspects some order totals do not match their line items. Write, step by step, one query that lists every order whose total_paise differs from the sum of its lines (quantity × unit_price_paise), including orders that have no lines at all. Then predict the output if order 103\'s Steel Bottle line was saved with unit_price_paise 15000 instead of 20000, and order 104\'s lines were never written.',
      assumptions: [
        'orders: 101 = 50000, 102 = 20000, 103 = 75000, 104 = 30000',
        'order_items after the bug: 101 → 2 × 25000; 102 → 1 × 20000; 103 → 1 × 55000 + 1 × 15000; 104 → no rows',
        'No discounts in this dataset',
      ],
      steps: [
        { label: '1. Start from the table that must not lose rows', calc: 'FROM orders o: every order must be checked, including those with no lines' },
        { label: '2. Bring in the lines without dropping orders', calc: 'LEFT JOIN order_items oi ON oi.order_id = o.id → 104 gets one NULL-padded row' },
        { label: '3. Aggregate per order', calc: 'GROUP BY o.id, o.total_paise; lines = COALESCE(SUM(oi.quantity * oi.unit_price_paise), 0) → 101: 50000, 102: 20000, 103: 70000, 104: 0 (SUM of NULLs is NULL → 0)' },
        { label: '4. Keep mismatches', calc: 'HAVING o.total_paise <> COALESCE(SUM(oi.quantity * oi.unit_price_paise), 0)' },
        { label: '5. Show the difference', calc: 'SELECT o.id, o.total_paise, lines, o.total_paise - lines AS diff ORDER BY o.id' },
        { label: '6. Predict', calc: '103: 75000 vs 70000 → diff 5000; 104: 30000 vs 0 → diff 30000; 101 and 102 match → 2 rows' },
      ],
      answer: `Query:
- \`SELECT o.id, o.total_paise,\`
- \`       COALESCE(SUM(oi.quantity * oi.unit_price_paise), 0) AS lines_paise,\`
- \`       o.total_paise - COALESCE(SUM(oi.quantity * oi.unit_price_paise), 0) AS diff\`
- \`FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id\`
- \`GROUP BY o.id, o.total_paise\`
- \`HAVING o.total_paise <> COALESCE(SUM(oi.quantity * oi.unit_price_paise), 0)\`
- \`ORDER BY o.id;\`

| id | total_paise | lines_paise | diff |
|---|---|---|---|
| 103 | 75000 | 70000 | 5000 |
| 104 | 30000 | 0 | 30000 |`,
      insight:
        'LEFT JOIN + COALESCE is what makes "orders without lines" visible: with an INNER JOIN order 104 would vanish, and without COALESCE its NULL sum would make the HAVING comparison UNKNOWN and drop it too. Two different defects (wrong unit price, missing lines) are caught by one query.',
      followUps: [
        {
          q: 'Real orders have a discount_paise column. How does the check change?',
          a: 'Compare against lines minus discount: HAVING o.total_paise <> COALESCE(SUM(oi.quantity * oi.unit_price_paise), 0) - o.discount_paise, with discount_paise added to GROUP BY (or COALESCE(o.discount_paise, 0) if it is nullable). I would also confirm with the BA whether tax and shipping are inside total_paise.',
        },
        {
          q: 'Why GROUP BY o.id, o.total_paise rather than only o.id?',
          a: 'PostgreSQL accepts GROUP BY o.id alone because id is the primary key and total_paise depends on it, and so does MySQL 8 with its functional-dependency detection. Listing total_paise as well is the portable form that also works on databases without that feature, and it makes the intent explicit.',
        },
      ],
    },
    {
      id: 'sql-joins-validation-drill-3',
      question:
        'Validate an order placed via the UI. Asha (customer 1) buys 1 × Wireless Mouse (₹550.00) and 2 × Phone Case (₹150.00 each), applies SAVE10 (10% off), pays by card, and sees "Order #105 · Total ₹765.00 · Paid". Before the order, stock was Mouse 25 and Phone Case 60. Write the checks and the expected value of each.',
      assumptions: [
        'orders has columns id, customer_id, status, total_paise, discount_paise, coupon_code, created_at (UTC)',
        'order_items(order_id, product_id, quantity, unit_price_paise); payments(id, order_id, amount_paise, gateway_ref); products(id, name, price_paise, stock)',
        'Products: 1 = Wireless Mouse 55000, 4 = Phone Case 15000',
        'Payment status arrives by webhook within ~10 seconds',
      ],
      steps: [
        { label: '1. Expected numbers', calc: 'items = 55000 + 2 × 15000 = 85000 paise; discount = 10% = 8500; total = 76500 paise = ₹765.00 ✓ matches the UI' },
        { label: '2. Header', calc: 'SELECT customer_id, status, total_paise, discount_paise, coupon_code FROM orders WHERE id = 105 → 1 | paid | 76500 | 8500 | SAVE10 (poll status until paid, max ~15 s)' },
        { label: '3. Lines', calc: 'SELECT product_id, quantity, unit_price_paise FROM order_items WHERE order_id = 105 ORDER BY product_id → (1, 1, 55000), (4, 2, 15000): 2 rows, sum 85000' },
        { label: '4. Header vs lines', calc: '85000 − 8500 = 76500 = total_paise ✓' },
        { label: '5. Payment', calc: 'SELECT COUNT(*), SUM(amount_paise), COUNT(DISTINCT gateway_ref) FROM payments WHERE order_id = 105 → 1 | 76500 | 1 (no double charge)' },
        { label: '6. Stock side effects', calc: 'SELECT id, stock FROM products WHERE id IN (1, 4) → Mouse 24, Phone Case 58' },
        { label: '7. Non-effects', calc: 'No second order for customer 1 in the same minute: SELECT COUNT(*) FROM orders WHERE customer_id = 1 AND created_at >= <test start> → 1' },
      ],
      answer: `| Check | Expected |
|---|---|
| orders #105 | customer 1, paid, total 76500, discount 8500, SAVE10 |
| order_items | 2 rows: (1, qty 1, 55000), (4, qty 2, 15000) |
| lines − discount = total | 85000 − 8500 = 76500 |
| payments | exactly 1 row, 76500, one gateway_ref |
| stock | Mouse 25 → 24, Phone Case 60 → 58 |
| duplicates | only one new order for Asha since the test started |

Any mismatch becomes a bug with the order id, the query, and expected vs actual values.`,
      insight:
        'A UI confirmation touches four or five tables. Writing the expected numbers first (in paise) turns validation into simple equality checks, and the "non-effects" check (no duplicate order, single payment) is where double-click and webhook-retry bugs are caught.',
      followUps: [
        {
          q: 'The status stays "pending" for 30 seconds in the test environment. Is that a bug?',
          a: 'Not necessarily. Check the agreed SLA for the payment webhook and whether the test environment uses a sandbox gateway with delays. If the requirement is "paid within 10 seconds", raise it as a performance or integration issue with the timings; otherwise raise the poll timeout for that environment and record the observed latency so it is tracked.',
        },
        {
          q: 'Stock for the mouse dropped from 25 to 23. What could cause that, and how do you investigate?',
          a: 'Something decremented twice: a double-submitted order, a retried webhook that reserves stock again, or another test buying the same product in parallel. I would look for other orders or reservations containing product 1 in the same time window and check the inventory log. Using a dedicated test product per run removes the parallel-test explanation.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'sql-joins-validation-mcq-01',
      difficulty: 'easy',
      question: 'How many rows does this INNER JOIN return? (Asha has orders 101 and 102, Ravi has 103, Meera has none, order 104 has customer_id NULL.)',
      code: { language: 'sql', code: `SELECT c.name, o.id\nFROM customers c\nINNER JOIN orders o ON o.customer_id = c.id;` },
      options: ['3', '2', '4', '5'],
      correct: [0],
      explanation:
        'INNER JOIN returns one row per matching pair: Asha-101, Asha-102 and Ravi-103. Asha counts twice because she has two orders, so 2 (one per customer) is wrong. Meera and guest order 104 have no partner, so 4 or 5 would require an outer join.',
      followUps: [
        { q: 'Which join would return 5 rows here?', a: 'FULL OUTER JOIN: the 3 matched pairs, Meera with NULL order columns, and order 104 with NULL customer columns. In MySQL you would emulate it with a LEFT JOIN UNION ALL the unmatched rows of a RIGHT JOIN.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-02',
      difficulty: 'easy',
      question: 'For a first-order coupon test you need customers who have never placed an order. Which approach is correct?',
      options: [
        'customers LEFT JOIN orders ON o.customer_id = c.id WHERE o.id IS NULL',
        'customers INNER JOIN orders ON o.customer_id = c.id WHERE o.id IS NULL',
        'customers LEFT JOIN orders ON o.customer_id = c.id WHERE o.id IS NOT NULL',
        'customers CROSS JOIN orders WHERE o.customer_id <> c.id',
      ],
      correct: [0],
      explanation:
        'A LEFT JOIN keeps every customer and pads unmatched ones with NULL order columns, so o.id IS NULL picks exactly those without orders. An INNER JOIN never produces NULL order ids, so it returns nothing. IS NOT NULL returns customers who did order, and the CROSS JOIN returns every non-matching pair, including Asha with Ravi\'s order.',
      followUps: [
        { q: 'Give an equivalent query without a join.', a: 'SELECT * FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id). It is NULL-safe, unlike NOT IN, and usually gets the same anti-join plan.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-03',
      difficulty: 'easy',
      question: 'Meera has no orders and guest order 104 has no customer. What row count does customers LEFT JOIN orders produce?',
      code: { language: 'sql', code: `SELECT c.name, o.id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id;` },
      options: ['4', '3', '5', '12'],
      correct: [0],
      explanation:
        'The 3 matched pairs (Asha-101, Asha-102, Ravi-103) plus one row for Meera with o.id NULL make 4. 3 is the INNER JOIN count, 5 would also include the unmatched guest order (FULL OUTER), and 12 is the CROSS JOIN of 3 × 4.',
      followUps: [
        { q: 'Why does guest order 104 not appear?', a: 'A LEFT JOIN preserves the left table (customers) only. Order 104 matches no customer because NULL = id is never TRUE, and unmatched rows from the right table are dropped. A RIGHT or FULL join would keep it.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-04',
      difficulty: 'medium',
      question: 'The goal is "every customer with their paid orders, including customers with none". What does this return?',
      code: {
        language: 'sql',
        code: `SELECT c.name, o.id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.status = 'paid';`,
      },
      options: [
        'Asha-101 and Ravi-103 only; Meera is missing',
        'Asha-101, Ravi-103 and Meera-NULL',
        'Asha-101, Asha-102, Ravi-103 and Meera-NULL',
        'Asha-101, Ravi-103 and the guest order 104',
      ],
      correct: [0],
      explanation:
        'Meera\'s padded row has o.status NULL; NULL = \'paid\' is UNKNOWN, so WHERE removes it, and cancelled 102 fails the filter. The LEFT JOIN has effectively become an INNER JOIN. Keeping Meera requires moving the condition into ON. Order 104 never appears because customers is the preserved side.',
      followUps: [
        { q: 'Rewrite it so Meera appears.', a: 'SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = \'paid\'. Returns Asha-101, Ravi-103 and Meera-NULL; Asha\'s cancelled order simply does not match.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-05',
      difficulty: 'medium',
      question: 'Select ALL queries that return exactly Meera (the only customer without orders). Remember order 104 has customer_id NULL.',
      options: [
        'SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;',
        'SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);',
        'SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);',
        'SELECT c.name FROM customers c INNER JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;',
        'SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL);',
      ],
      correct: [0, 1, 4],
      explanation:
        'The LEFT JOIN anti-join, NOT EXISTS and NOT IN with NULLs filtered out all return Meera. Plain NOT IN returns no rows because the NULL from order 104 makes every id <> NULL comparison UNKNOWN. The INNER JOIN version never produces a NULL o.id, so it is always empty.',
      followUps: [
        { q: 'Which would you write in production and why?', a: 'NOT EXISTS: it states the intent ("no order exists for this customer"), is NULL-safe without extra filters, and returns each customer at most once. Modern optimizers usually run it as an anti-join, same as the LEFT JOIN form.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-06',
      difficulty: 'medium',
      question: 'What number does this query show for Meera, who has no orders?',
      code: {
        language: 'sql',
        code: `SELECT c.name, COUNT(*) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name;`,
      },
      options: [
        '1, because her NULL-padded row is still a row; COUNT(o.id) would give 0',
        '0, because COUNT(*) ignores NULL-padded rows',
        'NULL, because she has no orders to count',
        'Meera is not in the result, because GROUP BY removes rows with NULLs',
      ],
      correct: [0],
      explanation:
        'The LEFT JOIN gives Meera one row with NULL order columns, and COUNT(*) counts rows, so she gets 1. COUNT(o.id) counts non-NULL order ids and gives the correct 0. COUNT never returns NULL, and GROUP BY does not remove rows containing NULLs.',
      followUps: [
        { q: 'What would SUM(o.total_paise) show for Meera, and how do you display 0?', a: 'NULL, because SUM has no non-NULL values to add. Use COALESCE(SUM(o.total_paise), 0) so the report and any automated assertion see 0.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-07',
      difficulty: 'medium',
      question: 'In PostgreSQL, the Wireless Mouse (id 1) has stock 25. What does the final SELECT return?',
      code: {
        language: 'sql',
        code: `BEGIN;\nUPDATE products SET stock = 0 WHERE id = 1;\nSELECT stock FROM products WHERE id = 1;\nROLLBACK;\nSELECT stock FROM products WHERE id = 1;`,
      },
      options: [
        '25, because ROLLBACK discards the uncommitted UPDATE',
        '0, because the SELECT inside the transaction made the change permanent',
        '0, because PostgreSQL runs in autocommit mode and each statement commits immediately',
        'An error, because you cannot SELECT inside a transaction',
      ],
      correct: [0],
      explanation:
        'Inside the transaction the first SELECT sees 0, but ROLLBACK undoes the UPDATE, so the last SELECT returns 25. Reading does not commit anything. Autocommit applies only when no explicit BEGIN is issued, and SELECTs are allowed in transactions.',
      followUps: [
        { q: 'Could you use this to test the "out of stock" banner in the UI?', a: 'No. The app reads through its own connections and cannot see your uncommitted change, so the UI would still show stock 25. You must commit the change, run the UI test, and restore the original value (or use a dedicated test product).' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-08',
      difficulty: 'medium',
      question: 'Salaries are Anil 90000, Bina 90000, Chetan 80000, Divya 70000. A candidate answers "second highest salary" with this query. What does it return?',
      code: { language: 'sql', code: `SELECT salary\nFROM employees\nORDER BY salary DESC\nLIMIT 1 OFFSET 1;` },
      options: [
        '90000, which is wrong because the top salary is tied; DISTINCT or DENSE_RANK is needed',
        '80000, the correct second highest salary',
        '70000, because OFFSET 1 skips both 90000 rows',
        'No rows, because OFFSET cannot be used with ORDER BY',
      ],
      correct: [0],
      explanation:
        'Sorted rows are 90000, 90000, 80000, 70000; skipping one row lands on Bina\'s 90000. OFFSET skips rows, not distinct values, so it does not skip both 90000s. SELECT DISTINCT salary … LIMIT 1 OFFSET 1, or DENSE_RANK() = 2, returns the intended 80000.',
      followUps: [
        { q: 'Why does RANK() = 2 return no rows here?', a: 'RANK gives tied rows the same rank and then skips: 1, 1, 3, 4. There is no rank 2. DENSE_RANK does not skip (1, 1, 2, 3), so DENSE_RANK() = 2 returns Chetan.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-09',
      difficulty: 'medium',
      question: 'customers.email is UNIQUE; orders.customer_id is a nullable FOREIGN KEY to customers.id; orders.status is NOT NULL. Select ALL inserts that fail.',
      options: [
        'INSERT INTO customers (id, name, email) VALUES (4, \'Asha K\', \'asha@shop.test\');',
        'INSERT INTO orders (id, customer_id, status, total_paise) VALUES (105, 99, \'paid\', 1000);',
        'INSERT INTO orders (id, customer_id, status, total_paise) VALUES (106, NULL, \'paid\', 1000);',
        'INSERT INTO orders (id, customer_id, status, total_paise) VALUES (107, 1, NULL, 1000);',
      ],
      correct: [0, 1, 3],
      explanation:
        'The duplicate email violates UNIQUE (Postgres 23505, MySQL 1062), customer 99 does not exist so the FK rejects it (23503 / 1452), and a NULL status violates NOT NULL (23502 / 1048). The guest order with customer_id NULL succeeds, because a NULL foreign key is not checked against the parent table.',
      followUps: [
        { q: 'How should the API respond when the duplicate-email insert fails?', a: 'With a clean client error such as 409 Conflict and a friendly message ("email already registered"), not a 500 that leaks the SQL error text. I would test it with two simultaneous sign-ups too, since only the database constraint protects against that race.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-10',
      difficulty: 'hard',
      question: 'Order 103 (Ravi, total 75000) has two order_items rows; Asha\'s orders 101 and 102 have one item each. What spend does this report show for Ravi?',
      code: {
        language: 'sql',
        code: `SELECT c.name, SUM(o.total_paise) AS spend\nFROM customers c\nJOIN orders o       ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY c.id, c.name;`,
      },
      options: [
        '150000, because the order total is repeated once per item row',
        '75000, because SUM counts each order once',
        '70000, because only the item prices are summed',
        'The query fails because o.total_paise is not in GROUP BY',
      ],
      correct: [0],
      explanation:
        'After joining items, each row represents an order item, so order 103 appears twice and its header total is added twice (fan-out). SUM has no idea the two values belong to the same order. The query is valid because total_paise is inside an aggregate. Summing quantity × unit_price_paise, or aggregating items in a subquery first, gives the correct 75000.',
      followUps: [
        { q: 'Would SUM(DISTINCT o.total_paise) fix it?', a: 'No, it only hides the problem. Two different orders with the same total, say two 50000 orders, would be counted once. Fix the grain instead: sum line amounts, or aggregate per order before joining.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-11',
      difficulty: 'hard',
      question: 'You must set stock to 0 for one product on the shared QA database. Select ALL practices that actually protect you from changing the wrong rows.',
      options: [
        'Run a SELECT with the exact same WHERE first and note the row count',
        'Wrap the UPDATE in a transaction and COMMIT only if the rows-affected count matches the preview',
        'In MySQL, enable sql_safe_updates so UPDATE/DELETE without a key in WHERE (or a LIMIT) is rejected',
        'Add LIMIT 1 to every UPDATE, which guarantees the right row is changed',
      ],
      correct: [0, 1, 2],
      explanation:
        'Previewing with the same WHERE, checking rows affected inside a transaction, and MySQL\'s safe-updates mode all stop or catch a bad statement before it is permanent. LIMIT 1 only caps how many rows change; without a precise WHERE it changes an arbitrary row, which is still the wrong data, just less of it.',
      followUps: [
        { q: 'What else reduces the risk at the access level?', a: 'Use a read-only database user for verification and a separate, limited user (or an admin API) for test-data changes, so a typo in a verification session cannot modify anything. Some teams also give each test run its own database or schema.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-12',
      difficulty: 'expert',
      question: 'This runs in MySQL 8 with autocommit on. Which changes remain after ROLLBACK?',
      code: {
        language: 'sql',
        code: `START TRANSACTION;\nUPDATE products SET stock = 0 WHERE id = 1;\nTRUNCATE TABLE cart_items;\nROLLBACK;`,
      },
      options: [
        'Both: TRUNCATE causes an implicit commit, so the UPDATE is committed and TRUNCATE cannot be rolled back',
        'Neither: ROLLBACK undoes everything after START TRANSACTION',
        'Only the TRUNCATE; the UPDATE is rolled back',
        'Only the UPDATE; TRUNCATE is rolled back because it is inside the transaction',
      ],
      correct: [0],
      explanation:
        'In MySQL, DDL statements such as TRUNCATE commit the current transaction before executing and are not transactional themselves, so the UPDATE is committed and cart_items is emptied; ROLLBACK then has nothing to undo. "Neither" is what PostgreSQL would do, since its TRUNCATE and DDL are transactional. The partial options misplace the implicit commit.',
      followUps: [
        { q: 'How would you empty cart_items safely inside a MySQL transaction?', a: 'Use DELETE FROM cart_items (with a WHERE if only test rows should go). DELETE is DML, respects the transaction and can be rolled back. It is slower than TRUNCATE on big tables, but safety matters more on a shared QA database.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-13',
      difficulty: 'hard',
      question: 'Select ALL queries that list order_items rows whose order no longer exists (orders.id is the NOT NULL primary key).',
      options: [
        'SELECT oi.* FROM order_items oi LEFT JOIN orders o ON o.id = oi.order_id WHERE o.id IS NULL;',
        'SELECT oi.* FROM order_items oi WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = oi.order_id);',
        'SELECT oi.* FROM order_items oi WHERE oi.order_id NOT IN (SELECT id FROM orders);',
        'SELECT oi.* FROM order_items oi INNER JOIN orders o ON o.id = oi.order_id WHERE o.id IS NULL;',
      ],
      correct: [0, 1, 2],
      explanation:
        'The LEFT JOIN anti-join and NOT EXISTS are the standard orphan checks. NOT IN is safe here because the subquery returns orders.id, a NOT NULL primary key, so the list cannot contain NULL (it would also skip items whose own order_id is NULL, which is fine for this check). The INNER JOIN only returns items whose order exists, so o.id is never NULL and the result is always empty.',
      followUps: [
        { q: 'Your orphan query returns 0 rows. How do you know it works?', a: 'Make it fail once on purpose: in a scratch transaction insert an order_items row for order 999 (on a table without the FK, or in a copy), run the check, see that row, then ROLLBACK. A check that has never been seen to fail is not yet trustworthy.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-14',
      difficulty: 'expert',
      question: 'Which order ids does this correlated subquery return? (101: cust 1, 50000; 102: cust 1, 20000; 103: cust 2, 75000; 104: cust NULL, 30000.)',
      code: {
        language: 'sql',
        code: `SELECT o.id\nFROM orders o\nWHERE o.total_paise > (SELECT AVG(o2.total_paise)\n                       FROM orders o2\n                       WHERE o2.customer_id = o.customer_id);`,
      },
      options: ['101 only', '101 and 104', '101 and 103', '101, 103 and 104'],
      correct: [0],
      explanation:
        'Asha\'s average is 35000, so 101 (50000) qualifies and 102 does not. Ravi\'s only order equals his own average, and > is strict, so 103 is out. For 104, o2.customer_id = NULL never matches, the AVG over no rows is NULL, and 30000 > NULL is UNKNOWN, so 104 is excluded too.',
      followUps: [
        { q: 'How would you include guest orders, comparing them to the average of all guest orders?', a: 'Use a NULL-safe comparison in the subquery: WHERE o2.customer_id IS NOT DISTINCT FROM o.customer_id in PostgreSQL, or o2.customer_id <=> o.customer_id in MySQL. Then guest orders form their own comparison group. With only one guest order, 104 still equals its group average and stays out.' },
      ],
    },
    {
      id: 'sql-joins-validation-mcq-15',
      difficulty: 'hard',
      question: 'A Playwright test clicks "Place order", then immediately runs SELECT status FROM orders WHERE id = $1 and expects \'paid\'. It fails about 1 run in 5 with status \'pending\'. What is the best fix?',
      options: [
        'Poll the query with a timeout (e.g. expect.poll) until it returns \'paid\', because the payment webhook updates the status asynchronously',
        'Add page.waitForTimeout(5000) before the query so the webhook has time to finish',
        'Query "the latest order" instead of the specific id so the newest status is always read',
        'Accept either \'pending\' or \'paid\' so the test stops failing',
      ],
      correct: [0],
      explanation:
        'The status changes after an asynchronous event, so the check must wait for a condition, not a fixed time. Polling returns as soon as the value is right and fails with a clear message after the timeout. A fixed sleep is both slow and still flaky, "latest order" may read another test\'s order, and accepting pending removes the assertion that the payment completed.',
      followUps: [
        { q: 'What timeout would you choose for the poll?', a: 'Base it on the agreed SLA or observed behaviour in that environment, for example 10–15 seconds if the webhook normally lands in 1–3 seconds. If it regularly approaches the limit, that latency is itself worth reporting rather than hiding with a bigger timeout.' },
      ],
    },
  ],
};

export default topic;
