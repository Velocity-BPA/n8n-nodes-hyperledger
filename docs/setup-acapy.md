# Setting Up Hyperledger Aries Cloud Agent (ACA-Py)

This guide walks you through setting up ACA-Py for testing Self-Sovereign Identity workflows with n8n-nodes-hyperledger.

## Prerequisites

- Docker and Docker Compose
- Python 3.9+ (for running without Docker)

## Quick Start with Docker

### Using the ACA-Py Demo

```bash
# Clone the aries-cloudagent-python repository
git clone https://github.com/hyperledger/aries-cloudagent-python.git
cd aries-cloudagent-python/demo

# Start the demo (Faber issuer and Alice holder)
./run_demo faber
# In another terminal
./run_demo alice
```

### Simple Single Agent Setup

Create a `docker-compose.yml`:

```yaml
version: '3'
services:
  aca-py:
    image: ghcr.io/hyperledger/aries-cloudagent-python:py3.9-0.10.4
    ports:
      - "8030:8030"  # Agent endpoint
      - "8031:8031"  # Admin API
    environment:
      - ACAPY_ADMIN_API_KEY=adminkey123
    command: >
      start
      --inbound-transport http 0.0.0.0 8030
      --outbound-transport http
      --admin 0.0.0.0 8031
      --admin-api-key adminkey123
      --wallet-type askar
      --wallet-name testwallet
      --wallet-key testkey123
      --auto-provision
      --endpoint http://localhost:8030
      --webhook-url http://host.docker.internal:5678/webhook/acapy
      --log-level info
```

Start it:

```bash
docker-compose up -d
```

## Configuring n8n Credentials

1. In n8n, go to **Credentials** > **New Credential**
2. Search for "Hyperledger Aries Cloud Agent (ACA-Py) API"
3. Configure:
   - **ACA-Py Admin API URL**: `http://localhost:8031`
   - **Admin API Key**: `adminkey123`
   - **Multi-Tenant Mode**: disabled (for simple setup)

## Testing the Connection

Create a simple workflow:

1. Add a **Manual Trigger** node
2. Add a **Hyperledger Aries** node
3. Select **Resource**: Connection
4. Select **Operation**: Get Connections
5. Execute the workflow

## Setting Up for Credentials Issuance

### Connect to a Ledger

For credential issuance, you need a ledger. Options:

1. **Local VON Network** (recommended for testing):
```bash
git clone https://github.com/bcgov/von-network.git
cd von-network
./manage build
./manage start
```

2. **BCovrin Test Network**: http://test.bcovrin.vonx.io

### Register a DID

```bash
# Using the VON Network web interface or API
curl -X POST http://localhost:9000/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ENDORSER",
    "alias": "MyIssuer"
  }'
```

## Common Operations

### Create a Connection Invitation

```json
{
  "resource": "connection",
  "operation": "createInvitation",
  "alias": "Alice Connection",
  "autoAccept": true,
  "multiUse": false
}
```

### Create a Schema

```json
{
  "resource": "schema",
  "operation": "createSchema",
  "schemaName": "Diploma",
  "schemaVersion": "1.0",
  "schemaAttributes": "name,degree,date,gpa"
}
```

### Issue a Credential

```json
{
  "resource": "credentialIssuer",
  "operation": "issueCredential",
  "issueConnectionId": "connection-id-here",
  "credDefId": "cred-def-id-here",
  "credentialAttributes": [
    {"name": "name", "value": "Alice Smith"},
    {"name": "degree", "value": "Bachelor of Science"},
    {"name": "date", "value": "2024-05-15"},
    {"name": "gpa", "value": "3.8"}
  ]
}
```

### Request a Proof

```json
{
  "resource": "presentation",
  "operation": "requestPresentation",
  "presConnectionId": "connection-id-here",
  "proofRequest": {
    "name": "Degree Verification",
    "version": "1.0",
    "requested_attributes": {
      "degree_info": {
        "names": ["name", "degree"],
        "restrictions": [{"cred_def_id": "cred-def-id"}]
      }
    },
    "requested_predicates": {
      "gpa_check": {
        "name": "gpa",
        "p_type": ">=",
        "p_value": 3,
        "restrictions": [{"cred_def_id": "cred-def-id"}]
      }
    }
  }
}
```

## Webhook Integration

Set up an **Aries Webhook** trigger node in n8n to receive events:

1. Add **Hyperledger Aries Webhook** node
2. Note the webhook URL (e.g., `http://localhost:5678/webhook/xyz`)
3. Configure ACA-Py with this webhook URL

## Cleanup

```bash
docker-compose down -v
```

## Resources

- [ACA-Py Documentation](https://aca-py.org/)
- [ACA-Py Admin API](https://aca-py.org/latest/features/AdminAPI/)
- [Aries RFCs](https://github.com/hyperledger/aries-rfcs)
- [VON Network](https://github.com/bcgov/von-network)
