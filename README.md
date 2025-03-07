# E2E Encrypted Chat Application with Prosody XMPP

This is a secure chat application that uses Prosody XMPP server for end-to-end encrypted messaging. The application is built with Next.js and React, and uses a mock Prosody server for development and demonstration purposes.

## Features

- End-to-end encryption for all messages
- Real-time messaging with XMPP protocol
- Contact list with online status indicators
- Message read receipts
- Responsive UI for desktop and mobile

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Messaging Protocol**: XMPP (Extensible Messaging and Presence Protocol)
- **XMPP Server**: Prosody (mocked for development)
- **Encryption**: End-to-end encryption using public/private key pairs

## Mock Prosody Implementation

For development and demonstration purposes, this application includes a mock implementation of a Prosody XMPP server. In a production environment, you would replace this with a real Prosody server.

The mock implementation includes:

- Simulated XMPP connections
- Contact presence (online, offline, away)
- End-to-end encryption simulation
- Message delivery and read receipts

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Run the development server:
   ```
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production Deployment

For a production deployment, you would need to:

1. Set up a real Prosody XMPP server
2. Configure the server for TLS and SASL authentication
3. Implement proper end-to-end encryption using OMEMO or similar
4. Replace the mock implementation with real XMPP client libraries

## License

MIT
