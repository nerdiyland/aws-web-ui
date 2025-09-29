# Code Examples and Snippets

This document provides practical code examples, implementation patterns, and reusable snippets for the AWS Web UI infrastructure.

## 📚 Table of Contents

- [Basic Implementation](#basic-implementation)
- [Configuration Patterns](#configuration-patterns)
- [Authentication Integration](#authentication-integration)
- [Content Management](#content-management)
- [Monitoring & Logging](#monitoring--logging)
- [Security Implementation](#security-implementation)
- [CI/CD Integration](#cicd-integration)
- [Advanced Use Cases](#advanced-use-cases)

## 🚀 Basic Implementation

### Minimal Setup

The simplest possible deployment configuration:

```typescript
// bin/aws-web-ui.ts
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NerdiylandWebUi } from '../lib/nerdiyland-web-ui-stack';

const app = new cdk.App();

new NerdiylandWebUi(app, 'SimpleWebUI', {
  certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/your-cert-id',
  loginBucketName: 'your-login-bucket',
  originAccessIdentityCanonicalUserId: 'YOUR_OAI_CANONICAL_USER_ID',
  originAccessIdentityName: 'your-oai-name',
  viewersPublicKeyId: 'K2YOURPUBLICKEY123',
});
```

### Standard Production Setup

Production-ready configuration with all recommended settings:

```typescript
// bin/aws-web-ui.ts
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NerdiylandWebUi } from '../lib/nerdiyland-web-ui-stack';

const app = new cdk.App();

new NerdiylandWebUi(app, 'ProductionWebUI', {
  // Environment specification
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: 'us-east-1'
  },
  
  // Stack configuration
  stackName: 'production-web-ui-stack',
  description: 'Production Web UI Infrastructure with enhanced security',
  terminationProtection: true,
  
  // Tags for resource management
  tags: {
    Environment: 'production',
    Project: 'web-ui',
    Owner: 'platform-team',
    CostCenter: 'engineering',
    Backup: 'daily'
  },
  
  // WebUI specific configuration
  certificateArn: process.env.CERTIFICATE_ARN!,
  deliveryAliases: ['www.example.com', 'example.com'],
  loginBucketName: process.env.LOGIN_BUCKET_NAME!,
  originAccessIdentityCanonicalUserId: process.env.OAI_CANONICAL_USER_ID!,
  originAccessIdentityName: process.env.OAI_NAME!,
  viewersPublicKeyId: process.env.PUBLIC_KEY_ID!,
});
```

## ⚙️ Configuration Patterns

### Environment-Based Configuration

```typescript
// config/environments.ts
export interface EnvironmentConfig {
  certificateArn: string;
  loginBucketName: string;
  originAccessIdentityCanonicalUserId: string;
  originAccessIdentityName: string;
  viewersPublicKeyId: string;
  deliveryAliases?: string[];
  terminationProtection?: boolean;
  priceClass?: string;
}

export const environments: Record<string, EnvironmentConfig> = {
  development: {
    certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/dev-cert',
    loginBucketName: 'dev-auth-bucket',
    originAccessIdentityCanonicalUserId: 'DEV_OAI_CANONICAL_USER_ID',
    originAccessIdentityName: 'dev-oai',
    viewersPublicKeyId: 'K2DEV123456789',
    deliveryAliases: ['dev.example.com'],
    terminationProtection: false,
  },
  
  staging: {
    certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/staging-cert',
    loginBucketName: 'staging-auth-bucket',
    originAccessIdentityCanonicalUserId: 'STAGING_OAI_CANONICAL_USER_ID',
    originAccessIdentityName: 'staging-oai',
    viewersPublicKeyId: 'K2STAGING123456789',
    deliveryAliases: ['staging.example.com'],
    terminationProtection: false,
  },
  
  production: {
    certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/prod-cert',
    loginBucketName: 'prod-auth-bucket',
    originAccessIdentityCanonicalUserId: 'PROD_OAI_CANONICAL_USER_ID',
    originAccessIdentityName: 'prod-oai',
    viewersPublicKeyId: 'K2PROD123456789',
    deliveryAliases: ['www.example.com', 'example.com'],
    terminationProtection: true,
  }
};

// bin/aws-web-ui.ts
import { environments } from '../config/environments';

const environment = process.env.ENVIRONMENT || 'development';
const config = environments[environment];

if (!config) {
  throw new Error(`Unknown environment: ${environment}`);
}

const app = new cdk.App();
new NerdiylandWebUi(app, `WebUI-${environment}`, config);
```

### Configuration Validation

```typescript
// utils/config-validator.ts
import { EnvironmentConfig } from '../config/environments';

export class ConfigValidator {
  static validate(config: EnvironmentConfig): void {
    const errors: string[] = [];
    
    // Validate certificate ARN format
    if (!config.certificateArn.startsWith('arn:aws:acm:us-east-1:')) {
      errors.push('Certificate ARN must be in us-east-1 region');
    }
    
    // Validate public key ID format
    if (!config.viewersPublicKeyId.match(/^K2[A-Z0-9]{10,}$/)) {
      errors.push('Invalid public key ID format');
    }
    
    // Validate bucket name format
    if (!config.loginBucketName.match(/^[a-z0-9.-]+$/)) {
      errors.push('Invalid bucket name format');
    }
    
    // Validate domain names
    if (config.deliveryAliases) {
      config.deliveryAliases.forEach(domain => {
        if (!domain.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
          errors.push(`Invalid domain format: ${domain}`);
        }
      });
    }
    
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  }
}

// Usage in bin/aws-web-ui.ts
import { ConfigValidator } from '../utils/config-validator';

const config = environments[environment];
ConfigValidator.validate(config);
```

## 🔐 Authentication Integration

### Signed URL Generation

```typescript
// utils/signed-url-generator.ts
import * as crypto from 'crypto';
import * as fs from 'fs';

export class SignedURLGenerator {
  private privateKey: string;
  private publicKeyId: string;
  
  constructor(privateKeyPath: string, publicKeyId: string) {
    this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    this.publicKeyId = publicKeyId;
  }
  
  generateSignedURL(url: string, expiresIn: number = 3600): string {
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    
    const policy = {
      Statement: [
        {
          Resource: url,
          Condition: {
            DateLessThan: {
              'AWS:EpochTime': expires
            }
          }
        }
      ]
    };
    
    const policyString = JSON.stringify(policy).replace(/\s/g, '');
    const policyBase64 = Buffer.from(policyString).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    const signature = crypto.createSign('RSA-SHA1')
      .update(policyString)
      .sign(this.privateKey, 'base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return `${url}?Policy=${policyBase64}&Signature=${signature}&Key-Pair-Id=${this.publicKeyId}`;
  }
}

// Usage example
const signer = new SignedURLGenerator('/path/to/private-key.pem', 'K2EXAMPLE123456');
const signedURL = signer.generateSignedURL('https://d123456789.cloudfront.net/app.html', 3600);
```

### Authentication Middleware

```typescript
// middleware/auth-middleware.ts
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export class AuthMiddleware {
  private jwtSecret: string;
  
  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret;
  }
  
  authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = this.extractToken(req);
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
  
  authorize = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const hasRole = roles.some(role => req.user!.roles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    };
  };
  
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    
    // Check for token in cookies
    return req.cookies?.token || null;
  }
}

// Usage example
import express from 'express';
const app = express();
const auth = new AuthMiddleware(process.env.JWT_SECRET!);

app.use('/api/protected', auth.authenticate);
app.use('/api/admin', auth.authenticate, auth.authorize(['admin']));
```

## 📁 Content Management

### S3 Upload Helper

```typescript
// utils/s3-uploader.ts
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import * as mime from 'mime-types';
import * as fs from 'fs';
import * as path from 'path';

export class S3Uploader {
  private s3Client: S3Client;
  private bucketName: string;
  
  constructor(bucketName: string, region: string = 'us-east-1') {
    this.s3Client = new S3Client({ region });
    this.bucketName = bucketName;
  }
  
  async uploadFile(filePath: string, s3Key?: string): Promise<string> {
    const fileContent = fs.readFileSync(filePath);
    const key = s3Key || path.basename(filePath);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    
    const cacheControl = this.getCacheControl(filePath);
    
    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: cacheControl,
    };
    
    await this.s3Client.send(new PutObjectCommand(params));
    return `s3://${this.bucketName}/${key}`;
  }
  
  async uploadDirectory(directoryPath: string, s3Prefix: string = ''): Promise<string[]> {
    const files = this.getFilesRecursively(directoryPath);
    const uploadPromises = files.map(async (filePath) => {
      const relativePath = path.relative(directoryPath, filePath);
      const s3Key = s3Prefix ? `${s3Prefix}/${relativePath}` : relativePath;
      return this.uploadFile(filePath, s3Key);
    });
    
    return Promise.all(uploadPromises);
  }
  
  private getCacheControl(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    // Long cache for static assets
    if (['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2'].includes(ext)) {
      return 'public, max-age=31536000, immutable'; // 1 year
    }
    
    // Short cache for HTML
    if (['.html', '.htm'].includes(ext)) {
      return 'public, max-age=300'; // 5 minutes
    }
    
    // Default cache
    return 'public, max-age=3600'; // 1 hour
  }
  
  private getFilesRecursively(dir: string): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursively(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}

// Usage example
const uploader = new S3Uploader('my-website-bucket');

// Upload single file
await uploader.uploadFile('./dist/index.html');

// Upload entire directory
await uploader.uploadDirectory('./dist', 'v1.0.0');
```

### CloudFront Cache Invalidation

```typescript
// utils/cache-invalidator.ts
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

export class CacheInvalidator {
  private cloudFrontClient: CloudFrontClient;
  
  constructor(region: string = 'us-east-1') {
    this.cloudFrontClient = new CloudFrontClient({ region });
  }
  
  async invalidateCache(distributionId: string, paths: string[] = ['/*']): Promise<string> {
    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `invalidation-${Date.now()}`,
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
      },
    });
    
    const response = await this.cloudFrontClient.send(command);
    return response.Invalidation!.Id!;
  }
  
  async waitForInvalidation(distributionId: string, invalidationId: string): Promise<void> {
    // Implementation for waiting until invalidation completes
    let status = 'InProgress';
    
    while (status === 'InProgress') {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const { GetInvalidationCommand } = await import('@aws-sdk/client-cloudfront');
      const command = new GetInvalidationCommand({
        DistributionId: distributionId,
        Id: invalidationId,
      });
      
      const response = await this.cloudFrontClient.send(command);
      status = response.Invalidation!.Status!;
    }
  }
}

// Usage example
const invalidator = new CacheInvalidator();
const invalidationId = await invalidator.invalidateCache('E1234567890ABC', ['/index.html', '/app/*']);
await invalidator.waitForInvalidation('E1234567890ABC', invalidationId);
```

## 📊 Monitoring & Logging

### CloudWatch Metrics Dashboard

```typescript
// monitoring/dashboard.ts
import { Construct } from 'constructs';
import { Dashboard, GraphWidget, Metric, SingleValueWidget } from 'aws-cdk-lib/aws-cloudwatch';

export class WebUIMonitoringDashboard extends Construct {
  constructor(scope: Construct, id: string, distributionId: string) {
    super(scope, id);
    
    const dashboard = new Dashboard(this, 'WebUIDashboard', {
      dashboardName: 'WebUI-Monitoring',
    });
    
    // Request metrics
    const requestCount = new Metric({
      namespace: 'AWS/CloudFront',
      metricName: 'Requests',
      dimensionsMap: {
        DistributionId: distributionId,
      },
      statistic: 'Sum',
    });
    
    const cacheHitRate = new Metric({
      namespace: 'AWS/CloudFront',
      metricName: 'CacheHitRate',
      dimensionsMap: {
        DistributionId: distributionId,
      },
      statistic: 'Average',
    });
    
    const errorRate4xx = new Metric({
      namespace: 'AWS/CloudFront',
      metricName: '4xxErrorRate',
      dimensionsMap: {
        DistributionId: distributionId,
      },
      statistic: 'Average',
    });
    
    const errorRate5xx = new Metric({
      namespace: 'AWS/CloudFront',
      metricName: '5xxErrorRate',
      dimensionsMap: {
        DistributionId: distributionId,
      },
      statistic: 'Average',
    });
    
    // Add widgets to dashboard
    dashboard.addWidgets(
      new SingleValueWidget({
        title: 'Total Requests (24h)',
        metrics: [requestCount],
        width: 6,
        height: 3,
      }),
      
      new SingleValueWidget({
        title: 'Cache Hit Rate',
        metrics: [cacheHitRate],
        width: 6,
        height: 3,
      }),
      
      new GraphWidget({
        title: 'Request Volume',
        left: [requestCount],
        width: 12,
        height: 6,
      }),
      
      new GraphWidget({
        title: 'Error Rates',
        left: [errorRate4xx, errorRate5xx],
        width: 12,
        height: 6,
      }),
      
      new GraphWidget({
        title: 'Cache Performance',
        left: [cacheHitRate],
        width: 12,
        height: 6,
      })
    );
  }
}
```

### Custom Logging Solution

```typescript
// utils/logger.ts
import { createLogger, format, transports } from 'winston';
import { CloudWatchLogs } from 'aws-sdk';

export class WebUILogger {
  private logger: any;
  private cloudWatchLogs: CloudWatchLogs;
  
  constructor(logGroupName: string, logStreamName: string) {
    this.cloudWatchLogs = new CloudWatchLogs();
    
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        }),
        new transports.File({
          filename: 'webui-error.log',
          level: 'error'
        }),
        new transports.File({
          filename: 'webui-combined.log'
        })
      ]
    });
  }
  
  async logSecurityEvent(event: {
    type: 'authentication' | 'authorization' | 'access_denied';
    userId?: string;
    ip: string;
    userAgent: string;
    resource: string;
    success: boolean;
    metadata?: any;
  }) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      category: 'security',
      ...event
    };
    
    this.logger.warn('Security event', logEntry);
    
    // Send to CloudWatch for alerting
    await this.sendToCloudWatch(logEntry);
  }
  
  async logPerformanceMetric(metric: {
    operation: string;
    duration: number;
    success: boolean;
    metadata?: any;
  }) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'performance',
      ...metric
    };
    
    this.logger.info('Performance metric', logEntry);
  }
  
  private async sendToCloudWatch(logEntry: any) {
    // Implementation for sending logs to CloudWatch
    // This would require proper setup of log groups and streams
  }
}

