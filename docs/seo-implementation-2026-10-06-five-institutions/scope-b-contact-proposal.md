# Scope B: honest contact handoff or real enquiry submission

**Proposal only — 6 October 2026. Not implemented.** All ten scope-A pages currently link to `/contact`. The live contact form prevents submission and displays a success alert. Scope A leaves that flow unchanged. The separately edited contact canonical is also untouched, as explicitly requested by the owner.

## Option 1: minimal honest WhatsApp handoff

Replace the non-delivering form/success alert with a small enquiry panel using the site's existing public WhatsApp destination, `https://wa.me/601119359497`. Keep the existing email alternative, `mailto:info@onestepmy.com`. These are the configured public destinations, not proof that the accounts are owned, monitored or receiving messages; the owner must confirm routing and responsibility before release.

Reviewable wording:

> **Talk to One-Step about your study plans**
>
> Tell us your university, programme and intended intake so we can help you identify the right information.
>
> **Message One-Step on WhatsApp**
>
> This opens WhatsApp. Your enquiry reaches us only after you send the message. You can also email info@onestepmy.com.

Minimal markup proposal (this snippet is in documentation only):

```html
<section aria-labelledby="study-enquiry-title">
  <h2 id="study-enquiry-title">Talk to One-Step about your study plans</h2>
  <p>Tell us your university, programme and intended intake.</p>
  <a href="https://wa.me/601119359497" target="_blank" rel="noopener">
    Message One-Step on WhatsApp
  </a>
  <p>This opens WhatsApp. Your enquiry reaches us only after you send the message.</p>
  <p>You can also <a href="mailto:info@onestepmy.com">email One-Step</a>.</p>
</section>
```

Do not collect personal fields on the webpage and imply they were transmitted. An optional prefilled message should contain only a generic enquiry, not automatically copied personal information. Keep “Apply Now”/application-account language separate from an initial counselling enquiry.

**Delivery requirements:** owner confirms the WhatsApp number and monitored email, assigns a responder and agrees an honest response expectation. No response-time promise is displayed until it can be supported.

**Verification:** check links on mobile with/without WhatsApp installed and desktop with/without a signed-in session; ensure the correct number is shown before sending. With separate authorization, send one uniquely labelled test message and confirm receipt in the intended account. Closing the app without sending must never appear as a completed enquiry. Record `contact_click`/`whatsapp_open` separately from a staff-recorded message received and qualified enquiry. If app launch fails, keep the number/email visible and usable. This option supplies a real handoff but does not automatically measure completed messages.

**Effort/risk:** small frontend change, preserving design and other links. External-app availability and account monitoring remain dependencies. No new backend or fabricated confirmation state.

## Option 2: server-confirmed enquiry with durable storage and notification

Keep a simple contact form, but implement a dedicated public enquiry endpoint. The existing application JavaScript posts to `submit_application.php`; that is an application-specific flow, not an established general-contact endpoint. Inspect its ownership/security contract before considering reuse. Do not make an enquiry create an application account.

Proposed flow:

1. Collect only name, email or phone/WhatsApp contact route, programme/institution, intended intake if known, and message. Mark required/optional fields clearly. Associate the initial landing page and one of the five institutions when known, without guessing admission eligibility.
2. POST to a dedicated server endpoint, such as `/api/enquiries.php`, with server-side validation, size limits, request/session protection and practical spam/rate controls. Do not trust client validation or status flags.
3. In one database transaction, store the enquiry, an opaque receipt identifier, deduplication/idempotency key and an email notification/outbox record. Commit before returning success. Personal fields stay out of analytics payloads and public logs.
4. Respond with HTTP 201 and a receipt **only after durable storage succeeds**. Proposed message: **“Your enquiry has been saved. Reference: [receipt].”** This reports storage receipt, not inbox delivery or a completed application.
5. Deliver staff notifications using configured SMTP/provider credentials kept outside public code. Retry failed notifications through an approved worker/cron process; retain notification status separately from the enquiry. A monitored private inbox/dashboard or agreed staff retrieval path is required so saved enquiries cannot be silently abandoned.
6. Record `enquiry_received` from the server acknowledgement, `notification_accepted` from the mail transport separately, and `qualified_enquiry` only after staff assessment. SMTP acceptance is not proof of inbox delivery or staff reading. Capture source/landing context without sending personal data to analytics.

Suggested implementation files after approval: `contact.html`, a scoped contact script, a dedicated PHP endpoint/service, database migration for enquiries/outbox, private configuration and notification-worker integration. Reuse existing safe infrastructure only after inspection. Ten-page titles, rankings, fee amounts, canonicals and the excluded runtime URL patch are outside this contact implementation.

### Delivery decisions required

| Requirement | Needed owner decision/evidence |
| --- | --- |
| Receipt destination | Approved database/store with backup and controlled staff access; retention/deletion responsibility |
| Notification recipient | Confirm whether `info@onestepmy.com` is the actual monitored recipient or supply the intended inbox |
| Sender/transport | Authorized SMTP/provider, authenticated sender domain, credentials supplied through private configuration, delivery/bounce monitoring |
| Processing | Hostinger worker/cron capability and retry responsibility; do not assume an existing process is active |
| Staff handling | Named role/team responsible for the inbox/store and qualification status; agreed response expectation |
| Analytics | Owner-approved measurement destination/consent configuration and definition of receipt versus contact click versus qualification |

### Acceptance and failure verification

| Test | Required outcome |
| --- | --- |
| Valid authorized test | Exactly one committed enquiry with matching receipt, landing/institution context and a notification record; actual recipient confirms notification arrival separately |
| Invalid/oversized input | 422 validation errors, accessible field messages, no enquiry or success event |
| Spam/rate limit | 429 with a useful retry/handoff explanation; no duplicate notification |
| Database unavailable | 503 or explicit failure; input retained where safe; no “saved” message or receipt event |
| SMTP unavailable after commit | Enquiry remains saved; notification is marked pending/failed and retried; never confuse notification failure with loss of stored receipt |
| Double-click/retry/network timeout | Idempotency returns the same receipt for the same submission; one enquiry/outbox record; a lost browser response does not create another lead |
| Queue recovery | Pending notifications resume and become traceable; retry count/status visible to responsible staff |
| Forged client success or endpoint tampering | Server determines storage status; invalid requests cannot emit a genuine completion receipt |
| Accessibility/mobile | Keyboard submission, clear loading/failure state, disabled repeat submission while pending, field errors announced; no alert-only feedback |
| Measurement | One received enquiry → one server-confirmed event; failed request and WhatsApp/email click → no received-enquiry event; qualification reconciles to a real record |

Local tests can verify stored receipt, failure behaviour and idempotency with test infrastructure. Production transport and real recipient receipt require separately authorized deployment and a labelled test enquiry. No real messages/forms were sent during this work.

**Recommendation:** use Option 1 as the smallest honest interim repair if a monitored WhatsApp account is available. Choose Option 2 when storage, delivery, staff handling and measurement requirements are agreed. Neither option is implemented by scope A; approval of the chosen option is required before shared contact changes.
