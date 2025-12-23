import { Fabric } from '../nodes/Fabric/Fabric.node';
import { FabricTrigger } from '../nodes/Fabric/FabricTrigger.node';

describe('Fabric Node', () => {
  let fabric: Fabric;

  beforeEach(() => {
    fabric = new Fabric();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(fabric.description.displayName).toBe('Hyperledger Fabric');
    });

    it('should have correct name', () => {
      expect(fabric.description.name).toBe('fabric');
    });

    it('should require fabricGatewayApi credentials', () => {
      const creds = fabric.description.credentials;
      expect(creds).toBeDefined();
      expect(creds?.[0].name).toBe('fabricGatewayApi');
      expect(creds?.[0].required).toBe(true);
    });

    it('should have all required resources', () => {
      const resourceProp = fabric.description.properties.find(p => p.name === 'resource');
      expect(resourceProp).toBeDefined();
      const options = (resourceProp as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('transaction');
      expect(values).toContain('chaincode');
      expect(values).toContain('ledger');
      expect(values).toContain('identity');
    });

    it('should have transaction operations', () => {
      const operationProps = fabric.description.properties.filter(p => p.name === 'operation');
      const txOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('transaction');
      });
      expect(txOps).toBeDefined();
      const options = (txOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('submitTransaction');
      expect(values).toContain('evaluateTransaction');
      expect(values).toContain('getTransactionById');
    });

    it('should have ledger operations', () => {
      const operationProps = fabric.description.properties.filter(p => p.name === 'operation');
      const ledgerOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('ledger');
      });
      expect(ledgerOps).toBeDefined();
      const options = (ledgerOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('getBlockByNumber');
      expect(values).toContain('getBlockByHash');
      expect(values).toContain('getLatestBlock');
      expect(values).toContain('getBlockHeight');
    });

    it('should have identity operations', () => {
      const operationProps = fabric.description.properties.filter(p => p.name === 'operation');
      const identityOps = operationProps.find(p => {
        const displayOptions = p.displayOptions as { show?: { resource?: string[] } };
        return displayOptions?.show?.resource?.includes('identity');
      });
      expect(identityOps).toBeDefined();
      const options = (identityOps as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('enrollUser');
      expect(values).toContain('registerUser');
      expect(values).toContain('revokeUser');
    });
  });
});

describe('Fabric Trigger Node', () => {
  let trigger: FabricTrigger;

  beforeEach(() => {
    trigger = new FabricTrigger();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(trigger.description.displayName).toBe('Hyperledger Fabric Trigger');
    });

    it('should be a trigger node', () => {
      expect(trigger.description.group).toContain('trigger');
    });

    it('should have event type options', () => {
      const eventTypeProp = trigger.description.properties.find(p => p.name === 'eventType');
      expect(eventTypeProp).toBeDefined();
      const options = (eventTypeProp as { options: Array<{ value: string }> }).options;
      const values = options.map(o => o.value);
      expect(values).toContain('block');
      expect(values).toContain('chaincode');
      expect(values).toContain('transaction');
    });

    it('should have no inputs and one output', () => {
      expect(trigger.description.inputs).toEqual([]);
      expect(trigger.description.outputs).toEqual(['main']);
    });
  });
});
