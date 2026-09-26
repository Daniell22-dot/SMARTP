'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Avatar, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Send, Search, X, ChevronLeft, Paperclip, Loader2, Bell, CheckCircle } from 'lucide-react';
import { Contact, Message } from '@/types';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const messageSchema = z.object({
  recipient_id: z.number().min(1, 'Please select a recipient'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Message cannot be empty'),
});

type MessageForm = z.infer<typeof messageSchema>;

interface Conversation {
  id: number;
  other_user: Contact;
  last_message: Message;
  unread_count: number;
}

export default function TenantMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const contacts = await apiClient.get<Contact[]>('/users/contacts');
      
      const convos: Conversation[] = [];
      for (const contact of contacts) {
        try {
          const msgs = await apiClient.get<Message[]>(`/messages/inbox?limit=100`);
          const contactMsgs = msgs.filter(m => m.sender_id === contact.id || m.recipient_id === contact.id);
          if (contactMsgs.length > 0) {
            const sorted = contactMsgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const unread = sorted.filter(m => m.recipient_id === user?.id && !m.is_read).length;
            convos.push({
              id: contact.id,
              other_user: contact,
              last_message: sorted[0],
              unread_count: unread,
            });
          }
        } catch (e) {
          // Contact might not have messages yet
        }
      }
      setConversations(convos.sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    try {
      const allMsgs = await apiClient.get<Message[]>(`/messages/inbox?limit=200`);
      const contactMsgs = allMsgs.filter(m => 
        (m.sender_id === conversation.other_user.id && m.recipient_id === user?.id) ||
        (m.recipient_id === conversation.other_user.id && m.sender_id === user?.id)
      );
      const sorted = contactMsgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setMessages(sorted);
      
      const unread = sorted.filter(m => m.recipient_id === user?.id && !m.is_read);
      for (const msg of unread) {
        await apiClient.put(`/messages/${msg.id}/read`);
      }
      setConversations(prev => prev.map(c => 
        c.id === conversation.id ? { ...c, unread_count: 0 } : c
      ));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const onSubmit = async (data: MessageForm) => {
    setIsSending(true);
    try {
      await apiClient.post('/messages', data);
      toast.success('Message sent');
      setShowComposeModal(false);
      reset();
      loadConversations();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation || isSendingReply) return;
    
    setIsSendingReply(true);
    try {
      await apiClient.post('/messages', {
        recipient_id: selectedConversation.other_user.id,
        subject: 'Re: ' + selectedConversation.last_message.subject,
        body: replyText,
      });
      setReplyText('');
      loadMessages(selectedConversation);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setIsSendingReply(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredConversations = conversations.filter(c => 
    c.other_user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.other_user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.other_user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_message.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="h-24 animate-pulse bg-gray-200 dark:bg-gray-700" /></Card>
          ))}
        </div>
      </div>
    );
  }

  // Empty state component
  const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
      <MessageSquare className="h-24 w-24 mb-4 text-gray-300 dark:text-gray-600" />
      <h3 className="text-lg font-medium text-spurs-navy dark:text-white mb-2">Select a conversation</h3>
      <p>Choose a conversation from the left or start a new one</p>
      <Button onClick={() => setShowComposeModal(true)} className="mt-4 gap-2">
        <MessageSquare className="h-4 w-4" />
        New Message
      </Button>
    </div>
  );

  // No conversation selected
  const NoConversationSelected = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
      <MessageSquare className="h-24 w-24 mb-4 text-gray-300 dark:text-gray-600" />
      <h3 className="text-lg font-medium text-spurs-navy dark:text-white mb-2">Select a conversation</h3>
      <p>Choose a conversation from the left or start a new one</p>
      <Button onClick={() => setShowComposeModal(true)} className="mt-4 gap-2">
        <MessageSquare className="h-4 w-4" />
        New Message
      </Button>
    </div>
  );

  // Chat header
  const ChatHeader = () => (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
      <Avatar size="lg" name={`${selectedConversation.other_user.first_name} ${selectedConversation.other_user.last_name}`} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-spurs-navy dark:text-white truncate">
          {selectedConversation.other_user.first_name} {selectedConversation.other_user.last_name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{selectedConversation.other_user.role}</p>
      </div>
    </div>
  );

  // Message list
  const MessageList = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <MessageSquare className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" />
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.sender_id === user?.id
                    ? 'bg-spurs-navy text-white rounded-tr-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <p className={`text-xs mt-1 opacity-70 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                  {formatDateTime(msg.created_at)}
                  {msg.sender_id === user?.id && msg.is_read && (
                    <CheckCircle className="inline h-3 w-3 ml-1 text-spurs-gold" />
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );

  // Message input
  const MessageInput = () => (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleReplySubmit} className="flex items-end gap-2">
        <Textarea
          placeholder="Type a message..."
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          rows={1}
          className="flex-1 min-h-[44px] max-h-32 resize-none pr-10"
          disabled={isSendingReply}
        />
        <Button type="submit" variant="primary" size="icon" disabled={!replyText.trim() || isSendingReply}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );

  // Chat area (header + messages + input)
  const ChatArea = () => (
    <div className="flex-1 flex flex-col min-w-0">
      {selectedConversation ? (
        <>
          <ChatHeader />
          <MessageList />
          <MessageInput />
        </>
      ) : (
        <NoConversationSelected />
      )}
    </div>
  );

  // Conversation list sidebar
  const ConversationList = () => (
    <div className="w-full md:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-spurs-navy dark:text-white">Conversations</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>No conversations yet</p>
            <Button onClick={() => setShowComposeModal(true)} className="mt-4 gap-2">
              <MessageSquare className="h-4 w-4" />
              Start a conversation
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => loadMessages(convo)}
                className={`w-full p-4 text-left transition-colors ${
                  selectedConversation?.id === convo.id
                    ? 'bg-spurs-navy/5 dark:bg-spurs-navy/10 border-l-4 border-spurs-navy dark:border-spurs-gold'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar size="md" name={`${convo.other_user.first_name} ${convo.other_user.last_name}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-spurs-navy dark:text-white truncate">
                        {convo.other_user.first_name} {convo.other_user.last_name}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(convo.last_message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                      {convo.last_message.subject}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={convo.unread_count > 0 ? 'primary' : 'secondary'} className="text-xs">
                        {convo.unread_count > 0 ? `${convo.unread_count} unread` : 'Read'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs capitalize">{convo.other_user.role}</Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Header
  const Header = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="sm:hidden"><ChevronLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-heading-lg font-bold text-spurs-navy dark:text-white">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Conversations with landlord and admin</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-xs sm:max-w-md"
        />
        <Button onClick={() => setShowComposeModal(true)} className="gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">New Message</span>
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="h-24 animate-pulse bg-gray-200 dark:bg-gray-700" /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
      <Header />
      <div className="flex-1 flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <ConversationList />
        <ChatArea />
      </div>

      <Modal
        isOpen={showComposeModal}
        onClose={() => { setShowComposeModal(false); reset(); }}
        title="New Message"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Recipient"
            error={errors.recipient_id?.message}
            {...register('recipient_id')}
          >
            <option value="">Select recipient</option>
            {conversations.map(c => (
              <option key={c.id} value={c.other_user.id}>
                {c.other_user.first_name} {c.other_user.last_name} ({c.other_user.role})
              </option>
            ))}
          </Select>

          <Input
            label="Subject"
            error={errors.subject?.message}
            {...register('subject')}
            placeholder="Subject"
          />

          <Textarea
            label="Message"
            error={errors.body?.message}
            {...register('body')}
            rows={5}
            placeholder="Type your message..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => { setShowComposeModal(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSending}>
              Send Message
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const messageSchema = z.object({
  recipient_id: z.number().min(1, 'Please select a recipient'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Message cannot be empty'),
});

type MessageForm = z.infer<typeof messageSchema>;

interface Conversation {
  id: number;
  other_user: Contact;
  last_message: Message;
  unread_count: number;
}

const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Avatar, Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Send, Search, X, ChevronLeft, Paperclip, Loader2, Bell, CheckCircle, Paperclip } from 'lucide-react';
import { Contact, Message } from '@/types';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';