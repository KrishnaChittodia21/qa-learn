import type { CompanyQuestion } from '../../types';

// Company-reported HR / managerial / behavioural questions. Every entry cites a page that was opened
// and that ties the question to the company. AmbitionBox pages are company + role question lists
// posted by candidates; the year is the year the candidate posted the report.

const AB = (company: string, role: string) => `https://www.ambitionbox.com/interviews/${company}-interview-questions/${role}`;
const GFG_INFOSYS_QEA = {
  name: 'GeeksforGeeks — Quality Engineering Analyst Interview Experience at Infosys',
  url: 'https://www.geeksforgeeks.org/interview-experiences/quality-engineering-analyst-interview-experience-at-infosys/',
  year: 2025,
};
const GFG_AMAZON_QAE_2025 = {
  name: 'GeeksforGeeks — Amazon QAE On-Campus Placement Interview Experience',
  url: 'https://www.geeksforgeeks.org/interview-experiences/amazon-qae-on-campus-placement-interview-experience/',
  year: 2025,
};

export const QUESTIONS: CompanyQuestion[] = [
  {
    id: 'co-behavioral-amazon-1',
    company: 'Amazon',
    area: 'behavioral',
    role: 'Quality Assurance Engineer (off-campus)',
    round: 'Technical interview 2',
    difficulty: 'easy',
    question: 'Why is the QAE role important, and why are you interested in it?',
    answer: `Answer in two parts: what the role does for the business, then why it fits *you*, with evidence.

**Why it matters (Amazon framing):** a QAE protects **customer trust**. At Amazon's scale, a bug in checkout or pricing affects millions of orders in minutes. QAEs find risk early (reviewing requirements), build automated checks that let teams ship fast safely, and speak for the customer when a release decision is made. That maps to *Customer Obsession* and *Insist on the Highest Standards*.

**Why me (example):**
"In my college project, an attendance app, I was the one who kept asking 'what if the network drops while marking attendance?'. I wrote 60 test cases and found that duplicate entries were created on retry. Fixing it before the demo taught me that I enjoy finding how things break and making sure they don't. I like that a QAE combines that mindset with coding: I want to build automation, not only run tests."

Avoid: "QA is easier than development" or "it is a way into Amazon". Interviewers listen for genuine interest in quality.`,
    followUps: [
      {
        q: 'What is the difference between a QAE and an SDET at Amazon?',
        a: 'In general terms, QAEs focus on test strategy, test design and automation for a product area, while SDETs lean more towards building test tools and infrastructure. The split varies by team, so say you would confirm the team\'s expectations.',
      },
    ],
    topic: 'qa-behavioral',
    source: {
      name: 'GeeksforGeeks — Amazon Interview Experience for Quality Assurance Engineer (Off-Campus) 2024',
      url: 'https://www.geeksforgeeks.org/amazon-interview-experience-for-quality-assurance-engineer-off-campus-2024/',
      year: 2024,
    },
  },
  {
    id: 'co-behavioral-amazon-2',
    company: 'Amazon',
    area: 'behavioral',
    role: 'Quality Assurance Engineer (on-campus)',
    round: 'Technical interview 2',
    difficulty: 'medium',
    question: 'Tell me about the biggest problem you faced in a project and how you tackled it (answer in STAR format).',
    answer: `Use **STAR**: Situation, Task, Action, Result. Spend most of the time on *your* actions, and give a number in the result.

**Example answer:**
- **Situation:** final-year project, a food-ordering web app built by four of us. Two weeks before the demo, orders sometimes showed the wrong total.
- **Task:** I owned testing and had to find the cause and make sure it did not come back.
- **Action:** I wrote down every failing order and noticed they all had a coupon *and* an item removed after applying it. I reproduced it in five steps and showed the team that the discount was calculated once and never recalculated. After the fix, I wrote 25 test cases around coupons and cart changes and automated the 8 most important ones with Selenium, so they ran before every merge.
- **Result:** no wrong totals in the demo or in two months of use by 150 students; the automated checks caught two more regressions before they were merged.
- **Learning:** I now ask "what changes after this step?" for every calculation.

Pick a real problem with stakes, avoid blaming teammates, and be ready for "what would you do differently?".`,
    followUps: [
      {
        q: 'Which Amazon leadership principles does this story show?',
        a: 'Ownership (taking the bug end to end), Dive Deep (finding the pattern in failing orders) and Insist on the Highest Standards (adding automated checks so it cannot recur).',
      },
    ],
    topic: 'qa-behavioral',
    source: GFG_AMAZON_QAE_2025,
  },
  {
    id: 'co-behavioral-amazon-3',
    company: 'Amazon',
    area: 'behavioral',
    role: 'Quality Assurance Engineer (on-campus)',
    round: 'Technical interview 2',
    difficulty: 'easy',
    question: 'Why do you want to join Amazon?',
    answer: `Make it specific to Amazon and to the role, and connect it to your own experience. Three parts work well:

1. **The scale and the customer:** "Quality problems at Amazon's scale affect millions of customers, so testing here has real impact. I like that every team starts from the customer (Customer Obsession)."
2. **What you will learn:** "Amazon teams own their services end to end and automate heavily. I want to learn how testing works with continuous deployment, where checks must be fast and reliable."
3. **Fit with your story:** "I use Amazon and Prime Video daily. While preparing, I wrote test cases for the Prime Video search bar and found that I enjoyed thinking about typos and regional titles — that is the kind of problem I want to work on."

Avoid generic answers ("big brand", "good salary") and do not list leadership principles without examples. Mention one principle you have actually shown, with a short story.`,
    followUps: [
      {
        q: 'Which leadership principle do you relate to most?',
        a: 'Pick one with a real example, for example Dive Deep: "I traced a flaky test to a time-zone assumption in the test data instead of just re-running it" — and state the outcome.',
      },
    ],
    topic: 'qa-behavioral',
    source: GFG_AMAZON_QAE_2025,
  },
  {
    id: 'co-behavioral-amazon-4',
    company: 'Amazon',
    area: 'behavioral',
    role: 'SDET',
    round: 'Hiring manager interview',
    difficulty: 'medium',
    question: 'Tell me about an initiative you took at work, and how you handle feedback.',
    answer: `**Initiative (STAR):**
- *Situation:* our regression suite took 4 hours, so it ran only nightly and failures were found a day late.
- *Task:* nobody owned the problem; I offered to look at it.
- *Action:* I measured each test's duration and found that 20% of the tests took 70% of the time, mostly because each test logged in through the UI. I proposed API-based login with stored auth state and parallel runs, built a proof of concept on one module, and showed the numbers to my lead before changing everything.
- *Result:* the suite dropped to 35 minutes and now runs on every pull request; the team catches regressions on the same day.

**Handling feedback:**
"I ask for specifics, avoid defending myself in the moment, and agree an action. Example: my lead said my bug reports were too long for developers to scan. I started using a fixed template — one-line summary, steps, expected/actual, evidence — and asked two developers a month later whether it helped. They said it did, and the reopen rate of my bugs dropped."`,
    followUps: [
      {
        q: 'What if you disagree with the feedback?',
        a: 'Ask for an example, share your view with data, and agree how to check it. If the manager still disagrees, try their suggestion for a set time and review the result together.',
      },
    ],
    topic: 'qa-behavioral',
    source: {
      name: 'GeeksforGeeks — Amazon Interview Experience for Software Development Engineer in Test (SDET)',
      url: 'https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-software-development-engineer-in-test-sdet/',
      year: 2024,
    },
  },
  {
    id: 'co-behavioral-infosys-1',
    company: 'Infosys',
    area: 'behavioral',
    role: 'Quality Engineering Analyst',
    round: 'Managerial',
    difficulty: 'medium',
    question: 'How do you prioritise testing tasks in a fast-paced environment?',
    answer: `Explain a repeatable method, then give an example.

**Method — prioritise by risk:**
1. List what is in scope this cycle: new stories, bug fixes, regression areas.
2. Score each by **impact** (money, data, many users, legal) and **likelihood** (new or complex code, many changes, past defects).
3. Order: release blockers and critical paths first (smoke, payments, login), then new features with high risk, then regression around changed code, then low-risk areas.
4. Agree the order with the product owner and developers, so priorities are shared, not just mine.
5. Re-check daily: priorities change when a critical bug lands or scope moves.
6. Make the leftovers visible: report what was not tested and the remaining risk.

**Example:** two days before a release, three new stories and 12 bug fixes arrived together. I tested the payment-related fix and story first, ran the automated smoke after each build, did focused regression on the checkout module, and moved two cosmetic fixes to the next cycle. I told the PO in the stand-up what was deferred. We released on time with no critical defects.`,
    followUps: [
      {
        q: 'What if everything is marked "high priority"?',
        a: 'Ask the product owner to rank the items against each other, show the capacity available, and make the trade-off explicit: "We can do these three today; which one moves to tomorrow?"',
      },
    ],
    topic: 'qa-behavioral',
    source: GFG_INFOSYS_QEA,
  },
  {
    id: 'co-behavioral-infosys-2',
    company: 'Infosys',
    area: 'behavioral',
    role: 'Quality Engineering Analyst',
    round: 'Managerial',
    difficulty: 'medium',
    question: 'Tell us about a time you worked closely with developers to improve product quality.',
    answer: `**STAR example:**
- **Situation:** our mobile banking team had many bugs reopened after "fixes" — about 30% of fixed bugs came back.
- **Task:** as the QA on the team, I wanted to reduce rework without slowing developers down.
- **Action:**
  - I sat with two developers to look at ten reopened bugs. Most were fixes that worked for the reported case but not for close variants (another account type, another language).
  - We agreed that for every bug I would add 2–3 "variant" cases to the report, and that developers would run them before marking it fixed.
  - We started **three amigos sessions** (PO, dev, QA) for each story, to agree examples and edge cases before coding.
  - I shared my test cases in the pull request, so developers could run the API checks locally.
- **Result:** the reopen rate fell from about 30% to under 10% in two sprints, and developers started asking me for test ideas while designing.

Key message: quality improves when testers and developers share information early, not when QA acts as a gate at the end.`,
    followUps: [
      {
        q: 'How do you build trust with developers?',
        a: 'Write precise, reproducible bug reports, criticise the code and not the person, acknowledge good work, and help them test early — for example by sharing test cases before they start coding.',
      },
    ],
    topic: 'qa-behavioral',
    source: GFG_INFOSYS_QEA,
  },
  {
    id: 'co-behavioral-infosys-3',
    company: 'Infosys',
    area: 'behavioral',
    role: 'Test Analyst',
    round: 'Behavioral',
    difficulty: 'medium',
    question: 'Was there ever a mistake that led to a blame game between the DevOps and testing teams? How was it handled?',
    answer: `Show that you focus on facts and fixing the process, not on who is to blame.

**Example:**
- **Situation:** a release went to production with the wrong configuration: the payment service pointed to the sandbox gateway. DevOps said QA should have caught it; QA said the staging config was correct and the production config was never in our scope.
- **Action:**
  - I suggested we stop discussing fault and first fix the incident: DevOps corrected the config, and I ran the production smoke checklist with them.
  - In the post-incident review I proposed a **blameless RCA** using "5 whys". The root cause: production configuration was changed manually, outside the pipeline, and no check verified it after deployment.
  - Actions agreed: configuration kept in version control and deployed through the pipeline; an automated post-deployment smoke test that checks the payment endpoint and environment flags; QA added to the release checklist sign-off for config changes.
- **Result:** no repeat incident in the following releases, and the two teams now review config changes together.

The lesson to state: a blame game wastes time; shared ownership of the release process prevents the next incident.`,
    followUps: [
      {
        q: 'What if the mistake really was yours?',
        a: 'Say so early and plainly, explain the impact and what you have done to fix it, and propose a change so it cannot happen again — for example a new regression case or checklist item.',
      },
    ],
    topic: 'qa-behavioral',
    source: { name: 'AmbitionBox — Infosys Test Analyst interview questions', url: AB('infosys', 'test-analyst'), year: 2024 },
  },
  {
    id: 'co-behavioral-tech-mahindra-1',
    company: 'Tech Mahindra',
    area: 'behavioral',
    role: 'Manual Test Engineer',
    difficulty: 'medium',
    question: 'As a QA professional, what would you do if a developer rejects a bug you reported?',
    answer: `Stay factual and collaborative; the goal is the right outcome for the product, not winning.

1. **Read the rejection reason** (not a bug / works as designed / cannot reproduce / duplicate).
2. **Re-check yourself:** reproduce on the latest build, re-read the requirement and acceptance criteria, check whether it is a duplicate.
3. **If I was wrong:** agree, close it, and note what I misunderstood (perhaps the requirement needs to be clearer).
4. **If I still think it is a bug:** add evidence — steps, video, logs, the exact requirement line, user impact — and **talk to the developer directly** rather than arguing in ticket comments. Often a 5-minute call shows a difference in environment or data.
5. **If we still disagree:** take it to the product owner or triage, who decide on expected behaviour. Accept the decision and document it.

**Example:** a developer rejected "discount not applied for orders of exactly 500" as "works as designed". The spec said "500 and above". I attached the spec line and a screenshot; the PO confirmed it, and the developer fixed the boundary in 10 minutes.`,
    followUps: [
      {
        q: 'What if the developer says "cannot reproduce"?',
        a: 'Compare environment, build, data, browser and user role; share a recording or HAR file; try to reproduce together on their machine. Keep the ticket open with "needs info" rather than closing it.',
      },
    ],
    topic: 'qa-behavioral',
    source: { name: 'AmbitionBox — Tech Mahindra Manual Test Engineer interview questions', url: AB('tech-mahindra', 'manual-test-engineer'), year: 2025 },
  },
  {
    id: 'co-behavioral-tech-mahindra-2',
    company: 'Tech Mahindra',
    area: 'behavioral',
    role: 'Manual Test Engineer',
    difficulty: 'medium',
    question: 'What is your approach when a defect is found in the production environment?',
    answer: `Three phases: contain, fix, learn.

**1. Contain (first hour)**
- Reproduce it safely (staging with similar data, or read-only checks in production); capture evidence.
- Assess impact: how many users, money or data affected, is there a workaround.
- Log it with the right severity and inform the lead and on-call developer; for critical issues, join the incident call.
- Help with mitigation: feature flag off, rollback, or a known-issue message.

**2. Fix and verify**
- Test the hotfix in a lower environment: retest the exact scenario plus focused regression of the area.
- After deployment, smoke test in production and monitor logs or dashboards.

**3. Learn (escaped-defect analysis)**
- Ask why our testing missed it: no test case, wrong test data, environment difference, requirement gap?
- Add the missing test case (and automate it), and update the test data or environment if needed.
- Track defect leakage as a metric and share the lesson in the retrospective — blamelessly.

**Example:** customers in one state saw the wrong tax on invoices. We hid the invoice download behind a flag within an hour, the hotfix was verified the same day, and the RCA showed our test data had no customers from that state — we added them.`,
    followUps: [
      {
        q: 'Should QA feel responsible for every production bug?',
        a: 'Quality is a team responsibility. QA should own the analysis of why tests missed it and improve coverage, but not take blame alone — requirements, code reviews and monitoring are part of the same system.',
      },
    ],
    topic: 'qa-behavioral',
    source: { name: 'AmbitionBox — Tech Mahindra Manual Test Engineer interview questions', url: AB('tech-mahindra', 'manual-test-engineer'), year: 2025 },
  },
  {
    id: 'co-behavioral-ibm-1',
    company: 'IBM',
    area: 'behavioral',
    role: 'QA Engineer',
    round: 'Technical',
    difficulty: 'medium',
    question: 'A developer thinks something is a bug, but you do not agree. What do you do?',
    answer: `This is the reverse of the usual conflict, and it should be handled the same way: with evidence and the requirement, not opinions.

1. **Listen first:** ask the developer exactly what they think is wrong and why. They may know something about the design that I do not.
2. **Check the source of truth:** requirement, acceptance criteria, design document, API contract, previous decisions in the ticket history.
3. **Reproduce and look at the impact together:** if the behaviour could hurt users, it deserves a ticket even if it matches the spec — then the spec may be the bug.
4. **If still unsure, ask the product owner** to decide the expected behaviour, and record the decision in the ticket.
5. **Log it anyway if in doubt**, as a question or improvement, so it is visible and not lost.

**Example:** a developer felt that an expired session silently redirecting to login was a bug. I thought it matched the spec. Looking at it together, we realised that users lost unsaved form data. The PO agreed it was a usability problem, and a "session expired — your draft is saved" message was added.

Point to make: being "right" is less important than reaching a shared, documented decision.`,
    followUps: [
      {
        q: 'Who decides expected behaviour when the spec is silent?',
        a: 'The product owner or business analyst. QA and developers bring the options and impacts; the PO decides, and the decision is added to the acceptance criteria.',
      },
    ],
    topic: 'qa-behavioral',
    source: { name: 'AmbitionBox — IBM QA Engineer interview questions', url: AB('ibm', 'qa-engineer'), year: 2024 },
  },
  {
    id: 'co-behavioral-cognizant-1',
    company: 'Cognizant',
    area: 'behavioral',
    role: 'Quality Analyst',
    difficulty: 'medium',
    question: 'Tell me about a time you dealt with conflict.',
    answer: `Choose a real, work-related conflict where you contributed to the solution. Use STAR and keep the tone neutral.

**Example:**
- **Situation:** near a deadline, the dev lead wanted to skip regression for a "small" change in the order service; I was responsible for test sign-off.
- **Task:** protect release quality without blocking the team for no reason.
- **Action:**
  - I asked for 10 minutes to understand the change instead of refusing outright.
  - Looking at the diff together, we saw it touched a shared pricing function used by three modules.
  - I proposed a compromise: run the automated smoke and the 40 most critical pricing cases (about 90 minutes) instead of the full 6-hour regression.
  - We agreed, and I shared progress every 30 minutes.
- **Result:** the focused run found a rounding bug in invoices that would have affected every order. It was fixed the same day and we still released on time. Afterwards we agreed a rule: changes to shared modules always get the focused regression pack.

What interviewers look for: you listened, used data, offered options, and kept the relationship good.`,
    followUps: [
      {
        q: 'What if the compromise had not been accepted?',
        a: 'Escalate calmly with the facts — what is untested and what could go wrong — to the person who owns the release decision, and document the decision either way.',
      },
    ],
    topic: 'qa-behavioral',
    source: { name: 'AmbitionBox — Cognizant Quality Analyst interview questions', url: AB('cognizant', 'quality-analyst'), year: 2025 },
  },
  {
    id: 'co-behavioral-wipro-1',
    company: 'Wipro',
    area: 'behavioral',
    role: 'QA Engineer',
    round: 'HR',
    difficulty: 'easy',
    question: 'Where do you see yourself in five years?',
    answer: `Show ambition that fits the company and the role, and a plan to get there. Avoid "in your chair" or "in a different field".

**A good structure:** skills → responsibility → contribution.

**Example answer for a QA role:**
"In the first two years, I want to become strong in both manual and automation testing here — testing complex client projects well, learning the domain, and building reliable automated suites with Selenium or Playwright and API tests. By year three, I would like to own testing for a module: planning, estimation, and mentoring new testers. In five years I see myself as a test lead or a senior SDET, responsible for the test strategy of a project and helping the client release with confidence. I also want to add certifications, such as ISTQB Advanced, along the way."

Tie it to the company: mention its training programmes, client variety or growth paths if you know them. Keep it realistic and show that you plan to grow *with* them.`,
    followUps: [
      {
        q: 'Do you want to move to development later?',
        a: 'Be honest but show commitment: for example, "I want to grow my coding skills, but I want to use them in quality engineering — building test frameworks and tools — rather than move away from testing."',
      },
    ],
    topic: 'qa-behavioral',
    source: { name: 'AmbitionBox — Wipro QA Engineer interview questions', url: AB('wipro', 'qa-engineer'), year: 2025 },
  },
  {
    id: 'co-behavioral-wipro-2',
    company: 'Wipro',
    area: 'behavioral',
    role: 'Manual Test Engineer',
    difficulty: 'easy',
    question: 'What are your strengths and weaknesses?',
    answer: `**Strengths:** pick two that matter for testing and prove each with an example.
- *Attention to detail:* "In my last project I noticed the tax on invoices was off by one paisa in some orders; it turned out to be a rounding bug affecting thousands of invoices."
- *Clear communication:* "Developers told me my bug reports were easy to reproduce; my reopen rate was the lowest in the team."

**Weakness:** choose a real one that is not central to the job, and show what you are doing about it.
- "I used to spend too long trying to test everything before reporting progress. I now time-box my testing by risk and share status at the end of each day, so my lead sees early what is done and what is left."
- Or: "My automation skills are still basic. I am taking a Playwright course and automating our smoke cases in my free time; I have finished 15 so far."

Avoid fake weaknesses such as "I am a perfectionist" or "I work too hard" — interviewers hear them every day and they show low self-awareness.`,
    followUps: [
      {
        q: 'How would your last manager describe you?',
        a: 'Give a short, honest answer that matches your strengths, ideally quoting real feedback — for example "reliable under deadlines, and someone who asks the questions others miss".',
      },
    ],
    topic: 'qa-behavioral',
    source: { name: 'AmbitionBox — Wipro Manual Test Engineer interview questions', url: AB('wipro', 'manual-test-engineer'), year: 2025 },
  },
  {
    id: 'co-behavioral-qualtech-edge-1',
    company: 'Qualtech Edge',
    area: 'behavioral',
    role: 'Testing Engineer',
    round: 'HR interview',
    difficulty: 'easy',
    question: 'What made you interested in a career in software testing?',
    answer: `Give a real trigger, what you have done since, and what you want next. Interviewers want to see that testing is a choice, not a fallback.

**Example answer:**
"During my internship I built a small leave-management web app. When a friend used it, he broke it in five minutes by applying for leave with the end date before the start date. That surprised me — and I realised I enjoyed finding those cases even more than writing the feature. Since then I have learned testing properly: I studied the ISTQB Foundation syllabus, wrote test cases for apps I use every day, learned SQL to check data behind the screens, and started automating with Selenium.

What I like about testing is that it combines thinking like a user, thinking like an attacker, and understanding how the system works. Every bug I find before a release is a problem a real user never sees. I want to grow as a test engineer here and build both manual and automation skills."

Avoid: "I could not get a development job" or "testing is easier".`,
    followUps: [
      {
        q: 'Do you think testing is less technical than development?',
        a: 'No. Good testing needs knowledge of the system, data, APIs and automation code, plus analytical thinking about risk. Many testers write as much code as developers, just for a different purpose.',
      },
    ],
    topic: 'qa-behavioral',
    source: {
      name: 'GeeksforGeeks — Qualtech Edge Interview Experience for Testing Engineer 2023',
      url: 'https://www.geeksforgeeks.org/interview-experiences/qualtech-edge-interview-experience-for-testing-engineer-2023/',
      year: 2023,
    },
  },
  {
    id: 'co-behavioral-capgemini-1',
    company: 'Capgemini',
    area: 'behavioral',
    role: 'Automation Engineer',
    round: 'Managerial round',
    difficulty: 'medium',
    question: 'If the current framework cannot automate certain test cases, would you automate them with a different framework or keep them manual?',
    answer: `Show judgement: it depends on **value vs cost**, and the decision should be made with data.

**Questions to ask first:**
- How often is the case run, and how critical is the flow? (A release-blocking payment check run on every build is worth more effort than a yearly report.)
- Why can't the current framework handle it? (A desktop window, a captcha, a PDF, a native mobile screen, a hardware device.)
- Can the framework be **extended** instead of replaced — a library, an API call, a helper (for example PDF parsing, OCR, an API shortcut for the captcha in test environments)?
- What would a second framework cost: setup, CI integration, skills, maintenance, two sets of reports?

**Typical decision:**
- Few, low-risk, rarely run cases → **keep manual** and document them in the regression checklist.
- High-value cases that one gap blocks → **extend the current framework** or add a small, well-integrated tool (for example WinAppDriver or Appium for one native screen), reporting into the same pipeline.
- Do not introduce a second full framework for a handful of tests.

**Example:** five cases needed to verify downloaded PDF invoices. Instead of a new tool, we added a PDF-parsing library to the Selenium framework — two days of work that saved 3 hours of manual checks every release.`,
    followUps: [
      {
        q: 'What should never be automated?',
        a: 'Tests that run once, usability and visual judgement, exploratory testing, and flows that change every sprint — the maintenance cost would exceed the value.',
      },
    ],
    topic: 'qa-behavioral',
    source: {
      name: 'GeeksforGeeks — Capgemini Interview Experience For Automation Engineer',
      url: 'https://www.geeksforgeeks.org/capgemini-interview-experience-for-automation-engineer/',
      year: 2024,
    },
  },
  {
    id: 'co-behavioral-gamecloud-technologies-1',
    company: 'GameCloud Technologies',
    area: 'behavioral',
    role: 'Quality Assurance Tester',
    round: 'HR interview',
    difficulty: 'easy',
    question: 'How do you handle stress?',
    answer: `Show that you have a practical method and give a real example; avoid "I never get stressed".

**Method:**
1. **Break the work down:** list the tasks, estimate them, and prioritise by risk and deadline.
2. **Communicate early:** if the plan does not fit the time, tell the lead what can be done and what is at risk, instead of silently working late.
3. **Focus on one task at a time** with short, time-boxed blocks.
4. **Recover outside work:** sport, gaming, enough sleep — so the next day starts fresh.

**Example (game QA):**
"Before a game build went to the publisher, we got a new build two days before submission with 30 fixes to verify. I felt the pressure, so I sorted the fixes by severity, verified the crash and progression blockers first, ran a quick smoke of the full level flow, and shared a status sheet with the lead twice a day. We submitted on time, and the two cosmetic fixes I could not verify were listed clearly as 'not verified'."

The key message: stress is managed by planning and transparency, not by heroics.`,
    followUps: [
      {
        q: 'How do you handle repetitive testing without losing focus?',
        a: 'Vary the approach (change data, devices or order), take short breaks, use checklists so nothing is skipped, and automate the most repetitive checks where possible.',
      },
    ],
    topic: 'qa-behavioral',
    source: {
      name: 'GeeksforGeeks — GameCloud Technologies Interview Experience For A Quality Assurance Tester',
      url: 'https://www.geeksforgeeks.org/gamecloud-technologies-interview-experience-for-a-quality-assurance-tester/',
      year: 2024,
    },
  },
  {
    id: 'co-behavioral-paytm-1',
    company: 'Paytm',
    area: 'behavioral',
    role: 'QA Engineer',
    round: 'HR',
    difficulty: 'easy',
    question: 'Why are you changing jobs? Was there any issue in your previous organisation?',
    answer: `Be honest but positive: talk about what you are moving **towards**, not what you are running away from. Never criticise your previous employer, manager or colleagues.

**Good structure:** what I achieved there → what I am missing now → why this role gives it.

**Example answer:**
"I have learned a lot in my current company — I tested a lending product end to end and built our first API automation suite. The product is now stable and mostly in maintenance, so my learning has slowed. I want to work on a high-scale payments product where releases are frequent and automation and performance testing matter much more. Paytm's scale and the role's focus on payments and automation are exactly that."

If there really was an issue (layoffs, project closure, relocation), state it briefly and factually: "The project I was on was closed and the team was reduced." Then move on to what you want next.

Avoid: salary as the only reason, complaints about the manager, or vague answers that sound like you are hiding something.`,
    followUps: [
      {
        q: 'What if they ask about a short stint or a gap?',
        a: 'Give the real reason in one sentence (project ended, health, family, upskilling) and show what you did in that time — courses, certifications or personal projects.',
      },
    ],
    topic: 'qa-behavioral',
    source: { name: 'AmbitionBox — Paytm QA Engineer interview questions', url: AB('paytm', 'qa-engineer'), year: 2024 },
  },
  {
    id: 'co-behavioral-ltimindtree-1',
    company: 'LTIMindtree',
    area: 'behavioral',
    role: 'Senior Test Engineer',
    round: 'One-on-one',
    difficulty: 'medium',
    question: 'What scripting challenges have you faced in test automation, and how did you overcome them?',
    answer: `Name two or three real challenges, the cause, and your fix with a measurable result.

**1. Flaky tests from timing.** Tests failed randomly on CI because of hard-coded sleeps and elements loading late. *Fix:* replaced sleeps with explicit waits on conditions (element clickable, network idle, API response received); in Playwright, used web-first assertions with auto-waiting. Flaky failures dropped from about 15% of runs to under 2%.

**2. Brittle locators.** A UI redesign broke 120 tests because they used long absolute XPaths. *Fix:* agreed with developers to add data-testid attributes, moved locators into page objects, and preferred role- and label-based locators. The next redesign needed changes in 6 page objects instead of 120 tests.

**3. Test data dependencies.** Tests passed alone but failed in parallel because they shared one user account. *Fix:* each test created its own data through APIs in setup and cleaned it up afterwards; parallel runs became stable and the suite time fell from 70 to 20 minutes.

**4. Dynamic elements** (iframes, new tabs, shadow DOM) — handled with the right frame/window switching and framework support instead of workarounds.

Close with the lesson: treat test code like production code — reviews, patterns, and stable data.`,
    followUps: [
      {
        q: 'How do you deal with a flaky test that you cannot fix immediately?',
        a: 'Quarantine it (tag it and run it separately so it does not block the pipeline), create a ticket with failure evidence, and track the flaky-test list so it does not grow silently.',
      },
    ],
    topic: 'qa-behavioral',
    source: { name: 'AmbitionBox — LTIMindtree Senior Test Engineer interview questions', url: AB('ltimindtree', 'senior-test-engineer'), year: 2022 },
  },
];
