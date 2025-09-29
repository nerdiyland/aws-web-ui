# Architecture Guide

This document provides a comprehensive overview of the AWS Web UI infrastructure architecture, component interactions, and system design patterns.

## 🏗️ System Overview

The AWS Web UI infrastructure follows a modern, secure, and scalable architecture pattern using AWS managed services. The system is designed to deliver web applications with high performance, global distribution, and robust security controls.

### High-Level Architecture

**AI Image Generation Prompt for Architecture Diagram:**
```
Create a professional AWS architecture diagram with vibrant colors showing a secure web UI infrastructure. Use bright blues for AWS services, orange for data flow, and green for security components. The diagram should include:

- A colorful "Users/Browsers" icon (multiple people with devices) on the left in bright teal
- A large, prominent "Amazon CloudFront" logo/box in AWS orange in the center
- Two S3 bucket icons in AWS green: "Website Bucket" and "Login Bucket" 
- "Origin Access Identity" shield icon in gold between CloudFront and S3
- "Trusted Key Groups" security badge in purple
- "SSL Certificate" padlock icon in red
- Arrows showing data flow in bright blue with clear directional indicators
- All text labels must be clearly readable in bold, dark fonts
- Background should be light gray with subtle AWS cloud patterns
- Include the title "AWS Web UI Architecture" at the top in large, bold letters
- Add AWS logo watermark in bottom right corner
- Use modern, flat design style with rounded corners and drop shadows
```

## 🏢 Core Components

### 1. CDK Application Structure

#### Main Stack (`NerdiylandWebUi`)
```typescript
// Entry point orchestrating the entire infrastructure
├── Stack Configuration
├── WebUI Construct Integration  
├── Parameter Management
└── Output Generation
```

**Responsibilities:**
- Centralizes infrastructure configuration
- Manages stack-level properties and dependencies
- Provides consistent naming and tagging
- Coordinates resource creation across constructs

#### WebUI Construct (`WebUI`)
```typescript
// Core infrastructure construct
├── S3 Bucket Management
├── CloudFront Distribution
├── Security Configuration
├── Cache Policy Management
└── DNS and Certificate Setup
```

**Design Patterns:**
- **Construct Pattern**: Encapsulates related AWS resources
- **Configuration Pattern**: Externalized parameters for flexibility
- **Security-First Pattern**: Default secure configurations
- **Output Pattern**: Exposes important resource identifiers

### 2. Storage Layer (Amazon S3)

#### Website Bucket
- **Purpose**: Primary storage for web application files
- **Access Control**: Private bucket with OAI access only
- **Content Types**: HTML, CSS, JavaScript, images, assets
- **Lifecycle**: Managed by CDK with configurable removal policy

#### Login Bucket (External)
- **Purpose**: Centralized authentication page storage
- **Shared Resource**: Used across multiple applications
- **Content Types**: Authentication HTML pages and related assets
- **Security**: Same OAI access pattern as website bucket

```typescript
// S3 Configuration Pattern
Bucket Security Model:
├── Private by default
├── Origin Access Identity access
├── Resource-based policies
└── Encryption at rest (default)
```

### 3. Content Delivery Network (Amazon CloudFront)

#### Distribution Configuration
- **Global Edge Locations**: Low-latency content delivery
- **Custom Cache Behaviors**: Optimized for different content types
- **Security Headers**: Automatic HTTPS enforcement
- **Error Handling**: SPA-friendly error responses

#### Cache Behavior Hierarchy
```
Priority Order:
1. /login.html (Login bucket, 5min cache)
2. /apps-login.html (Login bucket, 5min cache)
3. /eth-login.html (Login bucket, 5min cache)
4. /idpresponse.html (Login bucket, 5min cache)
5. /apps-idpresponse.html (Login bucket, 5min cache)
6. /favicon.png (Website bucket, 5min cache)
7. /logo.png (Website bucket, 5min cache)
8. /css/* (Website bucket, long cache, signed)
9. /css/chunk-vendors* (Website bucket, long cache, public)
10. /js/* (Website bucket, long cache, signed)
11. /js/chunk-vendors* (Website bucket, long cache, public)
12. /assets/* (Website bucket, long cache, signed)
13. Default behavior (Website bucket, 5min cache, signed)
```

### 4. Security Layer

#### Origin Access Identity (OAI)
- **Function**: Secures S3 bucket access through CloudFront only
- **Implementation**: Canonical user principal with specific permissions
- **Scope**: Both website and login buckets
- **Benefits**: Prevents direct S3 access, maintains content privacy

