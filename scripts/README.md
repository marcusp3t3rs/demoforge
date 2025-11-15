# DemoForge Azure Setup Scripts

This directory contains automation scripts for setting up the DemoForge multi-tenant Azure AD application and related infrastructure.

## 🚀 Quick Start

### Prerequisites

1. **Azure CLI**: Install from [https://docs.microsoft.com/en-us/cli/azure/install-azure-cli](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
2. **jq**: JSON processor - `brew install jq` (macOS) or `apt-get install jq` (Linux)
3. **DemoForge Admin Access**: You need Global Administrator or Application Administrator permissions

### Basic Setup

```bash
# 1. Login to Azure with DemoForge admin account
az login

# 2. Run the setup script
./scripts/setup-demoforge-app.sh development

# 3. The script will create:
#    - Multi-tenant Azure AD application
#    - Required API permissions for Epic 1
#    - Client secret
#    - .env.development file with configuration
```

## 📋 Scripts Overview

### `setup-demoforge-app.sh`

**Primary setup script** that creates and configures the DemoForge multi-tenant application.

**Usage:**
```bash
./setup-demoforge-app.sh [environment]
```

**Environments:**
- `development` (default) - Local development setup
- `staging` - Staging environment  
- `production` - Production deployment

**What it does:**
1. ✅ Creates multi-tenant Azure AD application
2. ✅ Configures redirect URIs for the environment
3. ✅ Sets Microsoft Graph API permissions
4. ✅ Generates client secret (2-year validity)
5. ✅ Creates environment-specific `.env` file
6. ✅ Provides admin consent URL for testing

## 🔐 Security & Permissions

### Required Permissions (Epic 1)

**Delegated Permissions:**
- `User.Read` - Basic profile (E1-US1)
- `openid` - Authentication (E1-US1)  
- `profile` - User profile (E1-US1)
- `offline_access` - Refresh tokens (E1-US1)
- `Files.ReadWrite.All` - OneDrive provisioning (E1-US1)

**Application Permissions:**
- `User.Read.All` - Read users (E1-US3)
- `Directory.Read.All` - Read directory (E1-US1)
- `User.ReadWrite.All` - Manage users (E1-US3)
- `Directory.ReadWrite.All` - Admin consent (E1-US2)

### Client Secret Management

**Development:**
- Stored in `.env.development` (git-ignored)
- 2-year validity for convenience

**Production:**
- Use Azure Key Vault or similar secret management
- Implement secret rotation
- Monitor expiration dates

## 🏗️ Multi-Environment Support

### Development Setup
```bash
./setup-demoforge-app.sh development
# Creates: .env.development
# Redirect: http://localhost:3000/auth/callback
```

### Staging Setup
```bash
./setup-demoforge-app.sh staging
# Creates: .env.staging  
# Redirect: https://staging.demoforge.com/auth/callback
```

### Production Setup
```bash
./setup-demoforge-app.sh production
# Creates: .env.production
# Redirect: https://app.demoforge.com/auth/callback
```

## 🧪 Testing the Setup

### 1. Verify Application Creation
```bash
# Check if app was created
az ad app list --display-name "DemoForge Tenant Management"
```

### 2. Test Admin Consent
```bash
# Use the admin consent URL from script output
# https://login.microsoftonline.com/common/adminconsent?client_id=YOUR_APP_ID
```

### 3. Validate Environment Configuration
```bash
# Check generated environment file
cat .env.development

# Should contain:
# DEMOFORGE_CLIENT_ID="..."
# DEMOFORGE_CLIENT_SECRET="..."
```

## 🔄 Updating Permissions

When adding new Epic 1 features that require additional permissions:

1. **Update** `../config/app-permissions.json`
2. **Re-run** setup script: `./setup-demoforge-app.sh development`
3. **Test** admin consent flow
4. **Update** all environments

## 🚨 Troubleshooting

### Common Issues

**"Application already exists"**
- Script will prompt to update existing app
- Choose 'y' to update permissions and configuration

**"Insufficient privileges"**
- Ensure you're logged in with Global Administrator role
- Check tenant permissions for app registration

**"jq command not found"**
- Install jq: `brew install jq` or `apt-get install jq`

**"az command not found"**
- Install Azure CLI: [Installation Guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

### Debug Mode

Run with verbose logging:
```bash
bash -x ./setup-demoforge-app.sh development
```

## 📚 Next Steps

After running the setup:

1. **Update Authentication Code**: Use `DEMOFORGE_CLIENT_ID` and `DEMOFORGE_CLIENT_SECRET`
2. **Test E1-US1 Flow**: Verify tenant admin authentication works
3. **Implement E1-US2**: Admin consent management
4. **Deploy Infrastructure**: Use generated configuration for deployment

## 🔗 Related Documentation

- [Epic 1 Implementation Guide](../docs/epics/epic-1-tenant-connection.md)
- [Authentication Architecture](../docs/authentication.md)
- [Azure AD Multi-Tenant Apps](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-convert-app-to-be-multi-tenant)