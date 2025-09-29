#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NerdiylandWebUi } from '../lib/nerdiyland-web-ui-stack';

const app = new cdk.App();
new NerdiylandWebUi(app, 'NerdiylandWebUi', {
  certificateArn: '',
  loginBucketName: '',
  originAccessIdentityCanonicalUserId: '',
  originAccessIdentityName: '',
  viewersPublicKeyId: '',
});