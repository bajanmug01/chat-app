'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { mockProsody, XMPPContact, XMPPMessage, XMPPPresence } from '../lib/mockProsody';

// Create a safe wrapper for the mockProsody server
const safeMockProsody = {
  // Event handling (pass through to mockProsody)
  on: <T extends unknown[]>(event: string, listener: (...args: T) => void) => 
    mockProsody.on(event, listener as (...args: unknown[]) => void),
  off: <T extends unknown[]>(event: string, listener: (...args: T) => void) => 
    mockProsody.off(event, listener as (...args: unknown[]) => void),
  emit: (event: string, ...args: unknown[]) => mockProsody.emit(event, ...args),
  
  // Connection methods
  connect: async (jid: string, password: string): Promise<boolean> => {
    try {
      return await mockProsody.connect(jid, password);
    } catch (error: unknown) {
      console.error('Error connecting:', error);
      return false;
    }
  },
  
  disconnect: async (): Promise<void> => {
    try {
      await mockProsody.disconnect();
    } catch (error: unknown) {
      console.error('Error disconnecting:', error);
    }
  },
  
  isConnected: (): boolean => {
    return mockProsody.isConnected();
  },
  
  // Contact and message methods
  getContacts: (): XMPPContact[] => {
    try {
      return mockProsody.getContacts();
    } catch (error: unknown) {
      console.error('Error getting contacts:', error);
      return [];
    }
  },
  
  getMessages: (contactId: string): XMPPMessage[] => {
    try {
      return mockProsody.getMessages(contactId);
    } catch (error: unknown) {
      console.error('Error getting messages:', error);
      return [];
    }
  },
  
  sendMessage: async (to: string, body: string, encrypted = true): Promise<XMPPMessage> => {
    try {
      return await mockProsody.sendMessage(to, body, encrypted);
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      // Return a fallback message
      return {
        id: 'error',
        from: 'system',
        to,
        body: 'Failed to send message',
        timestamp: new Date(),
        encrypted: false
      };
    }
  },
  
  markAsRead: (contactId: string): void => {
    try {
      mockProsody.markAsRead(contactId);
    } catch (error: unknown) {
      console.error('Error marking as read:', error);
    }
  },
  
  updatePresence: (status: 'online' | 'offline' | 'away'): void => {
    try {
      mockProsody.updatePresence(status);
    } catch (error: unknown) {
      console.error('Error updating presence:', error);
    }
  },
  
  // Encryption methods
  getPublicKey: (jid: string): string | undefined => {
    try {
      return mockProsody.getPublicKey(jid);
    } catch (error: unknown) {
      console.error('Error getting public key:', error);
      return undefined;
    }
  },
  
  getPrivateKey: (jid: string): string | undefined => {
    try {
      return mockProsody.getPrivateKey(jid);
    } catch (error: unknown) {
      console.error('Error getting private key:', error);
      return undefined;
    }
  },
  
  decryptMessage: (message: XMPPMessage): XMPPMessage => {
    try {
      return mockProsody.decryptMessage(message);
    } catch (error: unknown) {
      console.error('Error decrypting message:', error);
      return message;
    }
  }
};

interface XMPPContextType {
  isConnected: boolean;
  contacts: XMPPContact[];
  connect: (jid: string, password: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  sendMessage: (to: string, body: string, encrypted?: boolean) => Promise<XMPPMessage>;
  getMessages: (contactId: string) => XMPPMessage[];
  markAsRead: (contactId: string) => void;
  updatePresence: (status: 'online' | 'offline' | 'away') => void;
}

const XMPPContext = createContext<XMPPContextType | undefined>(undefined);

export const XMPPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState<XMPPContact[]>([]);

  useEffect(() => {
    // Set up event listeners
    const handleConnect = () => {
      setIsConnected(true);
      setContacts(safeMockProsody.getContacts());
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setContacts([]);
    };

    const handleMessage = () => {
      // Update contacts when a new message is received
      setContacts(safeMockProsody.getContacts());
    };

    const handleUnreadCountChanged = () => {
      // Update contacts when unread count changes
      setContacts(safeMockProsody.getContacts());
    };

    // Add event listeners
    mockProsody.on('connected', handleConnect);
    mockProsody.on('disconnected', handleDisconnect);
    mockProsody.on('message', handleMessage);
    mockProsody.on('unreadCountChanged', handleUnreadCountChanged);

    // Clean up event listeners
    return () => {
      mockProsody.off('connected', handleConnect);
      mockProsody.off('disconnected', handleDisconnect);
      mockProsody.off('message', handleMessage);
      mockProsody.off('unreadCountChanged', handleUnreadCountChanged);
    };
  }, []);

  // Auto-connect for demo purposes
  useEffect(() => {
    if (!isConnected) {
      void safeMockProsody.connect('user@xmpp.example.com', 'password').then(() => {
        console.log('Connected to mock Prosody server');
      }).catch(error => {
        console.error('Failed to connect to mock Prosody server:', error);
      });
    }
  }, [isConnected]);

  const connect = async (jid: string, password: string) => {
    const result = await safeMockProsody.connect(jid, password);
    return result;
  };

  const disconnect = async () => {
    await safeMockProsody.disconnect();
  };

  const sendMessage = async (to: string, body: string, encrypted = true) => {
    return await safeMockProsody.sendMessage(to, body, encrypted);
  };

  const getMessages = (contactId: string) => {
    const messages = safeMockProsody.getMessages(contactId);
    // Decrypt messages for display
    return messages.map(msg => {
      if (msg.encrypted && msg.to === 'user@xmpp.example.com') {
        return safeMockProsody.decryptMessage(msg);
      }
      return msg;
    });
  };

  const markAsRead = (contactId: string) => {
    safeMockProsody.markAsRead(contactId);
  };

  const updatePresence = (status: 'online' | 'offline' | 'away') => {
    safeMockProsody.updatePresence(status);
  };

  const value = {
    isConnected,
    contacts,
    connect,
    disconnect,
    sendMessage,
    getMessages,
    markAsRead,
    updatePresence,
  };

  return <XMPPContext.Provider value={value}>{children}</XMPPContext.Provider>;
};

export const useXMPP = () => {
  const context = useContext(XMPPContext);
  if (context === undefined) {
    throw new Error('useXMPP must be used within an XMPPProvider');
  }
  return context;
}; 