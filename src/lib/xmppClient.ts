import { EventEmitter } from 'events';
import { client, xml, jid, XmppClient, XmlElement } from '@xmpp/client';
import { XMPPContact, XMPPMessage, XMPPPresence } from './mockProsody';

// Simple encryption utilities for E2E encryption
// Note: In a production app, use a proper E2E encryption library like OMEMO
const encryptionUtils = {
  // Generate a key pair
  generateKeyPair: async (): Promise<{ publicKey: string; privateKey: string }> => {
    // In a real implementation, use WebCrypto API
    const id = Math.random().toString(36).substring(2, 15);
    return {
      publicKey: `pub-${id}`,
      privateKey: `priv-${id}`
    };
  },
  
  // Encrypt a message
  encrypt: async (message: string, publicKey: string): Promise<string> => {
    // In a real implementation, use WebCrypto API
    return Buffer.from(`${message}:${publicKey}`).toString('base64');
  },
  
  // Decrypt a message
  decrypt: async (encryptedMessage: string, privateKey: string): Promise<string> => {
    // In a real implementation, use WebCrypto API
    try {
      const decoded = Buffer.from(encryptedMessage, 'base64').toString();
      const [message = ''] = decoded.split(':');
      return message;
    } catch (error) {
      console.error('Error decrypting message:', error);
      return encryptedMessage;
    }
  }
};

class XMPPClient extends EventEmitter {
  private xmppClient: XmppClient | null = null;
  private connected = false;
  private currentUser: string | null = null;
  private contacts: XMPPContact[] = [];
  private messages: Record<string, XMPPMessage[]> = {};
  private keyPairs: Record<string, { publicKey: string, privateKey: string }> = {};
  private useMock = true; // Set to false to use real XMPP server

  constructor() {
    super();
    
    // Initialize with empty state
    this.contacts = [];
    this.messages = {};
    this.keyPairs = {};
  }

  /**
   * Connect to the XMPP server
   */
  public async connect(jid: string, password: string): Promise<boolean> {
    if (this.useMock) {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      this.connected = true;
      this.currentUser = jid;
      
      // Generate mock contacts
      this.initializeMockData();
      
      this.emit('connected', { jid });
      return true;
    }
    
    try {
      // Create XMPP client
      this.xmppClient = client({
        service: 'xmpp://xmpp.example.com:5222', // Replace with your XMPP server
        domain: 'example.com', // Replace with your domain
        username: jid.split('@')[0] ?? jid,
        password
      });
      
      // Set up event handlers
      this.xmppClient.on('online', (data) => {
        console.log('Connected as', data.jid.toString());
        this.connected = true;
        this.currentUser = jid;
        
        // Handle async operations
        void (async () => {
          // Send initial presence
          await this.xmppClient?.send(xml('presence'));
          
          // Request roster (contact list)
          await this.xmppClient?.send(
            xml('iq', { type: 'get', id: 'roster_1' }, 
              xml('query', { xmlns: 'jabber:iq:roster' })
            )
          );
          
          // Generate key pair for encryption
          const keyPair = await encryptionUtils.generateKeyPair();
          this.keyPairs[jid] = keyPair;
        })();
        
        this.emit('connected', { jid });
      });
      
      this.xmppClient.on('error', (err: Error) => {
        console.error('XMPP error:', err);
        this.emit('error', err);
      });
      
      this.xmppClient.on('stanza', (stanza: XmlElement) => {
        this.handleStanza(stanza);
      });
      
      this.xmppClient.on('offline', () => {
        console.log('XMPP client disconnected');
        this.connected = false;
        this.currentUser = null;
        this.emit('disconnected');
      });
      
      // Start the connection
      await this.xmppClient.start();
      return true;
    } catch (error) {
      console.error('Error connecting to XMPP server:', error);
      return false;
    }
  }

  /**
   * Disconnect from the XMPP server
   */
  public async disconnect(): Promise<void> {
    if (this.useMock) {
      // Simulate disconnection delay
      await new Promise(resolve => setTimeout(resolve, 300));
      this.connected = false;
      this.currentUser = null;
      this.emit('disconnected');
      return;
    }
    
    if (this.xmppClient && this.connected) {
      // Send unavailable presence
      await this.xmppClient.send(xml('presence', { type: 'unavailable' }));
      
      // Stop the client
      await this.xmppClient.stop();
      this.connected = false;
      this.currentUser = null;
    }
  }

  /**
   * Check if connected to the XMPP server
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get the list of contacts
   */
  public getContacts(): XMPPContact[] {
    return this.contacts;
  }

  /**
   * Get messages for a specific contact
   */
  public getMessages(contactId: string): XMPPMessage[] {
    return this.messages[contactId] ?? [];
  }

