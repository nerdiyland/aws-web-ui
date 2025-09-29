# AI Image Generation Prompts

This document contains detailed prompts for generating professional technical diagrams and illustrations for the AWS Web UI infrastructure documentation. Each prompt is designed to create vibrant, informative visuals that enhance the technical documentation.

## 📚 Table of Contents

- [Architecture Diagrams](#architecture-diagrams)
- [Security Visualizations](#security-visualizations)
- [Deployment Process Diagrams](#deployment-process-diagrams)
- [Flow and Process Diagrams](#flow-and-process-diagrams)
- [Performance and Monitoring](#performance-and-monitoring)
- [Certificate and Setup Processes](#certificate-and-setup-processes)
- [Usage Guidelines](#usage-guidelines)

## 🏗️ Architecture Diagrams

### Main Architecture Overview

**Purpose**: High-level system architecture showing all AWS services and their relationships

**Prompt**:
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

### Static Content Delivery Flow

**Purpose**: Show how content flows from S3 through CloudFront to users

**Prompt**:
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

### Caching Strategy Visualization

**Purpose**: Illustrate different cache policies and TTL strategies

**Prompt**:
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

## 🛡️ Security Visualizations

### Security Architecture Overview

**Purpose**: Comprehensive security model showing all protection layers

**Prompt**:
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

### Authentication Flow Diagram

**Purpose**: Multi-method authentication process visualization

**Prompt**:
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

### Access Control Matrix

**Purpose**: Visual representation of permission levels and access controls

**Prompt**:
```
Create a professional access control matrix diagram with clear security indicators:

- Table-style layout with colorful headers in AWS blue
- Resource types listed vertically with distinct icons for each type
- Access levels (Public, Authenticated, Admin) as column headers
- Green checkmarks for allowed access, red X marks for denied access
- Yellow warning icons for conditional access
- Security badges showing "SIGNED URLS REQUIRED" in gold
- All text in bold, professional fonts with high contrast
- Title "Access Control Matrix" in large, security-themed letters
- Include legend explaining symbols and color coding
- Professional enterprise security aesthetic
- Clean grid layout with clear boundaries between cells
```

## 🚀 Deployment Process Diagrams

### Complete Deployment Pipeline

**Purpose**: End-to-end deployment process from development to production

**Prompt**:
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

### Certificate Setup Process

**Purpose**: SSL certificate configuration and validation workflow

**Prompt**:
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

### Multi-Environment Deployment

**Purpose**: Deployment across development, staging, and production environments

**Prompt**:
```
Design a multi-environment deployment diagram with distinct color schemes for each environment:

- Development environment in bright blue tones with "DEV" badges
- Staging environment in vibrant yellow tones with "STAGING" badges
- Production environment in professional green tones with "PROD" badges
- Deployment pipelines connecting environments with animated arrows
- Configuration differences highlighted with colorful callout boxes
- Security levels increasing from left to right with shield intensity
- All environment names in large, bold letters
- Title "Multi-Environment Deployment Strategy" in prominent header
- Include technical details like stack names, regions, and configurations
- Modern DevOps aesthetic with clean separation between environments
- Progress indicators showing promotion path from dev to prod
```

## 🔄 Flow and Process Diagrams

### Error Handling Flow

**Purpose**: How different error types are handled and user experience

**Prompt**:
```
Create a comprehensive error handling flow diagram with clear color coding:

- Different error types (404, 403, 500) in distinct bright colors
- User request path in blue arrows
- Error detection points as warning triangles in orange
- Redirect paths in green for successful recoveries
- Login redirect flows in purple for authentication errors
- SPA routing for 404 errors in yellow paths
- All error codes in large, bold numbers
- Title "Error Handling & Recovery Flow" in prominent letters
- Include user experience annotations showing what users see
- Modern UX-focused design with user journey emphasis
- Clear distinction between different error scenarios
- Success and failure paths clearly marked
```

### Content Management Workflow

**Purpose**: S3 upload and CloudFront invalidation process

**Prompt**:
```
Design a content management workflow diagram with vibrant operational colors:

- Local development files in bright blue folders
- Build process represented as gear icons in orange
- S3 upload process with green upload arrows
- CloudFront invalidation shown as purple refresh symbols
- Cache clearing visualization with yellow sparkle effects
- Content types differentiated by colorful file icons
- All process names in bold, technical fonts
- Title "Content Management & Deployment Workflow" in large header
- Include timing indicators showing process duration
- Modern CI/CD aesthetic with automation emphasis
- Progress bars showing completion status
- Technical details like cache TTL values clearly visible
```

## 📊 Performance and Monitoring

### Monitoring Dashboard Layout

**Purpose**: CloudWatch dashboard design and metric visualization

**Prompt**:
```
Create a professional monitoring dashboard layout with vibrant data visualization:

- Multiple widget panels in AWS orange and blue color scheme
- Real-time metrics graphs with colorful line charts
- Performance indicators as gauge-style displays in green/yellow/red
- Alert status indicators with bright notification badges
- Request volume charts with gradient fills in blue tones
- Error rate displays with red warning indicators when high
- Cache hit ratio as circular progress indicators in green
- All metric names in bold, dashboard-style fonts
- Title "WebUI Monitoring Dashboard" in large, professional letters
- Include sample data showing healthy vs. unhealthy states
- Modern data visualization aesthetic with clean grid layout
- Color-coded severity levels throughout
```

### Performance Metrics Visualization

**Purpose**: Core Web Vitals and performance indicators

**Prompt**:
```
Design a performance metrics dashboard with vibrant health indicators:

- Core Web Vitals metrics as colorful gauge displays
- Page load times with speedometer-style visualizations in gradient colors
- Performance scores with color-coded ratings (green=good, yellow=needs improvement, red=poor)
- User experience metrics with person icons and satisfaction indicators
- Network performance with signal strength visualizations
- All metric values in large, readable numbers with units
- Title "Performance Metrics & Core Web Vitals" in prominent header
- Include benchmark lines showing optimal vs. actual performance
- Modern performance monitoring aesthetic with dashboard styling
- Real-time data visualization emphasis with live indicators
```

## 🔧 Certificate and Setup Processes

### Public Key Infrastructure Setup

**Purpose**: CloudFront public key and trusted key group configuration

**Prompt**:
```
Create a technical diagram showing public key infrastructure setup with security emphasis:

- RSA key generation process with mathematical symbols in bright colors
- Public key upload to CloudFront shown as secure transfer in green
- Trusted key groups formation with interconnected key icons in gold
- Private key storage in AWS Secrets Manager with vault imagery in blue
- Key rotation schedule with calendar and renewal symbols in purple
- All cryptographic terms in bold, technical fonts
- Title "Public Key Infrastructure Setup" in large, security-themed letters
- Include security best practices as highlighted callout boxes
- Professional cryptography aesthetic with modern security styling
- Mathematical formulas and key formats clearly displayed
- Color-coded security levels throughout the process
```

### DNS and Domain Configuration

**Purpose**: Route 53 and domain setup process

**Prompt**:
```
Design a DNS configuration diagram with networking-focused visuals:

- Domain registration process with colorful domain bubbles
- DNS propagation shown as network waves spreading globally
- Route 53 hosted zones with organized record layouts in AWS colors
- Certificate validation through DNS with checkmark confirmations
- Global distribution points with world map visualization
- All domain names and record types in clear, technical fonts
- Title "DNS & Domain Configuration" in large networking header
- Include propagation timing indicators with clock symbols
- Modern networking aesthetic with global connectivity emphasis
- Color-coded record types (A, CNAME, TXT) throughout
- Geographic distribution visualization with connecting lines
```

## 📋 Usage Guidelines

### Best Practices for Image Generation

#### Color Consistency
- **AWS Services**: Use official AWS orange (#FF9900) for AWS service icons
- **Security Elements**: Use gold/yellow for security badges and shields
- **Data Flow**: Use bright blue for arrows and data movement
- **Success States**: Use green for confirmations and successful operations
- **Warnings/Errors**: Use red for errors and critical alerts
- **Information**: Use purple for informational elements

#### Typography Requirements
- **Minimum Font Size**: 12pt for all text elements
- **Headers**: Use bold, large fonts for titles (minimum 18pt)
- **Technical Terms**: Ensure all technical terms are clearly readable
- **Contrast**: Use high contrast (white text on dark backgrounds, dark text on light backgrounds)

#### Visual Style Guidelines
- **Modern Flat Design**: Use contemporary flat design with subtle shadows
- **Professional Aesthetic**: Maintain enterprise-grade visual quality
- **Consistent Branding**: Include AWS branding elements where appropriate
- **Clear Hierarchy**: Use size, color, and positioning to establish visual hierarchy

#### Content Requirements
- **Accuracy**: Ensure all technical terms and service names are correct
- **Completeness**: Include all specified elements in each prompt
- **Clarity**: Make complex technical concepts visually understandable
- **Consistency**: Maintain visual consistency across all diagrams

### Recommended AI Tools

#### Suggested Platforms
1. **DALL-E 3**: Excellent for technical diagrams with text requirements
2. **Midjourney**: Great for professional, polished technical illustrations
3. **Stable Diffusion**: Good for customization and iteration
4. **Adobe Firefly**: Strong for enterprise-style technical graphics

#### Generation Tips
- **Iterate**: Generate multiple versions and combine best elements
- **Refine**: Use additional prompts to adjust specific elements
- **Validate**: Ensure all technical terms are correctly spelled and positioned
- **Optimize**: Adjust for clarity and readability at different sizes

### Post-Generation Guidelines

#### Quality Assurance
- ✅ Verify all technical terms are spelled correctly
- ✅ Ensure color coding is consistent across related diagrams
- ✅ Check that all required elements from the prompt are included
- ✅ Confirm text is readable at documentation display sizes
- ✅ Validate that the overall message is clear and accurate

#### Integration Notes
- **File Format**: Use PNG for crisp text and detailed diagrams
- **Resolution**: Generate at least 1920x1080 for documentation use
- **Accessibility**: Ensure sufficient color contrast for accessibility compliance
- **Documentation**: Include alt-text descriptions for screen readers

### Customization Instructions

#### Adapting for Specific Needs
- **Branding**: Replace generic elements with your organization's branding
- **Scale**: Adjust complexity based on your audience's technical level
- **Focus**: Emphasize aspects most relevant to your implementation
- **Context**: Add environment-specific details where applicable

#### Version Control
- **Naming**: Use descriptive filenames indicating diagram type and version
- **Updates**: Maintain consistency when updating diagrams for documentation changes
- **Archives**: Keep previous versions for reference and rollback if needed

---

These prompts are designed to create professional, informative visualizations that enhance the technical documentation and make complex AWS infrastructure concepts more accessible to developers, operators, and stakeholders.
