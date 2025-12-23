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

export class BesuApi implements ICredentialType {
  name = 'besuApi';
  displayName = 'Hyperledger Besu JSON-RPC API';
  documentationUrl = 'https://besu.hyperledger.org/reference';
  
  properties: INodeProperties[] = [
    {
      displayName: 'Besu JSON-RPC URL',
      name: 'rpcUrl',
      type: 'string',
      default: 'http://localhost:8545',
      placeholder: 'http://localhost:8545',
      description: 'The JSON-RPC endpoint of your Besu node',
      required: true,
    },
    {
      displayName: 'Authentication Token',
      name: 'authToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Bearer token for authenticated Besu nodes (optional)',
      required: false,
    },
    {
      displayName: 'Privacy Group ID',
      name: 'privacyGroupId',
      type: 'string',
      default: '',
      description: 'Default privacy group ID for private transactions (optional)',
      required: false,
    },
    {
      displayName: 'Tessera URL',
      name: 'tesseraUrl',
      type: 'string',
      default: '',
      placeholder: 'http://localhost:9081',
      description: 'Tessera node URL for privacy operations (optional)',
      required: false,
    },
    {
      displayName: 'Chain ID',
      name: 'chainId',
      type: 'number',
      default: 1337,
      description: 'The chain ID of the network',
      required: false,
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{"Bearer " + $credentials.authToken}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.rpcUrl}}',
      url: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'web3_clientVersion',
        params: [],
        id: 1,
      }),
    },
  };
}
