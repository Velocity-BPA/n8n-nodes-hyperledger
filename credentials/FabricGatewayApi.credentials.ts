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

export class FabricGatewayApi implements ICredentialType {
  name = 'fabricGatewayApi';
  displayName = 'Hyperledger Fabric Gateway API';
  documentationUrl = 'https://hyperledger-fabric.readthedocs.io/en/latest/gateway.html';
  
  properties: INodeProperties[] = [
    {
      displayName: 'Gateway URL',
      name: 'gatewayUrl',
      type: 'string',
      default: 'http://localhost:3000',
      placeholder: 'http://localhost:3000',
      description: 'The REST API endpoint for the Fabric gateway (e.g., firefly-fabconnect)',
      required: true,
    },
    {
      displayName: 'Channel Name',
      name: 'channelName',
      type: 'string',
      default: 'mychannel',
      description: 'The Fabric channel to operate on',
      required: true,
    },
    {
      displayName: 'Organization MSP ID',
      name: 'mspId',
      type: 'string',
      default: 'Org1MSP',
      description: 'The MSP ID of your organization',
      required: true,
    },
    {
      displayName: 'User Identity',
      name: 'userId',
      type: 'string',
      default: '',
      description: 'The enrollment ID of the user identity',
      required: true,
    },
    {
      displayName: 'Client Certificate (PEM)',
      name: 'clientCert',
      type: 'string',
      typeOptions: {
        password: true,
        rows: 5,
      },
      default: '',
      description: 'The client certificate in PEM format',
      required: false,
    },
    {
      displayName: 'Client Private Key (PEM)',
      name: 'clientKey',
      type: 'string',
      typeOptions: {
        password: true,
        rows: 5,
      },
      default: '',
      description: 'The client private key in PEM format',
      required: false,
    },
    {
      displayName: 'TLS CA Certificate (PEM)',
      name: 'tlsCaCert',
      type: 'string',
      typeOptions: {
        password: true,
        rows: 5,
      },
      default: '',
      description: 'The TLS CA certificate for secure connections',
      required: false,
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API key for authenticated gateway access (optional)',
      required: false,
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
        'X-User-ID': '={{$credentials.userId}}',
        'X-MSP-ID': '={{$credentials.mspId}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.gatewayUrl}}',
      url: '/health',
      method: 'GET',
    },
  };
}