// Usage example
const logger = new WebUILogger('webui-logs', 'application-stream');

// Log security event
await logger.logSecurityEvent({
  type: 'authentication',
  userId: 'user123',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  resource: '/api/protected',
  success: true
});

// Log performance metric
await logger.logPerformanceMetric({
  operation: 'page_load',
  duration: 1250,
  success: true,
  metadata: { page: '/dashboard' }
});
```

## 🔒 Security Implementation

### WAF Integration

```typescript
// security/waf-rules.ts
import { Construct } from 'constructs';
import { CfnWebACL, CfnIPSet } from 'aws-cdk-lib/aws-wafv2';

export class WebUIWAF extends Construct {
  public readonly webAclArn: string;
  
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    // Create IP sets for whitelisting/blacklisting
    const allowedIPs = new CfnIPSet(this, 'AllowedIPs', {
      scope: 'CLOUDFRONT',
      ipAddressVersion: 'IPV4',
      addresses: [
        '203.0.113.0/24',  // Office network
        '198.51.100.0/24', // Partner network
      ],
      description: 'Allowed IP addresses',
    });
    
    // Create Web ACL
    const webAcl = new CfnWebACL(this, 'WebUIWebACL', {
      scope: 'CLOUDFRONT',
      defaultAction: { allow: {} },
      description: 'Web ACL for WebUI protection',
      
      rules: [
        {
          name: 'RateLimitRule',
          priority: 1,
          statement: {
            rateBasedStatement: {
              limit: 1000,
              aggregateKeyType: 'IP',
            },
          },
          action: { block: {} },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'RateLimitRule',
          },
        },
        
        {
          name: 'IPWhitelistRule',
          priority: 2,
          statement: {
            ipSetReferenceStatement: {
              arn: allowedIPs.attrArn,
            },
          },
          action: { allow: {} },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'IPWhitelistRule',
          },
        },
        
        {
          name: 'SQLInjectionRule',
          priority: 3,
          statement: {
            sqliMatchStatement: {
              fieldToMatch: {
                allQueryArguments: {},
              },
              textTransformations: [
                {
                  priority: 0,
                  type: 'URL_DECODE',
                },
                {
                  priority: 1,
                  type: 'HTML_ENTITY_DECODE',
                },
              ],
            },
          },
          action: { block: {} },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'SQLInjectionRule',
          },
        },
      ],
    });
    
    this.webAclArn = webAcl.attrArn;
  }
}
```

### Security Headers Implementation

```typescript
// security/security-headers.ts
import { Construct } from 'constructs';
import { ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Duration } from 'aws-cdk-lib';

