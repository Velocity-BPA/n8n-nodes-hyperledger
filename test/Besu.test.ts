import { Besu } from '../nodes/Besu/Besu.node';
import { BesuTrigger } from '../nodes/Besu/BesuTrigger.node';

describe('Besu Node', () => {
  let besu: Besu;

  beforeEach(() => {
    besu = new Besu();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(besu.description.displayName).toBe('Hyperledger Besu');
    });

    it('should have correct name', () => {
      expect(besu.description.name).toBe('besu');
    });

    it('should require besuApi credentials', () => {
      const creds = besu.description.credentials;
      expect(creds).toBeDefined();
      expect(creds?.[0].name).toBe('besuApi');
      expect(creds?.[0].required).toBe(true);
    });

    it('should have all required resources', () => {
      const resourceProp = besu.description.properties.find(p => p.name === 'resource');
      expect(resourceProp).toBeDefined();
      const options = (resourceProp as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('ethereum');
      expect(values).toContain('permissioning');
      expect(values).toContain('privacy');
    });

    it('should have ethereum operations', () => {
      const operationProps = besu.description.properties.filter(p => p.name === 'operation');
      const ethOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('ethereum');
      });
      expect(ethOps).toBeDefined();
      const options = (ethOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('getBalance');
      expect(values).toContain('sendTransaction');
      expect(values).toContain('call');
      expect(values).toContain('getTransactionReceipt');
      expect(values).toContain('getBlockByNumber');
    });

    it('should have permissioning operations', () => {
      const operationProps = besu.description.properties.filter(p => p.name === 'operation');
      const permOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('permissioning');
      });
      expect(permOps).toBeDefined();
      const options = (permOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('getPermissionedNodes');
      expect(values).toContain('addPermissionedNode');
      expect(values).toContain('removePermissionedNode');
      expect(values).toContain('addAccountToAllowlist');
    });

    it('should have privacy operations', () => {
      const operationProps = besu.description.properties.filter(p => p.name === 'operation');
      const privOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('privacy');
      });
      expect(privOps).toBeDefined();
      const options = (privOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('createPrivacyGroup');
      expect(values).toContain('getPrivacyGroup');
      expect(values).toContain('findPrivacyGroup');
      expect(values).toContain('sendPrivateTransaction');
    });
  });
});

describe('Besu Trigger Node', () => {
  let trigger: BesuTrigger;

  beforeEach(() => {
    trigger = new BesuTrigger();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(trigger.description.displayName).toBe('Hyperledger Besu Trigger');
    });

    it('should be a trigger node', () => {
      expect(trigger.description.group).toContain('trigger');
    });

    it('should have event type options', () => {
      const eventTypeProp = trigger.description.properties.find(p => p.name === 'eventType');
      expect(eventTypeProp).toBeDefined();
      const options = (eventTypeProp as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('newBlocks');
      expect(values).toContain('logs');
      expect(values).toContain('pendingTransactions');
    });

    it('should have no inputs and one output', () => {
      expect(trigger.description.inputs).toEqual([]);
      expect(trigger.description.outputs).toEqual(['main']);
    });
  });
});
