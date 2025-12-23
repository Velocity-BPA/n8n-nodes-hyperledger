import { AcaPy } from '../nodes/AcaPy/AcaPy.node';
import { AcaPyWebhook } from '../nodes/AcaPy/AcaPyWebhook.node';

describe('ACA-Py Node', () => {
  let acaPy: AcaPy;

  beforeEach(() => {
    acaPy = new AcaPy();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(acaPy.description.displayName).toBe('Hyperledger Aries (ACA-Py)');
    });

    it('should have correct name', () => {
      expect(acaPy.description.name).toBe('acaPy');
    });

    it('should require acaPyApi credentials', () => {
      const creds = acaPy.description.credentials;
      expect(creds).toBeDefined();
      expect(creds?.[0].name).toBe('acaPyApi');
      expect(creds?.[0].required).toBe(true);
    });

    it('should have all required resources', () => {
      const resourceProp = acaPy.description.properties.find(p => p.name === 'resource');
      expect(resourceProp).toBeDefined();
      const options = (resourceProp as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('connection');
      expect(values).toContain('credentialIssuer');
      expect(values).toContain('credentialHolder');
      expect(values).toContain('presentation');
      expect(values).toContain('schema');
      expect(values).toContain('did');
    });

    it('should have connection operations', () => {
      const operationProps = acaPy.description.properties.filter(p => p.name === 'operation');
      const connOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('connection');
      });
      expect(connOps).toBeDefined();
      const options = (connOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('createInvitation');
      expect(values).toContain('receiveInvitation');
      expect(values).toContain('getConnections');
      expect(values).toContain('getConnection');
      expect(values).toContain('deleteConnection');
    });

    it('should have credential issuer operations', () => {
      const operationProps = acaPy.description.properties.filter(p => p.name === 'operation');
      const credOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('credentialIssuer');
      });
      expect(credOps).toBeDefined();
      const options = (credOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('createCredDef');
      expect(values).toContain('issueCredential');
      expect(values).toContain('revokeCredential');
    });

    it('should have presentation operations', () => {
      const operationProps = acaPy.description.properties.filter(p => p.name === 'operation');
      const presOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('presentation');
      });
      expect(presOps).toBeDefined();
      const options = (presOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('requestPresentation');
      expect(values).toContain('verifyPresentation');
      expect(values).toContain('getPresentationExchanges');
    });

    it('should have DID operations', () => {
      const operationProps = acaPy.description.properties.filter(p => p.name === 'operation');
      const didOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('did');
      });
      expect(didOps).toBeDefined();
      const options = (didOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('createDID');
      expect(values).toContain('getDIDs');
      expect(values).toContain('setPublicDID');
      expect(values).toContain('resolveDID');
    });
  });
});

describe('ACA-Py Webhook Node', () => {
  let webhook: AcaPyWebhook;

  beforeEach(() => {
    webhook = new AcaPyWebhook();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(webhook.description.displayName).toBe('Hyperledger Aries Webhook');
    });

    it('should be a trigger node', () => {
      expect(webhook.description.group).toContain('trigger');
    });

    it('should have topic filter options', () => {
      const topicProp = webhook.description.properties.find(p => p.name === 'topic');
      expect(topicProp).toBeDefined();
      const options = (topicProp as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('all');
      expect(values).toContain('connections');
      expect(values).toContain('issue_credential');
      expect(values).toContain('present_proof');
    });

    it('should have webhook configuration', () => {
      expect(webhook.description.webhooks).toBeDefined();
      expect(webhook.description.webhooks?.length).toBe(1);
      expect(webhook.description.webhooks?.[0].httpMethod).toBe('POST');
    });
  });
});
