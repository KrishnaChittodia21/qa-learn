import type { CompanyQuestion } from '../../types';

// Company-reported SQL interview questions for QA / SDET roles. Every entry links to a page that was opened
// and that reports the question at that company. All queries were run against SQLite sample data.

const GFG_PAYTM_QA =
  'https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-quality-assurance-engineer-on-campus-2022/';
const GFG_GREY_ORANGE = 'https://www.geeksforgeeks.org/interview-experiences/grey-orange-interview-experience-for-sdet-on-campus/';
const GFG_COUPA = 'https://www.geeksforgeeks.org/interview-experiences/coupa-software-interview-experience-sdet-role-full-time/';
const GFG_COMMVAULT = 'https://www.geeksforgeeks.org/interview-experiences/commvault-interview-experience-for-sdet/';
const GFG_DESHAW = 'https://www.geeksforgeeks.org/interview-experiences/d-e-shaw-interview-experience-for-sdet/';
const LC_SWIGGY = 'https://leetcode.com/discuss/interview-experience/5235311/Swiggy-or-SDET-or-Remote-or-May-2024-Offer/';
const LC_CASHFREE = 'https://leetcode.com/discuss/post/2514357/';
const LC_EQ = 'https://leetcode.com/discuss/post/4366315/';
const LC_ZEPTO = 'https://leetcode.com/discuss/post/6026438/';
const LC_ARCESIUM = 'https://leetcode.com/discuss/post/5240223/';
const MD_STRYKER = 'https://medium.com/@ArpitChoubey9/stryker-qa-automation-interview-question-0822c41c2cce';
const MD_DELOITTE = 'https://medium.com/@ArpitChoubey9/deloitte-interview-questions-for-qa-automation-role-8b1baff5cd46';
const MD_INFOSYS = 'https://medium.com/@ArpitChoubey9/infosys-interview-questions-for-automation-testing-selenium-java-e8b98308eaed';