  /**
   * Send a message to a contact
   */
  public async sendMessage(to: string, body: string, encrypted = true): Promise<XMPPMessage> {
    if (!this.connected || !this.currentUser) {
      throw new Error('Cannot send message: not connected');
    }
    
    const contactId = this.contacts.find(c => c.jid === to)?.id;
    if (!contactId) {
      throw new Error('Cannot send message: contact not found');
    }
    
    let processedBody = body;
    
    // Apply encryption if needed
    if (encrypted) {
      const recipientPublicKey = this.keyPairs[to]?.publicKey;
      if (recipientPublicKey) {
        processedBody = await encryptionUtils.encrypt(body, recipientPublicKey);
      }
    }
    
    const messageId = Math.random().toString(36).substring(2, 15);
    
    if (this.useMock) {
      // Create message object
      const message: XMPPMessage = {
        id: messageId,
        from: this.currentUser,
        to,
        body: processedBody,
        timestamp: new Date(),
        encrypted
      };
      
      // Add to messages
      if (!this.messages[contactId]) {
        this.messages[contactId] = [];
      }
      this.messages[contactId].push(message);
      
      // Update contact's last message time
      const contact = this.contacts.find(c => c.id === contactId);
      if (contact) {
        contact.lastMessageTime = new Date().toISOString();
      }
      
      // Emit message event
      this.emit('message', message);
      
      // Simulate reply after a random delay
      if (Math.random() > 0.3) {
        setTimeout(() => {
          this.simulateIncomingMessage(to);
        }, 1000 + Math.random() * 5000);
      }
      
      return message;
    } else {
      // Send message via XMPP
      const messageElement = xml(
        'message',
        { type: 'chat', to, id: messageId },
        xml('body', {}, encrypted ? processedBody : body)
      );
      
      if (encrypted) {
        // Add encryption metadata (in a real app, use proper XEP for encryption)
        messageElement.append(xml('encrypted', { xmlns: 'urn:xmpp:e2e:0' }));
      }
      
      if (this.xmppClient) {
        await this.xmppClient.send(messageElement);
      }
      
      // Create message object for local storage
      const messageObj: XMPPMessage = {
        id: messageId,
        from: this.currentUser,
        to,
        body: processedBody,
        timestamp: new Date(),
        encrypted
      };
      
      // Add to messages
      if (!this.messages[contactId]) {
        this.messages[contactId] = [];
      }
      this.messages[contactId].push(messageObj);
      
      // Update contact's last message time
      const contact = this.contacts.find(c => c.id === contactId);
      if (contact) {
        contact.lastMessageTime = new Date().toISOString();
      }
      
      // Emit message event
      this.emit('message', messageObj);
      
      return messageObj;
    }
  }

  /**
   * Mark messages from a contact as read
   */
  public markAsRead(contactId: string): void {
    const contact = this.contacts.find(c => c.id === contactId);
    if (contact) {
      contact.unreadCount = 0;
      this.emit('unreadCountChanged', { contactId, unreadCount: 0 });
      
      if (!this.useMock && this.xmppClient && this.connected) {
        // In a real implementation, send read receipts via XEP-0184
        // This is a simplified version
        const messages = this.messages[contactId] ?? [];
        const unreadMessages = messages.filter(m => m.from !== this.currentUser);
        
        if (unreadMessages.length > 0) {
          const lastMessage = unreadMessages[unreadMessages.length - 1];
          if (lastMessage) {
            // Send read receipt
            void this.xmppClient.send(
              xml('message', { to: contact.jid },
                xml('received', { 
                  xmlns: 'urn:xmpp:receipts',
                  id: lastMessage.id
                })
              )
            );
          }
        }
      }
    }
  }

  /**
   * Update presence status
   */
  public updatePresence(status: 'online' | 'offline' | 'away'): void {
    if (!this.connected || !this.currentUser) return;
    
    if (this.useMock) {
      const presence: XMPPPresence = {
        jid: this.currentUser,
        status,
        timestamp: new Date()
      };
      
      this.emit('presence', presence);
    } else if (this.xmppClient) {
      // Map status to XMPP presence
      let showValue: string | undefined;
      let typeValue: string | undefined;
      
      if (status === 'away') {
        showValue = 'away';
      } else if (status === 'offline') {
        typeValue = 'unavailable';
      }
      
      // Create presence stanza
      const presenceElement = xml('presence');
      
      if (showValue) {
        presenceElement.append(xml('show', {}, showValue));
      }
      
      if (typeValue) {
        presenceElement.attrs.type = typeValue;
      }
      
      // Send presence
      void this.xmppClient.send(presenceElement);
    }
  }