export class SecurityHeaders extends Construct {
  public readonly responseHeadersPolicy: ResponseHeadersPolicy;
  
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    this.responseHeadersPolicy = new ResponseHeadersPolicy(this, 'SecurityHeadersPolicy', {
      responseHeadersPolicyName: 'WebUI-Security-Headers',
      comment: 'Security headers for WebUI',
      
      securityHeadersBehavior: {
        strictTransportSecurity: {
          accessControlMaxAge: Duration.seconds(63072000), // 2 years
          includeSubdomains: true,
          preload: true,
        },
        contentTypeOptions: {
          override: true,
        },
        frameOptions: {
          frameOption: 'DENY',
          override: true,
        },
        xssProtection: {
          modeBlock: true,
          protection: true,
          override: true,
        },
        referrerPolicy: {
          referrerPolicy: 'strict-origin-when-cross-origin',
          override: true,
        },
      },
      
      customHeadersBehavior: {
        customHeaders: [
          {
            header: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https://api.example.com",
            ].join('; '),
            override: true,
          },
          {
            header: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
            ].join(', '),
            override: true,
          },
        ],
      },
    });
  }
}
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy WebUI Infrastructure

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  AWS_REGION: 'us-east-1'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test
        
      - name: Run linting
        run: npm run lint
        
      - name: Security audit
        run: npm audit --audit-level moderate
        
      - name: Build project
        run: npm run build

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Deploy to production
        run: |
          npm run build
          cdk deploy --require-approval never
        env:
          ENVIRONMENT: production
          CERTIFICATE_ARN: ${{ secrets.PROD_CERTIFICATE_ARN }}
          LOGIN_BUCKET_NAME: ${{ secrets.PROD_LOGIN_BUCKET_NAME }}
          OAI_CANONICAL_USER_ID: ${{ secrets.PROD_OAI_CANONICAL_USER_ID }}
          OAI_NAME: ${{ secrets.PROD_OAI_NAME }}
          PUBLIC_KEY_ID: ${{ secrets.PROD_PUBLIC_KEY_ID }}
          
      - name: Upload content to S3
        run: |
          BUCKET_NAME=$(aws cloudformation describe-stacks \
            --stack-name WebUI-production \
            --query 'Stacks[0].Outputs[?OutputKey==`WebUIBucketName`].OutputValue' \
            --output text)
          aws s3 sync ./dist s3://$BUCKET_NAME --delete
          
      - name: Invalidate CloudFront cache
        run: |
          DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
            --stack-name WebUI-production \
            --query 'Stacks[0].Outputs[?OutputKey==`WebUIDistributionId`].OutputValue' \
            --output text)
          aws cloudfront create-invalidation \
            --distribution-id $DISTRIBUTION_ID \
            --paths "/*"
