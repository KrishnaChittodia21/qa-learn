import type { CompanyQuestion } from '../../types';

// Company-reported "how would you test X" questions. Every entry cites a page that was opened and
// that ties the question to the company. AmbitionBox pages are company + role question lists posted
// by candidates; the year is the year the candidate posted the report.

const AB = (company: string, role: string) => `https://www.ambitionbox.com/interviews/${company}-interview-questions/${role}`;
const GFG_AMAZON_QAE_2024 = {
  name: 'GeeksforGeeks — Amazon Interview Experience for Quality Assurance Engineer (Off-Campus) 2024',
  url: 'https://www.geeksforgeeks.org/amazon-interview-experience-for-quality-assurance-engineer-off-campus-2024/',
  year: 2024,
};
const GFG_AMAZON_QAE_2022 = {
  name: 'GeeksforGeeks — Amazon Interview Experience for Quality Assurance Engineer (On-Campus)',
  url: 'https://www.geeksforgeeks.org/amazon-interview-experience-for-quality-assurance-engineer-on-campus/',
  year: 2022,
};
const GFG_PAYTM_QAE = {
  name: 'GeeksforGeeks — Paytm Interview Experience for Quality Assurance Engineer (On-Campus 2022)',
  url: 'https://www.geeksforgeeks.org/paytm-interview-experience-for-quality-assurance-engineer-on-campus-2022/',
  year: 2021,
};

