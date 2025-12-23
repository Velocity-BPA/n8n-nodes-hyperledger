# Setting Up Hyperledger Fabric

This guide walks you through setting up a Hyperledger Fabric test network for use with n8n-nodes-hyperledger.

## Prerequisites

- Docker and Docker Compose
- Go 1.19+
- Node.js 18+
- Git

## Quick Start with Test Network

### Download Fabric Samples

```bash
# Download fabric-samples, binaries, and Docker images
curl -sSL https://bit.ly/2ysbOFE | bash -s

# Navigate to test-network
cd fabric-samples/test-network
```

### Start the Network

```bash
# Start network with CouchDB and create channel
./network.sh up createChannel -c mychannel -ca -s couchdb

# Deploy the basic chaincode
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-go -ccl go
```

This creates:
- 2 Organizations (Org1 and Org2)
- 1 Orderer organization
- 1 Channel (mychannel)
- Basic asset-transfer chaincode

## Setting Up a REST Gateway

The n8n node requires a REST API gateway. We recommend **firefly-fabconnect**.

### Install FabConnect

```bash
# Clone the repository
git clone https://github.com/hyperledger/firefly-fabconnect.git
cd firefly-fabconnect

# Build
make

# Or use Docker
docker pull ghcr.io/hyperledger/firefly-fabconnect
```

### Configure FabConnect

Create `config.yaml`:

```yaml
rest:
  port: 3000
  
rpc:
  configPath: /path/to/connection-org1.yaml
  
events:
  webhooks:
    url: http://localhost:5678/webhook/fabric

blockchain:
  mspId: Org1MSP
  user: Admin
```

### Start FabConnect

```bash
./fabconnect -f config.yaml
```

## Configuring n8n Credentials

1. In n8n, go to **Credentials** > **New Credential**
2. Search for "Hyperledger Fabric Gateway API"
3. Configure:
   - **Gateway URL**: `http://localhost:3000`
   - **Channel Name**: `mychannel`
   - **Organization MSP ID**: `Org1MSP`
   - **User Identity**: `Admin`

## Testing the Connection

Create a simple workflow:

1. Add a **Manual Trigger** node
2. Add a **Hyperledger Fabric** node
3. Select **Resource**: Ledger
4. Select **Operation**: Get Block Height
5. Execute the workflow

## Common Operations

### Query Chaincode

```json
{
  "resource": "chaincode",
  "operation": "queryChaincode",
  "chaincodeName": "basic",
  "functionName": "GetAllAssets",
  "arguments": "[]"
}
```

### Submit Transaction

```json
{
  "resource": "transaction",
  "operation": "submitTransaction",
  "chaincodeName": "basic",
  "functionName": "CreateAsset",
  "arguments": "[\"asset1\", \"blue\", \"5\", \"Tom\", \"1300\"]"
}
```

### Get Block Information

```json
{
  "resource": "ledger",
  "operation": "getBlockByNumber",
  "blockNumber": 0
}
```

## Cleanup

```bash
cd fabric-samples/test-network
./network.sh down
```

## Resources

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Fabric Gateway API](https://hyperledger-fabric.readthedocs.io/en/latest/gateway.html)
- [FabConnect Documentation](https://github.com/hyperledger/firefly-fabconnect)
