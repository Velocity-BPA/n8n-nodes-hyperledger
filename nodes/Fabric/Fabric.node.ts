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

export class Fabric implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Hyperledger Fabric',
    name: 'fabric',
    icon: 'file:fabric.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Hyperledger Fabric - Enterprise Blockchain Framework',
    defaults: {
      name: 'Hyperledger Fabric',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'fabricGatewayApi',
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
          { name: 'Transaction', value: 'transaction' },
          { name: 'Chaincode', value: 'chaincode' },
          { name: 'Ledger', value: 'ledger' },
          { name: 'Identity', value: 'identity' },
        ],
        default: 'transaction',
      },
      // Transaction Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['transaction'],
          },
        },
        options: [
          { name: 'Submit Transaction', value: 'submitTransaction', action: 'Submit a transaction to be endorsed and committed' },
          { name: 'Evaluate Transaction', value: 'evaluateTransaction', action: 'Evaluate a transaction (query)' },
          { name: 'Get Transaction by ID', value: 'getTransactionById', action: 'Retrieve transaction details by ID' },
        ],
        default: 'submitTransaction',
      },
      // Chaincode Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['chaincode'],
          },
        },
        options: [
          { name: 'Invoke Chaincode', value: 'invokeChaincode', action: 'Invoke chaincode function with arguments' },
          { name: 'Query Chaincode', value: 'queryChaincode', action: 'Query chaincode (read-only)' },
          { name: 'Get Chaincode List', value: 'getChaincodeList', action: 'List installed chaincodes' },
        ],
        default: 'invokeChaincode',
      },
      // Ledger Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['ledger'],
          },
        },
        options: [
          { name: 'Get Block by Number', value: 'getBlockByNumber', action: 'Retrieve block by block number' },
          { name: 'Get Block by Hash', value: 'getBlockByHash', action: 'Retrieve block by hash' },
          { name: 'Get Latest Block', value: 'getLatestBlock', action: 'Get the most recent block' },
          { name: 'Get Block Height', value: 'getBlockHeight', action: 'Get current blockchain height' },
          { name: 'Query Ledger', value: 'queryLedger', action: 'Query ledger with CouchDB selectors' },
        ],
        default: 'getLatestBlock',
      },
      // Identity Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['identity'],
          },
        },
        options: [
          { name: 'Enroll User', value: 'enrollUser', action: 'Enroll a user with the Fabric CA' },
          { name: 'Register User', value: 'registerUser', action: 'Register a new user identity' },
          { name: 'Revoke User', value: 'revokeUser', action: 'Revoke a user enrollment certificate' },
        ],
        default: 'enrollUser',
      },
      // Common Parameters
      {
        displayName: 'Chaincode Name',
        name: 'chaincodeName',
        type: 'string',
        default: '',
        description: 'The name of the chaincode to invoke',
        displayOptions: {
          show: {
            resource: ['transaction', 'chaincode'],
            operation: ['submitTransaction', 'evaluateTransaction', 'invokeChaincode', 'queryChaincode'],
          },
        },
        required: true,
      },
      {
        displayName: 'Function Name',
        name: 'functionName',
        type: 'string',
        default: '',
        description: 'The chaincode function to call',
        displayOptions: {
          show: {
            resource: ['transaction', 'chaincode'],
            operation: ['submitTransaction', 'evaluateTransaction', 'invokeChaincode', 'queryChaincode'],
          },
        },
        required: true,
      },
      {
        displayName: 'Arguments',
        name: 'arguments',
        type: 'json',
        default: '[]',
        description: 'Function arguments as JSON array',
        displayOptions: {
          show: {
            resource: ['transaction', 'chaincode'],
            operation: ['submitTransaction', 'evaluateTransaction', 'invokeChaincode', 'queryChaincode'],
          },
        },
      },
      {
        displayName: 'Transient Data',
        name: 'transientData',
        type: 'json',
        default: '{}',
        description: 'Private transient data (JSON object)',
        displayOptions: {
          show: {
            resource: ['transaction', 'chaincode'],
            operation: ['submitTransaction', 'invokeChaincode'],
          },
        },
      },
      {
        displayName: 'Transaction ID',
        name: 'transactionId',
        type: 'string',
        default: '',
        description: 'The transaction ID to retrieve',
        displayOptions: {
          show: {
            resource: ['transaction'],
            operation: ['getTransactionById'],
          },
        },
        required: true,
      },
      // Ledger Parameters
      {
        displayName: 'Block Number',
        name: 'blockNumber',
        type: 'number',
        default: 0,
        description: 'The block number to retrieve',
        displayOptions: {
          show: {
            resource: ['ledger'],
            operation: ['getBlockByNumber'],
          },
        },
        required: true,
      },
      {
        displayName: 'Block Hash',
        name: 'blockHash',
        type: 'string',
        default: '',
        description: 'The block hash to retrieve',
        displayOptions: {
          show: {
            resource: ['ledger'],
            operation: ['getBlockByHash'],
          },
        },
        required: true,
      },
      {
        displayName: 'Query Selector',
        name: 'querySelector',
        type: 'json',
        default: '{}',
        description: 'CouchDB query selector (JSON)',
        displayOptions: {
          show: {
            resource: ['ledger'],
            operation: ['queryLedger'],
          },
        },
        required: true,
      },
      // Identity Parameters
      {
        displayName: 'Enrollment ID',
        name: 'enrollmentId',
        type: 'string',
        default: '',
        description: 'The enrollment ID for the user',
        displayOptions: {
          show: {
            resource: ['identity'],
          },
        },
        required: true,
      },
      {
        displayName: 'Enrollment Secret',
        name: 'enrollmentSecret',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'The enrollment secret for the user',
        displayOptions: {
          show: {
            resource: ['identity'],
            operation: ['enrollUser'],
          },
        },
        required: true,
      },
      {
        displayName: 'Affiliation',
        name: 'affiliation',
        type: 'string',
        default: '',
        description: 'The user affiliation (e.g., org1.department1)',
        displayOptions: {
          show: {
            resource: ['identity'],
            operation: ['registerUser'],
          },
        },
      },
      {
        displayName: 'User Role',
        name: 'userRole',
        type: 'options',
        options: [
          { name: 'Client', value: 'client' },
          { name: 'Peer', value: 'peer' },
          { name: 'Admin', value: 'admin' },
          { name: 'Orderer', value: 'orderer' },
        ],
        default: 'client',
        description: 'The role of the user',
        displayOptions: {
          show: {
            resource: ['identity'],
            operation: ['registerUser'],
          },
        },
      },
      {
        displayName: 'Revocation Reason',
        name: 'revocationReason',
        type: 'string',
        default: '',
        description: 'Reason for revoking the certificate',
        displayOptions: {
          show: {
            resource: ['identity'],
            operation: ['revokeUser'],
          },
        },
      },
      // Options
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Timeout (Seconds)',
            name: 'timeout',
            type: 'number',
            default: 60,
            description: 'Transaction timeout in seconds',
          },
          {
            displayName: 'Endorsing Peers',
            name: 'endorsingPeers',
            type: 'string',
            default: '',
            description: 'Comma-separated list of endorsing peer addresses',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('fabricGatewayApi');
    const gatewayUrl = credentials.gatewayUrl as string;
    const channelName = credentials.channelName as string;

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;
        const options = this.getNodeParameter('options', i, {}) as {
          timeout?: number;
          endorsingPeers?: string;
        };

        let endpoint = '';
        let method: IHttpRequestMethods = 'GET';
        let body: Record<string, unknown> = {};

        if (resource === 'transaction' || resource === 'chaincode') {
          const chaincodeName = this.getNodeParameter('chaincodeName', i, '') as string;
          
          if (operation === 'submitTransaction' || operation === 'invokeChaincode') {
            method = 'POST';
            endpoint = `/channels/${channelName}/chaincodes/${chaincodeName}/invoke`;
            const functionName = this.getNodeParameter('functionName', i) as string;
            const args = JSON.parse(this.getNodeParameter('arguments', i) as string);
            const transientData = JSON.parse(this.getNodeParameter('transientData', i, '{}') as string);
            
            body = {
              fcn: functionName,
              args,
              ...(Object.keys(transientData).length > 0 && { transient: transientData }),
              ...(options.timeout && { timeout: options.timeout }),
            };
          } else if (operation === 'evaluateTransaction' || operation === 'queryChaincode') {
            method = 'POST';
            endpoint = `/channels/${channelName}/chaincodes/${chaincodeName}/query`;
            const functionName = this.getNodeParameter('functionName', i) as string;
            const args = JSON.parse(this.getNodeParameter('arguments', i) as string);
            
            body = {
              fcn: functionName,
              args,
            };
          } else if (operation === 'getTransactionById') {
            method = 'GET';
            const transactionId = this.getNodeParameter('transactionId', i) as string;
            endpoint = `/channels/${channelName}/transactions/${transactionId}`;
          } else if (operation === 'getChaincodeList') {
            method = 'GET';
            endpoint = `/channels/${channelName}/chaincodes`;
          }
        } else if (resource === 'ledger') {
          if (operation === 'getBlockByNumber') {
            method = 'GET';
            const blockNumber = this.getNodeParameter('blockNumber', i) as number;
            endpoint = `/channels/${channelName}/blocks/${blockNumber}`;
          } else if (operation === 'getBlockByHash') {
            method = 'GET';
            const blockHash = this.getNodeParameter('blockHash', i) as string;
            endpoint = `/channels/${channelName}/blocks?hash=${blockHash}`;
          } else if (operation === 'getLatestBlock') {
            method = 'GET';
            endpoint = `/channels/${channelName}/blocks?latest=true`;
          } else if (operation === 'getBlockHeight') {
            method = 'GET';
            endpoint = `/channels/${channelName}/info`;
          } else if (operation === 'queryLedger') {
            method = 'POST';
            endpoint = `/channels/${channelName}/query`;
            const querySelector = JSON.parse(this.getNodeParameter('querySelector', i) as string);
            body = { selector: querySelector };
          }
        } else if (resource === 'identity') {
          const enrollmentId = this.getNodeParameter('enrollmentId', i) as string;
          
          if (operation === 'enrollUser') {
            method = 'POST';
            endpoint = '/identities/enroll';
            const enrollmentSecret = this.getNodeParameter('enrollmentSecret', i) as string;
            body = {
              enrollmentID: enrollmentId,
              enrollmentSecret,
            };
          } else if (operation === 'registerUser') {
            method = 'POST';
            endpoint = '/identities/register';
            const affiliation = this.getNodeParameter('affiliation', i) as string;
            const userRole = this.getNodeParameter('userRole', i) as string;
            body = {
              enrollmentID: enrollmentId,
              role: userRole,
              ...(affiliation && { affiliation }),
            };
          } else if (operation === 'revokeUser') {
            method = 'POST';
            endpoint = '/identities/revoke';
            const revocationReason = this.getNodeParameter('revocationReason', i) as string;
            body = {
              enrollmentID: enrollmentId,
              ...(revocationReason && { reason: revocationReason }),
            };
          }
        }

        const requestOptions: {
          method: IHttpRequestMethods;
          url: string;
          json: boolean;
          body?: Record<string, unknown>;
        } = {
          method,
          url: `${gatewayUrl}${endpoint}`,
          json: true,
        };

        if (['POST', 'PUT', 'PATCH'].includes(method) && Object.keys(body).length > 0) {
          requestOptions.body = body;
        }

        const response = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'fabricGatewayApi',
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