  /**
   * Get public key for a JID
   */
  public getPublicKey(jid: string): string | undefined {
    return this.keyPairs[jid]?.publicKey;
  }

  /**
   * Get private key for a JID
   */
  public getPrivateKey(jid: string): string | undefined {
    return this.keyPairs[jid]?.privateKey;
  }

  /**
   * Decrypt a message
   */
  public async decryptMessage(message: XMPPMessage): Promise<XMPPMessage> {
    if (!message.encrypted) return message;
    
    const recipientJid = message.to;
    if (!recipientJid) return message;
    
    const privateKey = this.getPrivateKey(recipientJid);
    
    if (!privateKey) return message;
    
    const decryptedBody = await encryptionUtils.decrypt(message.body, privateKey);
    
    return {
      ...message,
      body: decryptedBody,
      encrypted: false
    };
  }

  /**
   * Handle incoming XMPP stanza
   */
  private handleStanza(stanza: XmlElement): void {
    if (!this.currentUser) return;
    
    // Handle message stanza
    if (stanza.is('message') && stanza.attrs.type === 'chat') {
      const from = stanza.attrs.from;
      const body = stanza.getChildText('body');
      
      if (from && body) {
        const isEncrypted = stanza.getChild('encrypted', 'urn:xmpp:e2e:0') !== undefined;
        
        // Extract bare JID and local part
        const bareJid = from.split('/')[0];
        if (!bareJid) return;
        
        const localPart = bareJid.split('@')[0] ?? bareJid;
        
        // Find or create contact
        let contact = this.contacts.find(c => c.jid === bareJid);
        if (!contact) {
          // Create new contact
          const contactId = Math.random().toString(36).substring(2, 15);
          
          contact = {
            id: contactId,
            jid: bareJid,
            name: localPart,
            status: 'online',
            unreadCount: 0,
            lastMessageTime: new Date().toISOString()
          };
          
          this.contacts.push(contact);
        }
        
        // Create message
        const message: XMPPMessage = {
          id: stanza.attrs.id ?? Math.random().toString(36).substring(2, 15),
          from: bareJid,
          to: this.currentUser,
          body,
          timestamp: new Date(),
          encrypted: isEncrypted
        };
        
        // Add to messages
        if (!this.messages[contact.id]) {
          this.messages[contact.id] = [];
        }
        
        this.messages[contact.id]!.push(message);
        
        // Update contact
        contact.lastMessageTime = new Date().toISOString();
        contact.unreadCount += 1;
        
        // Emit message event
        this.emit('message', message);
      }
    }
    // Handle presence stanza
    else if (stanza.is('presence')) {
      const from = stanza.attrs.from;
      if (from && from !== this.currentUser) {
        const bareJid = from.split('/')[0];
        if (!bareJid) return;
        
        // Determine status
        let status: 'online' | 'offline' | 'away' = 'online';
        
        if (stanza.attrs.type === 'unavailable') {
          status = 'offline';
        } else {
          const show = stanza.getChildText('show');
          if (show === 'away' || show === 'xa') {
            status = 'away';
          }
        }
        
        // Find contact
        const contact = this.contacts.find(c => c.jid === bareJid);
        if (contact) {
          contact.status = status;
        }
        
        // Emit presence event
        const presence: XMPPPresence = {
          jid: bareJid,
          status,
          timestamp: new Date()
        };
        
        this.emit('presence', presence);
      }
    }
    
    // Handle roster (contact list) response
    else if (stanza.is('iq') && stanza.attrs.type === 'result') {
      const query = stanza.getChild('query', 'jabber:iq:roster');
      if (query) {
        const items = query.getChildren('item');
        
        if (items && items.length > 0) {
          for (const item of items) {
            const itemJid = item.attrs.jid;
            if (!itemJid) continue;
            
            const name = item.attrs.name ?? itemJid.split('@')[0] ?? itemJid;
            
            // Check if contact already exists
            const existingContact = this.contacts.find(c => c.jid === itemJid);
            if (!existingContact) {
              // Create new contact
              const contactId = Math.random().toString(36).substring(2, 15);
              
              const contact: XMPPContact = {
                id: contactId,
                jid: itemJid,
                name,
                status: 'offline', // Default to offline until we receive presence
                unreadCount: 0,
                lastMessageTime: new Date().toISOString()
              };
              
              this.contacts.push(contact);
            }
          }
          
          // Emit contacts updated event
          this.emit('contactsUpdated', this.contacts);
        }
      }
    }
  }