export const QUESTIONS: CompanyQuestion[] = [
  {
    id: 'co-sql-paytm-1',
    company: 'Paytm',
    area: 'sql',
    role: 'Quality Assurance Engineer',
    round: 'Interview round 1',
    difficulty: 'easy',
    question: 'What are joins, what types exist, and can you write a query that uses one?',
    answer: `A **join** combines rows from two or more tables using a related column (usually a foreign key → primary key).

- **INNER JOIN**: only rows that match in both tables.
- **LEFT (OUTER) JOIN**: every row from the left table, with NULLs where the right side has no match.
- **RIGHT (OUTER) JOIN**: the mirror image of LEFT.
- **FULL OUTER JOIN**: all rows from both sides (not available in MySQL; emulate it with LEFT ∪ RIGHT).
- **CROSS JOIN**: every combination (a Cartesian product).
- **SELF JOIN**: a table joined to itself (employee → manager).

Example: list every employee with their department name, including employees with no department:

    SELECT e.name, d.name AS department
    FROM employee e
    LEFT JOIN department d ON d.id = e.dept_id
    ORDER BY e.name;

Switch to \`INNER JOIN\` and employees without a department disappear. Testers use exactly that difference to find **orphan records**: a \`LEFT JOIN ... WHERE d.id IS NULL\` lists rows whose foreign key points nowhere.`,
    followUps: [
      {
        q: 'Write a query to show each employee with their manager’s name.',
        a: 'Use a self join: SELECT e.name, m.name AS manager FROM employee e LEFT JOIN employee m ON m.id = e.manager_id. The LEFT JOIN keeps the top boss, whose manager is NULL.',
      },
    ],
    topic: 'sql-joins-validation',
    source: { name: 'GeeksforGeeks — Paytm interview experience for QA Engineer (on-campus)', url: GFG_PAYTM_QA, year: 2021 },
  },
  {
    id: 'co-sql-paytm-2',
    company: 'Paytm',
    area: 'sql',
    role: 'Quality Assurance Engineer',
    round: 'Interview round 1',
    difficulty: 'medium',
    question: 'Write a SQL query to find the third highest salary in the Employee table.',
    answer: `The key detail is **ties**: "third highest" normally means the third *distinct* salary value.

**Window function (MySQL 8+, PostgreSQL, SQL Server, Oracle):**

    SELECT DISTINCT salary
    FROM (
      SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
      FROM employee
    ) t
    WHERE rnk = 3;

**LIMIT/OFFSET on distinct values (MySQL/PostgreSQL):**

    SELECT DISTINCT salary
    FROM employee
    ORDER BY salary DESC
    LIMIT 1 OFFSET 2;

**Portable correlated subquery** (works for any N):

    SELECT DISTINCT salary FROM employee e1
    WHERE 2 = (SELECT COUNT(DISTINCT e2.salary) FROM employee e2 WHERE e2.salary > e1.salary);

With salaries 9000, 9000, 7000, 5000, 3000 all three return **5000**. A plain \`ORDER BY salary DESC LIMIT 1 OFFSET 2\` without DISTINCT would wrongly return 7000. If fewer than three distinct salaries exist the query returns no rows. Wrap it as \`SELECT (...) AS third\` to get NULL instead.`,
    followUps: [
      {
        q: 'How would you also return the names of the employees earning that salary?',
        a: 'Keep the name in the inner query and filter on the rank: SELECT name, salary FROM (SELECT name, salary, DENSE_RANK() OVER (ORDER BY salary DESC) rnk FROM employee) t WHERE rnk = 3.',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'GeeksforGeeks — Paytm interview experience for QA Engineer (on-campus)', url: GFG_PAYTM_QA, year: 2021 },
  },
  {
    id: 'co-sql-paytm-3',
    company: 'Paytm',
    area: 'sql',
    role: 'Quality Assurance Engineer',
    round: 'Interview round 1',
    difficulty: 'medium',
    question: 'Explain the ranking functions in MySQL — how do ROW_NUMBER, RANK and DENSE_RANK differ?',
    answer: `All three are **window functions** (MySQL 8+) that number rows by an \`ORDER BY\`, optionally restarting per group with \`PARTITION BY\`. They differ only in how they handle **ties**:

    SELECT name, salary,
           ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn,
           RANK()       OVER (ORDER BY salary DESC) AS rk,
           DENSE_RANK() OVER (ORDER BY salary DESC) AS drk
    FROM employee;

| name | salary | ROW_NUMBER | RANK | DENSE_RANK |
|---|---|---|---|---|
| A | 9000 | 1 | 1 | 1 |
| B | 9000 | 2 | 1 | 1 |
| C | 7000 | 3 | **3** | **2** |
| D | 5000 | 4 | 4 | 3 |

- **ROW_NUMBER**: always unique (1, 2, 3…). The order among tied rows is arbitrary unless you add a tie-breaker column.
- **RANK**: ties share a rank, and the next rank **skips** (1, 1, 3).
- **DENSE_RANK**: ties share a rank with **no gaps** (1, 1, 2).

Use DENSE_RANK for "Nth highest value", ROW_NUMBER for de-duplication ("keep the latest row per user": \`PARTITION BY user_id ORDER BY updated_at DESC\`, then keep \`rn = 1\`), and RANK for competition-style leaderboards.`,
    followUps: [
      {
        q: 'How can ROW_NUMBER help you delete duplicate rows?',
        a: 'Number the rows within each duplicate group (PARTITION BY the business key ORDER BY id) in a CTE, then delete the rows whose row number is greater than 1, keeping one copy per key.',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'GeeksforGeeks — Paytm interview experience for QA Engineer (on-campus)', url: GFG_PAYTM_QA, year: 2021 },
  },
  {
    id: 'co-sql-grey-orange-1',
    company: 'Grey Orange',
    area: 'sql',
    role: 'SDET',
    round: 'Round 2',
    difficulty: 'easy',
    question: 'Write a SQL query based on a join, then explain how the different join types differ from each other.',
    answer: `Query: every product with its category, keeping products that have no category:

    SELECT p.name AS product, c.name AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id;

How the join types differ (\`A\` = left table, \`B\` = right table):

- **INNER JOIN**: rows only where A and B match. Unmatched rows on either side are dropped.
- **LEFT JOIN**: all of A, with matching B columns or NULL. Adding \`WHERE B.key IS NULL\` gives rows in A with **no** match (an anti-join).
- **RIGHT JOIN**: all of B, with matching A or NULL.
- **FULL OUTER JOIN**: all rows of both, with NULLs on the side that is missing.
- **CROSS JOIN**: |A| × |B| rows, with no condition.
- **SELF JOIN**: the same table under two aliases, for hierarchies or comparing rows.

Common trap: putting a filter on the right table in **WHERE** after a LEFT JOIN (\`WHERE c.active = 1\`) silently turns it into an inner join. Put that condition in the **ON** clause to keep the unmatched rows.`,
    followUps: [
      {
        q: 'Can a join return more rows than the left table has?',
        a: 'Yes. If one left row matches several right rows (a one-to-many relationship), it appears once per match. That is why row-count checks after joins matter in data validation.',
      },
    ],
    topic: 'sql-joins-validation',
    source: { name: 'GeeksforGeeks — Grey Orange interview experience for SDET (on-campus)', url: GFG_GREY_ORANGE, year: 2023 },
  },
  {
    id: 'co-sql-grey-orange-2',
    company: 'Grey Orange',
    area: 'sql',
    role: 'SDET',
    round: 'Round 3',
    difficulty: 'hard',
    question: 'Solve a harder SQL problem that joins three tables and also uses a subquery.',
    answer: `Example of the kind of problem: tables \`order_items(order_id, product_id, qty)\`, \`products(id, name, category_id, price)\` and \`categories(id, name)\`. *Find each category whose total revenue is greater than the average product price, highest first.*

    SELECT c.name AS category,
           SUM(oi.qty * p.price) AS revenue
    FROM order_items oi
    JOIN products   p ON p.id = oi.product_id
    JOIN categories c ON c.id = p.category_id
    GROUP BY c.name
    HAVING SUM(oi.qty * p.price) > (SELECT AVG(price) FROM products)
    ORDER BY revenue DESC;

How to approach these live:
1. **Write the join chain first** (fact table → dimension tables) and check the row count before aggregating.
2. Decide the **grain**: GROUP BY the column you report on.
3. Put **row filters in WHERE** and **aggregate filters in HAVING**.
4. Use a **subquery or CTE** for the comparison value (an average or max) so it is computed once.
5. Check edge cases: categories with no orders (do they need a LEFT JOIN and \`COALESCE(..., 0)\`?), NULL prices, duplicates from one-to-many joins.

For a CTE version, move the per-category revenue into \`WITH rev AS (...)\` and select from it. That is easier to read and to debug step by step.`,
    followUps: [
      {
        q: 'What is the difference between a correlated and a non-correlated subquery?',
        a: 'A non-correlated subquery runs once on its own, like the AVG(price) above. A correlated subquery references the outer row, so it is evaluated per outer row, for example comparing each employee with the average of their own department.',
      },
    ],
    topic: 'sql-joins-validation',
    source: { name: 'GeeksforGeeks — Grey Orange interview experience for SDET (on-campus)', url: GFG_GREY_ORANGE, year: 2023 },
  },
  {
    id: 'co-sql-coupa-software-1',
    company: 'Coupa Software',
    area: 'sql',
    role: 'SDET',
    round: '2nd round',
    difficulty: 'medium',
    question: 'Write a query that finds the average price, which requires joining tables (for example, average product price per category).',
    answer: `Assume \`products(id, name, category_id, price)\` and \`categories(id, name)\`:

    SELECT c.name AS category,
           ROUND(AVG(p.price), 2) AS avg_price,
           COUNT(p.id)            AS products
    FROM categories c
    JOIN products p ON p.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY avg_price DESC;

Things interviewers look for:
- **GROUP BY** every non-aggregated column in the SELECT.
- **AVG ignores NULLs**: products with a NULL price are skipped, not counted as 0. Use \`AVG(COALESCE(price, 0))\` if they should count as zero.
- Use **LEFT JOIN** from categories if empty categories must appear (they show avg_price = NULL).
- Watch for **row multiplication**: if you also join order lines, each product repeats per order and the average gets weighted by sales. Aggregate in a subquery first if you only want the catalogue average.
- Filter on the aggregate with **HAVING**, e.g. \`HAVING AVG(p.price) > 100\`.

With Books priced 100 and 300 and Toys priced 50, the result is Books 200.00 and Toys 50.00.`,
    followUps: [
      {
        q: 'How do you find products priced above their own category’s average?',
        a: 'Use a correlated subquery: SELECT p.* FROM products p WHERE p.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p.category_id). Or join to a derived table of per-category averages.',
      },
    ],
    topic: 'sql-joins-validation',
    source: { name: 'GeeksforGeeks — Coupa Software interview experience (SDET, full-time)', url: GFG_COUPA, year: 2024 },
  },
  {
    id: 'co-sql-commvault-1',
    company: 'CommVault',
    area: 'sql',
    role: 'SDET',
    round: 'Second technical round',
    difficulty: 'medium',
    question:
      'Given a Customer table (id primary key, name, country), write a query to count the countries that have more than 5 customers, then change it to also list names in descending order.',
    answer: `Countries with more than five customers (\`HAVING\` filters groups after \`GROUP BY\`):

    SELECT country, COUNT(id) AS customers
    FROM customer
    GROUP BY country
    HAVING COUNT(id) > 5
    ORDER BY customers DESC;

The **number** of such countries (aggregate over the grouped result):

    SELECT COUNT(*) AS countries_over_5
    FROM (SELECT country FROM customer GROUP BY country HAVING COUNT(id) > 5) t;

Names of the customers in those countries, in descending order:

    SELECT name, country
    FROM customer
    WHERE country IN (SELECT country FROM customer GROUP BY country HAVING COUNT(*) > 5)
    ORDER BY name DESC;

Why not \`WHERE COUNT(id) > 5\`? WHERE runs **before** grouping and cannot see aggregates. HAVING runs after. The logical order is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.`,
    followUps: [
      {
        q: 'What is the difference between COUNT(*), COUNT(id) and COUNT(DISTINCT name)?',
        a: 'COUNT(*) counts rows, COUNT(col) counts rows where col is not NULL, and COUNT(DISTINCT col) counts unique non-NULL values. They differ whenever NULLs or duplicates exist.',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'GeeksforGeeks — CommVault interview experience for SDET', url: GFG_COMMVAULT, year: 2020 },
  },
  {
    id: 'co-sql-commvault-2',
    company: 'CommVault',
    area: 'sql',
    role: 'SDET',
    round: 'Third technical round',
    difficulty: 'easy',
    question: 'Find the second maximum income from a given table.',
    answer: `Assume \`employee(name, income)\`. The cleanest portable answer takes the max of everything below the max:

    SELECT MAX(income) AS second_max
    FROM employee
    WHERE income < (SELECT MAX(income) FROM employee);

It handles ties correctly (9000, 9000, 7000 → **7000**) and returns NULL when there is no second value.

Alternatives:

    -- MySQL / PostgreSQL
    SELECT DISTINCT income FROM employee ORDER BY income DESC LIMIT 1 OFFSET 1;

    -- window function, generalises to N
    SELECT DISTINCT income FROM (
      SELECT income, DENSE_RANK() OVER (ORDER BY income DESC) AS r FROM employee
    ) t WHERE r = 2;

    -- SQL Server
    SELECT DISTINCT income FROM employee ORDER BY income DESC
    OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY;

Mention the edge cases: duplicate top values (use DISTINCT or DENSE_RANK), NULL incomes (MAX ignores them), and an empty or one-row table.`,
    followUps: [
      {
        q: 'How would you get the second highest income in each department?',
        a: 'Partition the window: DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY income DESC) in a subquery, then filter WHERE r = 2. That gives one or more rows per department.',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'GeeksforGeeks — CommVault interview experience for SDET', url: GFG_COMMVAULT, year: 2020 },
  },
  {
    id: 'co-sql-de-shaw-1',
    company: 'D.E. Shaw',
    area: 'sql',
    role: 'SDET',
    round: 'Technical rounds',
    difficulty: 'medium',
    question: 'When would you use a SQL database and when a NoSQL one?',
    answer: `**SQL (relational: MySQL, PostgreSQL, Oracle)**: fixed schema, tables linked by keys, joins, and **ACID transactions**. Choose it when:
- the data is structured and highly relational (orders ↔ customers ↔ payments);
- correctness and consistency matter more than raw scale (money, trades, inventory);
- you need ad-hoc queries, reporting, joins and aggregates.

**NoSQL**: flexible schema, usually scales horizontally, often **eventually consistent** (BASE). It comes in several kinds:
- **Document** (MongoDB): JSON-like records that change shape, e.g. product catalogues or user profiles.
- **Key-value** (Redis, DynamoDB): caching, sessions, very fast lookups by key.
- **Wide-column** (Cassandra): huge write volumes such as time series and logs.
- **Graph** (Neo4j): relationships first, e.g. social networks or fraud rings.

Testing differences: in SQL, validate constraints, joins and transaction rollback. In NoSQL, validate the document schema in the application, eventual consistency (read-after-write may lag, so poll or retry), missing or extra fields, and duplicate handling without unique constraints.`,
    followUps: [
      {
        q: 'What does ACID stand for?',
        a: 'Atomicity (all or nothing), Consistency (constraints always hold), Isolation (concurrent transactions do not interfere) and Durability (committed data survives crashes).',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'GeeksforGeeks — D.E. Shaw interview experience for SDET (technical rounds as reported by the author)', url: GFG_DESHAW, year: 2024 },
  },
  {
    id: 'co-sql-swiggy-1',
    company: 'Swiggy',
    area: 'sql',
    role: 'SDET',
    round: 'Round 3: Hiring Manager',
    difficulty: 'medium',
    question: 'What are the differences between SQL and NoSQL databases, what are the advantages of each, and when would you pick one?',
    answer: `| | SQL | NoSQL |
|---|---|---|
| Model | Tables, rows, fixed schema | Documents, key-value, wide-column, graph |
| Schema | Defined up front (DDL, migrations) | Flexible, per record |
| Relations | Foreign keys + JOINs | Embedded or denormalised data, few joins |
| Consistency | ACID transactions | Often BASE / eventual (configurable) |
| Scaling | Mostly vertical; read replicas, sharding is harder | Built for horizontal sharding |
| Query | Standard SQL | Store-specific APIs |

**SQL advantages:** strong integrity, complex queries and reporting, mature tooling, transactions across tables.
**NoSQL advantages:** schema changes without migrations, very high write throughput, low-latency key lookups, easy horizontal scale.

For a food-delivery app, a typical split: **orders, payments and refunds** in SQL (they must be consistent); **menus and catalogues** in a document store (shape varies by restaurant); **sessions, carts and live rider location** in Redis or another key-value store (fast, short-lived). Many systems use both ("polyglot persistence").`,
    followUps: [
      {
        q: 'What is the CAP theorem in one line?',
        a: 'During a network partition a distributed store must choose between Consistency (every read sees the latest write) and Availability (every request gets a response). You cannot fully have both while partitioned.',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'LeetCode Discuss — Swiggy | SDET | Remote | May 2024 [Offer]', url: LC_SWIGGY, year: 2024 },
  },
  {
    id: 'co-sql-cashfree-1',
    company: 'CashFree',
    area: 'sql',
    role: 'SDET',
    round: 'Round 3',
    difficulty: 'medium',
    question: 'Why do we create different schemas in a database?',
    answer: `A **schema** is a named namespace inside a database that groups tables, views, procedures and permissions (e.g. \`payments.transactions\`, \`reporting.daily_summary\`). Teams split objects into schemas to:

- **Organise** by domain or module (\`payments\`, \`kyc\`, \`audit\`), so a large system stays understandable and names don't clash (\`payments.status\` vs \`kyc.status\`).
- **Control security**: grant a role access to a whole schema, e.g. the reporting user can read \`reporting\` but not \`payments\`. That is least privilege, and it matters for PCI or other sensitive data.
- **Isolate environments or tenants**: one schema per tenant, or \`test_\` / \`staging\` schemas on a shared server.
- **Separate workloads**: raw ingestion (\`staging\`), clean data (\`core\`) and analytics (\`mart\`).
- **Manage changes and backups** per area, and drop or recreate a test schema without touching the rest.

Note: in MySQL "schema" and "database" are synonyms, while PostgreSQL, SQL Server and Oracle treat schemas as namespaces inside a database.

For testers this means fully qualified names in queries, checking permissions (a role should **not** be able to read another schema), and resetting a dedicated test schema between runs.`,
    followUps: [
      {
        q: 'How would you verify that a reporting user cannot read payment data?',
        a: 'Connect as the reporting role and run SELECT on a payments table. Expect a permission-denied error, then confirm reads on the reporting schema still work. Automate it as a negative security test.',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'LeetCode Discuss — CashFree SDET role interview', url: LC_CASHFREE, year: 2022 },
  },
  {
    id: 'co-sql-stryker-1',
    company: 'Stryker',
    area: 'sql',
    role: 'QA Automation',
    round: 'Round 1',
    difficulty: 'easy',
    question: 'Write a SQL command that returns the second highest salary from an employee table.',
    answer: `Portable version (works in every SQL dialect):

    SELECT MAX(salary) AS second_highest
    FROM employee
    WHERE salary < (SELECT MAX(salary) FROM employee);

With salaries 9000, 9000, 7000, 5000 this returns **7000**, so duplicate top salaries are handled. It returns **NULL** when only one distinct salary exists, which is usually the behaviour you want.

Other options:

    -- MySQL / PostgreSQL
    SELECT DISTINCT salary FROM employee ORDER BY salary DESC LIMIT 1 OFFSET 1;

    -- any Nth, with window functions
    SELECT DISTINCT salary FROM (
      SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS r FROM employee
    ) t WHERE r = 2;

Say which one you would choose and why: \`DENSE_RANK\` reads clearly and generalises to N; the \`MAX(...) WHERE <\` version is short and portable. Forgetting \`DISTINCT\` with LIMIT/OFFSET is the classic bug, because it returns 9000 again.`,
    followUps: [
      {
        q: 'Why use DENSE_RANK rather than RANK for the Nth highest salary?',
        a: 'RANK leaves gaps after ties (1, 1, 3), so with a tie at the top no row has rank 2. DENSE_RANK gives 1, 1, 2, so rank N is always the Nth distinct salary.',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'Medium — Stryker QA automation interview questions (Arpit Choubey)', url: MD_STRYKER, year: 2025 },
  },
  {
    id: 'co-sql-stryker-2',
    company: 'Stryker',
    area: 'sql',
    role: 'QA Automation',
    round: 'Round 1',
    difficulty: 'easy',
    question: 'Using SQL, how would you list the departments that appear more than once in an employee table?',
    answer: `Group by the department and keep groups with more than one row:

    SELECT dept_id, COUNT(*) AS employees
    FROM employee
    WHERE dept_id IS NOT NULL
    GROUP BY dept_id
    HAVING COUNT(*) > 1
    ORDER BY employees DESC;

To show the department **name** as well, join first:

    SELECT d.name, COUNT(*) AS employees
    FROM employee e
    JOIN department d ON d.id = e.dept_id
    GROUP BY d.id, d.name
    HAVING COUNT(*) > 1;

The same **GROUP BY … HAVING COUNT(*) > 1** pattern is the standard way to find **duplicates** in test data, e.g. the same email registered twice:

    SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

Points to mention: \`HAVING\` (not WHERE) filters on aggregates; \`COUNT(*)\` counts rows while \`COUNT(col)\` skips NULLs; and excluding NULL departments is a deliberate choice you should state.`,
    followUps: [
      {
        q: 'How would you see the full duplicate rows, not just the duplicated key?',
        a: 'Join back to the grouped keys: SELECT e.* FROM employee e JOIN (SELECT dept_id FROM employee GROUP BY dept_id HAVING COUNT(*) > 1) d ON d.dept_id = e.dept_id. Or use COUNT(*) OVER (PARTITION BY dept_id) > 1.',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'Medium — Stryker QA automation interview questions (Arpit Choubey)', url: MD_STRYKER, year: 2025 },
  },
  {
    id: 'co-sql-deloitte-1',
    company: 'Deloitte',
    area: 'sql',
    role: 'QA Automation',
    difficulty: 'easy',
    question: 'Have you done database testing? How many types of joins are there, and why do we use joins in SQL?',
    answer: `**Why joins:** a normalised database splits data across tables to avoid duplication (customers, orders, payments). Joins put it back together at query time through key relationships, so you can answer questions like "orders with customer name and payment status".

**Types:**
1. **INNER JOIN**: matching rows only.
2. **LEFT OUTER JOIN**: all left rows plus matches (NULL otherwise).
3. **RIGHT OUTER JOIN**: all right rows plus matches.
4. **FULL OUTER JOIN**: all rows from both sides.
5. **CROSS JOIN**: Cartesian product.
6. **SELF JOIN**: a table joined to itself (a pattern, written with the joins above).
Some dialects add **NATURAL JOIN** (joins on same-named columns, risky) and semi- or anti-joins written with EXISTS / NOT EXISTS.

**How I use joins in database testing:**
- Check that a UI or API action wrote correct, linked rows: \`orders JOIN payments ON ...\` for the new order id.
- Find **orphans**: \`LEFT JOIN customers c ... WHERE c.id IS NULL\`.
- **Reconcile** source and target tables after an ETL or migration (counts, sums, mismatched rows via a FULL JOIN).
- Check that referential integrity holds after deletes (no child rows left behind).`,
    followUps: [
      {
        q: 'How would you find orders that have no payment record?',
        a: 'Use an anti-join: SELECT o.id FROM orders o LEFT JOIN payments p ON p.order_id = o.id WHERE p.id IS NULL. NOT EXISTS (SELECT 1 FROM payments p WHERE p.order_id = o.id) works too.',
      },
    ],
    topic: 'sql-joins-validation',
    source: { name: 'Medium — Deloitte interview questions for QA automation role (Arpit Choubey)', url: MD_DELOITTE, year: 2024 },
  },
  {
    id: 'co-sql-deloitte-2',
    company: 'Deloitte',
    area: 'sql',
    role: 'QA Automation',
    difficulty: 'medium',
    question: 'What is the difference between a CROSS JOIN and an INNER JOIN?',
    answer: `- **CROSS JOIN** has **no join condition**. It pairs **every** row of A with **every** row of B, so the result has |A| × |B| rows. 5 employees × 3 departments = **15** rows.

    SELECT e.name, d.name FROM employee e CROSS JOIN department d;

- **INNER JOIN** has an **ON condition** and keeps only the pairs that satisfy it, usually key equality:

    SELECT e.name, d.name FROM employee e INNER JOIN department d ON d.id = e.dept_id;

Logically, an inner join is a cross join followed by a filter, and the optimiser never actually builds the full product.

When a cross join is useful: generating **test-data combinations** (every browser × every OS, every size × every colour), building calendar grids, or pairing every store with every date for a report.

The classic bug: forgetting the join condition (\`FROM a, b\` with no WHERE, or a wrong ON) turns an inner join into an accidental cross join. Row counts explode and sums become inflated. A tester spots it by comparing the result count with the expected row count.`,
    followUps: [
      {
        q: 'Is "SELECT * FROM a, b WHERE a.id = b.a_id" an inner or a cross join?',
        a: 'It is old-style comma syntax: a cross join filtered by WHERE, which gives the same result as an INNER JOIN on that condition. Explicit JOIN ... ON is preferred because a missing condition is easier to spot.',
      },
    ],
    topic: 'sql-joins-validation',
    source: { name: 'Medium — Deloitte interview questions for QA automation role (Arpit Choubey)', url: MD_DELOITTE, year: 2024 },
  },
  {
    id: 'co-sql-eq-technologic-1',
    company: 'eQ Technologic',
    area: 'sql',
    role: 'QA Engineer',
    round: 'Round 2: Technical interview',
    difficulty: 'easy',
    question: 'Write a SQL query to update the address of one particular employee.',
    answer: `Target the row by its **primary key** so exactly one record changes:

    UPDATE employee
    SET address = 'New Street 5, Pune'
    WHERE id = 3;

Good practice to mention:
- **Always include a WHERE clause.** Without it, every employee's address is overwritten. Many teams enable MySQL's \`sql_safe_updates\` for this reason.
- **Check first** with the same filter: \`SELECT * FROM employee WHERE id = 3;\`, and confirm it returns one row.
- Use a **transaction** when testing by hand:

    START TRANSACTION;
    UPDATE employee SET address = 'New Street 5, Pune' WHERE id = 3;
    -- check the affected row count is 1, then
    COMMIT;   -- or ROLLBACK;

- Filtering by name (\`WHERE name = 'Vishal'\`) is risky because names are not unique.
- Escape quotes in values (\`O''Brien\`) and use parameterised queries in code to avoid SQL injection.

To verify: rows affected = 1, the new value can be read back, other rows are unchanged, and any \`updated_at\` or audit columns changed as expected.`,
    followUps: [
      {
        q: 'How do you update a column using values from another table?',
        a: 'Use a join or subquery update. In MySQL: UPDATE employee e JOIN address_changes a ON a.emp_id = e.id SET e.address = a.new_address. In standard SQL: UPDATE employee SET address = (SELECT ... WHERE ...) WHERE EXISTS (...).',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'LeetCode Discuss — eQ Technologic on-campus 2023, QA Engineer', url: LC_EQ, year: 2023 },
  },
  {
    id: 'co-sql-zepto-1',
    company: 'Zepto',
    area: 'sql',
    role: 'SDET2',
    round: 'First round (bar-raiser)',
    difficulty: 'medium',
    question: 'Write a query to find the third highest salary.',
    answer: `Use \`DENSE_RANK\` so that ties count as one salary level:

    SELECT DISTINCT salary AS third_highest
    FROM (
      SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
      FROM employee
    ) ranked
    WHERE rnk = 3;

Without window functions (older MySQL), use nested MAX calls or a distinct offset:

    SELECT MAX(salary) FROM employee
    WHERE salary < (SELECT MAX(salary) FROM employee
                    WHERE salary < (SELECT MAX(salary) FROM employee));

    SELECT DISTINCT salary FROM employee ORDER BY salary DESC LIMIT 1 OFFSET 2;

With salaries 9000, 9000, 7000, 5000, 3000 every version returns **5000**.

Talking points: why \`DISTINCT\` or \`DENSE_RANK\` is needed (ties), what happens with fewer than three salaries (no row, or NULL for the MAX version), NULL salaries (exclude them with \`WHERE salary IS NOT NULL\`, because PostgreSQL and Oracle sort NULLs first in DESC order and would rank them highest), and an index on \`salary\` makes the ORDER BY version cheap.`,
    followUps: [
      {
        q: 'How would you return the Nth highest salary for any N?',
        a: 'Parameterise the rank filter (WHERE rnk = :n), or use LIMIT 1 OFFSET n-1 over DISTINCT salaries. In MySQL a stored function can wrap it, as in the classic getNthHighestSalary(N).',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'LeetCode Discuss — ZEPTO | SDET2 | Interview Experience', url: LC_ZEPTO, year: 2024 },
  },
  {
    id: 'co-sql-arcesium-1',
    company: 'Arcesium',
    area: 'sql',
    role: 'Test Engineer',
    round: 'Technical Interview 1',
    difficulty: 'medium',
    question: 'Write SQL queries that combine GROUP BY, COUNT(), a subquery and the LIKE operator.',
    answer: `Examples of the kind of queries asked, on \`employee(id, name, dept_id, salary)\` and \`department(id, name)\`:

**1. GROUP BY + COUNT + LIKE**: employees per department, counting only names starting with A or C:

    SELECT d.name, COUNT(*) AS cnt
    FROM employee e
    JOIN department d ON d.id = e.dept_id
    WHERE e.name LIKE 'A%' OR e.name LIKE 'C%'
    GROUP BY d.name;

**2. Subquery**: employees earning above the company average:

    SELECT name, salary
    FROM employee
    WHERE salary > (SELECT AVG(salary) FROM employee)
    ORDER BY salary DESC;

**3. All together**: departments with more employees than the average department size:

    SELECT dept_id, COUNT(*) AS cnt
    FROM employee
    GROUP BY dept_id
    HAVING COUNT(*) > (SELECT AVG(c) FROM (SELECT COUNT(*) AS c FROM employee GROUP BY dept_id) t);

LIKE reminders: \`%\` matches any run of characters and \`_\` matches exactly one. \`'%son'\` means "ends with son". Case sensitivity depends on the collation, so use \`LOWER(name) LIKE 'a%'\` to be safe. A leading \`%\` cannot use a normal index.`,
    followUps: [
      {
        q: 'How do you search for a literal % or _ with LIKE?',
        a: "Escape it: WHERE code LIKE '50\\%%' (backslash is the default escape in MySQL), or declare one explicitly: WHERE code LIKE '50!%%' ESCAPE '!'.",
      },
    ],
    topic: 'sql-querying',
    source: { name: 'LeetCode Discuss — Arcesium | Test Engineer | May 2024 | Interview Experience', url: LC_ARCESIUM, year: 2024 },
  },
  {
    id: 'co-sql-infosys-1',
    company: 'Infosys',
    area: 'sql',
    role: 'Automation Testing (Selenium + Java)',
    difficulty: 'easy',
    question: 'A table holds a list of numbers. How do you find the numbers that are duplicated?',
    answer: `If the numbers are in a database table \`nums(n)\`, group and count:

    SELECT n, COUNT(*) AS times
    FROM nums
    GROUP BY n
    HAVING COUNT(*) > 1;

For 1, 2, 2, 3, 3, 3 this returns **(2, 2)** and **(3, 3)**.

To list every duplicate row (e.g. to clean them up), use a window count:

    SELECT * FROM (
      SELECT n, COUNT(*) OVER (PARTITION BY n) AS c FROM nums
    ) t WHERE c > 1;

If the "table" is an **HTML table on a web page** (a Selenium/Playwright context), read the cell texts into a list and count them in code:

    const seen = new Set(), dups = new Set();
    for (const v of cellTexts) (seen.has(v) ? dups : seen).add(v);
    // dups now holds each repeated value once

Both are **O(n)**: the database uses hashing or sorting for GROUP BY, and the code uses a Set. Mention which one you would use and why: validating stored data → SQL; validating what the UI shows → read the DOM.`,
    followUps: [
      {
        q: 'How would you delete the duplicates but keep one copy of each?',
        a: 'With a unique id column: DELETE FROM nums WHERE id NOT IN (SELECT MIN(id) FROM nums GROUP BY n). MySQL needs that subquery wrapped in a derived table. Or delete the rows with ROW_NUMBER() > 1 per value.',
      },
    ],
    topic: 'sql-querying',
    source: { name: 'Medium — Infosys interview questions for automation testing (Selenium, Java) (Arpit Choubey)', url: MD_INFOSYS, year: 2024 },
  },
];