```

### AWS CodePipeline Integration

```yaml
# buildspec.yml for AWS CodeBuild
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm install -g aws-cdk
      
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - npm ci
      - npm run test
      - npm audit --audit-level moderate
      
  build:
    commands:
      - echo Build started on `date`
      - npm run build
      - cdk synth
      
  post_build:
    commands:
      - echo Build completed on `date`
      - cdk deploy --require-approval never

artifacts:
  files:
    - '**/*'
  name: webui-build
```

## 🚀 Advanced Use Cases

### Multi-Region Deployment

```typescript
// advanced/multi-region-stack.ts
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { NerdiylandWebUi } from '../lib/nerdiyland-web-ui-stack';

export interface MultiRegionWebUIProps extends StackProps {
  primaryRegion: string;
  failoverRegion: string;
  certificateArn: string;
  loginBucketName: string;
  originAccessIdentityCanonicalUserId: string;
  originAccessIdentityName: string;
  viewersPublicKeyId: string;
  deliveryAliases?: string[];
}

export class MultiRegionWebUI extends Stack {
  constructor(scope: Construct, id: string, props: MultiRegionWebUIProps) {
    super(scope, id, props);
    
    // Primary region deployment
    const primary = new NerdiylandWebUi(this, 'PrimaryWebUI', {
      env: { region: props.primaryRegion },
      certificateArn: props.certificateArn,
      loginBucketName: props.loginBucketName,
      originAccessIdentityCanonicalUserId: props.originAccessIdentityCanonicalUserId,
      originAccessIdentityName: props.originAccessIdentityName,
      viewersPublicKeyId: props.viewersPublicKeyId,
      deliveryAliases: props.deliveryAliases,
    });
    
    // Failover region deployment
    const failover = new NerdiylandWebUi(this, 'FailoverWebUI', {
      env: { region: props.failoverRegion },
      certificateArn: props.certificateArn,
      loginBucketName: `${props.loginBucketName}-failover`,
      originAccessIdentityCanonicalUserId: props.originAccessIdentityCanonicalUserId,
      originAccessIdentityName: `${props.originAccessIdentityName}-failover`,
      viewersPublicKeyId: props.viewersPublicKeyId,
    });
    
    // Cross-region replication would be set up separately
  }
}
```

### Blue/Green Deployment Pattern

```typescript
// deployment/blue-green.ts
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { Alias, Function, Version } from 'aws-cdk-lib/aws-lambda';
import { LambdaEdgeEventType, Distribution } from 'aws-cdk-lib/aws-cloudfront';

