# Recovery email

The UI and OTP endpoints are implemented. Outbound recovery email stays disabled until a provider is configured. Existing recovery codes remain available.

## Option A: Resend

1. Verify a sending domain in the Resend account.
2. In Cloudflare Worker `tcv-ai`, configure secret `RESEND_API_KEY` and variable `RECOVERY_FROM` (an address on the verified domain).
3. Deploy a saved source version to apply the settings.
4. Test delivery using an email address the owner chooses. Never put API keys in the repository.

The adapter calls the Resend HTTPS API. This does not upgrade the Cloudflare Workers plan.

## Option B: Cloudflare Email Sending

The account must be able to send to arbitrary recipients (Workers Paid); Workers Free can send only to verified destination addresses. Enabling a paid plan is a separate owner decision.

After the owner chooses this option and confirms billing/domain setup, add a separate binding in wrangler.jsonc:

```json
{"name":"RECOVERY_EMAIL","allowed_sender_addresses":["noreply@khunglongcon.com"]}
```

Keep the existing FEEDBACK_EMAIL binding and its destination restriction. Set `RECOVERY_FROM=noreply@khunglongcon.com` and `RECOVERY_EMAIL_ENABLED=true`. The sender domain must be onboarded for Email Sending. Redeploy.

## User flow

- Signed-in learner opens Profile, enters an email and the current PIN, requests a verification code, then submits that code.
- A newly typed address does not replace the previous verified email until verification succeeds.
- Forgot PIN accepts profile ID and verified email. The response does not reveal whether the pair exists.
- The learner enters the emailed 6-digit code and chooses a new PIN.
- Codes expire after 10 minutes, allow at most 5 incorrect attempts, and are consumed once. Resends wait at least 60 seconds, with at most 5 sends per profile/purpose/hour.
- Reset preserves learning progress, revokes sessions and invalidates older offline recovery codes.
- Email/OTP form fields are excluded from automatic lesson draft storage.
- Recovery email is stored server-side separately from editable learning progress.

## Endpoints

- GET /email/status — public availability only
- POST /profile/email/status — authenticated recovery email state
- POST /profile/email/send — authenticated; requires currentPin
- POST /profile/email/verify — authenticated
- POST /profile/reset-email-request — public, generic response
- POST /profile/reset-email — public, requires single-use challenge/code and new PIN

All endpoints retain the existing origin checks. SQL tables and indexes are created lazily in D1. Codes are hashed and never returned by the API or written to logs.

## Validation performed

Fifteen checks with in-memory D1, clock, random and email adapters cover current-PIN checks, proof of email ownership, resend throttling, incorrect/expired/reused codes, changed email revision, progress preservation, session revocation and provider-disabled behavior. No live recovery emails or live PIN changes were performed during these checks.

References:
- https://developers.cloudflare.com/email-service/
- https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- https://resend.com/docs/api-reference/emails/send-email
