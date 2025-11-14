# POC Scripts - Unattended Provisioning

This directory contains TypeScript scripts to test unattended provisioning capabilities with Microsoft Graph API.

## Setup

### 1. Azure App Registration
Register a new Azure app at `entra.microsoft.com` with these **Application permissions**:
- User.ReadWrite.All (Application)
- Directory.ReadWrite.All (Application) 
- Mail.ReadWrite (Application)
- Files.ReadWrite.All (Application)
- Chat.ReadWrite.All (Application)

### 2. Environment Configuration
Copy `.env.template` to `.env.local` and configure:

```bash
cp .env.template .env.local
```

Fill in your Azure app credentials in `.env.local`.

### 3. Dependencies
From the dashboard root directory:

```bash
npm install --save-dev @types/node ts-node dotenv
```

## Execution Order

### Phase 0: Configuration Verification
0. **`00-verify-config.ts`** - Verify Azure app permissions and configuration

### Phase 1: Authentication
1. **`01-authenticate.ts`** - Test client_credentials flow with Azure app

### Phase 2: Core Provisioning  
2. **`02-create-user.ts`** - Create test user via Graph API
3. **`03-upload-file.ts`** - Upload file to user's OneDrive
4. **`04-create-email.ts`** - Create mail item in user's mailbox
5. **`05-teams-test.ts`** - Attempt Teams chat operations

### Phase 3: Validation
6. **`validate-attribution.ts`** - Check CreatedBy fields and ownership
7. **`validate-security.ts`** - Test app permission boundaries

## Running Scripts

From the dashboard root directory:

```bash
# First, verify your Azure configuration
npx ts-node scripts/poc/00-verify-config.ts

# Test authentication
npx ts-node scripts/poc/01-authenticate.ts

# Create test user
npx ts-node scripts/poc/02-create-user.ts

# Additional scripts as they're implemented...
```

## Results

Results are logged to:
- Console output (detailed logging)
- `poc-results.json` (structured data for analysis)

## GitHub Issues

Progress tracked in GitHub issues:
- #35: Phase 1 - Authentication Testing
- #36: Phase 2 - Core Provisioning
- #37: Phase 3 - Validation & Analysis
- #38: Final POC Report

## Documentation

See `docs/poc/POC_PROGRESS.md` for detailed progress tracking and findings.