import type { Topic } from '../../types';

const topic: Topic = {
  id: 'qa-behavioral',
  phase: 'interview',
  order: 3,
  title: 'HR & Managerial Round for QA: Stories, Honesty and STAR',
  subtitle:
    'What HR and hiring-manager rounds score for a manual tester moving into automation: "tell me about yourself", conflicts with developers, a bug missed in production, deadline pressure, presenting Playwright honestly as a skill you are learning (backed by a portfolio), walking through that portfolio, and the questions you ask at the end.',
  estimatedMinutes: 75,
  sources: [
    'Amazon Jobs: Interviewing at Amazon (STAR method guidance)',
    'Coursera: 9 QA interview questions and how to answer them (missed-bug and conflict questions, STAR)',
    'SoftwareTestPilot: How to answer "Tell me about yourself" in a QA interview (Present-Past-Future, 60–90 seconds)',
    'Yrkan QA course: The STAR method for QA interviews (story bank, never blame developers)',
    'Glassdoor interview-question listings for software QA roles: "Describe a bug that made it into production. Why was it missed? What did you do to prevent similar issues?"',
    'MockQuestions: QA interview — "Describe an incident where you missed an error"',
    'Glassdoor candidate reports (2025–2026) of manual-QA interviews asking about interest in automation and following up with an automation take-home task',
    'Career Karma: How to move from manual to automation testing',
    'Lisa Crispin & Janet Gregory — Agile Testing (whole-team quality, tester–developer collaboration)',
    'Mentor guidance for this learner: keep Playwright as a learning-only skill on the resume until there is enough practical experience to demonstrate it confidently',
  ],
  tags: ['behavioral', 'hr-round', 'star', 'tell-me-about-yourself', 'conflict', 'production-bug', 'career-switch', 'portfolio', 'honesty'],
  cheatSheet: [
    'HR/managerial rounds score: ownership, communication, collaboration with developers, handling pressure, learning ability, honesty, and fit with the role you are actually applying for.',
    'STAR(L): Situation + Task ≈ 20%, Action ≈ 50–60% (what YOU did), Result ≈ 20% (numbers if you have them), Learning one line. Aim for about 2 minutes per story.',
    '"Tell me about yourself" = Present (current role + one result) → Past (how you got here, key skills) → Future (why automation, why this role). 60–90 seconds.',
    'Playwright honestly: "I am learning Playwright with TypeScript through a portfolio project; I have not used it on a production project yet." Then show depth on what you built.',
    'On the resume, list Playwright under "Currently learning" or "Projects (self-learning)", not under core skills with years of experience, until you can demonstrate it confidently.',
    'Conflict with a developer: facts and evidence, understand their view, agree on the user impact, escalate through the process (triage/PO) only if needed, keep the relationship. Never "I was right and they were wrong".',
    'Missed bug in production: own your part, explain the root cause briefly, what you did immediately, and the process change that stops it recurring. Never blame developers or "lack of time".',
    'Deadline pressure: prioritise by risk, make the untested risk visible in writing, give a clear recommendation, let the business decide. Quality advocate, not gatekeeper.',
    'Portfolio walkthrough: problem → what you tested and why → structure (config, pages, fixtures, data) → one hard problem you solved → CI → what you would improve. Be ready to share the screen.',
    'Always ask 2–3 questions at the end: how QA works in the team, automation maturity, what success in 90 days looks like, mentoring for someone growing into automation.',
  ],
  sections: [
    {
      heading: 'What the HR and managerial rounds score for QA',
      body: `**Intuition:** the technical rounds check *whether you can test*. The HR and hiring-manager rounds check *whether the team can trust you*: with a release, with a developer's ego, with the truth about what you know.

| Signal | What they want to hear | Red flag |
|---|---|---|
| **Ownership** | You follow a bug or a risk to closure, even outside your ticket | "That was the developer's job" |
| **Collaboration** | You disagree with evidence and keep the relationship | "Developers never listen to QA" |
| **Communication** | Clear bug reports, clear risk statements to managers | Vague, emotional, or only technical |
| **Handling pressure** | You prioritise and make trade-offs visible | "I just worked overnight and tested everything" |
| **Learning ability** | You are growing into automation in a structured way, with evidence | "I will learn it when the company trains me" |
| **Honesty** | You describe your level accurately and show what you did | Claiming production experience you do not have |
| **Motivation & fit** | Why QA, why automation, why this company | Generic answers that fit any company |

**For a manual tester moving into automation**, two signals dominate: *learning ability* and *honesty*. Candidate reports for manual-QA roles describe interviewers asking "do you know automation?", and when the candidate said yes, sending an automation take-home task. Whatever you claim will be tested.

**In interviews, think this:** "Every story should drop evidence into at least two boxes of this table."`,
      keyPoints: [
        'HR/managerial rounds measure trust: ownership, collaboration, honesty, learning.',
        'For a career switcher, learning ability and honesty carry the most weight.',
        'Claims about tools get verified, often with a task.',
      ],
      source: 'Glassdoor candidate reports for manual QA roles (2025–2026); Coursera — QA interview questions',
    },
    {
      heading: 'STAR for testers: shaping a story in two minutes',
      body: `**Intuition:** a good behavioural answer is a short film: where we were, what I had to do, what *I* did, how it ended. STAR is the storyboard. Amazon's own interview guidance recommends it, and most companies score answers the same way.

| Part | Share of time | For a QA story, include |
|---|---|---|
| **S**ituation | ~10% | Product, team, release, what was at stake (one or two sentences) |
| **T**ask | ~10% | Your responsibility in that moment |
| **A**ction | ~50–60% | The steps *you* took: what you tested, who you spoke to, what evidence you gathered, the trade-offs |
| **R**esult | ~20% | Outcome with numbers if possible (bugs found, time saved, escaped defects) |
| **L**earning | one line | What you do differently now |

**Make it measurable without inventing numbers.** Use real numbers you can defend ("regression went from 2 days to 1.5 days after I reorganised the suite by risk"). If you do not have numbers, describe the observable outcome ("the release went out on time and no payment incident was reported in the next month"). **Never make up metrics**; a follow-up question will expose them.

**"I" vs "we":** say *we* for the team's outcome and *I* for your actions. If the interviewer cannot tell what you did, the story scores nothing for you.

**Build a story bank of 6–8 stories** that you can bend to many questions:
1. A critical bug you found (and how you reported it)
2. A disagreement with a developer or PO
3. A bug that escaped to production
4. A tight deadline / release pressure
5. A process you improved (checklist, test data, regression selection)
6. Learning something new fast (your Playwright learning journey)
7. Helping a teammate or new joiner
8. A mistake you made and fixed`,
      diagram: `  S ─► T ─► A A A A A ─► R R ─► L
  10%  10%    50-60%       20%   1 line
  context     what *I* did  numbers / observable outcome`,
      keyPoints: [
        'Action is the biggest part; context is short.',
        'Real numbers or observable outcomes only; never invented metrics.',
        'Prepare 6–8 stories and map each to several questions.',
      ],
      source: 'Amazon Jobs — interviewing at Amazon (STAR); Yrkan QA course — STAR method for QA interviews',
    },
    {
      heading: '"Tell me about yourself": the manual-to-automation version',
      body: `**Intuition:** this is the trailer for the whole interview. In 60–90 seconds you choose which topics the interviewer will ask about next, so point them at your strengths.

**Structure: Present → Past → Future** (recommended by QA interview guides):

| Part | ~Time | What to say |
|---|---|---|
| Present | 20 s | Current role, domain, what you test, one concrete result |
| Past | 30 s | How you got here, core manual skills (test design, API with Postman, SQL, Jira), and the automation learning you have done |
| Future | 15–20 s | Why automation, why this role, what you bring now |

**Example to adapt (the facts are placeholders; use your own):**

"I'm a QA engineer with about two years of manual testing on an e-commerce web application. I own test design and execution for the checkout and payments module: I write test cases from user stories, test APIs in Postman, and validate orders with SQL. In the last release cycle I found a coupon-rounding defect before it reached production, which would have given wrong discounts on large orders.

I started in manual testing and built strong fundamentals: boundary and decision-table design, clear bug reports, and working closely with developers in sprints. Over the last few months I've been **learning automation with Playwright and TypeScript**. I've built a practice framework on public demo sites: SauceDemo for UI and Restful Booker for API, with page objects, fixtures, and a GitHub Actions run. I haven't used Playwright on a production project yet, and I'm looking for a role where I can keep contributing strong manual and API testing while growing into automation with the team."

**Why it works:** it leads with real, current strengths; it shows initiative; and it states the automation level honestly, which invites questions about the portfolio, where you are prepared.

**Common mistakes:** reading the resume line by line, starting with school, listing ten tools, going over two minutes, or claiming "I am an automation tester" when you have only practised.`,
      keyPoints: [
        'Present → Past → Future in 60–90 seconds.',
        'Lead with real manual/API/SQL strengths and one concrete result.',
        'State the Playwright level precisely: learning, portfolio, not yet production.',
      ],
      source: 'SoftwareTestPilot — How to answer "Tell me about yourself" in a QA interview',
    },
    {
      heading: 'Presenting Playwright honestly as a skill you are learning',
      body: `**Intuition:** an honest "learning, and here is what I built" is stronger than a vague "yes, I know Playwright". The first invites a conversation you can win; the second invites a test you may fail.

**The mentor's guidance for this learner:** *keep Playwright as a learning-only skill on the resume until there is enough practical experience to demonstrate it confidently.* In practice:

| Where | Overclaiming (avoid) | Honest and still strong |
|---|---|---|
| Resume skills line | "Automation: Playwright (2 years)" | "Testing: manual, API (Postman), SQL, Jira · **Currently learning:** Playwright with TypeScript" |
| Resume projects | "Built enterprise automation framework" | "**Practice project (self-learning):** Playwright + TypeScript suite for SauceDemo and Restful Booker: POM, fixtures, storageState login, API tests, GitHub Actions run · link" |
| Interview answer | "Yes, I've done Playwright automation." | "I've been learning it for some months through a portfolio project. I haven't used it on a production project yet. Shall I walk you through what I built?" |
| When asked something you have not done | Guessing an API name confidently | "I haven't used sharding myself; my understanding is… I'd confirm in the docs and try it on my repo." |

**What makes "learning" credible:**
- A **public repo** with a clear README, meaningful commit history and a passing CI run.
- Specific things you can explain: why \`getByRole\` over XPath, why web-first assertions, how \`storageState\` works, one flaky test you fixed.
- A **learning plan** with dates: what you have covered, what is next.

**When does it move to "skills"?** When you can build and explain a small suite without notes, debug a failing test with the trace viewer, and answer two levels of follow-up questions, ideally with some real project use. Until then, "learning" is accurate, and accuracy is what the mentor asks for.

**Why this is not a weakness:** many teams hiring QA/SDET-1 want strong testing fundamentals plus a clear growth path. Honesty plus evidence scores well on both *honesty* and *learning ability*.`,
      keyPoints: [
        'Resume: Playwright under "Currently learning" / practice projects, not core skills.',
        'Say "learning, portfolio, not yet production" and offer a walkthrough.',
        'Credibility = public repo + explainable decisions + a learning plan.',
      ],
      source: 'Mentor guidance for this learner; Glassdoor manual-QA candidate reports (automation claims followed by a take-home task)',
    },
    {
      heading: 'Walking through your portfolio project',
      body: `**Intuition:** your portfolio is the evidence behind the word "learning". The walkthrough is a guided tour, not a code dump: *what problem, what I chose, why, what I would improve*.

**A 5-minute walkthrough structure:**

1. **Goal (20 s):** "I wanted to practise a realistic suite: UI flows on SauceDemo and CRUD on Restful Booker."
2. **What I test and why (40 s):** login (valid, locked-out user), add to cart, checkout; booking create/read/update/delete. "I picked flows a real shop would run on every build."
3. **Structure (60 s):** \`playwright.config.ts\` (baseURL, projects, retries in CI, trace on first retry), \`pages/\` (page objects), \`fixtures/\` (custom fixtures to inject page objects), \`tests/ui\` and \`tests/api\`, \`test-data/\`.
4. **One problem I solved (60 s):** e.g. "My cart test was flaky in GitHub Actions. The trace showed I asserted the badge before the click finished, because I had forgotten an await. I fixed it and enabled the no-floating-promises lint rule."
5. **CI (30 s):** GitHub Actions workflow runs on every push, uploads the HTML report.
6. **What I'd improve (30 s):** "Test data via API instead of fixed users, more negative API cases, a small visual check."

**Repo checklist before the interview:**
- README: what it covers, how to run (\`npm ci\`, \`npx playwright install\`, \`npx playwright test\`), a screenshot of the report
- No secrets committed; credentials via \`.env\` with a \`.env.example\`
- Green CI badge; recent commits with clear messages
- Code you can explain line by line. Anything copied that you cannot explain should be removed or understood first

**Be ready for:** "Why this locator?", "What happens if this test runs in parallel with that one?", "Change this test live to cover X."`,
      code: [
        {
          language: 'text',
          title: 'README excerpt that sets honest expectations',
          code: `# saucedemo-playwright-practice

Self-learning project: practising Playwright + TypeScript on public demo apps.
Not production code. Built while transitioning from manual to automation testing.

What it covers
- UI: login (standard + locked_out_user), cart, checkout on saucedemo.com
- API: create/read/update/delete bookings on restful-booker.herokuapp.com
- Page objects + custom fixtures, login once via storageState
- GitHub Actions: runs on every push, uploads HTML report and traces

Run locally
  npm ci
  npx playwright install --with-deps
  npx playwright test

Next on my learning plan
- Generate test data via API instead of fixed users
- Add negative API cases from the booking schema`,
        },
      ],
      keyPoints: [
        'Goal → what and why → structure → one problem solved → CI → improvements.',
        'Every line in the repo must be explainable by you.',
        'Label it as a self-learning project in the README and resume.',
      ],
      source: 'Career Karma — moving from manual to automation testing; Playwright docs — CI and Authentication',
    },
    {
      heading: 'Conflict with a developer',
      body: `**Intuition:** the interviewer is not asking "who won?". They are asking "will you make my team better or more tense?". A good conflict story ends with the *product* winning and the relationship intact.

**Typical prompts:** "Tell me about a time a developer rejected your bug." "How do you handle a developer who says 'works on my machine'?" "Describe a disagreement with a teammate."

**Shape of a strong answer:**

| Step | What you say |
|---|---|
| Facts first | You reproduced it, with exact steps, data, environment, screenshots/video, logs or the network response |
| Understand their view | You asked why they disagreed: environment difference, "by design", priority pressure |
| Shared goal | You framed it around the user or business impact, not "my bug" |
| Resolve | Pair to reproduce on their machine, check the acceptance criteria with the PO, or take it to triage |
| Outcome | Fixed, deferred with an agreed risk, or you learned it was by design and updated your test |
| Learning | What you now do upfront (e.g. attach a HAR file, clarify acceptance criteria in refinement) |

**A good answer can end with "I was wrong".** If the PO confirmed it was by design, say so, and say how you avoided the misunderstanding next time (asking in three-amigos sessions). That shows maturity.

**Common mistakes:** "Developers always reject my bugs", escalating to the manager as the first step, or a story where nobody learns anything.`,
      keyPoints: [
        'Evidence, empathy, shared goal, process, outcome, learning.',
        'Escalate through triage or the PO, not as the first move.',
        'Being proven wrong, handled well, is a strong story too.',
      ],
      source: 'Lisa Crispin & Janet Gregory — Agile Testing (tester–developer collaboration); Yrkan — STAR for QA (never blame developers)',
    },
    {
      heading: 'A bug you missed in production',
      body: `**Intuition:** every tester has missed something. The question is really "do you own mistakes, learn from them, and fix the system so it does not repeat?". Answer guides agree: own it, do not blame others, show what changed.

Glassdoor lists this one almost word for word for QA roles: *"Describe a bug that made it into production. Why was it missed? What did you do to prevent similar issues?"*

**Shape of a strong answer:**
1. **What happened (short):** the bug, how it was found (customer, monitoring), the impact.
2. **Immediate action:** reproduced it fast, gave developers exact steps, verified the hotfix, checked for similar cases.
3. **Root cause, honestly:** "My test data only had small orders, so the rounding issue above 10,000 never showed up" or "the scenario wasn't in the acceptance criteria and I didn't ask about it."
4. **Prevention (most important):** a new regression test, a test-data change, a checklist item, a question you now ask in refinement, an automated check.
5. **Result:** "We haven't had a recurrence; the new test caught a similar issue two sprints later" (only if true).

**Ownership without self-punishment:** "I missed it" plus what you changed. Do not over-apologise; do not hide behind "testing can't find all bugs" (true, but it sounds like an excuse here).

**If you truly have no such story:** use a near-miss (a bug you caught late in UAT) and be clear that it is a near-miss.`,
      code: [
        {
          language: 'text',
          title: 'Story skeleton: escaped defect (fill in your own facts)',
          code: `S  Release 4.2 of our e-commerce site; a customer reported that coupon
   discounts on orders above 10,000 were off by a few rupees.
T  I owned checkout testing for that release.
A  - Reproduced it within an hour with a 12,499 cart; shared exact steps,
     data and API response with the developer.
   - Verified the hotfix and re-ran checkout regression the same day.
   - Root cause on my side: my coupon test data only used carts under
     5,000, so the rounding path for larger totals was never exercised.
   - Added boundary-based coupon cases (min, max cap, large totals) to
     the regression set and a data table so they are easy to extend.
R  Hotfix went out the same day; the new cases are part of every
   regression cycle since then.
L  I now derive test data from boundaries and limits in the rules, not
   from "typical" values.`,
        },
      ],
      keyPoints: [
        'Own it, root cause, immediate action, prevention, result.',
        'Prevention is the part interviewers remember.',
        'Never blame developers, time or "testing can\'t find everything".',
      ],
      source: 'Glassdoor QA interview-question listings; Coursera — QA interview questions; MockQuestions — missed error question',
    },
    {
      heading: 'Deadline pressure and release decisions',
      body: `**Intuition:** managers ask about pressure to find out whether you will either block everything or silently cut corners. They want neither. They want **visible trade-offs**.

**Typical prompts:** "The release is tomorrow and you have not finished testing. What do you do?" "Your manager asks you to sign off with open bugs." "You have two days for a five-day test plan."

**Strong pattern:**
1. **Prioritise by risk:** run the critical business flows and the changed areas first.
2. **Make the gap visible early,** not at 6 p.m. on release day: "We'll finish P1 and P2; P3 (about 40 cases: localisation and older browsers) will not be run."
3. **Quantify the risk in plain language:** "If the Safari issue exists, about 10% of users could fail to check out."
4. **Offer options:** release with a known-issues list and monitoring; move the date; release behind a feature flag; reduce scope.
5. **Recommend, then respect the decision.** The PO/manager owns the business decision; you own the clarity of information. Put it in writing (a short message or test summary).

**On "sign off with open bugs":** it is normal to release with known low-severity bugs. What matters is that severity is honest, the PO agrees, and they are documented. If a critical bug is open, say clearly that you do not recommend release and why.

**Avoid:** "I worked all night and tested everything" (not sustainable, not believable), or "I refused to release" with no alternatives.`,
      keyPoints: [
        'Prioritise, make the gap visible early, quantify, offer options.',
        'Recommend clearly; the business owns the decision.',
        'Releasing with documented, agreed low-severity bugs is normal.',
      ],
      source: 'ISTQB CTFL v4.0 — test monitoring, control and completion; Crispin & Gregory — Agile Testing',
    },
    {
      heading: 'Other common HR questions for testers',
      body: `**Intuition:** these are short questions, but each has a trap. Prepare one or two sentences for each, true to you.

| Question | Strong direction | Trap |
|---|---|---|
| Why QA / why testing? | What you enjoy (finding how things break, protecting users) with an example | "I couldn't get a developer job" |
| Why move to automation? | Repetitive regression wastes time; you want faster feedback and to spend manual time on exploration; you have started learning | "Manual testing is boring / dying" |
| Why are you leaving your current job? | Growth towards automation, product domain, team practices | Complaining about the manager or company |
| What is your biggest weakness? | A real one with a plan: "My automation experience is still from practice projects; I spend 6–8 hours a week on my Playwright repo and ask for code reviews from a mentor" | Fake weakness ("I'm a perfectionist") |
| Where do you see yourself in 3 years? | Confident in automation and API testing, contributing to framework decisions, still a strong tester | "Moving to development" for a QA role, or "your job" |
| How do you keep learning? | Concrete: docs, a course, a community, your repo, a schedule | "I watch YouTube sometimes" |
| Notice period / salary | Facts plainly; a researched range for the role and city | Inventing competing offers |

**For the weakness question in particular,** the honest automation gap is a perfect answer *because* the mentor's positioning already handles it: you name it, show the plan, and show progress.`,
      keyPoints: [
        'Every short HR question has a trap; prepare two true sentences each.',
        'Never criticise manual testing, your employer or your manager.',
        'The automation gap + learning plan is a credible "weakness" answer.',
      ],
      source: 'Coursera — QA interview questions; Career Karma — manual to automation',
    },
    {
      heading: 'Questions to ask the interviewer',
      body: `**Intuition:** "Do you have any questions for us?" is still part of the interview. Good questions show you are thinking about doing the job well, and they help you decide whether this team will help you grow into automation.

**Pick 2–3, tailored to who is in front of you:**

| Interviewer | Good questions |
|---|---|
| Hiring manager | "What does success look like for this role in the first 90 days?" · "How is the split between manual, API and automation work today?" · "How would someone growing into automation get mentoring or code reviews here?" |
| QA lead / engineer | "Which tools and framework do you use, and who maintains it?" · "How do you handle flaky tests?" · "When does QA get involved: refinement, three amigos, or after development?" |
| HR | "What does the onboarding look like?" · "Are there learning budgets or certifications supported?" · "What are the next steps and timeline?" |

**Avoid:** questions answered on the careers page, leading with salary in a technical round, or "no questions".

**A quietly powerful one for your situation:** "If I join with strong manual and API skills and a Playwright practice project, what would you expect me to be able to automate after six months?" It is honest, shows ambition, and tells you whether the team will actually support the transition.`,
      keyPoints: [
        'Always ask 2–3 role-specific questions.',
        'Ask about QA involvement, automation maturity, flaky-test handling, mentoring.',
        'Use the six-month question to check the team supports your transition.',
      ],
      source: 'Coursera — QA interview questions (questions for the interviewer)',
    },
  ],
  codeChallenges: [
    {
      id: 'qa-behavioral-cc-1',
      title: 'Answer Lab: rescue an overclaiming "tell me about yourself"',
      context:
        'A manual tester with two years of experience, who has been practising Playwright on SauceDemo for three months, gives this answer in the first minute of an SDET-1 interview.',
      task: 'Rewrite the answer in 60–90 seconds using Present → Past → Future. Keep every strength, remove anything the candidate cannot defend, state the Playwright level honestly, and end by inviting a portfolio walkthrough.',
      starter: {
        language: 'text',
        title: 'Weak answer (as delivered)',
        code: `"Hi, I am Neha. I did my B.Tech in 2022 from a college in Indore, my
hobbies are reading and badminton. I am working in XYZ company as an
automation tester. I know Selenium, Playwright, Cypress, Appium, JMeter,
Postman, SQL, Java, JavaScript, Python, Jenkins, Docker. In my project I
did manual and automation testing of all modules. I am a hard worker and
a quick learner and a team player. I am looking for a good opportunity
to grow in automation."`,
      },
      hints: [
        'Which claims would collapse under a second follow-up question? ("automation tester", twelve tools)',
        'What has the candidate actually done that is concrete and impressive? Where is one result?',
        'How can the Playwright learning become a strength instead of a hidden gap?',
      ],
      solution: {
        language: 'text',
        title: 'Strong rewrite (placeholders in [brackets]: use your own facts)',
        code: `PRESENT (~20 s)
"I'm a QA engineer at [company] with two years of manual testing on an
[insurance/e-commerce] web app. I own testing for the [policy purchase]
module: I design test cases from user stories, test the APIs in Postman
and check the data with SQL. Last quarter I caught a premium-calculation
defect on the boundary age of 60 before it reached production."

PAST (~30 s)
"I started in manual testing and focused on fundamentals: boundary and
decision-table design, clear bug reports and working closely with
developers in two-week sprints. For the last three months I've been
learning Playwright with TypeScript. I built a practice suite on
SauceDemo and Restful Booker with page objects, fixtures, a storageState
login and a GitHub Actions run. I haven't used Playwright on a
production project yet."

FUTURE (~15 s)
"I'm looking for a QA role where my manual and API testing add value from
day one and I can grow into automation with the team. I'd be happy to
walk you through my practice repo if that's useful."`,
      },
      explanation: `- **"Automation tester" removed:** the candidate's job is mainly manual; claiming otherwise invites a live coding question they may not pass, and damages trust when discovered.
- **Twelve tools → the real stack:** Postman, SQL and test design are true and defensible; Playwright is presented as *learning with evidence*, matching the mentor's guidance.
- **Biography trimmed:** college year and hobbies were taking time from the professional story (a brief personal note is fine only if time allows).
- **One concrete result** (boundary defect) gives the interviewer something to ask about where the candidate is strong.
- **Adjectives replaced by evidence:** "quick learner" is shown by the three-month portfolio, not stated.
- **The ending steers the interview** towards the portfolio, where the candidate is prepared.`,
      followUps: [
        {
          q: 'The interviewer replies: "So you don\'t really know automation?" How do you respond?',
          a: 'Stay calm and specific: "I don\'t have production automation experience yet. What I do have is a working Playwright suite I built and can explain: locators, fixtures, auth reuse and a CI run. I can show it or write a small test now if you\'d like." It turns a challenge into a demonstration.',
        },
        {
          q: 'Should Selenium appear anywhere if you studied it briefly two years ago?',
          a: 'Only if you can answer two follow-up questions about it today. If not, leave it out, or mention it only as "basic exposure" if asked. Every tool on the resume or in the intro is an invitation to be tested on it.',
        },
      ],
    },
    {
      id: 'qa-behavioral-cc-2',
      title: 'Answer Lab: a conflict story where nobody wins',
      context:
        'Hiring manager: "Tell me about a time you disagreed with a developer about a bug." Here is the candidate\'s answer.',
      task: 'Rewrite it as a STAR(L) story that shows evidence, empathy, a shared goal, the right escalation path and a learning, in about two minutes. Keep it believable for a junior tester.',
      starter: {
        language: 'text',
        title: 'Weak answer (as delivered)',
        code: `"Yes, this happens a lot. Developers in my team don't like when I raise
bugs. Once I raised a bug in the checkout and the developer closed it as
'not a bug' saying it works on his machine. I was sure it was a bug so I
reopened it 3 times. Finally I told my manager and he told the developer
to fix it. In the end it was fixed and I was right. Developers should
take QA more seriously."`,
      },
      hints: [
        'What evidence would have made "works on my machine" impossible to argue with?',
        'What might have been different between the two environments, and how could you find out together?',
        'Where in the process should a disagreement go before your manager? What would you do differently next time?',
      ],
      solution: {
        language: 'text',
        title: 'Strong rewrite (adapt to a true story)',
        code: `S  Two days before a release, I logged a bug: on staging, applying a
   coupon after changing the delivery address reset the discount to 0.
   The developer closed it as "cannot reproduce".
T  I owned checkout testing, and a wrong total at payment is high impact,
   so I needed us to agree quickly, without a reopen/close loop.
A  - Re-ran it from a clean session and recorded a short video, plus the
     cart API request and response showing discount: 0.
   - Messaged the developer: "Can we look at it together for 10 minutes?
     I may be missing a step." On his machine it worked.
   - Comparing setups, we found he tested with the old address service
     stub; staging used the new service, which returned a different
     postcode format, and the coupon check failed on it.
   - We agreed it was a real bug for staging and production, and he fixed
     it that day. I added a regression case for coupon + address change.
R  Fixed before release; no coupon incidents were reported after it.
   The developer later asked me to review his test data for that service.
L  I now attach the API response and environment details to every bug,
   and if we still disagree, I suggest a quick pairing session before
   taking it to triage with the product owner.`,
      },
      explanation: `- **Evidence instead of insistence:** video, clean-session repro and the API response replace "I was sure".
- **Curiosity about the other side:** pairing found a real environment difference, which is the most common cause of "works on my machine".
- **Shared goal:** framed around a wrong total at payment, not winning an argument.
- **Right escalation path:** pairing, then triage/PO if needed, instead of reopening three times and going to the manager.
- **Relationship improves:** the developer asks for help later, a strong collaboration signal.
- **No generalisations:** "developers don't like QA" is gone; it is a red flag for any hiring manager.`,
      followUps: [
        {
          q: 'What if pairing shows it really is "by design"?',
          a: 'Accept it, and say so in the story. Then check the acceptance criteria with the PO: if the design surprises testers, it may surprise users, so suggest clarifying the UI or the criteria. Update the test case so it reflects the agreed behaviour. Handling being wrong gracefully is a strong signal.',
        },
        {
          q: 'When is going to your manager the right move?',
          a: 'When the disagreement blocks a release decision and the normal process (pairing, PO clarification, triage) has not resolved it, or when there is a behaviour problem rather than a technical one. Even then, present facts and options, not complaints about a person.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'qa-behavioral-iq-01',
      difficulty: 'easy',
      question: 'Tell me about yourself.',
      context: 'Asked at the start of almost every HR and hiring-manager round. For a career switcher, the interviewer listens for how you describe your automation level.',
      whatInterviewerLooksFor: [
        'Clear Present → Past → Future in 60–90 seconds',
        'Concrete strengths and one result, not a list of adjectives',
        'Honest, specific description of automation experience',
        'A reason for wanting this role',
      ],
      modelAnswer: `**Structure:** Present (current role and one result) → Past (how you built your skills) → Future (why this role).

**Example (replace the bracketed parts with your own facts):**

"I'm a QA engineer with about [two] years of manual testing on [an e-commerce web application]. I own testing for the [checkout and payments] module: I write test cases from user stories, test APIs in Postman, and validate data with SQL. In a recent release I found a [coupon-rounding] defect on large orders before it reached customers.

My foundation is manual testing: test design techniques like boundary values and decision tables, clear bug reports, and close work with developers in sprints. Over the past [few] months I've been **learning Playwright with TypeScript**. I built a practice suite on SauceDemo and Restful Booker with page objects, fixtures, login reuse through storageState and a GitHub Actions pipeline. It's a learning project; I haven't used Playwright in production yet.

I'm looking for a role where my manual and API testing help from day one and where I can grow into automation with the team. I'm happy to walk you through my repo."

**Why this works:**
- It leads with strengths you can defend in depth.
- It shows initiative and a learning trajectory with evidence.
- It is precise about automation level, which follows the "learning-only until I can demonstrate it confidently" positioning and builds trust.
- It ends by steering the conversation to your portfolio.

**Delivery tips:** practise with a timer; aim for 75 seconds; sound like you are talking, not reciting.`,
      followUps: [
        {
          q: 'You said you are learning Playwright. What is the hardest thing you have learned so far?',
          a: 'Pick something real and explain it simply: for example why web-first assertions retry and isVisible does not, and the flaky test you fixed because of it. Describe the symptom, how the trace showed it, and the fix. Specific beats impressive.',
        },
        {
          q: 'Why should we hire you over someone with production automation experience?',
          a: 'Do not argue against them; describe your value: strong test design and API/SQL skills that make automated tests worth having, a proven habit of learning with evidence, and domain knowledge. Add that you will automate the right things because you know what to test. Then point to the portfolio.',
        },
      ],
      pitfalls: [
        'Reading out the resume or starting with school',
        'Calling yourself an "automation tester" when automation is only practice',
        'Listing a dozen tools with no depth',
      ],
    },
    {
      id: 'qa-behavioral-iq-02',
      difficulty: 'medium',
      question: 'I see Playwright on your resume. How much have you used it, and where?',
      whatInterviewerLooksFor: [
        'An accurate, unembarrassed description of the experience level',
        'Specific evidence (repo, features used, problems solved)',
        'Ability to go two levels deep on what you claim',
        'A learning plan',
      ],
      modelAnswer: `**Answer the question directly first:** "I've used it in a self-learning project over the last [three] months, not yet on a production project. That's why it's listed under 'Currently learning' on my resume."

**Then give specific evidence:**
- "The suite covers SauceDemo login, cart and checkout, and CRUD API tests against Restful Booker."
- "I use \`getByRole\` and \`getByLabel\` locators, web-first assertions, page objects injected through a custom fixture, and a setup project that saves \`storageState\` so tests don't log in every time."
- "It runs in GitHub Actions on every push, with traces on the first retry."
- "One real problem: a test was flaky in CI. The trace showed I asserted before the click finished because of a missing \`await\`. I fixed it and turned on the no-floating-promises lint rule."

**Then the plan:** "Next I'm adding API-created test data and more negative API tests. I spend about [6–8] hours a week on it, and I'd love code reviews from experienced engineers, which is one reason I'm interested in this team."

**Why this is strong:** it is consistent with the resume (which follows the mentor's guidance to keep Playwright as learning-only until it can be demonstrated confidently), it is verifiable, and it gives the interviewer good follow-up material where you are prepared. Interviewers forgive limited experience; they do not forgive discovering an overclaim.

**If they then ask a question beyond your experience** (sharding, Docker, visual comparisons): "I haven't done that yet; my understanding is…, and here's how I'd try it."`,
      followUps: [
        {
          q: 'Can you write a small test now, for example logging in and checking an error message?',
          a: 'Say yes and talk while you write: goto the page, fill username and password using getByPlaceholder or getByLabel, click the button by role, then await expect on the error text. Mention why you chose each locator and that the assertion retries. If you forget an exact method name, say so and describe what it does; reasoning matters more than memory.',
        },
        {
          q: 'Why not just list it as a skill? Everyone does.',
          a: 'Because I want every line on my resume to hold up in an interview like this one. Listing it as "learning" with a linked project is accurate, and it lets me show depth instead of defending a claim. I\'ll move it to skills once I\'ve used it enough to demonstrate it confidently, ideally on a real project.',
        },
      ],
      pitfalls: [
        'Vague "yes, I have worked on it" that collapses on the next question',
        'Apologising excessively instead of showing evidence',
        'Claiming features you have only read about',
      ],
    },
    {
      id: 'qa-behavioral-iq-03',
      difficulty: 'medium',
      question: 'Walk me through a project you have built or worked on, as if I were joining the team tomorrow.',
      whatInterviewerLooksFor: [
        'Clear structure: purpose, scope, design, your role, results',
        'Ability to explain decisions and trade-offs',
        'Honesty about what was practice vs production',
        'Self-critique: what you would improve',
      ],
      modelAnswer: `**Pick one project and say which kind it is.** For a career switcher, two good options: your **work project** (manual/API testing on a real product) or your **Playwright portfolio** (self-learning). Many candidates do both briefly: work first, portfolio second.

**Structure for the portfolio (about 5 minutes):**
1. **Purpose:** "A self-learning project to practise Playwright with TypeScript on realistic flows."
2. **What it tests and why:** "SauceDemo login (including the locked-out user), cart and checkout, because those are the flows a shop runs on every build. Restful Booker CRUD to practise API tests and auth tokens."
3. **Design:** "\`playwright.config.ts\` with baseURL, Chromium and WebKit projects, retries 2 in CI, trace on first retry. Page objects in \`pages/\`, injected by a custom fixture. Login once via a setup project and \`storageState\`. Test data in JSON, credentials from environment variables."
4. **Your hardest problem:** "Checkout tests interfered with each other when running in parallel because they shared one cart state. I made each test start from an empty cart and stopped depending on test order."
5. **CI:** "GitHub Actions runs on push and uploads the report and traces."
6. **What I'd improve:** "Create data through APIs, add negative API cases from the schema, and add a contract check."

**For the work project:** domain, team size, your module, test approach (risk-based, regression selection), tools (Jira, Postman, SQL), one story of a key defect, and how you worked with developers.

**Tone:** confident about what you built, honest about scale ("about 25 tests, not an enterprise framework").`,
      followUps: [
        {
          q: 'Why did you use page objects? Are they always a good idea?',
          a: 'They keep locators and actions for a page in one place, so a UI change is fixed once and tests read like user steps. For a very small suite they can be overkill, and they become harmful if they grow into huge classes with assertions everywhere. I keep them thin: locators and actions, with assertions in tests.',
        },
        {
          q: 'What would break first if the team doubled the number of tests?',
          a: 'Probably run time and test data collisions. I would turn on fullyParallel and sharding in CI, make every test create its own data through the API, and tag tests so smoke runs on every push and the full regression nightly. I would also watch the flaky list closely.',
        },
      ],
      pitfalls: [
        'Reading code file by file with no story',
        'Inflating a practice project into "an enterprise framework"',
        'No answer to "what would you improve?"',
      ],
    },
    {
      id: 'qa-behavioral-iq-04',
      difficulty: 'medium',
      question: 'Tell me about a time a developer disagreed with a bug you raised. What happened?',
      whatInterviewerLooksFor: [
        'Evidence-based communication',
        'Empathy and curiosity about the other view',
        'Correct escalation path (pairing, PO, triage)',
        'A learning and an intact relationship',
      ],
      modelAnswer: `**Use STAR(L), keep the developer human, and let the product win.**

**S:** "During a sprint, I logged a bug where the order-history page showed orders in the wrong time zone for users outside India. The developer closed it as 'by design': times were shown in IST."

**T:** "I tested order history and wanted to make sure we weren't shipping something that would confuse international users, without turning it into a ticket ping-pong."

**A:**
- "I checked the acceptance criteria; they didn't mention time zones at all, so it was a requirements gap, not clearly a bug."
- "I wrote down the user impact with an example: a customer in Dubai sees an order placed at 9:30 p.m. local time as 11:00 p.m., which looks wrong on invoices."
- "I asked the developer for 10 minutes to understand the design. He explained the backend stored IST only, so local time would need a bigger change."
- "We took it to the PO together, with both views and the effort estimate."

**R:** "The PO chose to show the time zone label ('IST') now and schedule local-time display for the next quarter. I updated my test cases, and the label shipped that sprint."

**L:** "I now raise time-zone and locale questions in three-amigos sessions, before development, and I check the acceptance criteria before calling something a bug."

**Why it works:** evidence, curiosity, a shared decision through the PO, an outcome everyone could accept, and a process improvement.`,
      followUps: [
        {
          q: 'What if the PO had sided with the developer and you still thought it was wrong?',
          a: 'Accept the decision. The PO owns the product trade-off. Make sure the risk is documented (a ticket in the backlog or a known-issue note) so it is visible if customers complain. Disagree and commit, and keep the relationship. Revisit only if new evidence appears, such as support tickets.',
        },
        {
          q: 'How do you prevent "works on my machine" debates?',
          a: 'Put enough evidence in the first report: environment, build, browser, test data, exact steps, screenshot or video, the API request/response or console errors. When it still does not reproduce, offer a quick pairing session, because environment differences are the usual cause.',
        },
      ],
      pitfalls: [
        'Generalising: "developers never accept bugs"',
        'Going straight to the manager',
        'A story where you were simply right and nothing was learned',
      ],
    },
    {
      id: 'qa-behavioral-iq-05',
      difficulty: 'hard',
      question: 'Describe a bug that made it into production on your watch. Why was it missed, and what did you change?',
      context: 'Listed almost word for word on Glassdoor for software QA roles; answer guides stress ownership and prevention over apology.',
      whatInterviewerLooksFor: [
        'Ownership without blaming others',
        'Clear, honest root cause',
        'Quick, practical response',
        'A prevention step that changes the process',
      ],
      modelAnswer: `**S:** "After a release of our insurance quote page, a customer aged exactly 60 got the premium for the 46–59 band. Support raised it the next morning."

**T:** "I had tested the premium calculation module for that release."

**A:**
- "**Immediate:** I reproduced it within the hour with date-of-birth values around the 60th birthday, gave the developer the exact inputs and the API response, and checked whether other age bands had the same problem: the 18 and 45 boundaries were fine."
- "**Root cause (my part):** my test data used ages like 35, 55 and 65, the middle of each band, so the boundary at 60 was never tested. The rule said '60 and above', and the code used '> 60'."
- "**Fix verification:** I retested the hotfix on all band boundaries (17/18, 45/46, 59/60) and ran the quote regression."
- "**Prevention:** I rewrote the premium test set using boundary value analysis for every band, put the values in a data table, and asked for the API tests in CI to use the same table. I also added a 'boundaries checked?' item to our test-case review checklist."

**R:** "The hotfix went out the same day, affected quotes were corrected, and the boundary table has been part of regression since then."

**L:** "Any rule with ranges gets boundary values, not typical values. I'd rather spend 10 extra minutes on test data than miss an edge again."

**Note:** use your own true story. If you have none, describe a near-miss caught late (in UAT) and say so.`,
      followUps: [
        {
          q: 'Wasn\'t it the developer\'s bug, not yours?',
          a: 'The developer wrote the defect; I missed the test that would have caught it. Both are true, and the team owns quality. In the interview I focus on my part, because that is what I control and what I changed. Blaming the developer would not prevent the next escape.',
        },
        {
          q: 'How would you measure whether your change worked?',
          a: 'Track escaped defects in that module over the next releases, and whether the new boundary cases catch anything in regression. A simple metric like "defects found in production per release" for the module, compared before and after, is enough to show the trend.',
        },
      ],
      pitfalls: [
        'Blaming developers, time pressure or unclear requirements alone',
        'No prevention step',
        'Choosing a trivial bug to avoid owning a real miss',
      ],
    },
    {
      id: 'qa-behavioral-iq-06',
      difficulty: 'medium',
      question: 'The release is tomorrow and you have not finished testing. Your manager asks if we can go live. What do you say?',
      whatInterviewerLooksFor: [
        'Risk-based prioritisation',
        'Clear, written communication of what is and is not tested',
        'Options rather than a flat yes/no',
        'Respect for who owns the business decision',
      ],
      modelAnswer: `**First, I would not wait until the evening to say this.** As soon as I see the gap, I tell the manager and PO.

**What I say (example):**
"We've completed all P1 tests: login, search, cart, checkout with cards and UPI, and the order API. All pass except one medium bug: the order confirmation email is delayed by up to 10 minutes. P2 is 70% done. Not tested yet: about 40 P3 cases, mostly older Safari versions and Hindi localisation.

**Risks:** if a Safari-specific checkout issue exists, roughly [x]% of users could be affected; localisation issues would be cosmetic.

**Options:**
1. Release tomorrow with the known-issue list, monitoring on checkout errors, and I finish P2/P3 in the first two days after release.
2. Release with Hindi behind a feature flag until it's tested.
3. Delay by one day to finish P2.

**My recommendation:** option 1 or 2, because all business-critical paths pass and the open bug has a workaround."

**Then:** I put the same summary in writing (test summary in Jira/Confluence or the release channel), so the decision and the risk are recorded.

**If a critical bug were open** (e.g. double charge), I would clearly recommend not releasing and explain the customer and financial impact. The final call is still the business's, but my recommendation must be unambiguous.

**What this shows:** I am a quality advocate who gives decision-makers the information they need, not a gatekeeper and not someone who quietly cuts corners.`,
      followUps: [
        {
          q: 'The manager says "just sign it off, we have no choice". What now?',
          a: 'I can confirm what I tested and what I found; I should not claim testing I did not do. I send the written summary with the untested areas and risks and ask the manager or PO to approve the release with those known risks. That keeps the record honest and the decision with the right owner, without being obstructive.',
        },
        {
          q: 'How do you stop this happening every sprint?',
          a: 'Find the cause: late builds, scope creep, too much manual regression. Then propose fixes: test earlier (three amigos, testing stories as they finish), agree on a code-freeze day, automate the stable regression flows, and include testing effort in sprint planning. Bring data from the last few sprints to the retrospective.',
        },
      ],
      pitfalls: [
        '"I will work overnight and test everything"',
        'Refusing to release with no options or data',
        'Signing off silently on untested areas',
      ],
    },
    {
      id: 'qa-behavioral-iq-07',
      difficulty: 'easy',
      question: 'Why do you want to move from manual testing into automation?',
      whatInterviewerLooksFor: [
        'Positive motivation (not escaping manual testing)',
        'Understanding of what automation is good and bad at',
        'Evidence of action already taken',
        'Respect for manual testing skills',
      ],
      modelAnswer: `**Lead with the work, not the job title:**

"In my current team, about [two days] of each sprint go into running the same regression cases by hand. I've seen how that delays feedback and leaves less time for exploratory testing, where I usually find the most interesting bugs. I want to be able to automate the stable, repetitive checks so the team gets faster feedback and I can spend my manual time where human judgement matters."

**Show you have already started:**

"So I started learning: JavaScript fundamentals first, then Playwright with TypeScript. I've built a practice suite on SauceDemo and Restful Booker with page objects, API tests and a CI run. It's a learning project, not production yet, and I'm working through a plan: test data via APIs next, then better reporting."

**Respect manual testing:**

"I don't see automation as replacing manual testing. My test-design skills are what make an automated test worth having: knowing which boundary or which negative case matters. I want to combine the two."

**Tie to the role:** "Your team's mix of API and UI automation with a strong QA culture is exactly the environment where I can contribute my testing skills now and grow my automation skills properly."

**Avoid:** "Manual testing is boring / dying / has no future." It insults the people interviewing you, many of whom did manual testing for years.`,
      followUps: [
        {
          q: 'What will you do if this role is 70% manual for the first six months?',
          a: 'Be honest about expectations and positive: strong manual and API testing is valuable from day one. Ask how automation work is shared, offer to automate a few stable flows alongside, and keep learning outside work. If it suits your goals, say so clearly; if growth into automation is essential, ask what the path looks like.',
        },
        {
          q: 'How are you learning, specifically?',
          a: 'Name the real resources and schedule: the official Playwright docs and examples, a JavaScript basics course, your practice repo with weekly commits, and a mentor reviewing code. Concrete habits are more convincing than a list of course names, and they show you will keep learning after you are hired.',
        },
      ],
      pitfalls: [
        'Criticising manual testing',
        'Motivation is only salary or title',
        'No evidence of having started',
      ],
    },
    {
      id: 'qa-behavioral-iq-08',
      difficulty: 'medium',
      question: 'Tell me about the most important bug you have found. How did you find it and what happened next?',
      whatInterviewerLooksFor: [
        'A real bug with clear impact',
        'Testing technique or thinking that led to it (not luck)',
        'Quality of reporting and follow-through',
        'Humility and team credit',
      ],
      modelAnswer: `**Choose a bug that shows thinking, not just luck.** Impact (money, data, security, many users) plus a technique (boundary, state, concurrency, exploratory heuristic) makes the best story.

**Example structure:**

**S:** "We were adding UPI payments to checkout two weeks before a festive sale."

**T:** "I was testing payment flows, including failures."

**A:**
- "Besides success and decline, I tried interrupting the flow: I approved the payment in the UPI app but closed the browser tab before it redirected back."
- "The money was debited, but no order was created, because our app only created the order on the redirect, and the gateway's server-to-server callback wasn't handled."
- "I reproduced it three times, captured the gateway sandbox logs and our API calls, and raised it as critical with clear steps. I also asked the developer whether a refresh during redirect would do the same, and it did."
- "I joined the triage call to explain the customer impact during a sale."

**R:** "The team added webhook handling so orders are created from the gateway callback, plus a reconciliation job. I added interruption cases to the payment regression set."

**L:** "Money flows need 'what if it stops halfway?' tests at every step."

**Credit:** "The developer designed the webhook fix; my part was finding the gap and proving the impact."

**Avoid:** a cosmetic bug, a bug you cannot explain technically, or a story with no follow-through.`,
      followUps: [
        {
          q: 'What severity and priority did you give it and why?',
          a: 'Critical severity: customers lose money without an order, which also creates support load and refund work. Priority was highest because the sale was two weeks away and payment volume would spike. I proposed both and the PO confirmed the priority in triage.',
        },
        {
          q: 'Could automation have found this bug?',
          a: 'Once known, yes: a test can simulate the gateway callback without the redirect, or close the page mid-flow, and assert that an order is still created. Finding it the first time came from exploratory thinking about interruptions. That is why I see manual exploration and automation as partners.',
        },
      ],
      pitfalls: [
        'Picking a trivial UI typo as the "most important" bug',
        'Not explaining how you found it',
        'Taking all the credit for the fix',
      ],
    },
    {
      id: 'qa-behavioral-iq-09',
      difficulty: 'easy',
      question: 'Do you have any questions for us?',
      whatInterviewerLooksFor: [
        'Genuine interest in how the team works',
        'Questions that show QA maturity',
        'Questions that help you judge fit for your growth',
        'Not "no questions" and not only salary',
      ],
      modelAnswer: `**Always ask 2–3, chosen for the person in front of you.**

**For a hiring manager:**
- "What would success look like for this role after 90 days?"
- "How is the team's testing split today between manual, API and UI automation, and where do you want it to be in a year?"
- "For someone with strong manual and API skills who is learning Playwright, what would the first automation tasks look like, and is there code review or mentoring?"

**For a QA lead or engineer:**
- "When does QA get involved in a story: refinement and three amigos, or after development?"
- "How do you handle flaky tests: is there an owner or a quarantine process?"
- "What does your CI pipeline run on each pull request versus nightly?"

**For HR:**
- "What does onboarding look like in the first month?"
- "Is there a learning budget or support for certifications?"
- "What are the next steps and the timeline?"

**Why these work:** they show you think about quality as a team practice, they are specific to QA, and they tell you whether the team will genuinely support your move into automation, which matters for your own decision.

**Close well:** a one-line thank you and, if appropriate, "I'm very interested in this role; my practice repo link is on my resume if anyone would like to look at it."`,
      followUps: [
        {
          q: 'The interviewer says automation is "something we want to start". How do you respond?',
          a: 'Show interest and realism: ask what is driving it (regression time, release frequency), who will maintain it, and whether there is time allocated. Mention you would be glad to help start small, with smoke tests in CI, while keeping manual coverage strong. It positions you as useful without overclaiming expertise.',
        },
        {
          q: 'Is it OK to ask about salary here?',
          a: 'With HR, yes, if they have not covered it, phrased neutrally ("Could you share the range for this role?"). In technical or hiring-manager rounds, prioritise questions about the work; compensation usually belongs to the HR conversation, where it can be discussed openly without distracting from your technical impression.',
        },
      ],
      pitfalls: [
        'Saying "No, everything is clear"',
        'Asking only about salary, leave or work-from-home in a technical round',
        'Asking something answered on the job description',
      ],
    },
  ],
  envelopeQuestions: [],
  test: [
    {
      id: 'qa-behavioral-mcq-01',
      difficulty: 'easy',
      question: 'In a STAR answer, which part should take the most time?',
      options: ['Action: what you personally did', 'Situation: the background', 'Task: your responsibility', 'Result: the outcome'],
      correct: [0],
      explanation:
        'Interviewers score your behaviour, which lives in the Action part, so it should be roughly half the answer. Long situations are the most common weakness, and Task and Result are essential but short. A strong Result without clear actions does not show what you did.',
      followUps: [
        {
          q: 'How do you keep the Situation short?',
          a: 'One or two sentences: product, team, what was at stake. If the interviewer needs more context, they will ask.',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-02',
      difficulty: 'easy',
      question: 'You have practised Playwright for three months on a personal project and never used it at work. Which resume entry best matches honest positioning?',
      options: [
        '"Currently learning: Playwright (TypeScript)", plus the project listed as a self-learning project with a link',
        '"Skills: Playwright, 3 months of automation experience"',
        '"Automation Test Engineer (Playwright)" as your job title',
        'Leave Playwright off the resume entirely and never mention it',
      ],
      correct: [0],
      explanation:
        'Listing it as a learning skill with a linked practice project is accurate and still shows initiative. Calling it "automation experience" or changing your job title implies production work, and hiding it wastes real evidence of learning ability.',
      followUps: [
        {
          q: 'When would you move Playwright into your main skills?',
          a: 'When you can build and debug a small suite confidently and answer follow-up questions without notes, ideally with some real project use. Until then, "learning" is accurate.',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-03',
      difficulty: 'easy',
      question: 'Which "tell me about yourself" opening is strongest for a manual tester applying for a QA role with automation growth?',
      options: [
        '"I\'m a QA engineer with two years of manual testing on an e-commerce app; I own checkout testing and validate APIs with Postman and SQL."',
        '"I was born in Pune and finished my B.Tech in 2022, and my hobbies are reading and cricket."',
        '"I know Selenium, Playwright, Cypress, Appium, JMeter, Java, Python and Docker."',
        '"I am a hard-working, quick-learning team player looking for a good opportunity."',
      ],
      correct: [0],
      explanation:
        'Leading with the current role, domain and concrete responsibilities gives the interviewer real material. Biography wastes the first seconds, a long tool list invites questions you may not survive, and adjectives without evidence add nothing.',
      followUps: [
        {
          q: 'What should follow that opening?',
          a: 'One concrete result, then how you built your skills (including the honest Playwright learning), then why this role, all within about 90 seconds.',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-04',
      difficulty: 'medium',
      question: 'A developer closes your bug as "cannot reproduce". What is the best FIRST step?',
      options: [
        'Re-check with a clean session, add environment details and evidence, and offer a quick pairing session',
        'Reopen the bug immediately with the comment "It is a bug"',
        'Escalate to your manager so the developer is told to fix it',
        'Close it yourself and move on to avoid conflict',
      ],
      correct: [0],
      explanation:
        'Better evidence and a short pairing session resolve most "cannot reproduce" disputes, often by revealing an environment difference. Reopening without new information creates ping-pong, escalating first damages the relationship, and silently closing it may let a real bug ship.',
      followUps: [
        {
          q: 'What evidence helps most with web bugs?',
          a: 'Build and environment, browser version, exact data, a short video, and the failing network request/response or console error (a HAR file is ideal).',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-05',
      difficulty: 'medium',
      question: 'Asked about a bug that reached production, which closing line is strongest?',
      options: [
        '"Since then I derive test data from the rule boundaries, and those cases run in every regression."',
        '"Testing can never find every bug, so this was expected."',
        '"The developer should have written unit tests for it."',
        '"We didn\'t have enough time to test properly in that sprint."',
      ],
      correct: [0],
      explanation:
        'A concrete prevention step shows ownership and learning, which is what the question is designed to reveal. The other three may be partly true but sound like excuses or blame, and they leave the interviewer unsure you would avoid the same miss.',
      followUps: [
        {
          q: 'Can you mention time pressure at all?',
          a: 'Yes, as context, briefly, if it is true. Then focus on what you would do differently under the same pressure, such as risk-based prioritisation and flagging untested areas earlier.',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-06',
      difficulty: 'medium',
      question: 'Select ALL that apply. Which behaviours would a hiring manager see as positive when you face release pressure?',
      options: [
        'Telling the PO early which areas will not be tested and what the risk is',
        'Running the critical business flows and changed areas first',
        'Quietly marking untested cases as passed to meet the deadline',
        'Offering options such as releasing behind a feature flag',
        'Refusing to discuss release until every test case has run',
      ],
      correct: [0, 1, 3],
      explanation:
        'Early transparency, risk-based prioritisation and options give decision-makers what they need. Marking untested cases as passed is dishonest and dangerous, and refusing all discussion turns QA into a blocker rather than a partner.',
      followUps: [
        {
          q: 'Who makes the final go/no-go decision?',
          a: 'Usually the PO or release manager with engineering input. QA owns the accuracy of the information and a clear recommendation.',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-07',
      difficulty: 'medium',
      question: 'Select ALL that apply. Which make a Playwright portfolio more credible in an interview?',
      options: [
        'A README that says what is covered, how to run it, and that it is a self-learning project',
        'A passing CI run with the HTML report uploaded',
        'Being able to explain why each locator and assertion was chosen',
        'A large framework copied from a tutorial that you cannot explain',
        'Real credentials committed so the interviewer can run it easily',
      ],
      correct: [0, 1, 2],
      explanation:
        'Clear documentation, a working pipeline and the ability to explain decisions show real understanding. Copied code you cannot explain backfires on the first question, and committed credentials signal a security mistake.',
      followUps: [
        {
          q: 'What should you do with code you copied and do not fully understand?',
          a: 'Study it until you can explain each line, or remove it. Interviewers often point at a random file and ask "why is this here?".',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-08',
      difficulty: 'medium',
      question: 'Which answer to "What is your biggest weakness?" works best for a manual tester moving into automation?',
      options: [
        '"My automation experience comes from a practice project so far; I spend 6–8 hours a week on it and get code reviewed by a mentor."',
        '"I\'m a perfectionist, so I test too thoroughly."',
        '"I don\'t really have weaknesses that affect my work."',
        '"I find manual testing boring, so I lose focus."',
      ],
      correct: [0],
      explanation:
        'A real, relevant weakness with a concrete plan and evidence of progress shows self-awareness and honesty. The perfectionist line is a cliché, claiming no weaknesses sounds evasive, and calling manual testing boring raises a fit concern for a QA role.',
      followUps: [
        {
          q: 'How do you show progress on that weakness?',
          a: 'Point to dated evidence: commits over several months, features added (API tests, CI, storageState), and a flaky test you diagnosed with the trace viewer.',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-09',
      difficulty: 'hard',
      question: 'The interviewer asks about Playwright sharding, which you have never used. Which reply is best?',
      options: [
        '"I haven\'t used it yet. My understanding is it splits test files across machines to cut run time; I\'d try it in my repo with two shards to confirm."',
        '"Yes, I\'ve used sharding a lot in my projects."',
        '"I don\'t know." (and stop)',
        '"That\'s a DevOps topic, testers don\'t need it."',
      ],
      correct: [0],
      explanation:
        'Admitting the gap, sharing related understanding and saying how you would verify it is honest and shows reasoning. A false claim collapses under follow-ups, a bare "I don\'t know" wastes the chance to show thinking, and dismissing it signals low ownership of the test pipeline.',
      followUps: [
        {
          q: 'What if your understanding turns out to be slightly wrong?',
          a: 'That is fine because you framed it as your understanding and offered to verify. Interviewers penalise confident wrong claims far more than hedged reasoning.',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-10',
      difficulty: 'hard',
      question: 'Select ALL that apply. In a conflict-with-a-developer story, which details strengthen the answer?',
      options: [
        'You collected evidence (video, API response, environment) before discussing',
        'You asked why the developer disagreed and found an environment difference',
        'You reopened the ticket several times until they gave in',
        'You agreed the outcome with the PO in triage and updated your test cases',
        'You concluded that developers in general do not respect QA',
      ],
      correct: [0, 1, 3],
      explanation:
        'Evidence, curiosity about the other view and resolution through the proper process show collaboration and maturity. Reopening repeatedly is ticket ping-pong, and generalising about developers is a red flag for team fit.',
      followUps: [
        {
          q: 'What learning could end this story?',
          a: 'For example: "I now attach the API response and environment to every bug and clarify ambiguous behaviour in three-amigos sessions before development."',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-11',
      difficulty: 'hard',
      question: 'You do not have a real metric for a story. What should you do?',
      options: [
        'Describe the observable outcome honestly ("released on time, no payment incidents reported that month") without inventing numbers',
        'Make up a plausible percentage; interviewers cannot check it',
        'Skip the Result part entirely',
        'Use a metric from a teammate\'s project as if it were yours',
      ],
      correct: [0],
      explanation:
        'An honest observable result still closes the story and survives follow-up questions. Invented or borrowed numbers are easy to expose ("how did you measure that?") and destroy trust, and a story without any result feels unfinished.',
      followUps: [
        {
          q: 'How can you have real numbers next time?',
          a: 'Start noting them now: regression time before and after a change, defects found per cycle, escaped defects per release. A simple personal log is enough.',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-12',
      difficulty: 'medium',
      question: 'Your manager asks you to sign off a release even though some planned tests were not run. What is the most professional response?',
      options: [
        'Send a written summary of what was tested, what was not, and the risks, and ask the PO/manager to approve releasing with those known risks',
        'Sign off without comment, since the manager is responsible',
        'Refuse to communicate until all tests are complete',
        'Report the manager to HR for pressuring you',
      ],
      correct: [0],
      explanation:
        'A written, honest summary keeps the decision with the business owner while making the risk explicit. Silent sign-off misrepresents testing, refusing to engage is unhelpful, and reporting normal release pressure to HR is disproportionate.',
      followUps: [
        {
          q: 'What if a critical bug is open?',
          a: 'State clearly that you recommend not releasing, explain the user and business impact, and still record the decision whoever makes it.',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-13',
      difficulty: 'medium',
      question: 'Select ALL that apply. Which are good questions to ask a hiring manager at the end of a QA interview?',
      options: [
        '"What would success look like in this role after 90 days?"',
        '"How would someone growing into automation get mentoring or code reviews here?"',
        '"When does QA get involved in a story: refinement or after development?"',
        '"What does your company do?"',
        '"How many leaves do I get?" (as the only question)',
      ],
      correct: [0, 1, 2],
      explanation:
        'Questions about success criteria, growth support and QA involvement show engagement and help you judge fit. Asking what the company does shows no preparation, and leave policy as the only question in a manager round signals the wrong priorities.',
      followUps: [
        {
          q: 'Why is the mentoring question especially useful for you?',
          a: 'It tells you whether the team will actually support your move into automation, which is as important for your decision as the offer itself.',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-14',
      difficulty: 'expert',
      question: 'An interviewer says: "Your resume says Playwright is a learning skill. Why should we believe you can automate for us?" Which response is strongest?',
      options: [
        'Offer evidence on the spot: walk through the repo or write a small test live, explaining locator and assertion choices',
        'Insist you are a fast learner and will pick it up on the job',
        'Say the resume undersells you and you actually have a lot of experience',
        'Suggest they hire someone else if they need automation immediately',
      ],
      correct: [0],
      explanation:
        'Demonstrating skill with your own repo or a live test answers doubt with evidence, which is exactly why the honest positioning works. "Fast learner" is an unsupported claim, contradicting your own resume destroys credibility, and giving up ends the conversation.',
      followUps: [
        {
          q: 'What small live test would you choose?',
          a: 'A SauceDemo login with a wrong password and a web-first assertion on the error message: short, and it shows locators, actions and retrying assertions.',
        },
      ],
    },
    {
      id: 'qa-behavioral-mcq-15',
      difficulty: 'hard',
      question: 'Which "Why automation?" answer is most likely to impress a QA hiring manager?',
      options: [
        '"Regression takes two days per sprint by hand; automating stable flows gives faster feedback and frees time for exploratory testing, so I started learning Playwright."',
        '"Manual testing is dying and automation pays more."',
        '"Everyone is moving to automation, so I should too."',
        '"I want to become a developer eventually, and automation is a step towards that."',
      ],
      correct: [0],
      explanation:
        'Linking automation to a real team problem and showing action taken demonstrates motivation and judgement. Dismissing manual testing insults the role, following the crowd shows no reasoning, and announcing a plan to leave QA raises retention concerns for a QA position.',
      followUps: [
        {
          q: 'How do you show respect for manual testing in the same answer?',
          a: 'Say that test-design skill is what makes automated tests valuable and that exploration stays human. Automation handles repetition so testers can focus on judgement.',
        },
      ],
    },
  ],
};

export default topic;
