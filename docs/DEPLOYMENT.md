# Deployment Guide

This comprehensive guide covers everything you need to know about deploying the AWS Web UI infrastructure, from initial setup to production deployment.

## 📚 Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [Step-by-Step Deployment](#step-by-step-deployment)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Multi-Environment Setup](#multi-environment-setup)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

## 📋 Prerequisites

### Required AWS Resources

Before deploying, ensure you have the following AWS resources prepared:

#### 1. SSL Certificate (AWS Certificate Manager)

**AI Image Generation Prompt for Certificate Setup:**
```
Create an engaging step-by-step diagram showing SSL certificate setup process with vibrant colors:

- AWS Certificate Manager console in bright AWS orange
- Domain validation process with green checkmarks
- Certificate status progression with colorful status indicators
- DNS validation steps with purple network icons
- Final certificate approval with golden success badges
- All text must be in bold, high-contrast fonts (minimum 12pt)
- Title "SSL Certificate Setup Process" in large letters at top
- Each step numbered clearly with white text on colored circles
- Include technical details like "us-east-1 region", "DNS validation", "Certificate ARN"
- Modern AWS console aesthetic with screenshots style layout
- Background with subtle AWS cloud patterns
```

```bash
# Create certificate via AWS CLI
aws acm request-certificate \
  --domain-name example.com \
  --subject-alternative-names www.example.com \
  --validation-method DNS \
  --region us-east-1
```

**Requirements:**
- Must be in `us-east-1` region (CloudFront requirement)
- Domain validation completed
- Includes all domains you plan to use as aliases
- Status must be "Issued" (not "Pending Validation")

#### 2. CloudFront Public Key

Upload your public key for signed URL authentication:

```bash
# Upload public key via AWS CLI
aws cloudfront create-public-key \
  --public-key-config Name=WebUIPublicKey,EncodedKey="$(cat public-key.pem)",CallerReference="webui-$(date +%s)"
```

#### 3. Origin Access Identity (OAI)

Create or identify existing OAI:

```bash
# Create OAI via AWS CLI
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config CallerReference="webui-oai-$(date +%s)",Comment="WebUI OAI"

# Get canonical user ID for existing OAI
aws cloudfront get-cloud-front-origin-access-identity --id E74FTE3AEXAMPLE
```

#### 4. Authentication S3 Bucket

Create or identify the bucket containing login pages:

```bash
# Create login bucket
aws s3 mb s3://my-auth-bucket --region us-east-1

# Upload authentication pages
aws s3 cp login.html s3://my-auth-bucket/
aws s3 cp apps-login.html s3://my-auth-bucket/
aws s3 cp eth-login.html s3://my-auth-bucket/
```

### Development Environment

#### Required Tools

