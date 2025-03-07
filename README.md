# E2E Encrypted Chat Application with Prosody XMPP

This is a secure chat application that uses Prosody XMPP server for end-to-end encrypted messaging. The application is built with Next.js and React, and includes both a mock implementation for development and a real XMPP.js client for production use.

## Features

- End-to-end encryption for all messages
- Real-time messaging with XMPP protocol
- Contact list with online status indicators
- Message read receipts
- Responsive UI for desktop and mobile

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Messaging Protocol**: XMPP (Extensible Messaging and Presence Protocol)
- **XMPP Server**: Prosody (mocked for development, real connection for production)
- **XMPP Client Library**: XMPP.js
- **Encryption**: End-to-end encryption using public/private key pairs

## Implementation Details

### Mock Prosody Server

For development and testing purposes, this application includes a mock implementation of a Prosody XMPP server. The mock server simulates:

- XMPP connections
- Contact presence (online, offline, away)
- End-to-end encryption
- Message delivery and read receipts

### Real XMPP Client

For production use, the application includes a real XMPP.js client implementation that can connect to an actual Prosody server. The real client supports:

- Connection to any XMPP server
- Roster (contact list) management
- Presence updates
- End-to-end encrypted messaging
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
3. Update the XMPP client configuration in `src/lib/xmppClient.ts` to point to your server
4. Set `useMock = false` in the XMPPClient class to use the real XMPP connection

## Switching Between Mock and Real Implementation

The application includes both implementations and allows you to switch between them:

- The mock implementation is available through `useXMPP` hook from `src/contexts/XMPPContext.tsx`
- The real implementation is available through `useXMPPReal` hook from `src/contexts/XMPPRealContext.tsx`

To use the real implementation in a component, simply import and use the `useXMPPReal` hook instead of `useXMPP`.

## License

MIT
