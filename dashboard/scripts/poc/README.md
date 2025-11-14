# 🧪 POC Scripts - Unattended Provisioning

**Purpose**: Standalone test scripts to validate Microsoft Graph API unattended provisioning capabilities.

## 📋 Script Execution Order

### Phase 1: Authentication
1. **`01-authenticate.js`** - Test client_credentials flow with Azure app

### Phase 2: Core Provisioning  
2. **`02-create-user.js`** - Create test user via Graph API
3. **`03-upload-file.js`** - Upload file to user's OneDrive
4. **`04-create-email.js`** - Create mail item in user's mailbox
5. **`05-teams-test.js`** - Attempt Teams chat operations

### Phase 3: Validation
6. **`validate-attribution.js`** - Check CreatedBy fields and ownership
7. **`validate-security.js`** - Test app permission boundaries

## 🔧 Setup Requirements

1. **Azure App Registration** with permissions:
   - `User.ReadWrite.All`
   - `Directory.ReadWrite.All`
   - `Mail.ReadWrite` or `Mail.Send`
   - `Files.ReadWrite.All`
   - `TeamsChat.ReadWrite` / `ChatMessage.Send`

2. **Environment Variables** (create `.env.local`):
   ```
   AZURE_TENANT_ID=your-tenant-id
   AZURE_CLIENT_ID=your-client-id
   AZURE_CLIENT_SECRET=your-client-secret
   ```

3. **Dependencies**:
   ```bash
   cd dashboard
   npm install
   ```

## 🚀 Running Scripts

```bash
# From dashboard directory
node scripts/poc/01-authenticate.js
node scripts/poc/02-create-user.js
# ... continue with other scripts
```

## 📊 Results

Each script will:
- ✅ Log success/failure to console
- 📄 Write detailed results to `poc-results.json`
- 🔍 Document any limitations or errors encountered

**Related**: 
- [Issue #35](https://github.com/marcusp3t3rs/demoforge/issues/35) - Phase 1 tasks
- [POC_PROGRESS.md](../../docs/poc/POC_PROGRESS.md) - Overall progress tracking