#### Trusted Key Groups
- **Purpose**: Implements signed URL authentication
- **Components**: Public key infrastructure for content verification
- **Scope**: Protects application content (excludes vendor files)
- **Flexibility**: Supports key rotation and multiple keys

#### SSL/TLS Implementation
- **Certificate Source**: AWS Certificate Manager
- **Enforcement**: Automatic HTTP to HTTPS redirection
- **Protocols**: TLS 1.2+ only
- **Validation**: Domain validation required

## 🔄 Data Flow Patterns

### 1. Static Content Delivery

**AI Image Generation Prompt for Data Flow Diagram:**
```
Create a colorful step-by-step data flow diagram showing how static content is delivered through the AWS infrastructure:

- User browser icon in bright blue making a request
- DNS resolution step with purple cloud icons
- CloudFront edge location in AWS orange receiving the request
- Cache hit/miss decision diamond in yellow with YES/NO paths
- S3 origin fetch in green if cache miss
- Content delivery back to user with green success arrows
- All text must be in bold, high-contrast fonts (minimum 12pt)
- Title "Static Content Delivery Flow" in large letters at top
- Each step numbered clearly with white text on colored circles
- Include technical details like "TTL", "Edge Cache", "Origin Fetch"
- Modern tech aesthetic with gradients and professional styling
- Background with subtle network patterns
```

```
User Request → CloudFront Edge → Cache Check
                    ↓
            [Cache Hit] → Deliver Content
                    ↓
            [Cache Miss] → S3 Origin → Cache Store → Deliver Content
```

### 2. Authentication Flow

**AI Image Generation Prompt for Authentication Flow:**
```
Design a colorful step-by-step authentication flow diagram with vibrant colors and clear text. Include:

- Three distinct user personas icons in different bright colors (standard user in blue, app user in green, ETH user in purple)
- Login pages represented as browser windows with different colored frames
- CloudFront distribution as a central hub with orange AWS branding
- S3 login bucket with authentication icons in bright yellow
- Trusted key verification process with golden security badges
- Success/redirect arrows in bright green
- Error handling paths in red with warning icons
- All text must be in bold, high-contrast fonts (minimum 12pt)
- Title "Multi-Method Authentication Flow" in large letters at top
- Each step numbered clearly with white text on colored circles
- Modern tech aesthetic with gradients and professional styling
- Ensure all technical terms like "apps-login.html", "eth-login.html", "idpresponse.html" are clearly visible
```

```
User Access Attempt → CloudFront → Authentication Check
                           ↓
                    [Unauthenticated] → Redirect to Login Bucket
                           ↓
                    Login Page Selection:
                    ├── /login.html (Standard)
                    ├── /apps-login.html (Apps)
                    └── /eth-login.html (ETH)
                           ↓
                    Authentication Process → IDP Response
                           ↓
                    Signed URL Generation → Content Access
```

### 3. Error Handling Flow

```
Request → CloudFront → Content Check
              ↓
        [404 Not Found] → Redirect to /index.html (SPA Routing)
              ↓
        [403 Forbidden] → Redirect to Login Page
              ↓
        [Other Errors] → Standard HTTP Error Response
```

## 🎯 Performance Architecture

### Caching Strategy Design

**AI Image Generation Prompt for Caching Strategy:**
```
Create a vibrant technical diagram showing CloudFront caching strategies with colorful time-based visual elements:

- Content types as colorful file icons: HTML (red), CSS (blue), JS (yellow), Images (green)
- TTL timelines as colorful progress bars with different lengths
- Short cache (5 minutes) in bright red with clock icon
- Long cache (1-3 years) in deep blue with calendar icon
- Cache behaviors as flowing pathways in rainbow colors
- Performance metrics as speedometer icons in bright orange
- All cache duration text must be clearly readable in bold fonts
- Title "CloudFront Caching Strategy" in large, prominent letters
- Include legend with color coding for different cache policies
- Modern dashboard-style layout with charts and graphs
- Ensure technical details like "Duration.days(365)" are legible
- AWS branding colors throughout with professional gradients
```

#### Cache Policy Matrix

| Content Type | TTL | Signed URLs | Reasoning |
|--------------|-----|-------------|-----------|
| **HTML Pages** | 5 minutes | Yes* | Dynamic content, frequent updates |
| **CSS Files** | 1-3 years | Yes | Static assets, versioned |
| **JS Files** | 1-3 years | Yes | Static assets, versioned |
| **Vendor Chunks** | 1-3 years | No | Public libraries, stable |
| **Images/Assets** | 1-3 years | Yes | Static resources, versioned |
| **Auth Pages** | 5 minutes | No | Login flows, dynamic |

*Authentication pages exempt from signed URLs

#### Performance Optimizations

