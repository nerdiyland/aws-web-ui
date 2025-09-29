import { CacheCookieBehavior, CacheHeaderBehavior, CachePolicy, Distribution, KeyGroup, OriginAccessIdentity, OriginRequestHeaderBehavior, OriginRequestPolicy, OriginRequestQueryStringBehavior, PriceClass, PublicKey, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { PolicyStatement, CanonicalUserPrincipal } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { CfnOutput, Duration, RemovalPolicy, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs'
import { S3BucketOrigin, HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

export interface WebUIProps {
  /**
   * Name of the CloudFront deployment
   */
  deploymentName?: string;

  /**
   * Aliases for accessing your distribution
   */
  aliases?: string[];

  /**
   * Certificate to use. Required if using aliases
   */
  acmCertificateArn?: string;

  /**
   * Public key material for app viewers
   */
  viewersPublicKeyId: string;

  loginBucketName: string;

  OriginAccessIdentityName: string;
  OriginAccessIdentityCanonicalUserId: string;

  AppsLoginUrl?: string;
}

export class WebUI extends Construct {

  /** @returns the website bucket */
  public readonly websiteBucket: Bucket;

  /** @returns the website distribution */
  public readonly websiteDistribution: Distribution;

  public readonly trustedKeyGroup: KeyGroup;

  constructor(scope: Construct, id: string, props: WebUIProps) {
    super(scope, id);

    const websiteOAI = OriginAccessIdentity.fromOriginAccessIdentityName(this, 'WebsiteOAI', props.OriginAccessIdentityName)

    // Create the S3 bucket
    this.websiteBucket = new Bucket(this, 'WebsiteBucket', {
      removalPolicy: RemovalPolicy.DESTROY
    });

    // Configure the bucket policy
    this.websiteBucket.addToResourcePolicy(new PolicyStatement({
      principals: [new CanonicalUserPrincipal(props.OriginAccessIdentityCanonicalUserId)],
      actions: [
        's3:GetObject',
        's3:ListBucket'
      ],
      resources: [
        this.websiteBucket.bucketArn,
        this.websiteBucket.arnForObjects('*')
      ]
    }));

    // Get login bucket
    const loginBucket = Bucket.fromBucketName(this, 'LoginBucket', props.loginBucketName);
    const trustedPublicKey = PublicKey.fromPublicKeyId(this, 'ViewersKey', props.viewersPublicKeyId);

    this.trustedKeyGroup = new KeyGroup(this, 'ViewersKeyGroup', {
      items: [
        trustedPublicKey
      ]
    });

    const defaultOrigin = S3BucketOrigin.withOriginAccessIdentity(this.websiteBucket, {
      originAccessIdentity: websiteOAI
    });

    const loginOrigin = S3BucketOrigin.withOriginAccessIdentity(loginBucket, {
      originAccessIdentity: websiteOAI,
    });

    // TODO Update this cache policy for production
    const defaultCachePolicy = new CachePolicy(this, 'DefaultCachePolicy', {
      minTtl: Duration.seconds(0),
      defaultTtl: Duration.minutes(5),
      maxTtl: Duration.hours(24),
    });

    const longStorageCachePolicy = new CachePolicy(this, 'LongStorageCachePolicy', {
      minTtl: Duration.days(365),
      defaultTtl: Duration.days(720),
      maxTtl: Duration.days(3650)
    });

    const certificate = Certificate.fromCertificateArn(this, 'WebsiteCertificate', props.acmCertificateArn!);

    this.websiteDistribution = new Distribution(this, 'WebsiteDistribution', {
      certificate,
      defaultRootObject: 'index.html',
      domainNames: props.aliases,
      defaultBehavior: {
        origin: defaultOrigin,
        cachePolicy: defaultCachePolicy,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        trustedKeyGroups: [this.trustedKeyGroup],
      },
      additionalBehaviors: {
        '/login.html': {
          origin: loginOrigin,
          cachePolicy: defaultCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        '/apps-login.html': {
          origin: loginOrigin,
          cachePolicy: defaultCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        },
        '/eth-login.html': {
          origin: loginOrigin,
          cachePolicy: defaultCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        },
        '/idpresponse.html': {
          origin: loginOrigin,
          cachePolicy: defaultCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        },
        '/apps-idpresponse.html': {
          origin: loginOrigin,
          cachePolicy: defaultCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        },
        '/favicon.png': {
          origin: defaultOrigin,
          cachePolicy: defaultCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        '/logo.png': {
          origin: defaultOrigin,
          cachePolicy: defaultCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        '/css/*': {
          origin: defaultOrigin,
          cachePolicy: longStorageCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
          trustedKeyGroups: [this.trustedKeyGroup]
        },
        '/css/chunk-vendors*': {
          origin: defaultOrigin,
          cachePolicy: longStorageCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        },
        '/js/*': {
          origin: defaultOrigin,
          cachePolicy: longStorageCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
          trustedKeyGroups: [this.trustedKeyGroup]
        },
        '/js/chunk-vendors*': {
          origin: defaultOrigin,
          cachePolicy: longStorageCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        },
        '/assets/*': {
          origin: defaultOrigin,
          cachePolicy: longStorageCachePolicy,
          viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
          trustedKeyGroups: [this.trustedKeyGroup]
        }
      },
      priceClass: PriceClass.PRICE_CLASS_100,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: !!props.AppsLoginUrl ? `/apps-login.html` : '/login.html',
        }
      ],
    });

    // Configure output
    new CfnOutput(scope, 'WebUIBucketName', { value: this.websiteBucket.bucketName });
    new CfnOutput(scope, 'WebUIDomainName', { value: this.websiteDistribution.distributionDomainName });
  }
}