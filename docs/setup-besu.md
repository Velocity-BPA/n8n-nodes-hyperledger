# Setting Up Hyperledger Besu

This guide walks you through setting up a Hyperledger Besu network for testing with n8n-nodes-hyperledger.

## Prerequisites

- Docker and Docker Compose
- Java 17+ (for running without Docker)

## Quick Start with Docker

### Single Node Development Network

```bash
docker run -p 8545:8545 -p 8546:8546 \
  hyperledger/besu:latest \
  --network=dev \
  --miner-enabled \
  --miner-coinbase=0xfe3b557e8fb62b89f4916b721be55ceb828dbd73 \
  --rpc-http-enabled \
  --rpc-http-apis=ETH,NET,WEB3,ADMIN,PERM,PRIV \
  --rpc-ws-enabled \
  --host-allowlist="*" \
  --rpc-http-cors-origins="*"
```

### Multi-Node Private Network

Create a `docker-compose.yml`:

```yaml
version: '3.4'
services:
  bootnode:
    image: hyperledger/besu:latest
    command: >
      --genesis-file=/config/genesis.json
      --node-private-key-file=/config/key
      --rpc-http-enabled
      --rpc-http-apis=ETH,NET,WEB3,ADMIN,PERM
      --rpc-http-host=0.0.0.0
      --rpc-http-cors-origins="*"
      --host-allowlist="*"
      --p2p-host=0.0.0.0
    ports:
      - "8545:8545"
      - "30303:30303"
    volumes:
      - ./config:/config

  node1:
    image: hyperledger/besu:latest
    depends_on:
      - bootnode
    command: >
      --genesis-file=/config/genesis.json
      --bootnodes=enode://BOOTNODE_ENODE@bootnode:30303
      --rpc-http-enabled
      --rpc-http-apis=ETH,NET,WEB3
      --rpc-http-host=0.0.0.0
      --host-allowlist="*"
    ports:
      - "8546:8545"
    volumes:
      - ./config:/config
```

### Genesis File (IBFT 2.0)

Create `config/genesis.json`:

```json
{
  "config": {
    "chainId": 1337,
    "berlinBlock": 0,
    "ibft2": {
      "blockperiodseconds": 2,
      "epochlength": 30000,
      "requesttimeoutseconds": 4
    }
  },
  "nonce": "0x0",
  "timestamp": "0x58ee40ba",
  "gasLimit": "0x47b760",
  "difficulty": "0x1",
  "alloc": {
    "fe3b557e8fb62b89f4916b721be55ceb828dbd73": {
      "balance": "0x200000000000000000000000000000000000000000000000000000000000000"
    }
  }
}
```

## Configuring n8n Credentials

1. In n8n, go to **Credentials** > **New Credential**
2. Search for "Hyperledger Besu JSON-RPC API"
3. Configure:
   - **Besu JSON-RPC URL**: `http://localhost:8545`
   - **Authentication Token**: (leave empty for local development)
   - **Chain ID**: `1337`

## Testing the Connection

Create a simple workflow:

1. Add a **Manual Trigger** node
2. Add a **Hyperledger Besu** node
3. Select **Resource**: Ethereum
4. Select **Operation**: Get Chain ID
5. Execute the workflow

## Common Operations

### Get Account Balance

```json
{
  "resource": "ethereum",
  "operation": "getBalance",
  "address": "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73",
  "blockParameter": "latest"
}
```

### Send Transaction

```json
{
  "resource": "ethereum",
  "operation": "sendTransaction",
  "fromAddress": "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73",
  "toAddress": "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
  "value": "0xde0b6b3a7640000",
  "gas": "0x5208"
}
```

### Call Contract Method

```json
{
  "resource": "ethereum",
  "operation": "call",
  "toAddress": "0xContractAddress",
  "data": "0x70a08231000000000000000000000000fe3b557e8fb62b89f4916b721be55ceb828dbd73"
}
```

## Permissioning

### Enable Node Permissioning

Start Besu with permissioning:

```bash
docker run -p 8545:8545 \
  hyperledger/besu:latest \
  --network=dev \
  --permissions-nodes-config-file-enabled \
  --permissions-accounts-config-file-enabled \
  --rpc-http-enabled \
  --rpc-http-apis=ETH,NET,WEB3,ADMIN,PERM
```

### Manage Permissioned Nodes

```json
{
  "resource": "permissioning",
  "operation": "addPermissionedNode",
  "enodeUrl": "enode://abc123...@192.168.1.100:30303"
}
```

## Privacy (Tessera)

For privacy features, you need to run Tessera alongside Besu.

### Start Tessera

```bash
docker run -p 9081:9081 \
  quorumengineering/tessera:latest
```

### Configure Besu for Privacy

```bash
docker run -p 8545:8545 \
  hyperledger/besu:latest \
  --network=dev \
  --privacy-enabled \
  --privacy-url=http://tessera:9081 \
  --privacy-public-key-file=/config/tessera.pub \
  --rpc-http-enabled \
  --rpc-http-apis=ETH,NET,WEB3,PRIV,EEA
```

### Create Privacy Group

```json
{
  "resource": "privacy",
  "operation": "createPrivacyGroup",
  "memberPublicKeys": "BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo=,QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=",
  "privacyGroupName": "mygroup",
  "privacyGroupDescription": "Test privacy group"
}
```

## Cleanup

```bash
docker-compose down -v
# Or for single container
docker stop $(docker ps -q --filter ancestor=hyperledger/besu)
```

## Resources

- [Besu Documentation](https://besu.hyperledger.org/)
- [Besu JSON-RPC API](https://besu.hyperledger.org/reference)
- [Privacy Documentation](https://besu.hyperledger.org/private-networks/concepts/privacy)
- [Permissioning Documentation](https://besu.hyperledger.org/private-networks/concepts/permissioning)
