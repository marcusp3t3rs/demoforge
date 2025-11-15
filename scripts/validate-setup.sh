#!/bin/bash

# ================================================================
# DemoForge Environment Validation Script
# ================================================================
# 
# Validates that the Azure app setup was successful and all
# required environment variables are properly configured.
#
# Usage: ./validate-setup.sh [environment]
# ================================================================

set -euo pipefail

# Configuration
ENVIRONMENT="${1:-development}"
ENV_FILE=".env.$ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Load environment variables
load_environment() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file not found: $ENV_FILE"
        log_info "Run ./setup-demoforge-app.sh $ENVIRONMENT first"
        exit 1
    fi
    
    source "$ENV_FILE"
    log_success "Loaded environment: $ENVIRONMENT"
}

# Validate required variables
validate_variables() {
    local missing_vars=()
    
    # Required variables
    local required_vars=(
        "DEMOFORGE_CLIENT_ID"
        "DEMOFORGE_CLIENT_SECRET"
        "NEXTAUTH_URL"
        "MICROSOFT_REDIRECT_URI"
    )
    
    log_info "Validating required environment variables..."
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        else
            log_success "✓ $var: ${!var:0:20}..."
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
}

# Test Azure AD application
test_azure_app() {
    log_info "Testing Azure AD application..."
    
    if ! command -v az &> /dev/null; then
        log_warning "Azure CLI not found. Skipping Azure AD validation."
        return
    fi
    
    # Check if app exists
    local app_exists
    app_exists=$(az ad app show --id "$DEMOFORGE_CLIENT_ID" --query "appId" -o tsv 2>/dev/null || echo "")
    
    if [[ -n "$app_exists" ]]; then
        log_success "✓ Azure AD application found: $DEMOFORGE_CLIENT_ID"
        
        # Get app details
        local app_name
        app_name=$(az ad app show --id "$DEMOFORGE_CLIENT_ID" --query "displayName" -o tsv)
        log_info "  App Name: $app_name"
        
        # Check if multitenant
        local available_to_other_tenants
        available_to_other_tenants=$(az ad app show --id "$DEMOFORGE_CLIENT_ID" --query "signInAudience" -o tsv)
        if [[ "$available_to_other_tenants" == "AzureADMultipleOrgs" ]]; then
            log_success "✓ Multi-tenant configuration enabled"
        else
            log_warning "⚠ Application is not configured as multi-tenant"
        fi
    else
        log_error "✗ Azure AD application not found: $DEMOFORGE_CLIENT_ID"
        log_info "Run ./setup-demoforge-app.sh $ENVIRONMENT to create it"
        exit 1
    fi
}

# Test authentication endpoints
test_endpoints() {
    log_info "Testing authentication endpoints..."
    
    # Test OpenID configuration endpoint
    local openid_url="https://login.microsoftonline.com/common/v2.0/.well-known/openid_configuration"
    
    if command -v curl &> /dev/null; then
        local response
        response=$(curl -s -w "%{http_code}" -o /dev/null "$openid_url")
        
        if [[ "$response" == "200" ]]; then
            log_success "✓ OpenID Connect discovery endpoint accessible"
        else
            log_warning "⚠ OpenID Connect endpoint returned: $response"
        fi
    else
        log_warning "curl not found. Skipping endpoint tests."
    fi
}

# Display configuration summary
display_summary() {
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}Configuration Summary:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    echo -e "${BLUE}Environment:${NC} $ENVIRONMENT"
    echo -e "${BLUE}Config File:${NC} $ENV_FILE"
    echo
    echo -e "${BLUE}Azure Application:${NC}"
    echo "  Client ID: $DEMOFORGE_CLIENT_ID"
    echo "  App Name: ${DEMOFORGE_APP_NAME:-DemoForge Tenant Management}"
    echo
    echo -e "${BLUE}Authentication URLs:${NC}"
    echo "  Base URL: $NEXTAUTH_URL"
    echo "  Redirect: $MICROSOFT_REDIRECT_URI"
    echo
    echo -e "${BLUE}OneDrive Configuration:${NC}"
    echo "  Force Provisioning: ${ONEDRIVE_FORCE_PROVISIONING:-true}"
    echo "  Max Wait Time: ${ONEDRIVE_MAX_WAIT_TIME:-180}s"
    echo "  Retry Attempts: ${ONEDRIVE_RETRY_ATTEMPTS:-3}"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    echo -e "${GREEN}✅ Setup validation completed successfully!${NC}"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Update your application to use the configuration from $ENV_FILE"
    echo "2. Test the authentication flow"
    echo "3. Verify admin consent works: https://login.microsoftonline.com/common/adminconsent?client_id=$DEMOFORGE_CLIENT_ID"
    echo
}

# Main execution
main() {
    echo "════════════════════════════════════════════════════════════════════════════════"
    echo "🔍 DemoForge Setup Validation"
    echo "════════════════════════════════════════════════════════════════════════════════"
    echo
    
    load_environment
    validate_variables
    test_azure_app
    test_endpoints
    display_summary
}

main "$@"