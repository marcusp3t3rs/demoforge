---

# Provisioning Feasibility POC Plan

Goal
- Validate unattended provisioning / impersonation for: users, mails, files, (and Teams messages if possible).
- Decide between: app-only (client credentials) worker, delegated refresh tokens, or hybrid (service accounts / bots).

Timebox
- 3 days (2–4 days acceptable)

Environment
- Single tenant (test tenant you control) or dev tenant for POC.
- Azure App Registration (test app).

Permissions to request (application permissions)
- User.ReadWrite.All
- Directory.ReadWrite.All (if needed)
- Mail.ReadWrite or Mail.Send
- Files.ReadWrite.All
- TeamsChat.ReadWrite/ChatMessage.Send (note: Graph limitations may apply)

POC Steps
1. Register Test App in Azure:
   - Create client id + secret (store server-side).
   - Grant the above application permissions (admin consent).
2. Acquire token (client_credentials) and run a script:
   - Obtain token:
     POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
     grant_type=client_credentials&client_id=...&client_secret=...&scope=https://graph.microsoft.com/.default
     grant_type=client_credentials&amp;client_id=...&amp;client_secret=...&amp;scope=https://graph.microsoft.com/.default
3. Create test user:
   - POST /users with required fields.
   - Optionally assign license to provision mailbox (PowerShell or Graph license assignment).
4. Validate mailbox existence:
   - Query the user's mailbox or attempt mail operations.
5. Create mail in user's mailbox:
   - Try using /users/{id}/messages to create mail items (observe From/FromDisplayName).
6. Upload a file to user's OneDrive:
   - Use /users/{id}/drive/root:/path:/content
7. Attempt Teams message:
   - Try /chats or /teams endpoints; record success/failure and authorship behavior.
8. If app-only fails for certain operations:
   - Test alternatives:
     - Create service account(s) to own content.
     - Use bot framework for Teams messages.
     - Use delegated flow for limited scenarios.
9. Produce report:
   - What succeeded, what failed, recommended production architecture, required permissions, and admin-consent UX.

Sample commands & scripts
- Include minimal Node/TS snippets in report (token acquisition, create user, upload file, create mail).

---
Sample commands &amp; scripts
- Include minimal Node/TS snippets in report (token acquisition, create user, upload file, create mail).
