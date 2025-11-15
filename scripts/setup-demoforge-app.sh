#!/bin/bash

# ================================================================
# DemoForge Azure App Registration Setup Script
# ================================================================
# 
# This script automates the creation of a multi-tenant Azure AD application
# for DemoForge with all required permissions for Epic 1 implementation.
#
# Prerequisites:
# - Azure CLI installed and authenticated
# - DemoForge admin credentials with sufficient permissions
# - jq installed for JSON processing
#
# Usage:
#   ./setup-demoforge-app.sh [environment]
#   
# Environment options: development, staging, production (default: development)
#
# ================================================================

set -euo pipefail  # Exit on any error, undefined variables, or pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$(dirname "$SCRIPT_DIR")/config"
PERMISSIONS_FILE="$CONFIG_DIR/app-permissions.json"

# Default values
ENVIRONMENT="${1:-development}"
APP_NAME="DemoForge Tenant Management"
HOMEPAGE_URL="https://demoforge.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check jq
    if ! command -v jq &> /dev/null; then
        log_error "jq is not installed. Please install it for JSON processing."
        exit 1
    fi
    
    # Check if logged in to Azure
    if ! az ad signed-in-user show &> /dev/null; then
        log_error "Not logged in to Azure. Please run 'az login' first."
        exit 1
    fi
    
    # Check permissions file
    if [[ ! -f "$PERMISSIONS_FILE" ]]; then
        log_error "Permissions file not found: $PERMISSIONS_FILE"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Get environment-specific configuration
get_environment_config() {
    local env="$1"
    
    case "$env" in
        "development")
            REDIRECT_URIS='["http://localhost:3000/auth/callback","http://localhost:3001/auth/callback"]'
            ;;
        "staging")
            REDIRECT_URIS='["https://staging.demoforge.com/auth/callback"]'
            ;;
        "production")
            REDIRECT_URIS='["https://app.demoforge.com/auth/callback"]'
            ;;
        *)
            log_error "Unknown environment: $env"
            exit 1
            ;;
    esac
    
    log_info "Environment: $env"
    log_info "Redirect URIs: $(echo "$REDIRECT_URIS" | jq -r '.[]' | tr '\n' ' ')"
}

# Create Azure AD application
create_azure_app() {
    log_info "Creating Azure AD application..."
    
    # Check if app already exists
    local existing_app
    existing_app=$(az ad app list --display-name "$APP_NAME" --query "[0].appId" -o tsv 2>/dev/null || echo "")
    
    if [[ -n "$existing_app" && "$existing_app" != "null" ]]; then
        log_warning "Application '$APP_NAME' already exists with App ID: $existing_app"
        read -p "Do you want to update the existing app? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Exiting without changes."
            exit 0
        fi
        APP_ID="$existing_app"
    else
        # Create new application
        log_info "Creating new multi-tenant application..."
        
        APP_ID=$(az ad app create \
            --display-name "$APP_NAME" \
            --sign-in-audience AzureADMultipleOrgs \
            --web-home-page-url "$HOMEPAGE_URL" \
            --query "appId" -o tsv)
        
        if [[ -z "$APP_ID" ]]; then
            log_error "Failed to create Azure AD application"
            exit 1
        fi
        
        log_success "Created application with App ID: $APP_ID"
    fi
    
    # Get object ID for the application
    APP_OBJECT_ID=$(az ad app show --id "$APP_ID" --query "id" -o tsv)
    log_info "Application Object ID: $APP_OBJECT_ID"
}

# Configure redirect URIs
configure_redirect_uris() {
    log_info "Configuring redirect URIs..."
    
    # Update redirect URIs for web platform
    local redirect_uri_args=""
    for uri in $(echo "$REDIRECT_URIS" | jq -r '.[]'); do
        redirect_uri_args="$redirect_uri_args --web-redirect-uris $uri"
    done
    
    az ad app update --id "$APP_ID" $redirect_uri_args
    
    log_success "Configured redirect URIs"
}

# Set API permissions
set_api_permissions() {
    log_info "Setting API permissions..."
    
    # Extract required resource access from permissions file
    local required_resource_access
    required_resource_access=$(jq -c '.requiredResourceAccess' "$PERMISSIONS_FILE")
    
    # Update application with required permissions
    az ad app update --id "$APP_ID" \
        --required-resource-accesses "$required_resource_access"
    
    log_success "API permissions configured"
    
    # Display permissions for review
    log_info "Configured permissions:"
    jq -r '.permissions.delegated[] | "  Delegated: \(.permission) - \(.purpose)"' "$PERMISSIONS_FILE"
    jq -r '.permissions.application[] | "  Application: \(.permission) - \(.purpose)"' "$PERMISSIONS_FILE"
}

