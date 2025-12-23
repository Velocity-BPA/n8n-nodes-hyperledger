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
  IDataObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export class Besu implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Hyperledger Besu',
    name: 'besu',
    icon: 'file:besu.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Hyperledger Besu - Enterprise Ethereum Client',
    defaults: {
      name: 'Hyperledger Besu',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'besuApi',
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
          { name: 'Ethereum', value: 'ethereum' },
          { name: 'Permissioning', value: 'permissioning' },
          { name: 'Privacy', value: 'privacy' },
        ],
        default: 'ethereum',
      },
      // Ethereum Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['ethereum'] } },
        options: [
          { name: 'Get Balance', value: 'getBalance', action: 'Get ETH balance for address' },
          { name: 'Send Transaction', value: 'sendTransaction', action: 'Send a transaction' },
          { name: 'Call Contract', value: 'call', action: 'Call a contract method (read-only)' },
          { name: 'Get Transaction Receipt', value: 'getTransactionReceipt', action: 'Get transaction receipt' },
          { name: 'Get Block by Number', value: 'getBlockByNumber', action: 'Get block details by number' },
          { name: 'Get Block by Hash', value: 'getBlockByHash', action: 'Get block details by hash' },
          { name: 'Get Transaction Count', value: 'getTransactionCount', action: 'Get transaction count (nonce)' },
          { name: 'Estimate Gas', value: 'estimateGas', action: 'Estimate gas for a transaction' },
          { name: 'Get Gas Price', value: 'getGasPrice', action: 'Get current gas price' },
          { name: 'Get Chain ID', value: 'getChainId', action: 'Get the chain ID' },
        ],
        default: 'getBalance',
      },
      // Permissioning Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['permissioning'] } },
        options: [
          { name: 'Get Permissioned Nodes', value: 'getPermissionedNodes', action: 'List permissioned nodes' },
          { name: 'Add Permissioned Node', value: 'addPermissionedNode', action: 'Add node to permissioning list' },
          { name: 'Remove Permissioned Node', value: 'removePermissionedNode', action: 'Remove node from permissioning' },
          { name: 'Get Account Permissions', value: 'getAccountPermissions', action: 'Get account-level permissions' },
          { name: 'Add Account to Allowlist', value: 'addAccountToAllowlist', action: 'Add account to transaction allowlist' },
          { name: 'Remove Account from Allowlist', value: 'removeAccountFromAllowlist', action: 'Remove from allowlist' },
        ],
        default: 'getPermissionedNodes',
      },
      // Privacy Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['privacy'] } },
        options: [
          { name: 'Create Privacy Group', value: 'createPrivacyGroup', action: 'Create a new privacy group' },
          { name: 'Get Privacy Group', value: 'getPrivacyGroup', action: 'Get privacy group details' },
          { name: 'Find Privacy Group', value: 'findPrivacyGroup', action: 'Find groups by member list' },
          { name: 'Delete Privacy Group', value: 'deletePrivacyGroup', action: 'Delete a privacy group' },
          { name: 'Send Private Transaction', value: 'sendPrivateTransaction', action: 'Send private transaction' },
          { name: 'Get Private Transaction', value: 'getPrivateTransaction', action: 'Get private transaction details' },
        ],
        default: 'createPrivacyGroup',
      },
      // Ethereum Parameters
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'Ethereum address',
        displayOptions: { show: { resource: ['ethereum'], operation: ['getBalance', 'getTransactionCount', 'call'] } },
        required: true,
      },
      {
        displayName: 'Block Parameter',
        name: 'blockParameter',
        type: 'string',
        default: 'latest',
        description: 'Block number or "latest", "earliest", "pending"',
        displayOptions: { show: { resource: ['ethereum'], operation: ['getBalance', 'getTransactionCount', 'call'] } },
      },
      {
        displayName: 'To Address',
        name: 'toAddress',
        type: 'string',
        default: '',
        description: 'Recipient address',
        displayOptions: { show: { resource: ['ethereum'], operation: ['sendTransaction', 'call', 'estimateGas'] } },
        required: true,
      },
      {
        displayName: 'From Address',
        name: 'fromAddress',
        type: 'string',
        default: '',
        description: 'Sender address',
        displayOptions: { show: { resource: ['ethereum'], operation: ['sendTransaction', 'estimateGas'] } },
        required: true,
      },
      {
        displayName: 'Value (Wei)',
        name: 'value',
        type: 'string',
        default: '0',
        description: 'Value to send in Wei (hex string)',
        displayOptions: { show: { resource: ['ethereum'], operation: ['sendTransaction', 'call', 'estimateGas'] } },
      },
      {
        displayName: 'Data',
        name: 'data',
        type: 'string',
        default: '',
        description: 'Transaction data (hex string)',
        displayOptions: { show: { resource: ['ethereum'], operation: ['sendTransaction', 'call', 'estimateGas'] } },
      },
      {
        displayName: 'Gas',
        name: 'gas',
        type: 'string',
        default: '',
        description: 'Gas limit (hex string)',
        displayOptions: { show: { resource: ['ethereum'], operation: ['sendTransaction'] } },
      },
      {
        displayName: 'Gas Price',
        name: 'gasPrice',
        type: 'string',
        default: '',
        description: 'Gas price in Wei (hex string)',
        displayOptions: { show: { resource: ['ethereum'], operation: ['sendTransaction'] } },
      },
      {
        displayName: 'Transaction Hash',
        name: 'txHash',
        type: 'string',
        default: '',
        description: 'Transaction hash',
        displayOptions: { show: { resource: ['ethereum'], operation: ['getTransactionReceipt'] } },
        required: true,
      },
      {
        displayName: 'Block Number',
        name: 'blockNumber',
        type: 'string',
        default: 'latest',
        description: 'Block number (hex) or "latest", "earliest", "pending"',
        displayOptions: { show: { resource: ['ethereum'], operation: ['getBlockByNumber'] } },
        required: true,
      },
      {
        displayName: 'Block Hash',
        name: 'blockHash',
        type: 'string',
        default: '',
        description: 'Block hash',
        displayOptions: { show: { resource: ['ethereum'], operation: ['getBlockByHash'] } },
        required: true,
      },
      {
        displayName: 'Full Transactions',
        name: 'fullTransactions',
        type: 'boolean',
        default: false,
        description: 'Whether to return full transaction objects',
        displayOptions: { show: { resource: ['ethereum'], operation: ['getBlockByNumber', 'getBlockByHash'] } },
      },
      // Permissioning Parameters
      {
        displayName: 'Enode URL',
        name: 'enodeUrl',
        type: 'string',
        default: '',
        description: 'The enode URL of the node',
        displayOptions: { show: { resource: ['permissioning'], operation: ['addPermissionedNode', 'removePermissionedNode'] } },
        required: true,
      },
      {
        displayName: 'Account Address',
        name: 'accountAddress',
        type: 'string',
        default: '',
        description: 'The account address',
        displayOptions: { show: { resource: ['permissioning'], operation: ['getAccountPermissions', 'addAccountToAllowlist', 'removeAccountFromAllowlist'] } },
        required: true,
      },
      // Privacy Parameters
      {
        displayName: 'Privacy Group Name',
        name: 'privacyGroupName',
        type: 'string',
        default: '',
        description: 'Name for the privacy group',
        displayOptions: { show: { resource: ['privacy'], operation: ['createPrivacyGroup'] } },
      },
      {
        displayName: 'Privacy Group Description',
        name: 'privacyGroupDescription',
        type: 'string',
        default: '',
        description: 'Description for the privacy group',
        displayOptions: { show: { resource: ['privacy'], operation: ['createPrivacyGroup'] } },
      },
      {
        displayName: 'Member Public Keys',
        name: 'memberPublicKeys',
        type: 'string',
        default: '',
        description: 'Comma-separated list of member Tessera public keys',
        displayOptions: { show: { resource: ['privacy'], operation: ['createPrivacyGroup', 'findPrivacyGroup'] } },
        required: true,
      },
      {
        displayName: 'Privacy Group ID',
        name: 'privacyGroupId',
        type: 'string',
        default: '',
        description: 'The privacy group ID',
        displayOptions: { show: { resource: ['privacy'], operation: ['getPrivacyGroup', 'deletePrivacyGroup', 'sendPrivateTransaction', 'getPrivateTransaction'] } },
        required: true,
      },
      {
        displayName: 'Private Transaction Hash',
        name: 'privateTxHash',
        type: 'string',
        default: '',
        description: 'The private transaction hash',
        displayOptions: { show: { resource: ['privacy'], operation: ['getPrivateTransaction'] } },
        required: true,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('besuApi');
    const rpcUrl = credentials.rpcUrl as string;

    let requestId = 1;

    const makeRpcCall = async (method: string, params: unknown[] = []): Promise<Record<string, unknown>> => {
      const response = await this.helpers.httpRequestWithAuthentication.call(
        this,
        'besuApi',
        {
          method: 'POST',
          url: rpcUrl,
          headers: { 'Content-Type': 'application/json' },
          body: {
            jsonrpc: '2.0',
            method,
            params,
            id: requestId++,
          },
          json: true,
        },
      ) as { error?: { message: string }; result: unknown };

      if (response.error) {
        throw new Error(`RPC Error: ${response.error.message}`);
      }

      return { result: response.result };
    };

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        let result: IDataObject = {};

        // Ethereum Operations
        if (resource === 'ethereum') {
          if (operation === 'getBalance') {
            const address = this.getNodeParameter('address', i) as string;
            const block = this.getNodeParameter('blockParameter', i) as string;
            result = await makeRpcCall('eth_getBalance', [address, block]) as IDataObject;
          } else if (operation === 'sendTransaction') {
            const txParams: Record<string, string> = {
              from: this.getNodeParameter('fromAddress', i) as string,
              to: this.getNodeParameter('toAddress', i) as string,
            };
            const value = this.getNodeParameter('value', i, '0') as string;
            const data = this.getNodeParameter('data', i, '') as string;
            const gas = this.getNodeParameter('gas', i, '') as string;
            const gasPrice = this.getNodeParameter('gasPrice', i, '') as string;
            if (value) txParams.value = value;
            if (data) txParams.data = data;
            if (gas) txParams.gas = gas;
            if (gasPrice) txParams.gasPrice = gasPrice;
            result = await makeRpcCall('eth_sendTransaction', [txParams]) as IDataObject;
          } else if (operation === 'call') {
            const address = this.getNodeParameter('address', i, '') as string;
            const toAddress = this.getNodeParameter('toAddress', i) as string;
            const data = this.getNodeParameter('data', i, '') as string;
            const value = this.getNodeParameter('value', i, '0') as string;
            const block = this.getNodeParameter('blockParameter', i) as string;
            const callParams: Record<string, string> = { to: toAddress };
            if (address) callParams.from = address;
            if (data) callParams.data = data;
            if (value) callParams.value = value;
            result = await makeRpcCall('eth_call', [callParams, block]) as IDataObject;
          } else if (operation === 'getTransactionReceipt') {
            const txHash = this.getNodeParameter('txHash', i) as string;
            result = await makeRpcCall('eth_getTransactionReceipt', [txHash]) as IDataObject;
          } else if (operation === 'getBlockByNumber') {
            const blockNumber = this.getNodeParameter('blockNumber', i) as string;
            const fullTx = this.getNodeParameter('fullTransactions', i) as boolean;
            result = await makeRpcCall('eth_getBlockByNumber', [blockNumber, fullTx]) as IDataObject;
          } else if (operation === 'getBlockByHash') {
            const blockHash = this.getNodeParameter('blockHash', i) as string;
            const fullTx = this.getNodeParameter('fullTransactions', i) as boolean;
            result = await makeRpcCall('eth_getBlockByHash', [blockHash, fullTx]) as IDataObject;
          } else if (operation === 'getTransactionCount') {
            const address = this.getNodeParameter('address', i) as string;
            const block = this.getNodeParameter('blockParameter', i) as string;
            result = await makeRpcCall('eth_getTransactionCount', [address, block]) as IDataObject;
          } else if (operation === 'estimateGas') {
            const txParams: Record<string, string> = {
              from: this.getNodeParameter('fromAddress', i) as string,
              to: this.getNodeParameter('toAddress', i) as string,
            };
            const data = this.getNodeParameter('data', i, '') as string;
            const value = this.getNodeParameter('value', i, '0') as string;
            if (data) txParams.data = data;
            if (value) txParams.value = value;
            result = await makeRpcCall('eth_estimateGas', [txParams]) as IDataObject;
          } else if (operation === 'getGasPrice') {
            result = await makeRpcCall('eth_gasPrice') as IDataObject;
          } else if (operation === 'getChainId') {
            result = await makeRpcCall('eth_chainId') as IDataObject;
          }
        }
        // Permissioning Operations
        else if (resource === 'permissioning') {
          if (operation === 'getPermissionedNodes') {
            result = await makeRpcCall('perm_getNodesAllowlist') as IDataObject;
          } else if (operation === 'addPermissionedNode') {
            const enodeUrl = this.getNodeParameter('enodeUrl', i) as string;
            result = await makeRpcCall('perm_addNodesToAllowlist', [[enodeUrl]]) as IDataObject;
          } else if (operation === 'removePermissionedNode') {
            const enodeUrl = this.getNodeParameter('enodeUrl', i) as string;
            result = await makeRpcCall('perm_removeNodesFromAllowlist', [[enodeUrl]]) as IDataObject;
          } else if (operation === 'getAccountPermissions') {
            result = await makeRpcCall('perm_getAccountsAllowlist') as IDataObject;
          } else if (operation === 'addAccountToAllowlist') {
            const accountAddress = this.getNodeParameter('accountAddress', i) as string;
            result = await makeRpcCall('perm_addAccountsToAllowlist', [[accountAddress]]) as IDataObject;
          } else if (operation === 'removeAccountFromAllowlist') {
            const accountAddress = this.getNodeParameter('accountAddress', i) as string;
            result = await makeRpcCall('perm_removeAccountsFromAllowlist', [[accountAddress]]) as IDataObject;
          }
        }
        // Privacy Operations
        else if (resource === 'privacy') {
          if (operation === 'createPrivacyGroup') {
            const members = (this.getNodeParameter('memberPublicKeys', i) as string).split(',').map(m => m.trim());
            const name = this.getNodeParameter('privacyGroupName', i, '') as string;
            const description = this.getNodeParameter('privacyGroupDescription', i, '') as string;
            const params: Record<string, unknown> = { addresses: members };
            if (name) params.name = name;
            if (description) params.description = description;
            result = await makeRpcCall('priv_createPrivacyGroup', [params]) as IDataObject;
          } else if (operation === 'getPrivacyGroup') {
            const groupId = this.getNodeParameter('privacyGroupId', i) as string;
            result = await makeRpcCall('priv_findPrivacyGroup', [[groupId]]) as IDataObject;
          } else if (operation === 'findPrivacyGroup') {
            const members = (this.getNodeParameter('memberPublicKeys', i) as string).split(',').map(m => m.trim());
            result = await makeRpcCall('priv_findPrivacyGroup', [members]) as IDataObject;
          } else if (operation === 'deletePrivacyGroup') {
            const groupId = this.getNodeParameter('privacyGroupId', i) as string;
            result = await makeRpcCall('priv_deletePrivacyGroup', [groupId]) as IDataObject;
          } else if (operation === 'sendPrivateTransaction') {
            const groupId = this.getNodeParameter('privacyGroupId', i) as string;
            result = await makeRpcCall('eea_sendRawTransaction', [groupId]) as IDataObject;
          } else if (operation === 'getPrivateTransaction') {
            const txHash = this.getNodeParameter('privateTxHash', i) as string;
            result = await makeRpcCall('priv_getTransactionReceipt', [txHash]) as IDataObject;
          }
        }

        returnData.push({ json: result });
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
