import { FireFly } from '../nodes/FireFly/FireFly.node';
import { FireFlyTrigger } from '../nodes/FireFly/FireFlyTrigger.node';

describe('FireFly Node', () => {
  let fireFly: FireFly;

  beforeEach(() => {
    fireFly = new FireFly();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(fireFly.description.displayName).toBe('Hyperledger FireFly');
    });

    it('should have correct name', () => {
      expect(fireFly.description.name).toBe('fireFly');
    });

    it('should require fireFlyApi credentials', () => {
      const creds = fireFly.description.credentials;
      expect(creds).toBeDefined();
      expect(creds?.[0].name).toBe('fireFlyApi');
      expect(creds?.[0].required).toBe(true);
    });

    it('should have all required resources', () => {
      const resourceProp = fireFly.description.properties.find(p => p.name === 'resource');
      expect(resourceProp).toBeDefined();
      const options = (resourceProp as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('message');
      expect(values).toContain('token');
      expect(values).toContain('contract');
      expect(values).toContain('data');
      expect(values).toContain('subscription');
    });

    it('should have message operations', () => {
      const operationProps = fireFly.description.properties.filter(p => p.name === 'operation');
      const messageOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('message');
      });
      expect(messageOps).toBeDefined();
      const options = (messageOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('broadcastMessage');
      expect(values).toContain('sendPrivateMessage');
      expect(values).toContain('requestReply');
    });

    it('should have token operations', () => {
      const operationProps = fireFly.description.properties.filter(p => p.name === 'operation');
      const tokenOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('token');
      });
      expect(tokenOps).toBeDefined();
      const options = (tokenOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('mintTokens');
      expect(values).toContain('transferTokens');
      expect(values).toContain('burnTokens');
    });

    it('should have contract operations', () => {
      const operationProps = fireFly.description.properties.filter(p => p.name === 'operation');
      const contractOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('contract');
      });
      expect(contractOps).toBeDefined();
      const options = (contractOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('invokeContract');
      expect(values).toContain('queryContract');
      expect(values).toContain('createContractInterface');
    });
  });
});

describe('FireFly Trigger Node', () => {
  let trigger: FireFlyTrigger;

  beforeEach(() => {
    trigger = new FireFlyTrigger();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(trigger.description.displayName).toBe('Hyperledger FireFly Trigger');
    });

    it('should be a trigger node', () => {
      expect(trigger.description.group).toContain('trigger');
    });

    it('should have event type options', () => {
      const eventTypeProp = trigger.description.properties.find(p => p.name === 'eventType');
      expect(eventTypeProp).toBeDefined();
      const options = (eventTypeProp as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('all');
      expect(values).toContain('message_confirmed');
      expect(values).toContain('token_transfer_confirmed');
      expect(values).toContain('blockchain_event_received');
    });

    it('should have no inputs and one output', () => {
      expect(trigger.description.inputs).toEqual([]);
      expect(trigger.description.outputs).toEqual(['main']);
    });
  });
});
