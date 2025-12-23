import { FireFlyApi } from '../credentials/FireFlyApi.credentials';
import { FabricGatewayApi } from '../credentials/FabricGatewayApi.credentials';
import { AcaPyApi } from '../credentials/AcaPyApi.credentials';
import { BesuApi } from '../credentials/BesuApi.credentials';

describe('Credentials', () => {
  describe('FireFlyApi', () => {
    let credentials: FireFlyApi;

    beforeEach(() => {
      credentials = new FireFlyApi();
    });

    it('should have correct name', () => {
      expect(credentials.name).toBe('fireFlyApi');
    });

    it('should have correct display name', () => {
      expect(credentials.displayName).toBe('Hyperledger FireFly API');
    });

    it('should have required properties', () => {
      const propNames = credentials.properties.map(p => p.name);
      expect(propNames).toContain('baseUrl');
      expect(propNames).toContain('namespace');
      expect(propNames).toContain('apiKey');
    });

    it('should have test request configured', () => {
      expect(credentials.test).toBeDefined();
      expect(credentials.test?.request?.url).toBe('/api/v1/status');
    });
  });

  describe('FabricGatewayApi', () => {
    let credentials: FabricGatewayApi;

    beforeEach(() => {
      credentials = new FabricGatewayApi();
    });

    it('should have correct name', () => {
      expect(credentials.name).toBe('fabricGatewayApi');
    });

    it('should have correct display name', () => {
      expect(credentials.displayName).toBe('Hyperledger Fabric Gateway API');
    });

    it('should have required properties', () => {
      const propNames = credentials.properties.map(p => p.name);
      expect(propNames).toContain('gatewayUrl');
      expect(propNames).toContain('channelName');
      expect(propNames).toContain('mspId');
      expect(propNames).toContain('userId');
    });

    it('should have certificate properties', () => {
      const propNames = credentials.properties.map(p => p.name);
      expect(propNames).toContain('clientCert');
      expect(propNames).toContain('clientKey');
      expect(propNames).toContain('tlsCaCert');
    });
  });

  describe('AcaPyApi', () => {
    let credentials: AcaPyApi;

    beforeEach(() => {
      credentials = new AcaPyApi();
    });

    it('should have correct name', () => {
      expect(credentials.name).toBe('acaPyApi');
    });

    it('should have correct display name', () => {
      expect(credentials.displayName).toBe('Hyperledger Aries Cloud Agent (ACA-Py) API');
    });

    it('should have required properties', () => {
      const propNames = credentials.properties.map(p => p.name);
      expect(propNames).toContain('adminUrl');
      expect(propNames).toContain('apiKey');
    });

    it('should have multi-tenant properties', () => {
      const propNames = credentials.properties.map(p => p.name);
      expect(propNames).toContain('multiTenant');
      expect(propNames).toContain('walletId');
      expect(propNames).toContain('walletKey');
    });

    it('should have test request configured', () => {
      expect(credentials.test).toBeDefined();
      expect(credentials.test?.request?.url).toBe('/status');
    });
  });

  describe('BesuApi', () => {
    let credentials: BesuApi;

    beforeEach(() => {
      credentials = new BesuApi();
    });

    it('should have correct name', () => {
      expect(credentials.name).toBe('besuApi');
    });

    it('should have correct display name', () => {
      expect(credentials.displayName).toBe('Hyperledger Besu JSON-RPC API');
    });

    it('should have required properties', () => {
      const propNames = credentials.properties.map(p => p.name);
      expect(propNames).toContain('rpcUrl');
      expect(propNames).toContain('authToken');
    });

    it('should have privacy properties', () => {
      const propNames = credentials.properties.map(p => p.name);
      expect(propNames).toContain('privacyGroupId');
      expect(propNames).toContain('tesseraUrl');
    });

    it('should have test request configured', () => {
      expect(credentials.test).toBeDefined();
      expect(credentials.test?.request?.method).toBe('POST');
    });
  });
});