export class BlueGreenDeployment extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    // Lambda@Edge function for traffic routing
    const routingFunction = new Function(this, 'TrafficRoutingFunction', {
      // Function configuration
    });
    
    // Blue version (current production)
    const blueVersion = new Version(this, 'BlueVersion', {
      lambda: routingFunction,
    });
    
    // Green version (new deployment)
    const greenVersion = new Version(this, 'GreenVersion', {
      lambda: routingFunction,
    });
    
    // Weighted alias for gradual traffic shifting
    const productionAlias = new Alias(this, 'ProductionAlias', {
      aliasName: 'production',
      version: blueVersion,
      additionalVersions: [
        {
          version: greenVersion,
          weight: 0.1, // Start with 10% traffic to green
        }
      ],
    });
  }
  
  // Method to shift traffic percentages
  shiftTraffic(greenPercentage: number) {
    // Implementation for updating alias weights
  }
}
```

### Custom Cache Invalidation Strategy

```typescript
// utils/smart-invalidator.ts
export class SmartCacheInvalidator {
  private cloudFrontClient: CloudFrontClient;
  private s3Client: S3Client;
  
  constructor() {
    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1' });
    this.s3Client = new S3Client({ region: 'us-east-1' });
  }
  
  async invalidateChangedFiles(
    bucketName: string, 
    distributionId: string,
    previousDeploymentTag?: string
  ): Promise<string[]> {
    const changedFiles = await this.getChangedFiles(bucketName, previousDeploymentTag);
    
    if (changedFiles.length === 0) {
      console.log('No files changed, skipping invalidation');
      return [];
    }
    
    // Intelligently batch invalidations
    const batches = this.createInvalidationBatches(changedFiles);
    const invalidationIds: string[] = [];
    
    for (const batch of batches) {
      const invalidationId = await this.invalidateCache(distributionId, batch);
      invalidationIds.push(invalidationId);
      
      // Wait between batches to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return invalidationIds;
  }
  
  private async getChangedFiles(bucketName: string, previousTag?: string): Promise<string[]> {
    // Implementation to compare current files with previous deployment
    // This could use S3 object metadata, Git diff, or deployment tags
    
    if (!previousTag) {
      return ['/*']; // Invalidate everything on first deployment
    }
    
    // Logic to determine changed files
    return []; // Placeholder
  }
  
  private createInvalidationBatches(files: string[], batchSize: number = 100): string[][] {
    const batches: string[][] = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    
    return batches;
  }
  
  private async invalidateCache(distributionId: string, paths: string[]): Promise<string> {
    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `smart-invalidation-${Date.now()}-${Math.random()}`,
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
      },
    });
    
    const response = await this.cloudFrontClient.send(command);
    return response.Invalidation!.Id!;
  }
}
```

### Performance Monitoring Integration

```typescript
// monitoring/performance-monitor.ts
import { CloudWatch } from 'aws-sdk';