| Tool | Version | Installation |
|------|---------|--------------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 8+ | Included with Node.js |
| **AWS CLI** | 2.x | [AWS CLI Installation](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) |
| **AWS CDK** | 2.x | `npm install -g aws-cdk` |
| **Git** | 2.x | [git-scm.com](https://git-scm.com/) |

#### AWS Credentials

Configure AWS credentials with appropriate permissions:

```bash
# Configure AWS credentials
aws configure

# Or use AWS SSO
aws configure sso

# Verify credentials
aws sts get-caller-identity
```

**Required IAM Permissions:**
- CloudFormation full access
- S3 full access
- CloudFront full access
- Certificate Manager read access
- IAM role creation and policy attachment

## 🚀 Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/aws-web-ui.git
cd aws-web-ui

# Install dependencies
npm install

# Verify installation
npm run build
```

### 2. CDK Bootstrap

Bootstrap CDK in your target AWS account (one-time setup):

```bash
# Bootstrap for default region
cdk bootstrap

# Bootstrap for specific account/region
cdk bootstrap aws://123456789012/us-east-1

# Verify bootstrap
aws cloudformation describe-stacks --stack-name CDKToolkit
```

### 3. Gather Configuration Values

Collect the required configuration values:

```bash
# Get certificate ARN
aws acm list-certificates --region us-east-1

# Get public key ID
aws cloudfront list-public-keys

# Get OAI details
aws cloudfront list-cloud-front-origin-access-identities
```

## ⚙️ Environment Configuration

### Development Environment

Create `.env.development`:

```bash
# AWS Configuration
AWS_ACCOUNT=123456789012
AWS_REGION=us-east-1
ENVIRONMENT=development

# Certificate Configuration
CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/dev-cert-id
DOMAIN_ALIASES=dev.example.com

# Authentication Configuration
LOGIN_BUCKET_NAME=dev-auth-bucket
PUBLIC_KEY_ID=K2DEV123456789

# OAI Configuration
OAI_NAME=dev-webui-oai
OAI_CANONICAL_USER_ID=A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6
```

### Production Environment

Create `.env.production`:

```bash
# AWS Configuration
AWS_ACCOUNT=123456789012
AWS_REGION=us-east-1
ENVIRONMENT=production

# Certificate Configuration
CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/prod-cert-id
DOMAIN_ALIASES=www.example.com,example.com

# Authentication Configuration
LOGIN_BUCKET_NAME=prod-auth-bucket
PUBLIC_KEY_ID=K2PROD123456789

# OAI Configuration
OAI_NAME=prod-webui-oai
OAI_CANONICAL_USER_ID=A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6

# Production Settings
TERMINATION_PROTECTION=true
```

### Configuration Loading

Update `bin/aws-web-ui.ts` to load environment configuration:

```typescript
import * as dotenv from 'dotenv';

// Load environment-specific configuration
const environment = process.env.ENVIRONMENT || 'development';
dotenv.config({ path: `.env.${environment}` });

const app = new cdk.App();

new NerdiylandWebUi(app, `WebUI-${environment}`, {
  env: {
    account: process.env.AWS_ACCOUNT,
    region: process.env.AWS_REGION
  },
  certificateArn: process.env.CERTIFICATE_ARN!,
  deliveryAliases: process.env.DOMAIN_ALIASES?.split(','),
  loginBucketName: process.env.LOGIN_BUCKET_NAME!,
  originAccessIdentityCanonicalUserId: process.env.OAI_CANONICAL_USER_ID!,
  originAccessIdentityName: process.env.OAI_NAME!,
  viewersPublicKeyId: process.env.PUBLIC_KEY_ID!,
  terminationProtection: process.env.TERMINATION_PROTECTION === 'true'
});
```

## 🎯 Step-by-Step Deployment

### Phase 1: Pre-Deployment Validation

**AI Image Generation Prompt for Deployment Process:**
```
Create an engaging step-by-step deployment flowchart with vibrant process colors:

- Developer workstation icon in bright blue at the start
- CDK CLI commands as colorful terminal windows with green text
- AWS services activating in sequence with orange deployment arrows
- Progress indicators showing deployment stages in rainbow colors
- Success checkmarks in bright green at each completed step
- Certificate setup process with golden security icons
- DNS configuration with network symbols in purple
- Final verification with celebration elements in multiple bright colors
- All command text like "npm run build", "cdk deploy" must be clearly readable
- Title "Deployment Process Flow" in large, professional letters
- Step numbers in white text on colored circular badges
- Modern DevOps aesthetic with pipeline-style layout
- Ensure all technical commands and parameters are legible
```

#### 1.1 Validate Configuration

```bash
# Validate environment configuration
./scripts/validate-config.sh

# Check AWS credentials
aws sts get-caller-identity

# Verify certificate exists
aws acm describe-certificate --certificate-arn $CERTIFICATE_ARN --region us-east-1

# Verify public key exists
aws cloudfront get-public-key --id $PUBLIC_KEY_ID

# Verify OAI exists
aws cloudfront get-cloud-front-origin-access-identity --id $OAI_NAME
```

#### 1.2 Synthesize CloudFormation

```bash
# Generate CloudFormation template
npm run build
cdk synth

# Review generated template
cdk synth > template.yaml
less template.yaml
```

#### 1.3 Validate Resources

```bash
# Check for deployment conflicts
cdk diff

# Validate template
aws cloudformation validate-template --template-body file://template.yaml
```

### Phase 2: Infrastructure Deployment

#### 2.1 Deploy Stack

```bash
# Deploy with approval prompts
cdk deploy

# Deploy without prompts (CI/CD)
cdk deploy --require-approval never

# Deploy with specific parameters
cdk deploy --parameters ParameterName=Value
```

#### 2.2 Monitor Deployment

```bash
# Watch CloudFormation events
aws cloudformation describe-stack-events --stack-name WebUI-development

# Monitor stack status
watch -n 5 'aws cloudformation describe-stacks --stack-name WebUI-development --query "Stacks[0].StackStatus"'
```

#### 2.3 Verify Deployment

```bash
# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name WebUI-development \
  --query 'Stacks[0].Outputs'

# Test CloudFront distribution
curl -I https://$DISTRIBUTION_DOMAIN
```

### Phase 3: Content Deployment

#### 3.1 Upload Website Content

```bash
# Get bucket name from stack outputs
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name WebUI-development \
  --query 'Stacks[0].Outputs[?OutputKey==`WebUIBucketName`].OutputValue' \
  --output text)

# Upload website files
aws s3 sync ./dist s3://$BUCKET_NAME --delete

# Set cache control headers
aws s3 cp ./dist s3://$BUCKET_NAME \
  --recursive \
  --cache-control "max-age=31536000" \
  --exclude "*.html" \
  --exclude "service-worker.js"

# Upload HTML with short cache
aws s3 cp ./dist s3://$BUCKET_NAME \
  --recursive \
  --cache-control "max-age=300" \
  --exclude "*" \
  --include "*.html"