export const QUESTIONS: CompanyQuestion[] = [
  {
    id: 'co-scenario-amazon-1',
    company: 'Amazon',
    area: 'scenario',
    role: 'Quality Assurance Engineer (off-campus)',
    round: 'Technical interview 1',
    difficulty: 'medium',
    question: 'Write test cases for the Lightning Deal feature on the Amazon shopping app.',
    answer: `Start by stating what a Lightning Deal is: a limited-time discount on a limited quantity, with a countdown, a "% claimed" bar, and a waitlist when stock is fully claimed. Then cover these areas.

**Functional**
- Deal appears only between its start and end time; the countdown matches server time (also with a wrong device clock).
- Deal price, original price and % off are correct in the list, product page, cart and order.
- The "% claimed" bar updates as units are claimed; at 100% the button changes to "Join waitlist".
- Adding to cart reserves the unit for the stated hold time (for example 15 minutes); after it expires, the unit is released and the price returns to normal.
- Prime-early-access deals are visible to Prime members first.
- Per-customer quantity limit is enforced (cart, buy now, multiple devices).

**Edge and negative**
- Deal ends while the item is in the cart or during checkout: what price is charged?
- Two users claim the last unit at the same moment: only one succeeds (concurrency).
- Waitlisted user is notified when a unit is released and gets the same hold time.
- Coupons and bank offers stacking with the deal follow the rules.

**Non-functional:** load at deal start (thousands of users in the first second), countdown accuracy across time zones, accessibility of the progress bar and timer, behaviour on a slow network.`,
    followUps: [
      {
        q: 'Which of these would you automate first?',
        a: 'Price correctness across list, cart and order, the claim/hold/release logic, and the per-customer limit — they are high risk and deterministic. The concurrency case needs an API-level test with parallel requests.',
      },
    ],
    topic: 'qa-scenarios',
    source: GFG_AMAZON_QAE_2024,
  },
  {
    id: 'co-scenario-amazon-2',
    company: 'Amazon',
    area: 'scenario',
    role: 'Quality Assurance Engineer (off-campus)',
    round: 'Technical interview 1',
    difficulty: 'medium',
    question: 'On the payment page, list all the test data you would use for the credit card details.',
    answer: `Break the form into fields and apply equivalence partitioning and boundary values to each, then add combinations.

**Card number**
- Valid numbers for each network: Visa (16 digits, starts with 4), Mastercard (51–55 / 2221–2720), Amex (15 digits, 34/37), RuPay, Diners.
- Luhn-check failure (one digit changed); 15 and 17 digits for Visa; letters, spaces, dashes, emoji; empty; leading/trailing spaces; pasted with spaces "4111 1111 1111 1111" (should be accepted and normalised).
- Expired, blocked, and international cards; a card that is not supported (should be rejected with a clear message).

**Name on card:** normal name, single word, very long name (boundary of max length), dots and apostrophes (O'Brien), digits and symbols (reject or allow per spec), non-Latin script.

**Expiry (MM/YY):** current month (valid), last month (expired), month 00 and 13, far-future year, Feb/leap-year not relevant but month boundaries are.

**CVV:** 3 digits (4 for Amex), 2 and 5 digits, letters, empty; masked on screen; never stored.

**Combinations and flows:** saved card vs new card, "save this card" opt-in, 3-D Secure OTP correct/wrong/timeout, insufficient funds, bank decline, network drop after submit (no double charge).

Use the payment gateway's **sandbox test cards**, never real ones.`,
    followUps: [
      {
        q: 'What security checks belong here?',
        a: 'The page is HTTPS only, the card number and CVV are masked and never logged, CVV is never stored, the card fields are served from the PCI-compliant gateway (iframe/tokenisation), and the form is protected against double submission.',
      },
    ],
    topic: 'qa-scenarios',
    source: GFG_AMAZON_QAE_2024,
  },
  {
    id: 'co-scenario-amazon-3',
    company: 'Amazon',
    area: 'scenario',
    role: 'Quality Assurance Engineer (on-campus)',
    round: 'Round 2 (technical)',
    difficulty: 'medium',
    question: 'In a chat app, the keyboard does not appear when the user taps the message box. What would you test?',
    answer: `Treat it as a bug investigation: first reproduce and isolate, then list test cases that cover the conditions.

**Isolate the cause**
- Does it happen on every device, or one OS version / manufacturer / keyboard app (Gboard, SwiftKey, Samsung keyboard)?
- Every chat or only some (group chats, blocked contacts, broadcast lists where the user cannot send)?
- After a specific action: returning from background, rotating, opening from a notification, after sending an image?
- Is the field actually focused (cursor visible)? Is a hardware or Bluetooth keyboard connected (the OS hides the soft keyboard then)?

**Test cases**
- Tap the text field in a 1:1 chat → field gets focus, keyboard opens, cursor visible.
- Same in a group chat, a newly created chat, an archived chat.
- Open the chat from a push notification and tap → keyboard opens.
- App resumed from background, after screen lock/unlock, after rotation.
- Disabled or read-only chat (admin-only group) → no keyboard, but a clear "Only admins can send messages" message.
- Different keyboards, languages, accessibility settings (large font, TalkBack/VoiceOver).
- Low memory: keyboard process killed by the OS.
- Tap the field while a voice-note recording or an attachment sheet is open.

Report with device, OS, keyboard app and exact steps, plus a screen recording.`,
    followUps: [
      {
        q: 'How would you check whether it is an app bug or an OS bug?',
        a: 'Try another app\'s text field on the same device. If the keyboard opens there, the bug is in our app (focus or input handling). If not, it is the OS or the keyboard app.',
      },
    ],
    topic: 'qa-scenarios',
    source: GFG_AMAZON_QAE_2022,
  },
  {
    id: 'co-scenario-amazon-4',
    company: 'Amazon',
    area: 'scenario',
    role: 'Quality Assurance Engineer (on-campus)',
    round: 'Round 2 (technical)',
    difficulty: 'medium',
    question: 'Write test cases for a pair of Bluetooth headsets.',
    answer: `Cover the product from unboxing to daily use, then non-functional and safety.

**Pairing and connection**
- First-time pairing with Android, iOS, Windows, Mac; the device name appears correctly.
- Re-connects automatically to the last device when switched on.
- Pairing with a second device; multipoint (two devices at once) if supported.
- Range: works at 1 m, 10 m, behind a wall; reconnects after going out of range and back.
- Behaviour with interference (Wi-Fi router, microwave, many Bluetooth devices nearby).

**Audio and controls**
- Music plays in both ears, balanced; volume buttons; play/pause/next; ANC on/off.
- Calls: answer, reject, mute, mic quality in a noisy street; call audio switches from music correctly.
- Voice assistant button; in-ear detection pauses music when removed.

**Battery and charging**
- Advertised playback hours are met; low-battery voice alert; charging time; case charge level; works while charging (if supported).

**Physical and safety**
- Comfort for 2 hours; drop from 1 m; sweat/water resistance per IP rating; buttons after 10,000 presses; no overheating while charging.

**Software:** companion app (EQ, firmware update, interrupted firmware update recovers).`,
    followUps: [
      {
        q: 'Which test would you run first if you had 10 minutes?',
        a: 'Pair with a phone, play music, take a call, and check the reconnection after power cycling — the core flows that every buyer uses on day one.',
      },
    ],
    topic: 'qa-scenarios',
    source: GFG_AMAZON_QAE_2022,
  },
  {
    id: 'co-scenario-amazon-5',
    company: 'Amazon',
    area: 'scenario',
    role: 'Quality Assurance Engineer (on-campus)',
    round: 'Technical interview 2',
    difficulty: 'medium',
    question: 'You use Prime Video: write test cases for streaming playback and for the search bar.',
    answer: `**Playback**
- Play starts within the target time; resumes from the saved position on another device ("Continue watching").
- Adaptive bitrate: quality drops on a slow network and recovers without a long freeze; manual quality setting is respected.
- Pause/seek/skip intro/next episode autoplay; scrubbing shows thumbnails.
- Subtitles and audio tracks: correct language, in sync with speech after seeking, styling settings applied.
- Interruptions: incoming call, switching apps, losing Wi-Fi and switching to mobile data, screen lock.
- Rights: content not available in the region is blocked; rented titles expire; parental PIN for mature titles; device/stream limit enforced.
- Downloads play offline and expire correctly.

**Search bar**
- Exact title, partial title, actor, genre and language return relevant results.
- Typos and transliterations ("Pnchayat") still find the title.
- Empty search, only spaces, special characters, very long input, emoji → no crash, helpful message.
- Suggestions appear while typing and are fast (for example under 300 ms).
- Results respect the profile (kids profile shows no adult titles) and region.
- Voice search; recent searches can be cleared.

**Non-functional:** start-up time, buffering ratio, battery use, accessibility (screen reader on controls).`,
    followUps: [
      {
        q: 'How would you test video quality objectively?',
        a: 'Measure start-up time, rebuffering count and duration, and bitrate switches under throttled networks, and use metrics such as VMAF for picture quality instead of judging by eye.',
      },
    ],
    topic: 'qa-scenarios',
    source: {
      name: 'GeeksforGeeks — Amazon QAE On-Campus Placement Interview Experience',
      url: 'https://www.geeksforgeeks.org/interview-experiences/amazon-qae-on-campus-placement-interview-experience/',
      year: 2025,
    },
  },
  {
    id: 'co-scenario-amazon-6',
    company: 'Amazon',
    area: 'scenario',
    role: 'SDET',
    round: 'QA interview',
    difficulty: 'medium',
    question: 'Write test cases for a vending machine.',
    answer: `Clarify first: payment methods (coins, notes, card, UPI), product range, and whether change is given. Then:

**Functional**
- Select an in-stock item, pay the exact amount → item dispensed, display returns to idle.
- Pay more → correct change returned with the fewest coins available.
- Pay less → item not dispensed; machine asks for the rest; cancel returns all money.
- Out-of-stock item shows "Sold out" and accepts no payment.
- Card/UPI: approved, declined, timeout (no item, no charge or automatic refund).
- Invalid selection code; changing the selection before paying.

**Negative and edge**
- Fake or foreign coins, torn notes → rejected and returned.
- Machine has no change → "Exact amount only" shown before payment.
- Item stuck in the spiral → refund or retry mechanism.
- Power cut during a transaction → money is not lost after restart.
- Pressing many buttons at once; pressing cancel during dispensing.

**Non-functional:** usability (readable display, buttons for wheelchair users), operating temperature for chilled drinks, durability, tamper resistance, transaction logging and stock reporting for the operator.`,
    followUps: [
      {
        q: 'How would you prioritise these if time is short?',
        a: 'Money first: correct dispensing for correct payment, correct change, and no loss of money on cancel, decline or power failure. Cosmetic and usability cases come later.',
      },
    ],
    topic: 'qa-scenarios',
    source: {
      name: 'GeeksforGeeks — Amazon Interview Experience for Software Development Engineer in Test (SDET)',
      url: 'https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-software-development-engineer-in-test-sdet/',
      year: 2024,
    },
  },
  {
    id: 'co-scenario-amazon-7',
    company: 'Amazon',
    area: 'scenario',
    role: 'SDET-1',
    round: 'Testing and automation round',
    difficulty: 'medium',
    question: 'An add function takes two numbers as strings and returns their sum as an integer. List all the test cases.',
    answer: `Partition the inputs, then add boundaries and invalid formats.

**Valid**
- add("2", "3") → 5; add("0", "0") → 0; add("-4", "6") → 2; add("-4", "-6") → -10.
- Leading zeros "007" + "3" → 10; plus sign "+5" + "1" → 6 (if allowed by the spec).
- Leading/trailing spaces " 5" + "5 " → 10, or a clear error, as the spec says.

**Boundaries**
- Largest int: add("2147483647", "0") → 2147483647; add("2147483647", "1") → overflow must be detected (error), not a negative number.
- Smallest int: add("-2147483648", "-1") → overflow error.

**Invalid**
- Empty string, null/undefined, whitespace only.
- Letters "abc", mixed "12a", decimals "1.5" (reject or round per spec), scientific "1e3", hex "0x1F".
- Unicode digits (Arabic-Indic "٣"), full-width digits.
- Very long strings (10,000 digits).

**Properties**
- Commutative: add(a, b) == add(b, a).
- Identity: add(a, "0") == a.

The interviewer is looking for clarifying questions about the spec (overflow, decimals, spaces) as much as for the list.`,
    followUps: [
      {
        q: 'How would you automate these?',
        a: 'A table-driven (parameterised) unit test with input pairs and expected results or expected exceptions, plus a property-based test that compares add(a, b) with a reference implementation on random inputs.',
      },
    ],
    topic: 'qa-scenarios',
    source: {
      name: 'GeeksforGeeks — Amazon Interview Experience | Set 414 (SDET-1)',
      url: 'https://www.geeksforgeeks.org/amazon-interview-experience-set-414-sdet-1/',
      year: 2017,
    },
  },
  {
    id: 'co-scenario-paytm-1',
    company: 'Paytm',
    area: 'scenario',
    role: 'Quality Assurance Engineer (on-campus)',
    round: 'Interview round 2',
    difficulty: 'easy',
    question: 'Write test cases for a television remote control.',
    answer: `**Functional**
- Power on/off from up to the rated distance (for example 7 m) and at angles of up to about 30°.
- Every button does its job: number keys switch channel, channel up/down wraps at the ends, volume up/down/mute, input/source, menu navigation, OK, back, home.
- Long-press behaviour (fast volume change); two buttons pressed together.
- Works with the paired TV model only; does not change a neighbouring TV of another brand.
- Smart remote: voice button, Bluetooth pairing, app shortcut buttons (open the right app).

**Battery**
- Works with fresh and with weak batteries; reversed batteries do not damage it; low-battery warning on screen (smart remotes).

**Physical**
- Buttons labelled clearly, readable in low light, comfortable to hold.
- Drop from table height; buttons survive many thousands of presses; battery cover stays shut.
- Spill of water on the keypad.

**Environment and interference**
- Sunlight or strong lights on the IR receiver; other IR devices (AC remote) do not trigger the TV.

**Usability / accessibility:** large-button mode or tactile marks for visually impaired users.`,
    followUps: [
      {
        q: 'What would be your top 3 cases?',
        a: 'Power on/off, channel change and volume — they are used constantly and a failure makes the TV unusable. Then range and battery life.',
      },
    ],
    topic: 'qa-scenarios',
    source: GFG_PAYTM_QAE,
  },
  {
    id: 'co-scenario-paytm-2',
    company: 'Paytm',
    area: 'scenario',
    role: 'Quality Assurance Engineer (on-campus)',
    round: 'Interview round 2',
    difficulty: 'medium',
    question: 'What security checks would you do on a login page?',
    answer: `**Transport and storage**
- Page and login request only over HTTPS; HTTP redirects to HTTPS; HSTS header present.
- Password never appears in URLs, logs, or responses; stored as a salted hash (bcrypt/argon2) — confirm with developers.

**Brute force and enumeration**
- Account lockout or captcha after N failed attempts; rate limiting per IP and per account.
- Same error for wrong username and wrong password ("Invalid credentials"), so attackers cannot discover valid accounts; same for "Forgot password".

**Injection and input**
- SQL injection in username (' OR '1'='1) does not log in; XSS payload in fields is not executed or reflected.

**Session**
- New session ID after login (no session fixation); cookies are HttpOnly, Secure, SameSite.
- Logout invalidates the session on the server; back button after logout does not show account data.
- Session timeout after inactivity.

**Other**
- Password field masked, with paste allowed for password managers; autocomplete settings per policy.
- OTP/2FA: OTP expires, cannot be reused, limited attempts.
- CSRF protection on the login form; no clickjacking (X-Frame-Options/CSP frame-ancestors).`,
    followUps: [
      {
        q: 'Which tools help here?',
        a: 'Browser dev tools for cookies and headers, Burp Suite or OWASP ZAP to intercept and replay requests, and the OWASP Testing Guide / ASVS as a checklist.',
      },
    ],
    topic: 'qa-scenarios',
    source: GFG_PAYTM_QAE,
  },
  {
    id: 'co-scenario-eq-technologic-1',
    company: 'EQ Technologic',
    area: 'scenario',
    role: 'QA Engineer (on-campus)',
    round: 'Technical interview round 2',
    difficulty: 'medium',
    question: 'Write test cases for WhatsApp.',
    answer: `The app is huge, so say first that you will pick the core features and go deep, then name the rest.

**Registration:** phone number with valid/invalid OTP, OTP expiry, resend timer, number already used on another phone, changing number.

**1:1 messaging**
- Send text, emoji, links (preview appears), very long text, message to a contact who is offline (one grey tick → two grey → blue when read).
- Read receipts off: blue ticks not shown in either direction.
- Delete for me / delete for everyone within the time limit; edit message; reply and forward (forward label after 5 hops).
- Messages arrive in order after the phone was offline.

**Media:** photo, video, document, voice note; size limits; download on Wi-Fi only setting; view-once media cannot be forwarded.

**Groups:** create, add/remove members, admin-only settings, leave group, group size limit, mentions.

**Calls:** voice/video call, switching network during a call, call while another call is ongoing.

**Privacy and security:** block a contact (no messages or calls), last-seen and profile-photo settings, end-to-end encryption notice, two-step verification PIN.

**Backup and restore:** chat backup to Google Drive/iCloud and restore on a new phone.

**Non-functional:** battery and data usage, behaviour on 2G, notification delivery when the app is killed.`,
    followUps: [
      {
        q: 'How would you test the blue tick logic efficiently?',
        a: 'Use two test devices and a decision table of sender/receiver read-receipt settings and online/offline states, then check the tick state for each combination, including group chats where blue appears only when all members have read.',
      },
    ],
    topic: 'qa-scenarios',
    source: {
      name: 'GeeksforGeeks — EQ Technologic Interview Experience for QA Engineer (On-Campus)',
      url: 'https://www.geeksforgeeks.org/eq-technologic-interview-experience-for-qa-engineer-on-campus/',
      year: 2023,
    },
  },
  {
    id: 'co-scenario-flipkart-1',
    company: 'Flipkart',
    area: 'scenario',
    role: 'SDET',
    round: 'F2F round 4',
    difficulty: 'medium',
    question: 'For a login page, list all the test cases you would write from the API point of view and from the UI point of view.',
    answer: `**API (POST /login)**
- Valid credentials → 200, token or session cookie returned, token expiry set, no password in the response.
- Wrong password / unknown user → 401 with the same generic message (no user enumeration).
- Missing fields, empty strings, null, wrong types, extra fields → 400 with a clear error.
- Malformed JSON, wrong Content-Type → 400/415.
- SQL injection and very long strings → handled, no 500.
- Locked or deactivated account → 403/423 with the right message.
- Rate limiting after N failed attempts → 429.
- Token works on a protected endpoint; expired or tampered token → 401; logout invalidates the token.
- Response time under the SLA; HTTPS only.

**UI**
- Fields, labels, placeholders, tab order; Enter submits; password masked with a show/hide toggle.
- Client-side validation messages for empty or invalid email; the Login button is disabled until valid (if designed so).
- Successful login → correct landing page and user name shown.
- Error message for wrong credentials; fields keep the username but clear the password.
- Double-click on Login sends one request; loading state shown.
- "Remember me", "Forgot password" link, back button after logout.
- Responsive on mobile; works on supported browsers; screen-reader labels.`,
    followUps: [
      {
        q: 'Why test the API separately if the UI already calls it?',
        a: 'Attackers and other clients call the API directly, bypassing UI validation. API tests also run faster and pinpoint failures without UI noise.',
      },
    ],
    topic: 'qa-scenarios',
    source: { name: 'GeeksforGeeks — Flipkart Interview Experience | Set 19 (SDET)', url: 'https://www.geeksforgeeks.org/flipkart-interview-experience-set-19-sdet/', year: 2015 },
  },
  {
    id: 'co-scenario-flipkart-2',
    company: 'Flipkart',
    area: 'scenario',
    role: 'SDET',
    round: 'F2F round 3',
    difficulty: 'hard',
    question: 'How would you test a feature when you cannot have production data in the QA environment?',
    answer: `Recreate the *shape* of production data without copying the data itself.

1. **Study production safely:** ask for aggregated statistics, not records: volume of rows, distribution of values (order sizes, categories, pin codes), percentage of nulls, the longest names, unusual characters. Logs and analytics dashboards help too.
2. **Generate synthetic data** that matches those distributions (scripts, Faker, factories, APIs). Include the extremes: a seller with 100,000 products, a cart with 50 items, names in many scripts.
3. **Masked subset (if policy allows):** an anonymised, tokenised extract where personal and payment data are replaced but relationships are kept.
4. **Contract and mock data** for third-party systems (payment, logistics) using their sandboxes.
5. **Volume:** use bulk generators for performance tests so query plans resemble production.
6. **Shift right:** release behind a **feature flag** to internal users or a small percentage, use canary releases and monitoring, and compare metrics before full rollout.

**Example:** for a new "frequently bought together" widget, synthetic order histories were generated with the real category mix; a 1% canary then showed a slow query that only appeared with production-sized catalogues, which was fixed before the full rollout.`,
    followUps: [
      {
        q: 'What are the limits of synthetic data?',
        a: 'It only contains the patterns you thought of. Real data has surprises (bad legacy records, odd encodings), so combine it with canary releases and production monitoring.',
      },
    ],
    topic: 'qa-scenarios',
    source: { name: 'GeeksforGeeks — Flipkart Interview Experience | Set 19 (SDET)', url: 'https://www.geeksforgeeks.org/flipkart-interview-experience-set-19-sdet/', year: 2015 },
  },
  {
    id: 'co-scenario-jp-morgan-1',
    company: 'JP Morgan',
    area: 'scenario',
    role: 'SDET (experienced)',
    round: 'Round 6 (technical)',
    difficulty: 'easy',
    question: 'List the success and failure scenarios for the Gmail login page.',
    answer: `Gmail login is a two-step flow (email first, then password), which changes the cases.

**Success**
- Valid email → password page shows the account; correct password → inbox loads.
- Login with a phone number instead of email.
- Login with 2-Step Verification: correct code, prompt on phone approved, backup code.
- "Stay signed in" keeps the session; adding a second account; login from a new device triggers a security alert email.
- Case-insensitive email (USER@gmail.com) and email without @gmail.com both accepted.

**Failure**
- Empty email → "Enter an email or phone number".
- Unknown email → "Couldn't find your Google Account".
- Wrong password → "Wrong password", with "Forgot password?" offered.
- Too many wrong attempts → captcha or temporary block.
- Wrong or expired 2FA code; 2FA prompt denied on phone.
- Disabled or deleted account → specific message.
- Suspicious location → extra verification step.
- No network → retry message, no crash.
- Cookies disabled in browser → message asking to enable them.

Also check: password masking and show-password toggle, Enter key submission, back button behaviour, and session invalidation after "Sign out of all devices".`,
    followUps: [
      {
        q: 'Why does Gmail say "Couldn\'t find your Google Account" when that leaks whether an account exists?',
        a: 'It is a usability trade-off for the two-step flow; Google compensates with rate limiting, captcha and risk-based checks. On most other sites a generic "invalid credentials" message is preferred.',
      },
    ],
    topic: 'qa-scenarios',
    source: { name: 'GeeksforGeeks — JP Morgan Interview Experience (SDET role, experienced)', url: 'https://www.geeksforgeeks.org/jp-morgan-interview-experience-sdet-role-for-experienced/', year: 2018 },
  },
  {
    id: 'co-scenario-adobe-1',
    company: 'Adobe',
    area: 'scenario',
    role: 'Software Engineer',
    round: 'Technical rounds 2–3',
    difficulty: 'hard',
    question: 'A smartphone launches tomorrow on several platforms and you have one day. How would you plan the testing, and is testing it inside a fridge or microwave a valid scenario?',
    answer: `**With one day, test by risk, not by completeness.**

1. **Build a platform × feature matrix** (e.g. iOS / Windows / Android × camera, music, internet, voice calls, lock). Mark each cell: changed recently? used by most customers? failed before?
2. **Run in this order:** (a) smoke on every platform: boot, call, SMS, data, lock/unlock; (b) features changed in the latest update; (c) the most-used features (camera, calls, internet); (d) everything else as time allows.
3. **Parallelise:** split the team by platform; automate repeated smoke runs if any automation exists.
4. **Report the risk clearly at the end of the day:** what was tested, what was not, open defects, and a go/no-go recommendation. The business decides on the launch, but with full information.

**The fridge / microwave question:**
- **Fridge: yes, in principle.** It simulates low temperatures (cold climates, outdoor use). Proper testing uses a temperature chamber at the specified operating range (for example 0–35 °C) and checks battery, screen and charging.
- **Microwave: no.** It is not a realistic use case, it destroys the device and is dangerous. Heat testing is done in a controlled thermal chamber instead.

The point of the question: tests must be grounded in realistic usage and specifications, not just "anything that could break it".`,
    followUps: [
      {
        q: 'What do you say if the manager insists on launching despite a known high-severity bug?',
        a: 'State the risk with evidence (who is affected, how often, workaround), suggest mitigations (known-issues note, day-one patch, feature flag), and record the decision. The release decision belongs to the business.',
      },
    ],
    topic: 'qa-scenarios',
    source: {
      name: 'GeeksforGeeks — Adobe Interview Experience | Set 41 (Software Engineer)',
      url: 'https://www.geeksforgeeks.org/adobe-interview-experience-set-41-software-engineer/',
      year: 2016,
    },
  },
  {
    id: 'co-scenario-adobe-2',
    company: 'Adobe',
    area: 'scenario',
    role: 'Software Engineer (testing profile, fresher)',
    round: 'Technical round 1',
    difficulty: 'medium',
    question: 'An Excel file received by email will not open. List all the possible reasons.',
    answer: `Group the causes by where in the chain they happen; it shows a systematic approach.

**The file itself**
- Corrupted during creation or transfer (incomplete download, mail server truncation).
- Wrong or changed extension (.xls renamed to .xlsx, or a CSV saved as .xlsx).
- Created in a newer format or with features the receiver's version does not support.
- Password-protected or encrypted (IRM/sensitivity label) and the receiver has no rights.
- Very large file, or it contains macros (.xlsm) blocked by policy.

**The email path**
- Attachment stripped or quarantined by antivirus or the mail gateway; attachment size limit exceeded.
- Encoding problem in the mail client; the preview pane cannot render it but download can.

**The receiver's machine**
- Excel not installed or no file association; a viewer app opens it instead.
- Protected View / "file blocked" policy (Mark of the Web) for files from the internet.
- Excel already running with a hung instance or a faulty add-in; low disk space or memory.
- Opening on a phone or web client that does not support the format.

**Network / cloud**
- Link to OneDrive/SharePoint rather than a real attachment; no access permission or offline.

For a bug report: note the file size, extension, sender's Excel version, receiver's OS/Excel version and the exact error message.`,
    followUps: [
      {
        q: 'How would you find out quickly which category it is?',
        a: 'Try the same file on another machine and through another channel (USB, download from web mail). If it opens elsewhere, the problem is the receiver\'s setup; if it fails everywhere, the file or the transfer is corrupt.',
      },
    ],
    topic: 'qa-scenarios',
    source: {
      name: 'GeeksforGeeks — Adobe Interview Experience | Set 21 (Software Engineer, Testing profile, Fresher)',
      url: 'https://www.geeksforgeeks.org/adobe-interview-experience-set-21-for-software-engineer-fresher/',
      year: 2015,
    },
  },
  {
    id: 'co-scenario-tech-mahindra-1',
    company: 'Tech Mahindra',
    area: 'scenario',
    role: 'Test Engineer',
    difficulty: 'medium',
    question: 'Give 5 positive and 5 negative test cases for video streaming on Hotstar, including what happens when a WhatsApp call comes in.',
    answer: `**Positive**
1. A logged-in subscriber taps a title → playback starts within the target time (e.g. under 3 s on 4G).
2. Quality adapts: on a throttled network it drops to a lower resolution and recovers when bandwidth returns, without stopping.
3. Pausing and resuming later (even on another device) continues from the same position.
4. Subtitles and alternate audio languages can be switched mid-stream and stay in sync.
5. A live cricket match plays with a small delay behind real time; the score overlay updates.

**Negative**
1. **Incoming WhatsApp call:** the video pauses (or audio ducks per OS rules), no audio mixes with the call, and after the call it resumes from the same position — not from the start and not with a crash.
2. Network drops completely → a "check your connection" message with retry; no app crash; resumes after reconnecting.
3. Free user opens premium content → paywall shown, no stream URL leaked.
4. Device limit exceeded (subscription allows N screens) → a clear message on the extra device.
5. Content not licensed in the user's region or a VPN is detected → blocked with the right message.

Add device rotation, background/foreground switching, low battery saver mode and headphone unplug (should pause) if time allows.`,
    followUps: [
      {
        q: 'How do you test the incoming-call case without a second person?',
        a: 'Use a second test phone or an emulator/simulator feature that simulates incoming calls (Android emulator extended controls, Xcode call simulation), or a test WhatsApp account on another device.',
      },
    ],
    topic: 'qa-scenarios',
    source: { name: 'AmbitionBox — Tech Mahindra Test Engineer interview questions', url: AB('tech-mahindra', 'test-engineer'), year: 2026 },
  },
  {
    id: 'co-scenario-hcltech-1',
    company: 'HCLTech',
    area: 'scenario',
    role: 'Manual Test Engineer',
    difficulty: 'easy',
    question: 'Give some test cases for a messaging application.',
    answer: `Organise by feature, with positive and negative cases:

**Sending and receiving**
- Send a text to an online contact → delivered instantly; status changes sent → delivered → read.
- Send to an offline contact → delivered when they come online, in the correct order.
- Empty message cannot be sent; only spaces is trimmed or blocked.
- Maximum length message; emoji, other languages (Hindi, Tamil), right-to-left text, links.

**Attachments:** image, video, PDF, audio; size limit message; unsupported file type; slow network upload with a progress bar and cancel option.

**Notifications:** arrive when the app is in background or killed; muted chat shows none; tapping a notification opens the right chat.

**Conversation management:** delete message for me / for everyone, search in chat, archive, pin, clear chat.

**Groups:** create, add/remove members, only admins can post (if set), leave and rejoin.

**Privacy:** block user — no messages either way; report spam.

**Interruptions and sync:** incoming call while typing, switching Wi-Fi to mobile data mid-send (message retries, no duplicates), login on a second device syncs history.

**Non-functional:** battery and data usage, performance with a 10,000-message chat, accessibility.`,
    followUps: [
      {
        q: 'How would you test message ordering?',
        a: 'Send a numbered burst of messages while toggling the network and from two devices at once, then check that both sides show the same order based on server timestamps and that none are duplicated or lost.',
      },
    ],
    topic: 'qa-scenarios',
    source: { name: 'AmbitionBox — HCLTech Manual Test Engineer interview questions', url: AB('hcltech', 'manual-test-engineer'), year: 2021 },
  },
  {
    id: 'co-scenario-infosys-1',
    company: 'Infosys',
    area: 'scenario',
    role: 'Senior Test Engineer',
    round: 'Technical',
    difficulty: 'medium',
    question: 'List negative test scenarios for a lift (elevator).',
    answer: `Negative scenarios check that the lift fails safely when used wrongly or when something goes wrong.

**Input and use**
- Press a floor that does not exist or is restricted (basement parking without a key card) → no movement or access denied.
- Press many floor buttons at once, or the same button repeatedly → served once, in a sensible order.
- Press both up and down at a landing → both requests registered correctly.
- Press "door close" while someone is in the doorway → door must reopen.

**Load**
- Load above the rated capacity (e.g. 9 people in an 8-person lift) → overload alarm, doors stay open, lift does not move.

**Safety and faults**
- Object or hand in the door → sensors reopen the door; the door never closes on it.
- Power cut between floors → emergency light, alarm works, rescue mode moves the lift to the nearest floor and opens the door (ARD).
- Fire alarm → lift goes to the ground floor and is taken out of normal service.
- Doors cannot be opened from inside while moving; landing door does not open when the cabin is not there.
- Emergency alarm and intercom work with the main power off.

**Environment:** water in the lift pit, very high temperature in the machine room, earthquake sensor (if fitted).`,
    followUps: [
      {
        q: 'What positive scenarios would you add?',
        a: 'Call from each floor, travel to each floor, levelling accuracy at each stop, door open time, display and announcement of floor, and correct direction choice when multiple calls are pending.',
      },
    ],
    topic: 'qa-scenarios',
    source: { name: 'AmbitionBox — Infosys Senior Test Engineer interview questions', url: AB('infosys', 'senior-test-engineer'), year: 2024 },
  },
  {
    id: 'co-scenario-accenture-1',
    company: 'Accenture',
    area: 'scenario',
    role: 'QA Engineer',
    round: 'One-on-one',
    difficulty: 'medium',
    question: 'Write test scenarios for a payment flow.',
    answer: `**Happy paths per method:** credit/debit card (with 3-D Secure OTP), UPI (collect request and intent), net banking, wallet, EMI, cash on delivery → order confirmed, payment status "success", receipt and confirmation email/SMS, amount matches the cart.

**Failures**
- Card declined, insufficient funds, wrong OTP, OTP timeout → order not placed, clear message, retry possible.
- UPI request not approved within the time limit → payment marked failed; order not confirmed.
- User closes the browser or presses back on the bank page → order stays pending and is reconciled later.

**Money integrity (highest risk)**
- Network drops after the bank debit but before our callback → no lost money: the order is confirmed via reconciliation or the amount is refunded automatically.
- Double-click on "Pay" → one charge only (idempotency key).
- Amount tampering in the request (change 999 to 1) → server rejects it.
- Refund full and partial → correct amount returned to the original method; status updated.

**Security and compliance:** HTTPS, card data not stored, CVV never stored, PCI-compliant tokenisation, session timeout on the payment page.

**Non-functional:** load during a sale, response time of the gateway redirect, behaviour on slow networks, accessibility of the payment form.`,
    followUps: [
      {
        q: 'How do you test payments without real money?',
        a: 'Use the payment gateway\'s sandbox or test mode, its documented test cards and UPI IDs that simulate success, failure and timeout, and webhook replay tools for callback scenarios.',
      },
    ],
    topic: 'qa-scenarios',
    source: { name: 'AmbitionBox — Accenture QA Engineer interview questions', url: AB('accenture', 'qa-engineer'), year: 2024 },
  },
  {
    id: 'co-scenario-freshworks-1',
    company: 'Freshworks',
    area: 'scenario',
    role: 'Software Test Engineer',
    difficulty: 'medium',
    question: 'Write manual test cases for a bus booking site such as redBus.',
    answer: `**Search**
- From/To with autocomplete, same city in both (blocked), swap button, date picker (past dates disabled, today and far-future limits).
- Results: filters (AC/sleeper, departure time, operator, price), sorting, "no buses found" message.

**Seat selection**
- Seat layout matches the bus type; booked seats disabled; ladies-reserved seats only for female passengers; maximum seats per booking.
- Two users selecting the same seat at the same moment → only one gets it (seat hold with timer).
- Seat hold expires after the timer; the seat becomes available again.

**Boarding and passenger details**
- Boarding and dropping points listed with times; passenger name, age, gender validations; contact email and phone validations.

**Payment and confirmation**
- Successful payment → ticket with PNR, SMS and email; booking appears in "My trips".
- Payment failure or timeout → seat released, money refunded if debited.
- Coupons: valid, expired, minimum fare not met.

**Post-booking:** cancellation with the right refund per policy and time before departure; reschedule; live bus tracking link; rating after the trip.

**Non-functional:** load during festival booking peaks, mobile responsiveness, accessibility, slow network behaviour.`,
    followUps: [
      {
        q: 'Which is the riskiest part and why?',
        a: 'Seat locking and payment together: double booking of a seat or charging without a confirmed seat directly costs money and trust, so concurrency and payment-failure cases come first.',
      },
    ],
    topic: 'qa-scenarios',
    source: { name: 'AmbitionBox — Freshworks Software Test Engineer interview questions', url: AB('freshworks', 'software-test-engineer'), year: 2026 },
  },
];
