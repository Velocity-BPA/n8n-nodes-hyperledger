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

export class FireFlyTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Hyperledger FireFly Trigger',
    name: 'fireFlyTrigger',
    icon: 'file:firefly.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["eventType"]}}',
    description: 'Listen for real-time events from Hyperledger FireFly',
    defaults: {
      name: 'FireFly Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'fireFlyApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Event Type',
        name: 'eventType',
        type: 'options',
        options: [
          { name: 'All Events', value: 'all' },
          { name: 'Message Confirmed', value: 'message_confirmed' },
          { name: 'Message Rejected', value: 'message_rejected' },
          { name: 'Token Transfer', value: 'token_transfer_confirmed' },
          { name: 'Token Mint', value: 'token_mint_confirmed' },
          { name: 'Token Burn', value: 'token_burn_confirmed' },
          { name: 'Token Approval', value: 'token_approval_confirmed' },
          { name: 'Contract Event', value: 'blockchain_event_received' },
          { name: 'Transaction Submitted', value: 'transaction_submitted' },
          { name: 'Operation Succeeded', value: 'operation_succeeded' },
          { name: 'Operation Failed', value: 'operation_failed' },
        ],
        default: 'all',
        description: 'The type of event to listen for',
      },
      {
        displayName: 'Subscription Name',
        name: 'subscriptionName',
        type: 'string',
        default: 'n8n-subscription',
        description: 'Name for the FireFly subscription',
        required: true,
      },
      {
        displayName: 'Poll Interval',
        name: 'pollInterval',
        type: 'number',
        default: 5000,
        description: 'How often to poll for new events (in milliseconds)',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Topic Filter',
            name: 'topicFilter',
            type: 'string',
            default: '',
            description: 'Filter events by topic (comma-separated)',
          },
          {
            displayName: 'Tag Filter',
            name: 'tagFilter',
            type: 'string',
            default: '',
            description: 'Filter events by tag',
          },
          {
            displayName: 'Author Filter',
            name: 'authorFilter',
            type: 'string',
            default: '',
            description: 'Filter events by author identity',
          },
        ],
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const credentials = await this.getCredentials('fireFlyApi');
    const baseUrl = credentials.baseUrl as string;
    const namespace = credentials.namespace as string;
    const eventType = this.getNodeParameter('eventType') as string;
    const subscriptionName = this.getNodeParameter('subscriptionName') as string;
    const pollInterval = this.getNodeParameter('pollInterval') as number;
    const options = this.getNodeParameter('options', {}) as {
      topicFilter?: string;
      tagFilter?: string;
      authorFilter?: string;
    };

    let lastEventId: string | null = null;
    let subscriptionId: string | null = null;

    // Create subscription
    const createSubscription = async () => {
      const filter: Record<string, unknown> = {};
      
      if (eventType !== 'all') {
        filter.events = eventType;
      }
      
      if (options.topicFilter) {
        filter.topic = options.topicFilter;
      }
      
      if (options.tagFilter) {
        filter.tag = options.tagFilter;
      }
      
      if (options.authorFilter) {
        filter.author = options.authorFilter;
      }

      const response = await this.helpers.httpRequestWithAuthentication.call(
        this,
        'fireFlyApi',
        {
          method: 'POST',
          url: `${baseUrl}/api/v1/namespaces/${namespace}/subscriptions`,
          body: {
            name: `${subscriptionName}-${Date.now()}`,
            transport: 'webhooks',
            filter,
            options: {
              firstEvent: 'newest',
            },
          },
          json: true,
        },
      );

      subscriptionId = response.id;
      return response;
    };

    // Poll for events
    const pollEvents = async () => {
      try {
        let endpoint = `${baseUrl}/api/v1/namespaces/${namespace}/events?limit=100&sort=sequence`;
        
        if (lastEventId) {
          endpoint += `&after=${lastEventId}`;
        }

        if (eventType !== 'all') {
          endpoint += `&type=${eventType}`;
        }

        const response = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'fireFlyApi',
          {
            method: 'GET',
            url: endpoint,
            json: true,
          },
        );

        if (Array.isArray(response) && response.length > 0) {
          for (const event of response) {
            lastEventId = event.id;
            this.emit([this.helpers.returnJsonArray([event])]);
          }
        }
      } catch (error) {
        console.error('FireFly polling error:', error);
      }
    };

    // Initialize
    await createSubscription();
    
    // Start polling
    const intervalId = setInterval(pollEvents, pollInterval);

    // Cleanup function
    const closeFunction = async () => {
      clearInterval(intervalId);
      
      // Delete subscription if it was created
      if (subscriptionId) {
        try {
          await this.helpers.httpRequestWithAuthentication.call(
            this,
            'fireFlyApi',
            {
              method: 'DELETE',
              url: `${baseUrl}/api/v1/namespaces/${namespace}/subscriptions/${subscriptionId}`,
              json: true,
            },
          );
        } catch (error) {
          console.error('Error deleting FireFly subscription:', error);
        }
      }
    };

    return {
      closeFunction,
    };
  }
}
