'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { xmppClient } from '../lib/xmppClient';
import { XMPPContact, XMPPMessage } from '../lib/mockProsody';

interface XMPPRealContextType {
  isConnected: boolean;
  contacts: XMPPContact[];
  connect: (jid: string, password: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  sendMessage: (to: string, body: string, encrypted?: boolean) => Promise<XMPPMessage>;
  getMessages: (contactId: string) => XMPPMessage[];
  markAsRead: (contactId: string) => void;
  updatePresence: (status: 'online' | 'offline' | 'away') => void;
}

const XMPPRealContext = createContext<XMPPRealContextType | undefined>(undefined);

export const XMPPRealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState<XMPPContact[]>([]);

  useEffect(() => {
    // Set up event listeners
    const handleConnect = () => {
      setIsConnected(true);
      setContacts(xmppClient.getContacts());
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setContacts([]);
    };

    const handleMessage = () => {
      // Update contacts when a new message is received
      setContacts(xmppClient.getContacts());
    };

    const handleUnreadCountChanged = () => {
      // Update contacts when unread count changes
      setContacts(xmppClient.getContacts());
    };

    const handleContactsUpdated = (updatedContacts: XMPPContact[]) => {
      setContacts(updatedContacts);
    };

    // Add event listeners
    xmppClient.on('connected', handleConnect);
    xmppClient.on('disconnected', handleDisconnect);
    xmppClient.on('message', handleMessage);
    xmppClient.on('unreadCountChanged', handleUnreadCountChanged);
    xmppClient.on('contactsUpdated', handleContactsUpdated);

    // Clean up event listeners
    return () => {
      xmppClient.off('connected', handleConnect);
      xmppClient.off('disconnected', handleDisconnect);
      xmppClient.off('message', handleMessage);
      xmppClient.off('unreadCountChanged', handleUnreadCountChanged);
      xmppClient.off('contactsUpdated', handleContactsUpdated);
    };
  }, []);

  // Auto-connect for demo purposes
  useEffect(() => {
    if (!isConnected) {
      void xmppClient.connect('user@xmpp.example.com', 'password').then(() => {
        console.log('Connected to XMPP server');
      }).catch(error => {
        console.error('Failed to connect to XMPP server:', error);
      });
    }
  }, [isConnected]);

  const connect = async (jid: string, password: string) => {
    const result = await xmppClient.connect(jid, password);
    return result;
  };

  const disconnect = async () => {
    await xmppClient.disconnect();
  };

  const sendMessage = async (to: string, body: string, encrypted = true) => {
    return await xmppClient.sendMessage(to, body, encrypted);
  };

  const getMessages = (contactId: string): XMPPMessage[] => {
    const messages = xmppClient.getMessages(contactId);
    // We can't do async decryption in a synchronous function,
    // so we'll return the encrypted messages and decrypt them in the UI
    return messages;
  };

  const markAsRead = (contactId: string) => {
    xmppClient.markAsRead(contactId);
  };

  const updatePresence = (status: 'online' | 'offline' | 'away') => {
    xmppClient.updatePresence(status);
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

  return <XMPPRealContext.Provider value={value}>{children}</XMPPRealContext.Provider>;
};

export const useXMPPReal = () => {
  const context = useContext(XMPPRealContext);
  if (context === undefined) {
    throw new Error('useXMPPReal must be used within an XMPPRealProvider');
  }
  return context;
}; 