export class PerformanceMonitor {
  private cloudWatch: CloudWatch;
  
  constructor() {
    this.cloudWatch = new CloudWatch();
  }
  
  async trackPageLoad(metrics: {
    page: string;
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    userId?: string;
  }) {
    const customMetrics = [
      {
        MetricName: 'PageLoadTime',
        Value: metrics.loadTime,
        Unit: 'Milliseconds',
        Dimensions: [
          { Name: 'Page', Value: metrics.page }
        ]
      },
      {
        MetricName: 'FirstContentfulPaint',
        Value: metrics.firstContentfulPaint,
        Unit: 'Milliseconds',
        Dimensions: [
          { Name: 'Page', Value: metrics.page }
        ]
      },
      {
        MetricName: 'LargestContentfulPaint',
        Value: metrics.largestContentfulPaint,
        Unit: 'Milliseconds',
        Dimensions: [
          { Name: 'Page', Value: metrics.page }
        ]
      },
      {
        MetricName: 'CumulativeLayoutShift',
        Value: metrics.cumulativeLayoutShift,
        Unit: 'None',
        Dimensions: [
          { Name: 'Page', Value: metrics.page }
        ]
      }
    ];
    
    await this.cloudWatch.putMetricData({
      Namespace: 'WebUI/Performance',
      MetricData: customMetrics
    }).promise();
  }
  