```

#### 3.2 Invalidate CloudFront Cache

```bash
# Get distribution ID
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name WebUI-development \
  --query 'Stacks[0].Outputs[?OutputKey==`WebUIDistributionId`].OutputValue' \
  --output text)

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

# Monitor invalidation
aws cloudfront get-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --id INVALIDATION_ID
```

## 🔧 Post-Deployment Configuration

### DNS Configuration

#### Route 53 Setup

```bash
# Create Route 53 records for custom domains
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://dns-changes.json
```

Example `dns-changes.json`:

```json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.example.com",
        "Type": "A",
        "AliasTarget": {
          "DNSName": "d123456789.cloudfront.net",
          "EvaluateTargetHealth": false,
          "HostedZoneId": "Z2FDTNDATAQYW2"
        }
      }
    }
  ]
}
```

### Security Headers

Configure additional security headers:

```bash
# Create response headers policy
aws cloudfront create-response-headers-policy \
  --response-headers-policy-config file://security-headers.json
```

### Monitoring Setup

```bash
# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name WebUI-Dashboard \
  --dashboard-body file://dashboard.json

# Set up alarms
aws cloudwatch put-metric-alarm \
  --alarm-name WebUI-4xx-Errors \
  --alarm-description "High 4xx error rate" \
  --metric-name 4xxErrorRate \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

## 🏢 Multi-Environment Setup

### Environment Isolation Strategy

#### Separate AWS Accounts

```bash
# Deploy to development account
export AWS_PROFILE=dev-account
cdk deploy --context environment=development

# Deploy to production account
export AWS_PROFILE=prod-account
cdk deploy --context environment=production
```

#### Single Account with Isolation

```bash
# Deploy development stack
cdk deploy WebUI-development

# Deploy staging stack
cdk deploy WebUI-staging

# Deploy production stack
cdk deploy WebUI-production
```

### CI/CD Pipeline Integration

#### GitHub Actions Example

```yaml
name: Deploy WebUI

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Deploy CDK
        run: cdk deploy --require-approval never
        env:
          ENVIRONMENT: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Certificate Issues

**Problem**: `Certificate not found`

```bash
# Verify certificate exists in us-east-1
aws acm list-certificates --region us-east-1

# Check certificate status
aws acm describe-certificate --certificate-arn $CERTIFICATE_ARN --region us-east-1
```

**Solution**: Ensure certificate is in us-east-1 and status is "ISSUED"

#### OAI Issues

**Problem**: `Origin Access Identity does not exist`

```bash
# List all OAIs
aws cloudfront list-cloud-front-origin-access-identities

# Create new OAI if needed
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config CallerReference="webui-$(date +%s)"
```

#### Public Key Issues

**Problem**: `Public key not found`

```bash
# List public keys
aws cloudfront list-public-keys

# Upload new public key
aws cloudfront create-public-key \
  --public-key-config Name=WebUIKey,EncodedKey="$(cat public-key.pem)",CallerReference="key-$(date +%s)"
```

### Performance Issues

#### Slow Content Delivery

1. **Check cache hit ratio**:
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name CacheHitRate \
  --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID \
  --start-time 2023-01-01T00:00:00Z \
  --end-time 2023-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

2. **Optimize cache policies**:
- Review TTL settings
- Check query string and header forwarding
- Validate compression settings

### Security Issues

#### Access Denied Errors

1. **Check bucket policy**:
```bash
aws s3api get-bucket-policy --bucket $BUCKET_NAME
```

2. **Verify OAI permissions**:
```bash
aws s3api get-bucket-acl --bucket $BUCKET_NAME
```

## 🔄 Rollback Procedures

### Emergency Rollback

#### 1. Quick Content Rollback

```bash
# Revert to previous S3 version
aws s3api restore-object \
  --bucket $BUCKET_NAME \
  --key index.html \
  --version-id PREVIOUS_VERSION_ID

# Immediate cache invalidation
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

#### 2. Infrastructure Rollback

```bash
# Rollback to previous stack version
cdk deploy --rollback

# Or destroy and redeploy previous version
git checkout PREVIOUS_COMMIT
cdk deploy
```

### Planned Rollback

#### Blue/Green Deployment

1. **Deploy new version to staging**
2. **Test thoroughly**
3. **Switch DNS gradually**
4. **Monitor metrics**
5. **Complete cutover or rollback**

### Disaster Recovery

#### Cross-Region Backup

```bash
# Replicate S3 content to backup region
aws s3 sync s3://$PRIMARY_BUCKET s3://$BACKUP_BUCKET --region us-west-2

# Update Route 53 for failover
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://failover-dns.json
```

---

This deployment guide provides comprehensive instructions for successfully deploying and managing the AWS Web UI infrastructure across different environments and scenarios.