  /**
   * Simulate an incoming message (for mock mode)
   */
  private simulateIncomingMessage(from: string): void {
    if (!this.currentUser) return;
    
    const contactId = this.contacts.find(c => c.jid === from)?.id;
    if (!contactId) return;
    
    const contact = this.contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    const responses = [
      "That's interesting!",
      "I see what you mean.",
      "Thanks for letting me know.",
      "I'll get back to you on that.",
      "Can we discuss this later?",
      "I appreciate your message.",
      "Let me think about that.",
      "Good point!",
      "I agree with you.",
      "That makes sense."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Apply encryption
    const userPublicKey = this.keyPairs[this.currentUser]?.publicKey;
    if (userPublicKey) {
      // Use a definite response 
      const safeResponse = randomResponse!; // Assert response is defined
      void encryptionUtils.encrypt(safeResponse, userPublicKey)
        .then(encrypted => {
          this.createIncomingMessage(from, encrypted, contactId, contact);
        })
        .catch(error => {
          console.error('Error encrypting message:', error);
          this.createIncomingMessage(from, safeResponse, contactId, contact);
        });
    } else {
      // Use a definite response
      if (randomResponse) {
        this.createIncomingMessage(from, randomResponse, contactId, contact);
      }
    }
  }

  /**
   * Create and emit an incoming message
   */
  private createIncomingMessage(
    from: string, 
    body: string, 
    contactId: string, 
    contact: XMPPContact
  ): void {
    if (!this.currentUser) return;
    
    const message: XMPPMessage = {
      id: Math.random().toString(36).substring(2, 15),
      from,
      to: this.currentUser,
      body,
      timestamp: new Date(),
      encrypted: true
    };
    
    // Add to messages
    if (!this.messages[contactId]) {
      this.messages[contactId] = [];
    }
    this.messages[contactId].push(message);
    
    // Update contact's last message time and unread count
    contact.lastMessageTime = new Date().toISOString();
    contact.unreadCount += 1;
    
    // Emit message event
    this.emit('message', message);
  }

  /**
   * Initialize mock data for testing
   */
  private initializeMockData(): void {
    // Create mock contacts
    this.contacts = [
      {
        id: "1",
        jid: "alice@xmpp.example.com",
        name: "Alice Smith",
        status: 'online',
        unreadCount: 3,
        lastMessageTime: new Date().toISOString(),
        avatar: "https://i.pravatar.cc/150?u=1",
      },
      {
        id: "2",
        jid: "bob@xmpp.example.com",
        name: "Bob Johnson",
        status: 'away',
        unreadCount: 0,
        lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
        avatar: "https://i.pravatar.cc/150?u=2",
      },
      {
        id: "3",
        jid: "carol@xmpp.example.com",
        name: "Carol Williams",
        status: 'offline',
        unreadCount: 1,
        lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
        avatar: "https://i.pravatar.cc/150?u=3",
      },
      {
        id: "4",
        jid: "dave@xmpp.example.com",
        name: "Dave Miller",
        status: 'online',
        unreadCount: 0,
        lastMessageTime: new Date(Date.now() - 172800000).toISOString(),
        avatar: "https://i.pravatar.cc/150?u=4",
      },
      {
        id: "5",
        jid: "eve@xmpp.example.com",
        name: "Eve Brown",
        status: 'offline',
        unreadCount: 0,
        lastMessageTime: new Date(Date.now() - 259200000).toISOString(),
        avatar: "https://i.pravatar.cc/150?u=5",
      },
    ];
    
    // Initialize with some mock messages
    this.contacts.forEach(contact => {
      this.messages[contact.id] = [
        {
          id: Math.random().toString(36).substring(2, 15),
          from: contact.jid,
          to: this.currentUser ?? '',
          body: `Hello from ${contact.name}!`,
          timestamp: new Date(Date.now() - 3600000),
          encrypted: true
        },
        {
          id: Math.random().toString(36).substring(2, 15),
          from: this.currentUser ?? '',
          to: contact.jid,
          body: `Hi ${contact.name}, how are you?`,
          timestamp: new Date(Date.now() - 3000000),
          encrypted: true
        },
        {
          id: Math.random().toString(36).substring(2, 15),
          from: contact.jid,
          to: this.currentUser ?? '',
          body: "I'm doing well, thanks for asking!",
          timestamp: new Date(Date.now() - 2400000),
          encrypted: true
        }
      ];
    });
    
    // Generate key pairs for all contacts
    this.contacts.forEach(contact => {
      void encryptionUtils.generateKeyPair().then(keyPair => {
        this.keyPairs[contact.jid] = keyPair;
      });
    });
    
    // Generate key pair for current user
    if (this.currentUser) {
      void encryptionUtils.generateKeyPair().then(keyPair => {
        this.keyPairs[this.currentUser!] = keyPair;
      });
    }
  }
}

// Export singleton instance
export const xmppClient = new XMPPClient(); 