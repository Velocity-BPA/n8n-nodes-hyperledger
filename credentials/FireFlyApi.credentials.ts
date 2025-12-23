/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */
import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class FireFlyApi implements ICredentialType {
  name = 'fireFlyApi';
  displayName = 'Hyperledger FireFly API';
  documentationUrl = 'https://hyperledger.github.io/firefly/latest/reference/';
  
  properties: INodeProperties[] = [
    {
      displayName: 'FireFly Node URL',
      name: 'baseUrl',
      type: 'string',
      default: 'http://localhost:5000',
      placeholder: 'http://localhost:5000',
      description: 'The base URL of your FireFly node',
      required: true,
    },
    {
      displayName: 'Namespace',
      name: 'namespace',
      type: 'string',
      default: 'default',
      description: 'The FireFly namespace to operate in',
      required: true,
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API key for authenticated FireFly deployments (optional)',
      required: false,
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{"Bearer " + $credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/api/v1/status',
      method: 'GET',
    },
  };
}