# Create client secret
create_client_secret() {
    log_info "Creating client secret..."
    
    local secret_name="DemoForge-$ENVIRONMENT-$(date +%Y%m%d)"
    
    # Create secret (valid for 2 years)
    local secret_response
    secret_response=$(az ad app credential reset --id "$APP_ID" \
        --display-name "$secret_name" \
        --years 2 \
        --query "{appId: appId, password: password}" -o json)
    
    CLIENT_SECRET=$(echo "$secret_response" | jq -r '.password')
    
    if [[ -z "$CLIENT_SECRET" || "$CLIENT_SECRET" == "null" ]]; then
        log_error "Failed to create client secret"
        exit 1
    fi
    
    log_success "Client secret created successfully"
    log_warning "⚠️  Store this secret securely - it won't be shown again!"
}

# Store configuration
store_configuration() {
    log_info "Storing configuration..."
    
    local env_file=".env.$ENVIRONMENT"
    local backup_file=".env.$ENVIRONMENT.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Backup existing file if it exists
    if [[ -f "$env_file" ]]; then
        cp "$env_file" "$backup_file"
        log_info "Backed up existing $env_file to $backup_file"
    fi
    
    # Create/update environment file
    cat > "$env_file" << EOF
# DemoForge Azure App Registration Configuration
# Generated on $(date)
# Environment: $ENVIRONMENT

# Azure Multi-Tenant Application
DEMOFORGE_CLIENT_ID="$APP_ID"
DEMOFORGE_CLIENT_SECRET="$CLIENT_SECRET"
DEMOFORGE_APP_NAME="$APP_NAME"

# Authentication URLs
NEXTAUTH_URL="$(echo "$REDIRECT_URIS" | jq -r '.[0]' | sed 's|/auth/callback||')"
MICROSOFT_REDIRECT_URI="$(echo "$REDIRECT_URIS" | jq -r '.[0]')"

# OneDrive Provisioning (Enhanced from POC)
ONEDRIVE_FORCE_PROVISIONING="true"
ONEDRIVE_MAX_WAIT_TIME="180"
ONEDRIVE_RETRY_ATTEMPTS="3"

# Application Settings
NODE_ENV="$ENVIRONMENT"
LOG_LEVEL="debug"

# Security
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
EOF
    
    log_success "Configuration saved to $env_file"
}

# Display summary
display_summary() {
    log_success "🎉 DemoForge Azure App Setup Complete!"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}Application Details:${NC}"
    echo "  App Name: $APP_NAME"
    echo "  App ID: $APP_ID"
    echo "  Environment: $ENVIRONMENT"
    echo "  Multi-tenant: Yes"
    echo
    echo -e "${GREEN}Redirect URIs:${NC}"
    echo "$REDIRECT_URIS" | jq -r '.[] | "  " + .'
    echo
    echo -e "${GREEN}API Permissions:${NC}"
    echo "  Microsoft Graph API permissions configured"
    echo "  See config/app-permissions.json for details"
    echo
    echo -e "${GREEN}Configuration:${NC}"
    echo "  Environment file: .env.$ENVIRONMENT"
    echo "  Client secret: *** (stored securely)"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Review the generated .env.$ENVIRONMENT file"
    echo "2. Update your application to use DEMOFORGE_CLIENT_ID and DEMOFORGE_CLIENT_SECRET"
    echo "3. Test the authentication flow"
    echo "4. For production: Set up proper secret management (Azure Key Vault, etc.)"
    echo
    echo -e "${BLUE}Admin Consent URL (for testing):${NC}"
    echo "https://login.microsoftonline.com/common/adminconsent?client_id=$APP_ID"
    echo
}

# Main execution
main() {
    echo "════════════════════════════════════════════════════════════════════════════════"
    echo "🚀 DemoForge Azure App Registration Setup"
    echo "════════════════════════════════════════════════════════════════════════════════"
    echo
    
    check_prerequisites
    get_environment_config "$ENVIRONMENT"
    create_azure_app
    configure_redirect_uris
    set_api_permissions
    create_client_secret
    store_configuration
    display_summary
}

# Run main function
main "$@"