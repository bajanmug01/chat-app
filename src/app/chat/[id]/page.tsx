'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { useXMPP } from '../../../contexts/XMPPContext';
import Header from '../../../components/Header';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Avatar from '../../../components/Avatar';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { XMPPMessage } from '../../../lib/mockProsody';
import { Badge } from "../../../components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "../../../components/ui/tooltip";

export default function ChatConversationPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { contacts, getMessages, sendMessage, markAsRead } = useXMPP();
  const [messages, setMessages] = useState<XMPPMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contact, setContact] = useState(contacts.find(c => c.id === id));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages and mark as read
  useEffect(() => {
    if (id) {
      const fetchedMessages = getMessages(id);
      setMessages(fetchedMessages);
      markAsRead(id);
      
      // Find the contact
      const foundContact = contacts.find(c => c.id === id);
      if (foundContact) {
        setContact(foundContact);
      } else {
        // If contact not found, go back to chat list
        router.push('/chat');
      }
    }
  }, [id, contacts, getMessages, markAsRead, router]);

  // Set up polling for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (id) {
        const fetchedMessages = getMessages(id);
        setMessages(fetchedMessages);
        markAsRead(id);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, getMessages, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && contact) {
      await sendMessage(contact.jid, newMessage);
      setNewMessage('');
      
      // Update messages
      const updatedMessages = getMessages(id);
      setMessages(updatedMessages);
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ProtectedRoute>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex h-[calc(100vh-200px)] flex-col rounded-lg bg-white shadow-md">
          {/* Chat header */}
          {contact && (
            <div className="flex items-center border-b p-4">
              <Button
                variant="ghost"
                className="mr-2"
                onClick={() => router.push('/chat')}
              >
                &larr;
              </Button>
              <Avatar
                src={contact.avatar}
                alt={`${contact.name} avatar`}
                fallback={contact.name}
                size="md"
              />
              <div className="ml-4">
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold">{contact.name}</h2>
                  <Badge
                    variant={
                      contact.status === 'online'
                        ? 'success'
                        : contact.status === 'away'
                        ? 'warning'
                        : 'secondary'
                    }
                    className="ml-2"
                  >
                    {contact.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{contact.jid}</p>
              </div>
              <div className="ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="ml-2 bg-blue-50">
                        E2E Encrypted
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Messages are end-to-end encrypted with Prosody XMPP</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.from === 'user@xmpp.example.com'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.from === 'user@xmpp.example.com'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p>{message.body}</p>
                    <p
                      className={`mt-1 text-right text-xs ${
                        message.from === 'user@xmpp.example.com'
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message input */}
          <form
            onSubmit={handleSendMessage}
            className="flex border-t p-4"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" className="ml-2">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
} 