1. **Edge Caching**: Global distribution reduces latency
2. **Compression**: Automatic gzip/brotli compression
3. **HTTP/2**: Enhanced protocol support
4. **Regional Edge Caches**: Secondary cache layer
5. **Origin Request Optimization**: Minimized origin traffic

## 🛡️ Security Architecture

### Defense in Depth Strategy

**AI Image Generation Prompt for Security Architecture:**
```
Design a comprehensive security architecture diagram with bold, vibrant security-themed colors:

- Central shield icon in bright gold representing the security layer
- Signed URLs depicted as encrypted chains in silver/blue
- Origin Access Identity as a guardian figure in AWS orange
- Public key infrastructure shown as interconnected key icons in bright green
- HTTPS enforcement with padlock symbols in red
- Bucket policies as protective barriers in purple
- User access levels in different colored zones (public in green, restricted in yellow, private in red)
- All security policy names must be clearly readable in bold white text on colored backgrounds
- Title "Web UI Security Architecture" in large, bold security-themed font
- Include "TRUSTED" and "VERIFIED" badges in prominent positions
- Professional cybersecurity aesthetic with modern icons
- Ensure all technical terms are clearly visible and legible
```

#### Security Layers

1. **Network Layer**
   - TLS 1.2+ encryption
   - HTTPS enforcement
   - Secure headers

2. **Access Control Layer**
   - Origin Access Identity
   - Signed URL authentication
   - Trusted key groups

3. **Content Protection Layer**
   - Private S3 buckets
   - CloudFront-only access
   - Resource-based policies

4. **Authentication Layer**
   - Multiple auth methods
   - Secure token handling
   - Session management

### Access Control Matrix

| Resource Type | Public Access | Authenticated Access | Admin Access |
|---------------|---------------|---------------------|--------------|
| **Vendor JS/CSS** | ✅ Direct | ✅ Direct | ✅ Direct |
| **App Content** | ❌ None | ✅ Signed URLs | ✅ Signed URLs |
| **Auth Pages** | ✅ Limited | ✅ Direct | ✅ Direct |
| **Admin Content** | ❌ None | ❌ None | ✅ Signed URLs |

## 🔧 Configuration Patterns

### Environment-Specific Configurations

```typescript
// Development Environment
{
  aliases: ['dev.example.com'],
  priceClass: PriceClass.PRICE_CLASS_100,
  cachePolicies: 'short-ttl'
}

// Production Environment  
{
  aliases: ['www.example.com', 'example.com'],
  priceClass: PriceClass.PRICE_CLASS_ALL,
  cachePolicies: 'optimized-ttl'
}
```

### Extensibility Patterns

The architecture supports extension through:

1. **Additional Origins**: New S3 buckets or HTTP origins
2. **Custom Behaviors**: Path-based routing rules
3. **Enhanced Security**: Additional key groups or policies
4. **Performance Tuning**: Custom cache policies
5. **Monitoring**: CloudWatch integration points

## 📊 Monitoring and Observability

### Built-in Monitoring Points

1. **CloudFront Metrics**
   - Request count and error rates
   - Cache hit ratios
   - Origin response times

2. **S3 Metrics**
   - Storage utilization
   - Request patterns
   - Error rates

3. **Certificate Monitoring**
   - Expiration tracking
   - Validation status

### Logging Strategy

- **CloudFront Access Logs**: Request-level details
- **S3 Access Logs**: Origin access patterns  
- **CDK Deployment Logs**: Infrastructure changes
- **Application Logs**: Client-side telemetry

## 🚀 Deployment Architecture

### Infrastructure as Code

The entire architecture is defined using AWS CDK, providing:

- **Version Control**: Infrastructure changes tracked in Git
- **Reproducibility**: Consistent deployments across environments
- **Testing**: Synthetic testing of infrastructure components
- **Rollback**: Safe deployment rollback capabilities

### Deployment Pipeline

```
Code Changes → CDK Synthesis → CloudFormation → AWS Resources
      ↓              ↓              ↓              ↓
   Validation → Template Gen → Stack Update → Resource Update
```

## 🔄 Maintenance and Updates

### Update Strategies

1. **Rolling Updates**: Zero-downtime deployment
2. **Blue/Green**: Parallel environment deployment
3. **Canary**: Gradual traffic shifting
4. **Feature Flags**: Runtime configuration changes

### Backup and Recovery

- **S3 Versioning**: Content version history
- **CloudFormation**: Infrastructure state backup
- **Cross-Region**: Multi-region disaster recovery
- **Point-in-Time**: Specific version restoration

---

This architecture provides a solid foundation for scalable, secure web application hosting while maintaining flexibility for future enhancements and modifications.
