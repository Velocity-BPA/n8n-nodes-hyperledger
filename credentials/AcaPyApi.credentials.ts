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

export class AcaPyApi implements ICredentialType {
  name = 'acaPyApi';
  displayName = 'Hyperledger Aries Cloud Agent (ACA-Py) API';
  documentationUrl = 'https://aca-py.org/';
  
  properties: INodeProperties[] = [
    {
      displayName: 'ACA-Py Admin API URL',
      name: 'adminUrl',
      type: 'string',
      default: 'http://localhost:8031',
      placeholder: 'http://localhost:8031',
      description: 'The admin API URL of your ACA-Py agent',
      required: true,
    },
    {
      displayName: 'Admin API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'The X-API-Key for admin API authentication',
      required: true,
    },
    {
      displayName: 'Multi-Tenant Mode',
      name: 'multiTenant',
      type: 'boolean',
      default: false,
      description: 'Whether the agent is running in multi-tenant mode',
    },
    {
      displayName: 'Wallet ID',
      name: 'walletId',
      type: 'string',
      default: '',
      description: 'The wallet ID for multi-tenant deployments',
      displayOptions: {
        show: {
          multiTenant: [true],
        },
      },
    },
    {
      displayName: 'Wallet Key',
      name: 'walletKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'The wallet key for multi-tenant deployments',
      displayOptions: {
        show: {
          multiTenant: [true],
        },
      },
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.adminUrl}}',
      url: '/status',
      method: 'GET',
    },
  };
}
