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

export class FabricTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Hyperledger Fabric Trigger',
    name: 'fabricTrigger',
    icon: 'file:fabric.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["eventType"]}}',
    description: 'Listen for events from Hyperledger Fabric blockchain',
    defaults: {
      name: 'Fabric Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'fabricGatewayApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Event Type',
        name: 'eventType',
        type: 'options',
        options: [
          { name: 'Block Events', value: 'block' },
          { name: 'Chaincode Events', value: 'chaincode' },
          { name: 'Transaction Events', value: 'transaction' },
        ],
        default: 'block',
        description: 'The type of blockchain event to listen for',
      },
      {
        displayName: 'Chaincode Name',
        name: 'chaincodeName',
        type: 'string',
        default: '',
        description: 'The chaincode to monitor for events',
        displayOptions: {
          show: {
            eventType: ['chaincode'],
          },
        },
        required: true,
      },
      {
        displayName: 'Event Name Filter',
        name: 'eventNameFilter',
        type: 'string',
        default: '',
        description: 'Filter chaincode events by name (regex supported)',
        displayOptions: {
          show: {
            eventType: ['chaincode'],
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
      {
        displayName: 'Start Block',
        name: 'startBlock',
        type: 'options',
        options: [
          { name: 'Latest', value: 'latest' },
          { name: 'Oldest', value: 'oldest' },
          { name: 'Specific Block', value: 'specific' },
        ],
        default: 'latest',
        description: 'Where to start listening from',
      },
      {
        displayName: 'Block Number',
        name: 'blockNumber',
        type: 'number',
        default: 0,
        description: 'The specific block number to start from',
        displayOptions: {
          show: {
            startBlock: ['specific'],
          },
        },
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const credentials = await this.getCredentials('fabricGatewayApi');
    const gatewayUrl = credentials.gatewayUrl as string;
    const channelName = credentials.channelName as string;
    const eventType = this.getNodeParameter('eventType') as string;
    const pollInterval = this.getNodeParameter('pollInterval') as number;
    const startBlock = this.getNodeParameter('startBlock') as string;

    let lastBlockNumber = 0;
    let chaincodeName = '';
    let eventNameFilter = '';

    if (eventType === 'chaincode') {
      chaincodeName = this.getNodeParameter('chaincodeName') as string;
      eventNameFilter = this.getNodeParameter('eventNameFilter', '') as string;
    }

    // Initialize starting block
    const initializeStartBlock = async () => {
      if (startBlock === 'specific') {
        lastBlockNumber = this.getNodeParameter('blockNumber') as number;
      } else if (startBlock === 'latest') {
        const response = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'fabricGatewayApi',
          {
            method: 'GET',
            url: `${gatewayUrl}/channels/${channelName}/info`,
            json: true,
          },
        );
        lastBlockNumber = response.height - 1;
      } else {
        lastBlockNumber = 0;
      }
    };

    // Poll for events
    const pollEvents = async () => {
      try {
        // Get current block height
        const infoResponse = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'fabricGatewayApi',
          {
            method: 'GET',
            url: `${gatewayUrl}/channels/${channelName}/info`,
            json: true,
          },
        );

        const currentHeight = infoResponse.height;

        // Process new blocks
        while (lastBlockNumber < currentHeight) {
          const blockResponse = await this.helpers.httpRequestWithAuthentication.call(
            this,
            'fabricGatewayApi',
            {
              method: 'GET',
              url: `${gatewayUrl}/channels/${channelName}/blocks/${lastBlockNumber}`,
              json: true,
            },
          );

          if (eventType === 'block') {
            this.emit([this.helpers.returnJsonArray([{
              eventType: 'block',
              blockNumber: lastBlockNumber,
              block: blockResponse,
            }])]);
          } else if (eventType === 'chaincode' && blockResponse.data?.data) {
            // Extract chaincode events from block
            for (const envelope of blockResponse.data.data) {
              const payload = envelope.payload;
              if (payload?.data?.actions) {
                for (const action of payload.data.actions) {
                  const chaincodeEvent = action.payload?.action?.proposal_response_payload?.extension?.events;
                  if (chaincodeEvent && chaincodeEvent.chaincode_id === chaincodeName) {
                    if (!eventNameFilter || new RegExp(eventNameFilter).test(chaincodeEvent.event_name)) {
                      this.emit([this.helpers.returnJsonArray([{
                        eventType: 'chaincode',
                        blockNumber: lastBlockNumber,
                        chaincodeName,
                        eventName: chaincodeEvent.event_name,
                        payload: chaincodeEvent.payload,
                      }])]);
                    }
                  }
                }
              }
            }
          } else if (eventType === 'transaction' && blockResponse.data?.data) {
            for (const envelope of blockResponse.data.data) {
              const txId = envelope.payload?.header?.channel_header?.tx_id;
              if (txId) {
                this.emit([this.helpers.returnJsonArray([{
                  eventType: 'transaction',
                  blockNumber: lastBlockNumber,
                  transactionId: txId,
                  transaction: envelope,
                }])]);
              }
            }
          }

          lastBlockNumber++;
        }
      } catch (error) {
        console.error('Fabric polling error:', error);
      }
    };

    // Initialize
    await initializeStartBlock();

    // Start polling
    const intervalId = setInterval(pollEvents, pollInterval);

    // Cleanup function
    const closeFunction = async () => {
      clearInterval(intervalId);
    };

    return {
      closeFunction,
    };
  }
}
