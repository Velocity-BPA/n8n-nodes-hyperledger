/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */
import type {
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
  IDataObject,
} from 'n8n-workflow';

export class AcaPyWebhook implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Hyperledger Aries Webhook',
    name: 'acaPyWebhook',
    icon: 'file:acapy.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["topic"]}}',
    description: 'Receive webhooks from ACA-Py agent for protocol events',
    defaults: {
      name: 'ACA-Py Webhook',
    },
    inputs: [],
    outputs: ['main'],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Topic Filter',
        name: 'topic',
        type: 'options',
        options: [
          { name: 'All Topics', value: 'all' },
          { name: 'Connections', value: 'connections' },
          { name: 'Basic Messages', value: 'basicmessages' },
          { name: 'Issue Credential', value: 'issue_credential' },
          { name: 'Issue Credential V2', value: 'issue_credential_v2_0' },
          { name: 'Present Proof', value: 'present_proof' },
          { name: 'Present Proof V2', value: 'present_proof_v2_0' },
          { name: 'Revocation Registry', value: 'revocation_registry' },
          { name: 'Problem Report', value: 'problem_report' },
          { name: 'Ping', value: 'ping' },
          { name: 'Out of Band', value: 'out_of_band' },
        ],
        default: 'all',
        description: 'Filter webhooks by topic type',
      },
      {
        displayName: 'State Filter',
        name: 'stateFilter',
        type: 'string',
        default: '',
        description: 'Filter by specific state (e.g., "active", "request", "credential_issued")',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Connection ID Filter',
            name: 'connectionIdFilter',
            type: 'string',
            default: '',
            description: 'Only process webhooks for a specific connection ID',
          },
          {
            displayName: 'Include Raw Body',
            name: 'includeRawBody',
            type: 'boolean',
            default: false,
            description: 'Whether to include the raw request body in the output',
          },
        ],
      },
    ],
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const body = this.getBodyData() as Record<string, unknown>;
    const topicFilter = this.getNodeParameter('topic') as string;
    const stateFilter = this.getNodeParameter('stateFilter', '') as string;
    const options = this.getNodeParameter('options', {}) as {
      connectionIdFilter?: string;
      includeRawBody?: boolean;
    };

    // Extract topic from the URL path or body
    const urlPath = req.path || '';
    const pathParts = urlPath.split('/');
    const topic = pathParts[pathParts.length - 1] || (body.topic as string) || 'unknown';

    // Apply topic filter
    if (topicFilter !== 'all' && topic !== topicFilter) {
      return { noWebhookResponse: true };
    }

    // Apply state filter
    if (stateFilter && body.state !== stateFilter) {
      return { noWebhookResponse: true };
    }

    // Apply connection ID filter
    if (options.connectionIdFilter && body.connection_id !== options.connectionIdFilter) {
      return { noWebhookResponse: true };
    }

    // Build response data
    const responseData: IDataObject = {
      topic,
      timestamp: new Date().toISOString(),
    };

    // Copy body properties with proper typing
    for (const [key, value] of Object.entries(body)) {
      responseData[key] = value as IDataObject[keyof IDataObject];
    }

    if (options.includeRawBody) {
      responseData.rawBody = JSON.stringify(body);
    }

    return {
      workflowData: [this.helpers.returnJsonArray([responseData])],
    };
  }
}
