# API Reference

This document provides comprehensive API documentation for all interfaces, types, and configuration options in the AWS Web UI infrastructure.

## 📚 Table of Contents

- [Stack Interfaces](#stack-interfaces)
- [Construct Interfaces](#construct-interfaces)
- [Configuration Examples](#configuration-examples)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## 🏗️ Stack Interfaces

### `NerdiylandWebUiProps`

Main stack configuration interface that extends AWS CDK's `StackProps`.

```typescript
interface NerdiylandWebUiProps extends StackProps {
  certificateArn: string;
  deliveryAliases?: string[];
  viewersPublicKeyId: string;
  loginBucketName: string;
  originAccessIdentityName: string;
  originAccessIdentityCanonicalUserId: string;
}
```

#### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `certificateArn` | `string` | ARN of the SSL certificate in AWS Certificate Manager (ACM). Must be in us-east-1 region for CloudFront. | `"arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012"` |
| `viewersPublicKeyId` | `string` | CloudFront public key ID for signed URL authentication. | `"K2EXAMPLE123456"` |
| `loginBucketName` | `string` | Name of the existing S3 bucket containing authentication pages. | `"my-app-auth-bucket"` |
| `originAccessIdentityName` | `string` | Name of the existing CloudFront Origin Access Identity. | `"my-oai-name"` |
| `originAccessIdentityCanonicalUserId` | `string` | Canonical user ID of the Origin Access Identity for S3 bucket policies. | `"A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6"` |

#### Optional Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `deliveryAliases` | `string[]` | Custom domain names for the CloudFront distribution. Requires valid certificate. | `["www.example.com", "example.com"]` |

#### Inherited from StackProps

All standard AWS CDK `StackProps` are available:

```typescript
{
  env?: Environment;           // AWS account and region
  stackName?: string;          // Custom stack name
  description?: string;        // Stack description
  tags?: { [key: string]: string }; // Resource tags
  terminationProtection?: boolean;  // Deletion protection
}
```

## 🔧 Construct Interfaces

### `WebUIProps`

Configuration interface for the WebUI construct.

```typescript
interface WebUIProps {
  deploymentName?: string;
  aliases?: string[];
  acmCertificateArn?: string;
  viewersPublicKeyId: string;
  loginBucketName: string;
  OriginAccessIdentityName: string;
  OriginAccessIdentityCanonicalUserId: string;
  AppsLoginUrl?: string;
}
```

#### Property Details

| Property | Type | Required | Description | Default |
|----------|------|----------|-------------|---------|
| `deploymentName` | `string` | No | Name prefix for CloudFront deployment resources | `undefined` |
| `aliases` | `string[]` | No | Domain names for the distribution | `undefined` |
| `acmCertificateArn` | `string` | No* | SSL certificate ARN from ACM | `undefined` |
| `viewersPublicKeyId` | `string` | Yes | Public key ID for signed URLs | - |
| `loginBucketName` | `string` | Yes | S3 bucket name for auth pages | - |
| `OriginAccessIdentityName` | `string` | Yes | Existing OAI name | - |
| `OriginAccessIdentityCanonicalUserId` | `string` | Yes | OAI canonical user ID | - |
| `AppsLoginUrl` | `string` | No | Custom apps login URL for error redirects | `undefined` |

*Required if `aliases` is specified.

## 📝 Configuration Examples

### Basic Configuration

Minimal setup for development or testing:

```typescript
import { NerdiylandWebUi } from './lib/nerdiyland-web-ui-stack';

const app = new cdk.App();

new NerdiylandWebUi(app, 'DevWebUi', {
  certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/dev-cert-id',
  loginBucketName: 'dev-auth-bucket',
  originAccessIdentityCanonicalUserId: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6',
  originAccessIdentityName: 'dev-oai',
  viewersPublicKeyId: 'K2DEV123456789',
});
```

### Production Configuration

Full production setup with custom domains:

```typescript
new NerdiylandWebUi(app, 'ProdWebUi', {
  // Stack properties
  env: {
    account: '123456789012',
    region: 'us-east-1'
  },
  stackName: 'production-web-ui',
  description: 'Production Web UI Infrastructure',
  terminationProtection: true,
  tags: {
    Environment: 'production',
    Project: 'web-ui',
    Owner: 'platform-team'
  },

  // WebUI properties
  certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/prod-cert-id',
  deliveryAliases: ['www.example.com', 'example.com'],
  loginBucketName: 'prod-auth-bucket',
  originAccessIdentityCanonicalUserId: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6',
  originAccessIdentityName: 'prod-oai',
  viewersPublicKeyId: 'K2PROD123456789',
});
```

### Multi-Environment Configuration

Using environment-specific configurations:

```typescript
interface EnvironmentConfig extends NerdiylandWebUiProps {
  environment: string;
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    environment: 'development',
    certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/dev-cert',
    loginBucketName: 'dev-auth-bucket',
    originAccessIdentityCanonicalUserId: 'DEV_CANONICAL_USER_ID',
    originAccessIdentityName: 'dev-oai',
    viewersPublicKeyId: 'K2DEV123456',
    deliveryAliases: ['dev.example.com'],
  },
  staging: {
    environment: 'staging',
    certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/staging-cert',
    loginBucketName: 'staging-auth-bucket',
    originAccessIdentityCanonicalUserId: 'STAGING_CANONICAL_USER_ID',
    originAccessIdentityName: 'staging-oai',
    viewersPublicKeyId: 'K2STAGING123456',
    deliveryAliases: ['staging.example.com'],
  },
  production: {
    environment: 'production',
    certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/prod-cert',
    loginBucketName: 'prod-auth-bucket',
    originAccessIdentityCanonicalUserId: 'PROD_CANONICAL_USER_ID',
    originAccessIdentityName: 'prod-oai',
    viewersPublicKeyId: 'K2PROD123456',
    deliveryAliases: ['www.example.com', 'example.com'],
    terminationProtection: true,
  }
};

const environment = process.env.ENVIRONMENT || 'development';
const config = environments[environment];

new NerdiylandWebUi(app, `WebUi-${environment}`, config);
```

## 🏷️ Type Definitions

### AWS CDK Types

The project uses several AWS CDK types that are important to understand:

```typescript
// From aws-cdk-lib
import { 
  Duration,           // Time durations
  RemovalPolicy,      // Resource cleanup behavior
  StackProps         // Stack configuration
} from 'aws-cdk-lib';

// From CloudFront
import { 
  PriceClass,        // Geographic distribution pricing
  ViewerProtocolPolicy  // HTTPS enforcement options
} from 'aws-cdk-lib/aws-cloudfront';
```

### Custom Types

#### Environment Configuration

```typescript
type Environment = 'development' | 'staging' | 'production';

interface EnvironmentSettings {
  priceClass: PriceClass;
  cacheTtl: {
    short: Duration;
    long: Duration;
  };
  securityLevel: 'basic' | 'enhanced' | 'strict';
}
```

#### Cache Behavior Configuration

```typescript
interface CacheBehaviorSettings {
  path: string;
  ttl: Duration;
  signedUrls: boolean;
  origin: 'website' | 'login';
  viewerProtocolPolicy: ViewerProtocolPolicy;
}
```

## 🚨 Error Handling

### Common Configuration Errors

#### Invalid Certificate ARN

```typescript
// ❌ Incorrect - wrong region
certificateArn: 'arn:aws:acm:us-west-2:123456789012:certificate/...'

// ✅ Correct - us-east-1 required for CloudFront
certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/...'
```

#### Missing Required Dependencies

```typescript
// ❌ Incorrect - OAI doesn't exist
originAccessIdentityName: 'non-existent-oai'

// ✅ Correct - reference existing OAI
originAccessIdentityName: 'my-existing-oai'
```

#### Invalid Public Key Reference

```typescript
// ❌ Incorrect - key not uploaded to CloudFront
viewersPublicKeyId: 'K2NONEXISTENT123'

// ✅ Correct - valid CloudFront public key ID
viewersPublicKeyId: 'K2EXAMPLE123456'
```

### Error Messages and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Certificate not found` | Invalid certificate ARN or wrong region | Verify ARN and ensure certificate is in us-east-1 |
| `OAI does not exist` | Invalid Origin Access Identity name | Check OAI exists in CloudFront console |
| `Public key not found` | Invalid public key ID | Verify key is uploaded to CloudFront |
| `Invalid domain` | Domain not validated for certificate | Ensure domain is validated in ACM |

## 📋 Validation Rules

### Certificate Requirements

- Must be in `us-east-1` region
- Must be validated (not pending)
- Domain names must match aliases if specified
- Must support the domains in `deliveryAliases`

### Domain Name Requirements

```typescript
// Valid domain patterns
const validDomains = [
  'example.com',           // Apex domain
  'www.example.com',       // Subdomain
  '*.example.com',         // Wildcard (if certificate supports)
  'app.staging.example.com' // Multi-level subdomain
];

// Invalid domain patterns
const invalidDomains = [
  'http://example.com',    // No protocol
  'example.com/',          // No trailing slash
  'example.com:443',       // No port
];
```

### Public Key Requirements

- Must be uploaded to CloudFront
- Must be valid RSA public key
- Key ID format: `K2XXXXXXXXXX` (K2 prefix + 10 characters)

## 🔧 Advanced Configuration

### Custom Cache Policies

For advanced use cases, you can extend the construct to support custom cache policies:

```typescript
// Extended interface example
interface ExtendedWebUIProps extends WebUIProps {
  customCachePolicies?: {
    [path: string]: {
      ttl: Duration;
      compressionSupport?: boolean;
      queryStringBehavior?: 'none' | 'whitelist' | 'all';
    };
  };
}
```

### Multiple Origin Configuration

```typescript
interface MultiOriginWebUIProps extends WebUIProps {
  additionalOrigins?: {
    [pathPattern: string]: {
      bucketName: string;
      cacheTtl: Duration;
      requiresAuth: boolean;
    };
  };
}
```

## 🎯 Best Practices

### Configuration Management

1. **Environment Variables**: Use environment variables for sensitive data
2. **Parameter Store**: Store configuration in AWS Systems Manager
3. **Secrets Manager**: Use for sensitive values like private keys
4. **Version Control**: Never commit sensitive values to Git

### Security Configuration

```typescript
// Recommended security settings
const secureConfig: NerdiylandWebUiProps = {
  // ... other properties
  
  // Use environment variables for sensitive data
  certificateArn: process.env.CERTIFICATE_ARN!,
  viewersPublicKeyId: process.env.PUBLIC_KEY_ID!,
  
  // Enable termination protection for production
  terminationProtection: process.env.ENVIRONMENT === 'production',
  
  // Apply consistent tagging
  tags: {
    Environment: process.env.ENVIRONMENT || 'development',
    Project: 'web-ui',
    ManagedBy: 'cdk',
    CostCenter: 'engineering'
  }
};
```

### Resource Naming

```typescript
// Consistent naming convention
const stackName = `WebUI-${environment}-${region}`;
const constructId = `WebUI-${environment}`;

// Use descriptive resource names
const config = {
  deploymentName: `web-ui-${environment}`,
  // ... other properties
};
```

---

This API reference provides comprehensive documentation for configuring and using the AWS Web UI infrastructure. For implementation examples and deployment guidance, see the [Deployment Guide](DEPLOYMENT.md).
