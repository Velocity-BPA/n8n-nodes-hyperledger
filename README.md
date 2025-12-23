# n8n-nodes-hyperledger

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

---

Enterprise blockchain workflow automation for n8n with Hyperledger integration.

[![License: BUSL-1.1](https://img.shields.io/badge/License-BUSL%201.1-blue.svg)](LICENSE)
[![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-orange)](https://n8n.io)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

**Author:** [Velocity BPA, LLC](https://velobpa.com)  
**Website:** [https://velobpa.com](https://velobpa.com)  
**GitHub:** [Velocity-BPA](https://github.com/Velocity-BPA)  
**Licensing:** [licensing@velobpa.com](mailto:licensing@velobpa.com)

---

## Overview

This n8n community node package provides comprehensive integration with the Hyperledger family of enterprise blockchain projects under LF Decentralized Trust. Enable workflow automation for:

- **Distributed Ledger Transactions** - Submit and query blockchain transactions
- **Decentralized Identity Management** - Issue and verify credentials
- **Smart Contract Interactions** - Deploy and invoke smart contracts
- **Cross-chain Interoperability** - Connect multiple blockchain networks
- **Real-time Event Processing** - React to blockchain events in workflows

---

## Supported Hyperledger Projects

| Project | Description | Status |
|---------|-------------|--------|
| **Hyperledger FireFly** | Enterprise Web3 Supernode for building decentralized applications | ✅ Full Support |
| **Hyperledger Fabric** | Permissioned blockchain framework for enterprise solutions | ✅ Full Support |
| **Hyperledger Aries (ACA-Py)** | Self-Sovereign Identity and verifiable credentials | ✅ Full Support |
| **Hyperledger Besu** | Enterprise Ethereum client with privacy features | ✅ Full Support |

---

## Features

### Hyperledger FireFly
- **Messages**: Broadcast, private messaging, request-reply patterns
- **Tokens**: Mint, transfer, burn fungible and non-fungible tokens
- **Smart Contracts**: Invoke, query, and manage contract interfaces
- **Data**: Upload and retrieve data from the network
- **Events**: Real-time event subscriptions via trigger node

### Hyperledger Fabric
- **Transactions**: Submit and evaluate chaincode transactions
- **Chaincode**: Invoke and query smart contracts
- **Ledger**: Query blocks, transactions, and blockchain state
- **Identity**: Enroll, register, and manage identities via Fabric CA
- **Events**: Block, chaincode, and transaction event triggers

### Hyperledger Aries (ACA-Py)
- **Connections**: Create and manage DIDComm connections
- **Credentials**: Issue, hold, and revoke verifiable credentials
- **Presentations**: Request and verify proof presentations
- **Schemas**: Create and manage credential schemas
- **DIDs**: Create, resolve, and manage decentralized identifiers
- **Webhooks**: Receive real-time protocol events

### Hyperledger Besu
- **Ethereum**: Standard JSON-RPC operations (balance, transactions, calls)
- **Permissioning**: Node and account allowlist management
- **Privacy**: Tessera privacy groups and private transactions
- **Events**: Block, log, and pending transaction triggers

---

## Installation

### From npm (Recommended)

```bash
npm install n8n-nodes-hyperledger
```

### From Source

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-hyperledger.git
cd n8n-nodes-hyperledger

# Install dependencies
npm install

# Build the package
npm run build

# Link for local development
npm link
```

### In n8n

1. Go to **Settings** > **Community Nodes**
2. Select **Install a community node**
3. Enter: `n8n-nodes-hyperledger`
4. Click **Install**

---

## Configuration

### FireFly Credentials

| Field | Description | Required |
|-------|-------------|----------|
| FireFly Node URL | Base URL (e.g., `http://localhost:5000`) | Yes |
| Namespace | FireFly namespace to operate in | Yes |
| API Key | Authentication key for secured deployments | No |

### Fabric Gateway Credentials

| Field | Description | Required |
|-------|-------------|----------|
| Gateway URL | REST API endpoint | Yes |
| Channel Name | Fabric channel name | Yes |
| Organization MSP ID | Your org's MSP identifier | Yes |
| User Identity | Enrollment ID | Yes |
| Client Certificate | PEM format certificate | No |
| Client Private Key | PEM format private key | No |
| TLS CA Certificate | TLS certificate | No |

### ACA-Py Credentials

| Field | Description | Required |
|-------|-------------|----------|
| Admin API URL | ACA-Py admin endpoint (e.g., `http://localhost:8031`) | Yes |
| Admin API Key | X-API-Key for authentication | Yes |
| Multi-Tenant Mode | Enable for multi-tenant deployments | No |
| Wallet ID | Wallet identifier (multi-tenant) | Conditional |
| Wallet Key | Wallet key (multi-tenant) | Conditional |

### Besu Credentials

| Field | Description | Required |
|-------|-------------|----------|
| JSON-RPC URL | Besu RPC endpoint (e.g., `http://localhost:8545`) | Yes |
| Authentication Token | Bearer token for secured nodes | No |
| Privacy Group ID | Default privacy group | No |
| Tessera URL | Tessera node URL | No |
| Chain ID | Network chain ID | No |

---

## Usage Examples

### FireFly: Broadcast a Message

```json
{
  "resource": "message",
  "operation": "broadcastMessage",
  "messageData": {
    "type": "order",
    "orderId": "12345",
    "amount": 100.00
  },
  "tag": "purchase-order",
  "topics": "orders,finance"
}
```

### Fabric: Submit a Transaction

```json
{
  "resource": "transaction",
  "operation": "submitTransaction",
  "chaincodeName": "asset-transfer",
  "functionName": "CreateAsset",
  "arguments": ["asset1", "blue", "20", "Tom", "1000"]
}
```

### ACA-Py: Issue a Credential

```json
{
  "resource": "credentialIssuer",
  "operation": "issueCredential",
  "issueConnectionId": "conn-12345",
  "credDefId": "WgWxqztrNooG92RXvxSTWv:3:CL:20:tag",
  "credentialAttributes": [
    {"name": "name", "value": "Alice Smith"},
    {"name": "degree", "value": "Bachelor of Science"}
  ]
}
```

### Besu: Get Account Balance

```json
{
  "resource": "ethereum",
  "operation": "getBalance",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f8fD2e",
  "blockParameter": "latest"
}
```

---

## Local Development & Testing

### Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher
- n8n installed locally

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Lint
npm run lint

# Format code
npm run format
```

### Testing in Local n8n

1. Build the package: `npm run build`
2. Create a tarball: `npm pack`
3. Install in n8n's custom nodes directory
4. Restart n8n

---

## Project Structure

```
n8n-nodes-hyperledger/
├── package.json
├── tsconfig.json
├── LICENSE
├── COMMERCIAL_LICENSE.md
├── LICENSING_FAQ.md
├── README.md
├── credentials/
│   ├── FireFlyApi.credentials.ts
│   ├── FabricGatewayApi.credentials.ts
│   ├── AcaPyApi.credentials.ts
│   └── BesuApi.credentials.ts
├── nodes/
│   ├── FireFly/
│   │   ├── FireFly.node.ts
│   │   ├── FireFlyTrigger.node.ts
│   │   └── firefly.svg
│   ├── Fabric/
│   │   ├── Fabric.node.ts
│   │   ├── FabricTrigger.node.ts
│   │   └── fabric.svg
│   ├── AcaPy/
│   │   ├── AcaPy.node.ts
│   │   ├── AcaPyWebhook.node.ts
│   │   └── acapy.svg
│   └── Besu/
│       ├── Besu.node.ts
│       ├── BesuTrigger.node.ts
│       └── besu.svg
├── test/
│   ├── FireFly.test.ts
│   ├── Fabric.test.ts
│   ├── AcaPy.test.ts
│   ├── Besu.test.ts
│   └── credentials.test.ts
└── docs/
    ├── setup-firefly.md
    ├── setup-fabric.md
    ├── setup-acapy.md
    └── setup-besu.md
```

---

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for complete details.

---

## Third-Party Notices

**Hyperledger® is a registered trademark of The Linux Foundation.** This software is not affiliated with or endorsed by The Linux Foundation or any Hyperledger project.

---

## Support & Contact

- **Website:** [https://velobpa.com](https://velobpa.com)
- **Licensing:** [licensing@velobpa.com](mailto:licensing@velobpa.com)
- **Issues:** [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-hyperledger/issues)

---

## Resources

- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- [Hyperledger FireFly Documentation](https://hyperledger.github.io/firefly/)
- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [ACA-Py Documentation](https://aca-py.org/)
- [Hyperledger Besu Documentation](https://besu.hyperledger.org/)
- [LF Decentralized Trust](https://www.lfdecentralizedtrust.org/)
