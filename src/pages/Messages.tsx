import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/database';
import { Message, ParentNotification } from '../types';
import { MessageCircle, Mail, Phone, Calendar, Eye, Reply, Trash2, Filter, Search, AlertCircle, Bell, Send } from 'lucide-react';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(
    user?.role === 'admin' ? db.getMessages() : db.getMessagesForParent(user?.id || '')
  );
  const [notifications, setNotifications] = useState<ParentNotification[]>(
    user?.role === 'parent' ? db.getNotificationsForParent(user?.id || '') : []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || message.status === filterStatus;
    const matchesType = !filterType || message.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const markAsRead = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.status === 'unread') {
      db.updateMessage(messageId, { 
        status: 'read', 
        readAt: new Date().toISOString() 
      });
      
      // Update local state
      if (user?.role === 'admin') {
        setMessages(db.getMessages());
      } else {
        setMessages(db.getMessagesForParent(user?.id || ''));
      }

      // Mark notification as read if it's a parent
      if (user?.role === 'parent') {
        const notification = notifications.find(n => n.messageId === messageId);
        if (notification && !notification.isRead) {
          db.updateParentNotification(notification.id, {
            isRead: true,
            readAt: new Date().toISOString()
          });
          setNotifications(db.getNotificationsForParent(user.id));
        }
      }
    }
  };

  const handleReply = (messageId: string) => {
    if (!replyText.trim()) return;

    if (user?.role === 'admin') {
      // Admin replying to parent
      db.updateMessage(messageId, {
        status: 'replied',
        reply: replyText,
        repliedAt: new Date().toISOString()
      });

      // Send reply to parent
      db.sendReplyToParent(messageId, replyText, user.id);
      
      setMessages(db.getMessages());
    } else {
      // Parent sending new message
      const newMessage: Message = {
        id: Date.now().toString(),
        senderName: user?.name || '',
        senderEmail: user?.email || '',
        senderPhone: user?.phone,
        subject: `Re: ${selectedMessage?.subject || 'Nouveau message'}`,
        message: replyText,
        type: 'general',
        status: 'unread',
        priority: 'medium',
        createdAt: new Date().toISOString()
      };

      db.addMessage(newMessage);
      setMessages(db.getMessagesForParent(user?.id || ''));
    }

    setReplyText('');
    setShowReplyModal(false);
    setSelectedMessage(null);
  };

  const handleDelete = (messageId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      db.deleteMessage(messageId);
      
      if (user?.role === 'admin') {
        setMessages(db.getMessages());
      } else {
        setMessages(db.getMessagesForParent(user?.id || ''));
      }
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    }
  };

  const getStatusColor = (status: Message['status']) => {
    const colors = {
      unread: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      replied: 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Message['status']) => {
    const labels = {
      unread: 'Non lu',
      read: 'Lu',
      replied: 'Répondu'
    };
    return labels[status];
  };

  const getTypeLabel = (type: Message['type']) => {
    const labels = {
      contact: 'Contact',
      account_creation: 'Création de compte',
      general: 'Général'
    };
    return labels[type];
  };

  const getPriorityColor = (priority: Message['priority']) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-yellow-500',
      high: 'text-red-500'
    };
    return colors[priority];
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  // Check if user has access to messages
  if (user?.role !== 'admin' && user?.role !== 'parent') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Accès réservé aux administrateurs et parents</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'Messages reçus' : 'Mes messages'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'parent' && unreadNotifications > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                <Bell className="h-3 w-3 mr-1" />
                {unreadNotifications} nouvelle{unreadNotifications > 1 ? 's' : ''} réponse{unreadNotifications > 1 ? 's' : ''}
              </span>
            )}
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </span>
            )}
            {messages.length} message{messages.length > 1 ? 's' : ''} au total
          </p>
        </div>
        {user?.role === 'parent' && (
          <button
            onClick={() => {
              setSelectedMessage(null);
              setShowReplyModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Send className="h-5 w-5" />
            <span>Nouveau message</span>
          </button>
        )}
      </div>

      {/* Notifications for parents */}
      {user?.role === 'parent' && unreadNotifications > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <Bell className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-blue-900">Nouvelles réponses</h3>
          </div>
          <div className="space-y-2">
            {notifications.filter(n => !n.isRead).map(notification => (
              <div key={notification.id} className="bg-white p-3 rounded border border-blue-200">
                <h4 className="font-medium text-blue-900">{notification.title}</h4>
                <p className="text-sm text-blue-800">{notification.content}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tous les statuts</option>
          <option value="unread">Non lus</option>
          <option value="read">Lus</option>
          <option value="replied">Répondus</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tous les types</option>
          <option value="contact">Contact</option>
          <option value="account_creation">Création de compte</option>
          <option value="general">Général</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.role === 'admin' ? 'Messages reçus' : 'Conversation'}
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    markAsRead(message.id);
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                  } ${message.status === 'unread' ? 'border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${
                        message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {message.isFromAdmin ? 'Administration École' : message.senderName}
                      </h3>
                      <p className="text-xs text-gray-500">{message.senderEmail}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertCircle className={`h-3 w-3 ${getPriorityColor(message.priority)}`} />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                        {getStatusLabel(message.status)}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm mb-2 ${
                    message.status === 'unread' ? 'font-medium text-gray-900' : 'text-gray-600'
                  }`}>
                    {message.subject}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {message.message.substring(0, 80)}...
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      {message.isFromAdmin && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                          Réponse
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        {getTypeLabel(message.type)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedMessage.subject}</h2>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMessage.status)}`}>
                        {getStatusLabel(selectedMessage.status)}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        {getTypeLabel(selectedMessage.type)}
                      </span>
                      <span className={`text-xs ${getPriorityColor(selectedMessage.priority)}`}>
                        Priorité {selectedMessage.priority}
                      </span>
                      {selectedMessage.isFromAdmin && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                          Message de l'administration
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowReplyModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      {user?.role === 'admin' ? 'Répondre' : 'Nouveau message'}
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Sender Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {selectedMessage.isFromAdmin ? 'Message de l\'administration' : 'Informations de l\'expéditeur'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{selectedMessage.senderEmail}</span>
                    </div>
                    {selectedMessage.senderPhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{selectedMessage.senderPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Message</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Reply */}
                {selectedMessage.reply && user?.role === 'admin' && (
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Votre réponse</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.reply}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Envoyé le {selectedMessage.repliedAt && new Date(selectedMessage.repliedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message sélectionné</h3>
              <p className="text-gray-600">Sélectionnez un message dans la liste pour le consulter</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {user?.role === 'admin' 
                ? `Répondre à ${selectedMessage?.senderName}` 
                : 'Nouveau message à l\'administration'
              }
            </h3>
            
            <div className="space-y-4">
              {selectedMessage && user?.role === 'admin' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Sujet:</strong> Re: {selectedMessage.subject}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>À:</strong> {selectedMessage.senderEmail}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {user?.role === 'admin' ? 'Votre réponse' : 'Votre message'}
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={8}
                  placeholder={user?.role === 'admin' 
                    ? "Tapez votre réponse ici..." 
                    : "Tapez votre message à l'administration..."
                  }
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> {user?.role === 'admin' 
                    ? 'Cette réponse sera envoyée au parent et enregistrée dans le système.'
                    : 'Votre message sera envoyé à l\'administration qui vous répondra dans les plus brefs délais.'
                  }
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyText('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleReply(selectedMessage?.id || '')}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {user?.role === 'admin' ? 'Envoyer la réponse' : 'Envoyer le message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;