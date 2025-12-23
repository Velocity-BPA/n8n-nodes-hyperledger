# Setting Up Hyperledger FireFly

This guide walks you through setting up a Hyperledger FireFly environment for testing with n8n-nodes-hyperledger.

## Quick Start with FireFly CLI

The easiest way to get started is using the FireFly CLI.

### Prerequisites

- Docker and Docker Compose installed
- Go 1.19+ (for building CLI from source)

### Install FireFly CLI

```bash
# Using Go
go install github.com/hyperledger/firefly-cli/ff@latest

# Or download binary from releases
# https://github.com/hyperledger/firefly-cli/releases
```

### Create a FireFly Stack

```bash
# Initialize a new stack with 2 members
ff init mystack 2

# Start the stack
ff start mystack
```

This will start:
- FireFly Core nodes (default ports: 5000, 5001)
- PostgreSQL databases
- IPFS nodes
- Ethereum blockchain (Geth or Besu)
- Token connectors

### Access FireFly

- **Member 1 API**: http://localhost:5000/api/v1
- **Member 2 API**: http://localhost:5001/api/v1
- **Member 1 UI**: http://localhost:5000/ui
- **Member 2 UI**: http://localhost:5001/ui
- **Swagger Docs**: http://localhost:5000/api

## Configuring n8n Credentials

1. In n8n, go to **Credentials** > **New Credential**
2. Search for "Hyperledger FireFly API"
3. Configure:
   - **FireFly Node URL**: `http://localhost:5000`
   - **Namespace**: `default`
   - **API Key**: (leave empty for local development)

## Testing the Connection

Create a simple workflow:

1. Add a **Manual Trigger** node
2. Add a **Hyperledger FireFly** node
3. Select **Resource**: Message
4. Select **Operation**: Get Messages
5. Execute the workflow

If successful, you'll see the list of messages in the namespace.

## Common Operations

### Broadcast a Message

```json
{
  "resource": "message",
  "operation": "broadcastMessage",
  "messageData": {"hello": "world"},
  "tag": "test-message"
}
```

### Create a Token Pool

First, create a token pool via the FireFly API:

```bash
curl -X POST http://localhost:5000/api/v1/namespaces/default/tokens/pools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testpool",
    "type": "fungible"
  }'
```

Then mint tokens in n8n:

```json
{
  "resource": "token",
  "operation": "mintTokens",
  "poolName": "testpool",
  "amount": "1000"
}
```

## Cleanup

```bash
# Stop the stack
ff stop mystack

# Remove the stack
ff remove mystack
```

## Resources

- [FireFly Documentation](https://hyperledger.github.io/firefly/)
- [FireFly CLI Reference](https://hyperledger.github.io/firefly/reference/firefly_cli.html)
- [FireFly API Reference](https://hyperledger.github.io/firefly/reference/api_ref.html)