  async createPerformanceAlerts() {
    // Create CloudWatch alarms for performance metrics
    const alarms = [
      {
        AlarmName: 'HighPageLoadTime',
        MetricName: 'PageLoadTime',
        Threshold: 3000, // 3 seconds
        ComparisonOperator: 'GreaterThanThreshold'
      },
      {
        AlarmName: 'PoorCoreWebVitals',
        MetricName: 'LargestContentfulPaint',
        Threshold: 2500, // 2.5 seconds
        ComparisonOperator: 'GreaterThanThreshold'
      }
    ];
    
    for (const alarm of alarms) {
      await this.cloudWatch.putMetricAlarm({
        AlarmName: alarm.AlarmName,
        MetricName: alarm.MetricName,
        Namespace: 'WebUI/Performance',
        Statistic: 'Average',
        Period: 300,
        EvaluationPeriods: 2,
        Threshold: alarm.Threshold,
        ComparisonOperator: alarm.ComparisonOperator,
        AlarmActions: [
          'arn:aws:sns:us-east-1:123456789012:performance-alerts'
        ]
      }).promise();
    }
  }
}
```

---

This comprehensive examples document provides practical, production-ready code patterns for implementing, securing, monitoring, and maintaining the AWS Web UI infrastructure across various use cases and environments.
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Deploy to staging
        run: |
          npm run build
          cdk deploy --require-approval never
        env:
          ENVIRONMENT: staging
          CERTIFICATE_ARN: ${{ secrets.STAGING_CERTIFICATE_ARN }}
          LOGIN_BUCKET_NAME: ${{ secrets.STAGING_LOGIN_BUCKET_NAME }}
          OAI_CANONICAL_USER_ID: ${{ secrets.STAGING_OAI_CANONICAL_USER_ID }}
          OAI_NAME: ${{ secrets.STAGING_OAI_NAME }}
          PUBLIC_KEY_ID: ${{ secrets.STAGING_PUBLIC_KEY_ID }}

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Configure AWS credentials
