import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

// Mock encryption utilities
const mockEncryption = {
  // Simulate encryption with a simple base64 encoding (NOT REAL ENCRYPTION)
  encrypt: (message: string, publicKey: string | undefined): string => {
    if (!publicKey) return message; // Return original message if no public key
    return Buffer.from(`${message}:${publicKey}`).toString('base64');
  },
  
  // Simulate decryption with base64 decoding (NOT REAL DECRYPTION)
  decrypt: (encryptedMessage: string, privateKey: string | undefined): string => {
    if (!privateKey) return encryptedMessage; // Return encrypted message if no private key
    try {
      const decoded = Buffer.from(encryptedMessage, 'base64').toString();
      const [message = ''] = decoded.split(':');
      return message;
    } catch (error) {
      // If decryption fails, return the original message
      return encryptedMessage;
    }
  },
  
  // Generate mock key pair
  generateKeyPair: () => {
    const id = uuidv4();
    return {
      publicKey: `pub-${id}`,
      privateKey: `priv-${id}`
    };
  }
};

export type XMPPMessage = {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  encrypted: boolean;
};

export type XMPPContact = {
  id: string;
  jid: string;
  name: string;
  status: 'online' | 'offline' | 'away';
  publicKey?: string;
  avatar?: string;
  unreadCount: number;
  lastMessageTime: string;
};

export type XMPPPresence = {
  jid: string;
  status: 'online' | 'offline' | 'away';
  timestamp: Date;
};

class MockProsodyServer extends EventEmitter {
  private static instance: MockProsodyServer;
  private connected = false;
  private currentUser: string | null = null;
  private contacts: XMPPContact[] = [];
  private messages: Record<string, XMPPMessage[]> = {};
  private keyPairs: Record<string, { publicKey: string, privateKey: string }> = {};
  
  private constructor() {
    super();
    
    // Initialize with some mock contacts
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
          id: uuidv4(),
          from: contact.jid,
          to: "user@xmpp.example.com",
          body: `Hello from ${contact.name}!`,
          timestamp: new Date(Date.now() - 3600000),
          encrypted: true
        },
        {
          id: uuidv4(),
          from: "user@xmpp.example.com",
          to: contact.jid,
          body: `Hi ${contact.name}, how are you?`,
          timestamp: new Date(Date.now() - 3000000),
          encrypted: true
        },
        {
          id: uuidv4(),
          from: contact.jid,
          to: "user@xmpp.example.com",
          body: "I'm doing well, thanks for asking!",
          timestamp: new Date(Date.now() - 2400000),
          encrypted: true
        }
      ];
    });
    
    // Generate key pairs for all contacts
    this.contacts.forEach(contact => {
      this.keyPairs[contact.jid] = mockEncryption.generateKeyPair();
    });
    
    // Generate key pair for current user
    this.keyPairs["user@xmpp.example.com"] = mockEncryption.generateKeyPair();
  }
  
  public static getInstance(): MockProsodyServer {
    if (!MockProsodyServer.instance) {
      MockProsodyServer.instance = new MockProsodyServer();
    }
    return MockProsodyServer.instance;
  }
  
  public connect(jid: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        this.connected = true;
        this.currentUser = jid;
        this.emit('connected', { jid });
        resolve(true);
      }, 500);
    });
  }
  
  public disconnect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = false;
        this.currentUser = null;
        this.emit('disconnected');
        resolve();
      }, 300);
    });
  }
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  public getContacts(): XMPPContact[] {
    return this.contacts;
  }
  
  public getMessages(contactId: string): XMPPMessage[] {
    return this.messages[contactId] ?? [];
  }
  
  public sendMessage(to: string, body: string, encrypted = true): Promise<XMPPMessage> {
    return new Promise((resolve) => {
      const contactId = this.contacts.find(c => c.jid === to)?.id;
      
      if (!contactId || !this.currentUser) {
        throw new Error('Cannot send message: invalid recipient or not connected');
      }
      
      let processedBody = body;
      
      // Apply encryption if needed
      if (encrypted) {
        const recipientPublicKey = this.keyPairs[to]?.publicKey;
        if (recipientPublicKey) {
          processedBody = mockEncryption.encrypt(body, recipientPublicKey);
        }
      }
      
      const message: XMPPMessage = {
        id: uuidv4(),
        from: this.currentUser,
        to,
        body: processedBody ?? '',
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
      
      // Simulate network delay
      setTimeout(() => {
        resolve(message);
      }, 300);
      
      // Simulate reply after a random delay
      if (Math.random() > 0.3) {
        setTimeout(() => {
          this.simulateIncomingMessage(to);
        }, 1000 + Math.random() * 5000);
      }
    });
  }
  
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
    
    // Default to the random response if encryption fails
    let processedBody = randomResponse;
    
    // Apply encryption - ensure we have the current user and their key pair
    const currentUserKeyPair = this.currentUser ? this.keyPairs[this.currentUser] : undefined;
    if (currentUserKeyPair?.publicKey) {
      // We now know publicKey is defined
      processedBody = mockEncryption.encrypt(randomResponse ?? '', currentUserKeyPair.publicKey);
    }
    
    const message: XMPPMessage = {
      id: uuidv4(),
      from,
      to: this.currentUser,
      // Ensure body is never undefined
      body: processedBody ?? '',
      timestamp: new Date(),
      encrypted: true
    };
    
    // Add to messages - ensure contactId exists in messages
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
  
  public markAsRead(contactId: string): void {
    const contact = this.contacts.find(c => c.id === contactId);
    if (contact) {
      contact.unreadCount = 0;
      this.emit('unreadCountChanged', { contactId, unreadCount: 0 });
    }
  }
  
  public updatePresence(status: 'online' | 'offline' | 'away'): void {
    if (!this.currentUser) return;
    
    const presence: XMPPPresence = {
      jid: this.currentUser,
      status,
      timestamp: new Date()
    };
    
    this.emit('presence', presence);
  }
  
  public getPublicKey(jid: string): string | undefined {
    return this.keyPairs[jid]?.publicKey;
  }
  
  public getPrivateKey(jid: string): string | undefined {
    return this.keyPairs[jid]?.privateKey;
  }
  
  public decryptMessage(message: XMPPMessage): XMPPMessage {
    if (!message.encrypted) return message;
    
    const recipientJid = message.to;
    const privateKey = this.getPrivateKey(recipientJid);
    
    if (!privateKey) return message;
    
    return {
      ...message,
      body: mockEncryption.decrypt(message.body, privateKey),
      encrypted: false
    };
  }
}

export const mockProsody = MockProsodyServer.getInstance(); 