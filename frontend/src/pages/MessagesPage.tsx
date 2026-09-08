import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import type { Conversation, Message } from '../types';
import toast from 'react-hot-toast';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages/conversations');
        setConversations(res.data.conversations);
      } catch {
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/conversations/${conversationId}`);
        setMessages(res.data.messages);
        setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch {
        // Silent for polling - don't spam errors
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;
    setSending(true);
    try {
      const res = await api.post(`/messages/conversations/${conversationId}`, { content: newMessage });
      setMessages([...messages, res.data.message]);
      setNewMessage('');
      setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (conv: Conversation) => {
    return conv.participants.find(p => p._id !== user?._id);
  };

  // Conversation list view
  if (!conversationId) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No conversations yet</h3>
            <p className="text-gray-500 mb-4">Start a conversation from a skill listing or user profile</p>
            <Link to="/marketplace" className="text-primary-600 font-medium text-sm hover:text-primary-700">
              Browse marketplace →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => {
              const other = getOtherUser(conv);
              return (
                <Link
                  key={conv._id}
                  to={`/messages/${conv._id}`}
                  className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700 flex-shrink-0">
                    {other?.avatar ? (
                      <img src={other.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      other?.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{other?.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {conv.lastMessageAt && new Date(conv.lastMessageAt).toLocaleDateString()}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Chat view
  const currentConv = conversations.find(c => c._id === conversationId);
  const otherUser = currentConv ? getOtherUser(currentConv) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Chat Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/messages" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700">
          {otherUser?.avatar ? (
            <img src={otherUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            otherUser?.name?.charAt(0) || '?'
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{otherUser?.name || 'Unknown'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <div className="h-96 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Send the first message
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.sender._id === user?._id;
              return (
                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="border-t border-gray-200 p-4 flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
