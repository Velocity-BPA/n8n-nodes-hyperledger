/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IHttpRequestMethods,
  IDataObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export class FireFly implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Hyperledger FireFly',
    name: 'fireFly',
    icon: 'file:firefly.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Hyperledger FireFly - Enterprise Web3 Supernode',
    defaults: {
      name: 'Hyperledger FireFly',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'fireFlyApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Message', value: 'message' },
          { name: 'Token', value: 'token' },
          { name: 'Contract', value: 'contract' },
          { name: 'Data', value: 'data' },
          { name: 'Subscription', value: 'subscription' },
        ],
        default: 'message',
      },
      // Message Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['message'],
          },
        },
        options: [
          { name: 'Broadcast Message', value: 'broadcastMessage', action: 'Broadcast a message to all members' },
          { name: 'Send Private Message', value: 'sendPrivateMessage', action: 'Send a private message to specific recipients' },
          { name: 'Request Reply', value: 'requestReply', action: 'Send a message and wait for a reply' },
          { name: 'Get Messages', value: 'getMessages', action: 'Get messages' },
          { name: 'Get Message by ID', value: 'getMessageById', action: 'Get a message by ID' },
        ],
        default: 'broadcastMessage',
      },
      // Token Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['token'],
          },
        },
        options: [
          { name: 'Mint Tokens', value: 'mintTokens', action: 'Mint new tokens' },
          { name: 'Transfer Tokens', value: 'transferTokens', action: 'Transfer tokens between accounts' },
          { name: 'Burn Tokens', value: 'burnTokens', action: 'Burn/destroy tokens' },
          { name: 'Get Token Balance', value: 'getTokenBalance', action: 'Query token balance for an account' },
          { name: 'Get Token Pools', value: 'getTokenPools', action: 'List available token pools' },
        ],
        default: 'mintTokens',
      },
      // Contract Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['contract'],
          },
        },
        options: [
          { name: 'Invoke Contract', value: 'invokeContract', action: 'Invoke a smart contract method' },
          { name: 'Query Contract', value: 'queryContract', action: 'Query smart contract state' },
          { name: 'Create Contract Interface', value: 'createContractInterface', action: 'Register a contract interface (FFI)' },
          { name: 'Create Contract API', value: 'createContractAPI', action: 'Create an API for a deployed contract' },
          { name: 'Get Contract Events', value: 'getContractEvents', action: 'Retrieve contract events' },
        ],
        default: 'invokeContract',
      },
      // Data Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['data'],
          },
        },
        options: [
          { name: 'Upload Data', value: 'uploadData', action: 'Upload data to the network' },
          { name: 'Get Data', value: 'getData', action: 'Retrieve data by ID' },
          { name: 'Query Data', value: 'queryData', action: 'Search for data with filters' },
        ],
        default: 'uploadData',
      },
      // Subscription Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['subscription'],
          },
        },
        options: [
          { name: 'Create Subscription', value: 'createSubscription', action: 'Create an event subscription' },
          { name: 'Get Subscriptions', value: 'getSubscriptions', action: 'List active subscriptions' },
          { name: 'Delete Subscription', value: 'deleteSubscription', action: 'Remove a subscription' },
        ],
        default: 'createSubscription',
      },
      // Message Parameters
      {
        displayName: 'Message Data',
        name: 'messageData',
        type: 'json',
        default: '{}',
        description: 'The message data to send (JSON format)',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['broadcastMessage', 'sendPrivateMessage', 'requestReply'],
          },
        },
      },
      {
        displayName: 'Tag',
        name: 'tag',
        type: 'string',
        default: '',
        description: 'Optional tag for the message',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['broadcastMessage', 'sendPrivateMessage', 'requestReply'],
          },
        },
      },
      {
        displayName: 'Topics',
        name: 'topics',
        type: 'string',
        default: '',
        description: 'Comma-separated list of topics for the message',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['broadcastMessage', 'sendPrivateMessage', 'requestReply'],
          },
        },
      },
      {
        displayName: 'Recipients',
        name: 'recipients',
        type: 'string',
        default: '',
        description: 'Comma-separated list of recipient identities',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['sendPrivateMessage', 'requestReply'],
          },
        },
      },
      {
        displayName: 'Message ID',
        name: 'messageId',
        type: 'string',
        default: '',
        description: 'The ID of the message to retrieve',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['getMessageById'],
          },
        },
        required: true,
      },
      // Token Parameters
      {
        displayName: 'Pool Name',
        name: 'poolName',
        type: 'string',
        default: '',
        description: 'The name of the token pool',
        displayOptions: {
          show: {
            resource: ['token'],
            operation: ['mintTokens', 'transferTokens', 'burnTokens', 'getTokenBalance'],
          },
        },
        required: true,
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        default: '',
        description: 'The amount of tokens',
        displayOptions: {
          show: {
            resource: ['token'],
            operation: ['mintTokens', 'transferTokens', 'burnTokens'],
          },
        },
        required: true,
      },
      {
        displayName: 'To Address',
        name: 'toAddress',
        type: 'string',
        default: '',
        description: 'The recipient address',
        displayOptions: {
          show: {
            resource: ['token'],
            operation: ['mintTokens', 'transferTokens'],
          },
        },
      },
      {
        displayName: 'From Address',
        name: 'fromAddress',
        type: 'string',
        default: '',
        description: 'The sender address',
        displayOptions: {
          show: {
            resource: ['token'],
            operation: ['transferTokens', 'burnTokens'],
          },
        },
      },
      {
        displayName: 'Account Key',
        name: 'accountKey',
        type: 'string',
        default: '',
        description: 'The account key to query balance for',
        displayOptions: {
          show: {
            resource: ['token'],
            operation: ['getTokenBalance'],
          },
        },
        required: true,
      },
      {
        displayName: 'Token Index',
        name: 'tokenIndex',
        type: 'string',
        default: '',
        description: 'Token index for NFTs',
        displayOptions: {
          show: {
            resource: ['token'],
            operation: ['mintTokens', 'transferTokens', 'burnTokens'],
          },
        },
      },
      // Contract Parameters
      {
        displayName: 'Contract API Name',
        name: 'contractApiName',
        type: 'string',
        default: '',
        description: 'The name of the contract API',
        displayOptions: {
          show: {
            resource: ['contract'],
            operation: ['invokeContract', 'queryContract', 'getContractEvents'],
          },
        },
        required: true,
      },
      {
        displayName: 'Method Name',
        name: 'methodName',
        type: 'string',
        default: '',
        description: 'The contract method to call',
        displayOptions: {
          show: {
            resource: ['contract'],
            operation: ['invokeContract', 'queryContract'],
          },
        },
        required: true,
      },
      {
        displayName: 'Method Parameters',
        name: 'methodParams',
        type: 'json',
        default: '{}',
        description: 'Parameters to pass to the contract method (JSON format)',
        displayOptions: {
          show: {
            resource: ['contract'],
            operation: ['invokeContract', 'queryContract'],
          },
        },
      },
      {
        displayName: 'Interface Definition',
        name: 'interfaceDefinition',
        type: 'json',
        default: '{}',
        description: 'The FFI (FireFly Interface) definition in JSON format',
        displayOptions: {
          show: {
            resource: ['contract'],
            operation: ['createContractInterface'],
          },
        },
        required: true,
      },
      {
        displayName: 'Interface Name',
        name: 'interfaceName',
        type: 'string',
        default: '',
        description: 'The name of the contract interface',
        displayOptions: {
          show: {
            resource: ['contract'],
            operation: ['createContractAPI'],
          },
        },
        required: true,
      },
      {
        displayName: 'Interface Version',
        name: 'interfaceVersion',
        type: 'string',
        default: '1.0.0',
        description: 'The version of the contract interface',
        displayOptions: {
          show: {
            resource: ['contract'],
            operation: ['createContractAPI'],
          },
        },
      },
      {
        displayName: 'Contract Location',
        name: 'contractLocation',
        type: 'json',
        default: '{}',
        description: 'The location of the deployed contract (JSON format)',
        displayOptions: {
          show: {
            resource: ['contract'],
            operation: ['createContractAPI'],
          },
        },
        required: true,
      },
      {
        displayName: 'API Name',
        name: 'apiName',
        type: 'string',
        default: '',
        description: 'The name for the new contract API',
        displayOptions: {
          show: {
            resource: ['contract'],
            operation: ['createContractAPI'],
          },
        },
        required: true,
      },
      // Data Parameters
      {
        displayName: 'Data Value',
        name: 'dataValue',
        type: 'json',
        default: '{}',
        description: 'The data to upload (JSON format)',
        displayOptions: {
          show: {
            resource: ['data'],
            operation: ['uploadData'],
          },
        },
        required: true,
      },
      {
        displayName: 'Data Type',
        name: 'dataType',
        type: 'string',
        default: '',
        description: 'Optional validator type for the data',
        displayOptions: {
          show: {
            resource: ['data'],
            operation: ['uploadData'],
          },
        },
      },
      {
        displayName: 'Data ID',
        name: 'dataId',
        type: 'string',
        default: '',
        description: 'The ID of the data to retrieve',
        displayOptions: {
          show: {
            resource: ['data'],
            operation: ['getData'],
          },
        },
        required: true,
      },
      {
        displayName: 'Query Filter',
        name: 'queryFilter',
        type: 'string',
        default: '',
        description: 'Filter query for searching data',
        displayOptions: {
          show: {
            resource: ['data'],
            operation: ['queryData'],
          },
        },
      },
      // Subscription Parameters
      {
        displayName: 'Subscription Name',
        name: 'subscriptionName',
        type: 'string',
        default: '',
        description: 'The name for the subscription',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['createSubscription'],
          },
        },
        required: true,
      },
      {
        displayName: 'Event Filter',
        name: 'eventFilter',
        type: 'json',
        default: '{}',
        description: 'Event filter configuration (JSON format)',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['createSubscription'],
          },
        },
      },
      {
        displayName: 'Transport Type',
        name: 'transportType',
        type: 'options',
        options: [
          { name: 'WebSocket', value: 'websockets' },
          { name: 'Webhook', value: 'webhooks' },
        ],
        default: 'websockets',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['createSubscription'],
          },
        },
      },
      {
        displayName: 'Subscription ID',
        name: 'subscriptionId',
        type: 'string',
        default: '',
        description: 'The ID of the subscription to delete',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['deleteSubscription'],
          },
        },
        required: true,
      },
      // Common Options
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Confirm',
            name: 'confirm',
            type: 'boolean',
            default: true,
            description: 'Whether to wait for blockchain confirmation',
          },
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            default: 25,
            description: 'Maximum number of results to return',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('fireFlyApi');
    const baseUrl = credentials.baseUrl as string;
    const namespace = credentials.namespace as string;

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;
        const options = this.getNodeParameter('options', i, {}) as {
          confirm?: boolean;
          limit?: number;
        };

        let endpoint = '';
        let method: IHttpRequestMethods = 'GET';
        let body: Record<string, unknown> = {};

        // Build request based on resource and operation
        if (resource === 'message') {
          endpoint = `/api/v1/namespaces/${namespace}/messages`;
          
          if (operation === 'broadcastMessage') {
            method = 'POST';
            endpoint = `/api/v1/namespaces/${namespace}/messages/broadcast`;
            const messageData = JSON.parse(this.getNodeParameter('messageData', i) as string);
            const tag = this.getNodeParameter('tag', i) as string;
            const topics = (this.getNodeParameter('topics', i) as string).split(',').filter(t => t.trim());
            
            body = {
              data: [{ value: messageData }],
              ...(tag && { tag }),
              ...(topics.length > 0 && { header: { topics } }),
            };
          } else if (operation === 'sendPrivateMessage') {
            method = 'POST';
            endpoint = `/api/v1/namespaces/${namespace}/messages/private`;
            const messageData = JSON.parse(this.getNodeParameter('messageData', i) as string);
            const recipients = (this.getNodeParameter('recipients', i) as string).split(',').filter(r => r.trim());
            const tag = this.getNodeParameter('tag', i) as string;
            const topics = (this.getNodeParameter('topics', i) as string).split(',').filter(t => t.trim());
            
            body = {
              data: [{ value: messageData }],
              group: { members: recipients.map(r => ({ identity: r.trim() })) },
              ...(tag && { tag }),
              ...(topics.length > 0 && { header: { topics } }),
            };
          } else if (operation === 'requestReply') {
            method = 'POST';
            endpoint = `/api/v1/namespaces/${namespace}/messages/requestreply`;
            const messageData = JSON.parse(this.getNodeParameter('messageData', i) as string);
            const recipients = (this.getNodeParameter('recipients', i) as string).split(',').filter(r => r.trim());
            
            body = {
              data: [{ value: messageData }],
              group: { members: recipients.map(r => ({ identity: r.trim() })) },
            };
          } else if (operation === 'getMessages') {
            method = 'GET';
            endpoint = `/api/v1/namespaces/${namespace}/messages?limit=${options.limit || 25}`;
          } else if (operation === 'getMessageById') {
            method = 'GET';
            const messageId = this.getNodeParameter('messageId', i) as string;
            endpoint = `/api/v1/namespaces/${namespace}/messages/${messageId}`;
          }
        } else if (resource === 'token') {
          const poolName = this.getNodeParameter('poolName', i, '') as string;
          
          if (operation === 'mintTokens') {
            method = 'POST';
            endpoint = `/api/v1/namespaces/${namespace}/tokens/mint`;
            const amount = this.getNodeParameter('amount', i) as string;
            const toAddress = this.getNodeParameter('toAddress', i) as string;
            const tokenIndex = this.getNodeParameter('tokenIndex', i) as string;
            
            body = {
              pool: poolName,
              amount,
              ...(toAddress && { to: toAddress }),
              ...(tokenIndex && { tokenIndex }),
            };
          } else if (operation === 'transferTokens') {
            method = 'POST';
            endpoint = `/api/v1/namespaces/${namespace}/tokens/transfers`;
            const amount = this.getNodeParameter('amount', i) as string;
            const toAddress = this.getNodeParameter('toAddress', i) as string;
            const fromAddress = this.getNodeParameter('fromAddress', i) as string;
            const tokenIndex = this.getNodeParameter('tokenIndex', i) as string;
            
            body = {
              pool: poolName,
              amount,
              ...(toAddress && { to: toAddress }),
              ...(fromAddress && { from: fromAddress }),
              ...(tokenIndex && { tokenIndex }),
            };
          } else if (operation === 'burnTokens') {
            method = 'POST';
            endpoint = `/api/v1/namespaces/${namespace}/tokens/burn`;
            const amount = this.getNodeParameter('amount', i) as string;
            const fromAddress = this.getNodeParameter('fromAddress', i) as string;
            const tokenIndex = this.getNodeParameter('tokenIndex', i) as string;
            
            body = {
              pool: poolName,
              amount,
              ...(fromAddress && { from: fromAddress }),
              ...(tokenIndex && { tokenIndex }),
            };
          } else if (operation === 'getTokenBalance') {
            method = 'GET';
            const accountKey = this.getNodeParameter('accountKey', i) as string;
            endpoint = `/api/v1/namespaces/${namespace}/tokens/balances?pool=${poolName}&key=${accountKey}`;
          } else if (operation === 'getTokenPools') {
            method = 'GET';
            endpoint = `/api/v1/namespaces/${namespace}/tokens/pools?limit=${options.limit || 25}`;
          }
        } else if (resource === 'contract') {
          if (operation === 'invokeContract') {
            method = 'POST';
            const contractApiName = this.getNodeParameter('contractApiName', i) as string;
            const methodName = this.getNodeParameter('methodName', i) as string;
            const methodParams = JSON.parse(this.getNodeParameter('methodParams', i) as string);
            
            endpoint = `/api/v1/namespaces/${namespace}/apis/${contractApiName}/invoke/${methodName}`;
            body = { input: methodParams };
          } else if (operation === 'queryContract') {
            method = 'POST';
            const contractApiName = this.getNodeParameter('contractApiName', i) as string;
            const methodName = this.getNodeParameter('methodName', i) as string;
            const methodParams = JSON.parse(this.getNodeParameter('methodParams', i) as string);
            
            endpoint = `/api/v1/namespaces/${namespace}/apis/${contractApiName}/query/${methodName}`;
            body = { input: methodParams };
          } else if (operation === 'createContractInterface') {
            method = 'POST';
            endpoint = `/api/v1/namespaces/${namespace}/contracts/interfaces`;
            const interfaceDefinition = JSON.parse(this.getNodeParameter('interfaceDefinition', i) as string);
            body = interfaceDefinition;
          } else if (operation === 'createContractAPI') {
            method = 'POST';
            endpoint = `/api/v1/namespaces/${namespace}/apis`;
            const interfaceName = this.getNodeParameter('interfaceName', i) as string;
            const interfaceVersion = this.getNodeParameter('interfaceVersion', i) as string;
            const contractLocation = JSON.parse(this.getNodeParameter('contractLocation', i) as string);
            const apiName = this.getNodeParameter('apiName', i) as string;
            
            body = {
              name: apiName,
              interface: { name: interfaceName, version: interfaceVersion },
              location: contractLocation,
            };
          } else if (operation === 'getContractEvents') {
            method = 'GET';
            const contractApiName = this.getNodeParameter('contractApiName', i) as string;
            endpoint = `/api/v1/namespaces/${namespace}/apis/${contractApiName}/events?limit=${options.limit || 25}`;
          }
        } else if (resource === 'data') {
          if (operation === 'uploadData') {
            method = 'POST';
            endpoint = `/api/v1/namespaces/${namespace}/data`;
            const dataValue = JSON.parse(this.getNodeParameter('dataValue', i) as string);
            const dataType = this.getNodeParameter('dataType', i) as string;
            
            body = {
              value: dataValue,
              ...(dataType && { validator: dataType }),
            };
          } else if (operation === 'getData') {
            method = 'GET';
            const dataId = this.getNodeParameter('dataId', i) as string;
            endpoint = `/api/v1/namespaces/${namespace}/data/${dataId}`;
          } else if (operation === 'queryData') {
            method = 'GET';
            const queryFilter = this.getNodeParameter('queryFilter', i) as string;
            endpoint = `/api/v1/namespaces/${namespace}/data?limit=${options.limit || 25}${queryFilter ? `&${queryFilter}` : ''}`;
          }
        } else if (resource === 'subscription') {
          endpoint = `/api/v1/namespaces/${namespace}/subscriptions`;
          
          if (operation === 'createSubscription') {
            method = 'POST';
            const subscriptionName = this.getNodeParameter('subscriptionName', i) as string;
            const eventFilter = JSON.parse(this.getNodeParameter('eventFilter', i) as string);
            const transportType = this.getNodeParameter('transportType', i) as string;
            
            body = {
              name: subscriptionName,
              transport: transportType,
              filter: eventFilter,
            };
          } else if (operation === 'getSubscriptions') {
            method = 'GET';
            endpoint = `/api/v1/namespaces/${namespace}/subscriptions?limit=${options.limit || 25}`;
          } else if (operation === 'deleteSubscription') {
            method = 'DELETE';
            const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
            endpoint = `/api/v1/namespaces/${namespace}/subscriptions/${subscriptionId}`;
          }
        }

        // Add confirm parameter if applicable
        if (options.confirm !== undefined && ['POST', 'PUT', 'DELETE'].includes(method)) {
          const separator = endpoint.includes('?') ? '&' : '?';
          endpoint = `${endpoint}${separator}confirm=${options.confirm}`;
        }

        // Make the API request
        const requestOptions: {
          method: IHttpRequestMethods;
          url: string;
          json: boolean;
          body?: Record<string, unknown>;
          headers?: Record<string, string>;
        } = {
          method,
          url: `${baseUrl}${endpoint}`,
          json: true,
        };

        if (['POST', 'PUT', 'PATCH'].includes(method) && Object.keys(body).length > 0) {
          requestOptions.body = body;
        }

        const response = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'fireFlyApi',
          requestOptions,
        );

        returnData.push({ json: response as IDataObject });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message } });
          continue;
        }
        throw new NodeApiError(this.getNode(), { message: (error as Error).message });
      }
    }

    return [returnData];
  }
}
