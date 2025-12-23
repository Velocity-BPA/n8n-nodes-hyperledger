/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */
import type {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
} from 'n8n-workflow';

export class BesuTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Hyperledger Besu Trigger',
    name: 'besuTrigger',
    icon: 'file:besu.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["eventType"]}}',
    description: 'Listen for events from Hyperledger Besu blockchain',
    defaults: {
      name: 'Besu Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'besuApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Event Type',
        name: 'eventType',
        type: 'options',
        options: [
          { name: 'New Blocks', value: 'newBlocks' },
          { name: 'Contract Events (Logs)', value: 'logs' },
          { name: 'Pending Transactions', value: 'pendingTransactions' },
        ],
        default: 'newBlocks',
        description: 'The type of event to listen for',
      },
      {
        displayName: 'Contract Address',
        name: 'contractAddress',
        type: 'string',
        default: '',
        description: 'Filter logs by contract address',
        displayOptions: {
          show: {
            eventType: ['logs'],
          },
        },
      },
      {
        displayName: 'Event Topics',
        name: 'topics',
        type: 'string',
        default: '',
        description: 'Comma-separated event topic hashes to filter',
        displayOptions: {
          show: {
            eventType: ['logs'],
          },
        },
      },
      {
        displayName: 'Poll Interval',
        name: 'pollInterval',
        type: 'number',
        default: 5000,
        description: 'How often to poll for new events (in milliseconds)',
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const credentials = await this.getCredentials('besuApi');
    const rpcUrl = credentials.rpcUrl as string;
    const eventType = this.getNodeParameter('eventType') as string;
    const pollInterval = this.getNodeParameter('pollInterval') as number;

    let lastBlockNumber = 0;
    let filterId: string | null = null;
    let requestId = 1;

    const makeRpcCall = async (method: string, params: unknown[] = []): Promise<string | string[] | Record<string, unknown>> => {
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
      ) as { error?: { message: string }; result: string | string[] | Record<string, unknown> };

      if (response.error) {
        throw new Error(`RPC Error: ${response.error.message}`);
      }

      return response.result;
    };

    // Initialize filter based on event type
    const initializeFilter = async () => {
      if (eventType === 'newBlocks') {
        filterId = await makeRpcCall('eth_newBlockFilter') as string;
      } else if (eventType === 'logs') {
        const contractAddress = this.getNodeParameter('contractAddress', '') as string;
        const topicsStr = this.getNodeParameter('topics', '') as string;
        
        const filterParams: Record<string, unknown> = {};
        if (contractAddress) {
          filterParams.address = contractAddress;
        }
        if (topicsStr) {
          filterParams.topics = topicsStr.split(',').map(t => t.trim());
        }
        
        filterId = await makeRpcCall('eth_newFilter', [filterParams]) as string;
      } else if (eventType === 'pendingTransactions') {
        filterId = await makeRpcCall('eth_newPendingTransactionFilter') as string;
      }

      // Get current block number
      const blockHex = await makeRpcCall('eth_blockNumber') as string;
      lastBlockNumber = parseInt(blockHex, 16);
    };

    // Poll for events
    const pollEvents = async () => {
      try {
        if (!filterId) return;

        const changes = await makeRpcCall('eth_getFilterChanges', [filterId]) as string[];

        if (Array.isArray(changes) && changes.length > 0) {
          for (const change of changes) {
            if (eventType === 'newBlocks') {
              // For new blocks, change is block hash
              const block = await makeRpcCall('eth_getBlockByHash', [change, false]) as Record<string, unknown>;
              this.emit([this.helpers.returnJsonArray([{
                eventType: 'newBlock',
                blockHash: change as string,
                block: block as Record<string, unknown>,
              }])]);
            } else if (eventType === 'logs') {
              // For logs, change is the log object
              this.emit([this.helpers.returnJsonArray([{
                eventType: 'log',
                log: change as unknown as Record<string, unknown>,
              }])]);
            } else if (eventType === 'pendingTransactions') {
              // For pending transactions, change is tx hash
              this.emit([this.helpers.returnJsonArray([{
                eventType: 'pendingTransaction',
                transactionHash: change as string,
              }])]);
            }
          }
        }
      } catch (error) {
        console.error('Besu polling error:', error);
        // Try to recreate filter if it was lost
        try {
          await initializeFilter();
        } catch (e) {
          console.error('Failed to recreate filter:', e);
        }
      }
    };

    // Initialize
    await initializeFilter();

    // Start polling
    const intervalId = setInterval(pollEvents, pollInterval);

    // Cleanup function
    const closeFunction = async () => {
      clearInterval(intervalId);
      
      // Uninstall filter
      if (filterId) {
        try {
          await makeRpcCall('eth_uninstallFilter', [filterId]);
        } catch (error) {
          console.error('Error uninstalling Besu filter:', error);
        }
      }
    };

    return {
      closeFunction,
    };
  }
}
