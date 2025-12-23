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

export class AcaPy implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Hyperledger Aries (ACA-Py)',
    name: 'acaPy',
    icon: 'file:acapy.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Aries Cloud Agent Python - Self-Sovereign Identity',
    defaults: {
      name: 'Hyperledger Aries',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'acaPyApi',
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
          { name: 'Connection', value: 'connection' },
          { name: 'Credential (Issuer)', value: 'credentialIssuer' },
          { name: 'Credential (Holder)', value: 'credentialHolder' },
          { name: 'Presentation', value: 'presentation' },
          { name: 'Schema', value: 'schema' },
          { name: 'DID', value: 'did' },
        ],
        default: 'connection',
      },
      // Connection Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['connection'] } },
        options: [
          { name: 'Create Invitation', value: 'createInvitation', action: 'Create a connection invitation' },
          { name: 'Receive Invitation', value: 'receiveInvitation', action: 'Receive and accept an invitation' },
          { name: 'Get Connections', value: 'getConnections', action: 'List all connections' },
          { name: 'Get Connection', value: 'getConnection', action: 'Get connection details' },
          { name: 'Delete Connection', value: 'deleteConnection', action: 'Remove a connection' },
        ],
        default: 'createInvitation',
      },
      // Credential Issuer Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['credentialIssuer'] } },
        options: [
          { name: 'Create Credential Definition', value: 'createCredDef', action: 'Create a credential definition' },
          { name: 'Issue Credential', value: 'issueCredential', action: 'Issue a credential' },
          { name: 'Get Issued Credentials', value: 'getIssuedCredentials', action: 'List issued credentials' },
          { name: 'Revoke Credential', value: 'revokeCredential', action: 'Revoke a credential' },
        ],
        default: 'issueCredential',
      },
      // Credential Holder Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['credentialHolder'] } },
        options: [
          { name: 'Get Credentials', value: 'getCredentials', action: 'List credentials in wallet' },
          { name: 'Get Credential', value: 'getCredential', action: 'Get credential details' },
          { name: 'Delete Credential', value: 'deleteCredential', action: 'Remove credential from wallet' },
        ],
        default: 'getCredentials',
      },
      // Presentation Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['presentation'] } },
        options: [
          { name: 'Request Presentation', value: 'requestPresentation', action: 'Request a proof presentation' },
          { name: 'Verify Presentation', value: 'verifyPresentation', action: 'Verify a received presentation' },
          { name: 'Get Presentation Exchanges', value: 'getPresentationExchanges', action: 'List presentation exchanges' },
        ],
        default: 'requestPresentation',
      },
      // Schema Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['schema'] } },
        options: [
          { name: 'Create Schema', value: 'createSchema', action: 'Create and publish a schema' },
          { name: 'Get Schemas', value: 'getSchemas', action: 'List available schemas' },
          { name: 'Get Schema', value: 'getSchema', action: 'Get schema by ID' },
        ],
        default: 'createSchema',
      },
      // DID Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['did'] } },
        options: [
          { name: 'Create DID', value: 'createDID', action: 'Create a new DID' },
          { name: 'Get DIDs', value: 'getDIDs', action: 'List wallet DIDs' },
          { name: 'Set Public DID', value: 'setPublicDID', action: 'Set the public DID' },
          { name: 'Resolve DID', value: 'resolveDID', action: 'Resolve a DID to its document' },
        ],
        default: 'createDID',
      },
      // Connection Parameters
      {
        displayName: 'Alias',
        name: 'alias',
        type: 'string',
        default: '',
        description: 'Alias for the connection',
        displayOptions: { show: { resource: ['connection'], operation: ['createInvitation'] } },
      },
      {
        displayName: 'Auto Accept',
        name: 'autoAccept',
        type: 'boolean',
        default: true,
        description: 'Whether to auto-accept the connection',
        displayOptions: { show: { resource: ['connection'], operation: ['createInvitation', 'receiveInvitation'] } },
      },
      {
        displayName: 'Multi Use',
        name: 'multiUse',
        type: 'boolean',
        default: false,
        description: 'Whether the invitation can be used multiple times',
        displayOptions: { show: { resource: ['connection'], operation: ['createInvitation'] } },
      },
      {
        displayName: 'Invitation',
        name: 'invitation',
        type: 'json',
        default: '{}',
        description: 'The invitation object to receive',
        displayOptions: { show: { resource: ['connection'], operation: ['receiveInvitation'] } },
        required: true,
      },
      {
        displayName: 'Connection ID',
        name: 'connectionId',
        type: 'string',
        default: '',
        description: 'The connection ID',
        displayOptions: { show: { resource: ['connection'], operation: ['getConnection', 'deleteConnection'] } },
        required: true,
      },
      // Credential Definition Parameters
      {
        displayName: 'Schema ID',
        name: 'schemaId',
        type: 'string',
        default: '',
        description: 'The schema ID for the credential definition',
        displayOptions: { show: { resource: ['credentialIssuer'], operation: ['createCredDef'] } },
        required: true,
      },
      {
        displayName: 'Tag',
        name: 'credDefTag',
        type: 'string',
        default: 'default',
        description: 'Tag for the credential definition',
        displayOptions: { show: { resource: ['credentialIssuer'], operation: ['createCredDef'] } },
      },
      {
        displayName: 'Support Revocation',
        name: 'supportRevocation',
        type: 'boolean',
        default: false,
        description: 'Whether to support credential revocation',
        displayOptions: { show: { resource: ['credentialIssuer'], operation: ['createCredDef'] } },
      },
      // Issue Credential Parameters
      {
        displayName: 'Connection ID',
        name: 'issueConnectionId',
        type: 'string',
        default: '',
        description: 'The connection ID to issue credential to',
        displayOptions: { show: { resource: ['credentialIssuer'], operation: ['issueCredential'] } },
        required: true,
      },
      {
        displayName: 'Credential Definition ID',
        name: 'credDefId',
        type: 'string',
        default: '',
        description: 'The credential definition ID',
        displayOptions: { show: { resource: ['credentialIssuer'], operation: ['issueCredential'] } },
        required: true,
      },
      {
        displayName: 'Credential Attributes',
        name: 'credentialAttributes',
        type: 'json',
        default: '[]',
        description: 'Array of {name, value} attribute objects',
        displayOptions: { show: { resource: ['credentialIssuer'], operation: ['issueCredential'] } },
        required: true,
      },
      {
        displayName: 'Credential Exchange ID',
        name: 'credExId',
        type: 'string',
        default: '',
        description: 'The credential exchange ID',
        displayOptions: { show: { resource: ['credentialIssuer'], operation: ['revokeCredential'] } },
        required: true,
      },
      // Credential Holder Parameters
      {
        displayName: 'Credential ID',
        name: 'credentialId',
        type: 'string',
        default: '',
        description: 'The credential ID',
        displayOptions: { show: { resource: ['credentialHolder'], operation: ['getCredential', 'deleteCredential'] } },
        required: true,
      },
      // Presentation Parameters
      {
        displayName: 'Connection ID',
        name: 'presConnectionId',
        type: 'string',
        default: '',
        description: 'The connection ID to request presentation from',
        displayOptions: { show: { resource: ['presentation'], operation: ['requestPresentation'] } },
        required: true,
      },
      {
        displayName: 'Proof Request',
        name: 'proofRequest',
        type: 'json',
        default: '{}',
        description: 'The proof request object',
        displayOptions: { show: { resource: ['presentation'], operation: ['requestPresentation'] } },
        required: true,
      },
      {
        displayName: 'Presentation Exchange ID',
        name: 'presExId',
        type: 'string',
        default: '',
        description: 'The presentation exchange ID',
        displayOptions: { show: { resource: ['presentation'], operation: ['verifyPresentation'] } },
        required: true,
      },
      // Schema Parameters
      {
        displayName: 'Schema Name',
        name: 'schemaName',
        type: 'string',
        default: '',
        description: 'Name of the schema',
        displayOptions: { show: { resource: ['schema'], operation: ['createSchema'] } },
        required: true,
      },
      {
        displayName: 'Schema Version',
        name: 'schemaVersion',
        type: 'string',
        default: '1.0',
        description: 'Version of the schema',
        displayOptions: { show: { resource: ['schema'], operation: ['createSchema'] } },
        required: true,
      },
      {
        displayName: 'Schema Attributes',
        name: 'schemaAttributes',
        type: 'string',
        default: '',
        description: 'Comma-separated list of attribute names',
        displayOptions: { show: { resource: ['schema'], operation: ['createSchema'] } },
        required: true,
      },
      {
        displayName: 'Schema ID',
        name: 'getSchemaId',
        type: 'string',
        default: '',
        description: 'The schema ID to retrieve',
        displayOptions: { show: { resource: ['schema'], operation: ['getSchema'] } },
        required: true,
      },
      // DID Parameters
      {
        displayName: 'DID Method',
        name: 'didMethod',
        type: 'options',
        options: [
          { name: 'SOV (Indy)', value: 'sov' },
          { name: 'Key', value: 'key' },
        ],
        default: 'sov',
        description: 'The DID method to use',
        displayOptions: { show: { resource: ['did'], operation: ['createDID'] } },
      },
      {
        displayName: 'DID',
        name: 'did',
        type: 'string',
        default: '',
        description: 'The DID to set as public or resolve',
        displayOptions: { show: { resource: ['did'], operation: ['setPublicDID', 'resolveDID'] } },
        required: true,
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
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            default: 100,
            description: 'Maximum number of results',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('acaPyApi');
    const adminUrl = credentials.adminUrl as string;

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        let endpoint = '';
        let method: IHttpRequestMethods = 'GET';
        let body: Record<string, unknown> = {};

        // Connection Operations
        if (resource === 'connection') {
          if (operation === 'createInvitation') {
            method = 'POST';
            endpoint = '/connections/create-invitation';
            const alias = this.getNodeParameter('alias', i, '') as string;
            const autoAccept = this.getNodeParameter('autoAccept', i) as boolean;
            const multiUse = this.getNodeParameter('multiUse', i) as boolean;
            endpoint += `?auto_accept=${autoAccept}&multi_use=${multiUse}`;
            if (alias) endpoint += `&alias=${encodeURIComponent(alias)}`;
          } else if (operation === 'receiveInvitation') {
            method = 'POST';
            endpoint = '/connections/receive-invitation';
            const invitation = JSON.parse(this.getNodeParameter('invitation', i) as string);
            const autoAccept = this.getNodeParameter('autoAccept', i) as boolean;
            endpoint += `?auto_accept=${autoAccept}`;
            body = invitation;
          } else if (operation === 'getConnections') {
            method = 'GET';
            endpoint = '/connections';
          } else if (operation === 'getConnection') {
            method = 'GET';
            const connectionId = this.getNodeParameter('connectionId', i) as string;
            endpoint = `/connections/${connectionId}`;
          } else if (operation === 'deleteConnection') {
            method = 'DELETE';
            const connectionId = this.getNodeParameter('connectionId', i) as string;
            endpoint = `/connections/${connectionId}`;
          }
        }
        // Credential Issuer Operations
        else if (resource === 'credentialIssuer') {
          if (operation === 'createCredDef') {
            method = 'POST';
            endpoint = '/credential-definitions';
            const schemaId = this.getNodeParameter('schemaId', i) as string;
            const tag = this.getNodeParameter('credDefTag', i) as string;
            const supportRevocation = this.getNodeParameter('supportRevocation', i) as boolean;
            body = {
              schema_id: schemaId,
              tag,
              support_revocation: supportRevocation,
            };
          } else if (operation === 'issueCredential') {
            method = 'POST';
            endpoint = '/issue-credential/send';
            const connectionId = this.getNodeParameter('issueConnectionId', i) as string;
            const credDefId = this.getNodeParameter('credDefId', i) as string;
            const attributes = JSON.parse(this.getNodeParameter('credentialAttributes', i) as string);
            body = {
              connection_id: connectionId,
              cred_def_id: credDefId,
              credential_proposal: {
                '@type': 'issue-credential/1.0/credential-preview',
                attributes,
              },
            };
          } else if (operation === 'getIssuedCredentials') {
            method = 'GET';
            endpoint = '/issue-credential/records';
          } else if (operation === 'revokeCredential') {
            method = 'POST';
            endpoint = '/revocation/revoke';
            const credExId = this.getNodeParameter('credExId', i) as string;
            body = { cred_ex_id: credExId };
          }
        }
        // Credential Holder Operations
        else if (resource === 'credentialHolder') {
          if (operation === 'getCredentials') {
            method = 'GET';
            endpoint = '/credentials';
          } else if (operation === 'getCredential') {
            method = 'GET';
            const credentialId = this.getNodeParameter('credentialId', i) as string;
            endpoint = `/credential/${credentialId}`;
          } else if (operation === 'deleteCredential') {
            method = 'DELETE';
            const credentialId = this.getNodeParameter('credentialId', i) as string;
            endpoint = `/credential/${credentialId}`;
          }
        }
        // Presentation Operations
        else if (resource === 'presentation') {
          if (operation === 'requestPresentation') {
            method = 'POST';
            endpoint = '/present-proof/send-request';
            const connectionId = this.getNodeParameter('presConnectionId', i) as string;
            const proofRequest = JSON.parse(this.getNodeParameter('proofRequest', i) as string);
            body = {
              connection_id: connectionId,
              proof_request: proofRequest,
            };
          } else if (operation === 'verifyPresentation') {
            method = 'POST';
            const presExId = this.getNodeParameter('presExId', i) as string;
            endpoint = `/present-proof/records/${presExId}/verify-presentation`;
          } else if (operation === 'getPresentationExchanges') {
            method = 'GET';
            endpoint = '/present-proof/records';
          }
        }
        // Schema Operations
        else if (resource === 'schema') {
          if (operation === 'createSchema') {
            method = 'POST';
            endpoint = '/schemas';
            const schemaName = this.getNodeParameter('schemaName', i) as string;
            const schemaVersion = this.getNodeParameter('schemaVersion', i) as string;
            const attributesStr = this.getNodeParameter('schemaAttributes', i) as string;
            const attributes = attributesStr.split(',').map(a => a.trim());
            body = {
              schema_name: schemaName,
              schema_version: schemaVersion,
              attributes,
            };
          } else if (operation === 'getSchemas') {
            method = 'GET';
            endpoint = '/schemas/created';
          } else if (operation === 'getSchema') {
            method = 'GET';
            const schemaId = this.getNodeParameter('getSchemaId', i) as string;
            endpoint = `/schemas/${schemaId}`;
          }
        }
        // DID Operations
        else if (resource === 'did') {
          if (operation === 'createDID') {
            method = 'POST';
            endpoint = '/wallet/did/create';
            const didMethod = this.getNodeParameter('didMethod', i) as string;
            body = { method: didMethod };
          } else if (operation === 'getDIDs') {
            method = 'GET';
            endpoint = '/wallet/did';
          } else if (operation === 'setPublicDID') {
            method = 'POST';
            const did = this.getNodeParameter('did', i) as string;
            endpoint = `/wallet/did/public?did=${encodeURIComponent(did)}`;
          } else if (operation === 'resolveDID') {
            method = 'GET';
            const did = this.getNodeParameter('did', i) as string;
            endpoint = `/resolver/resolve/${encodeURIComponent(did)}`;
          }
        }

        const requestOptions: {
          method: IHttpRequestMethods;
          url: string;
          json: boolean;
          body?: Record<string, unknown>;
        } = {
          method,
          url: `${adminUrl}${endpoint}`,
          json: true,
        };

        if (['POST', 'PUT', 'PATCH'].includes(method) && Object.keys(body).length > 0) {
          requestOptions.body = body;
        }

        const response = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'acaPyApi',
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
