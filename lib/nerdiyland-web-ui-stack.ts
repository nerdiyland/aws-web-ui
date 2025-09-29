import { Construct } from 'constructs';
import { WebUI } from './web-ui';
import { Stack, StackProps } from 'aws-cdk-lib';

export interface NerdiylandWebUiProps extends StackProps {
  certificateArn: string;
  deliveryAliases?: string[];
  viewersPublicKeyId: string;
  loginBucketName: string;
  originAccessIdentityName: string;
  originAccessIdentityCanonicalUserId: string;
}

export class NerdiylandWebUi extends Stack {

  public readonly webUi: WebUI;

  constructor(scope: Construct, id: string, props: NerdiylandWebUiProps) {
    super(scope, id, props);

    this.webUi = new WebUI(this, 'WebUi', {
      acmCertificateArn: props.certificateArn,
      aliases: props.deliveryAliases,
      viewersPublicKeyId: props.viewersPublicKeyId,
      loginBucketName: props.loginBucketName,
      OriginAccessIdentityName: props.originAccessIdentityName,
      OriginAccessIdentityCanonicalUserId: props.originAccessIdentityCanonicalUserId,
    });
  }
}
