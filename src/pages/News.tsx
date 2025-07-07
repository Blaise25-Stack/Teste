import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/database';
import { News } from '../types';
import { Plus, Search, Edit, Trash2, Calendar, User, Eye, EyeOff } from 'lucide-react';

const NewsPage: React.FC = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>(db.getNews());
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [filterType, setFilterType] = useState('');

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || item.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'news' as News['type'],
    publishDate: new Date().toISOString().split('T')[0],
    imageUrl: '',
    priority: 'medium' as News['priority'],
    isPublished: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNews) {
      db.updateNews(editingNews.id, formData);
      setNews(db.getNews());
    } else {
      const newNews: News = {
        id: Date.now().toString(),
        ...formData,
        date: new Date().toISOString(),
        authorId: user?.id || '',
      };
      db.addNews(newNews);
      setNews(db.getNews());
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'news',
      publishDate: new Date().toISOString().split('T')[0],
      imageUrl: '',
      priority: 'medium',
      isPublished: true
    });
    setEditingNews(null);
    setShowModal(false);
  };

  const handleEdit = (newsItem: News) => {
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      type: newsItem.type,
      publishDate: newsItem.publishDate,
      imageUrl: newsItem.imageUrl || '',
      priority: newsItem.priority,
      isPublished: newsItem.isPublished
    });
    setEditingNews(newsItem);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      db.deleteNews(id);
      setNews(db.getNews());
    }
  };

  const togglePublish = (id: string, isPublished: boolean) => {
    db.updateNews(id, { isPublished: !isPublished });
    setNews(db.getNews());
  };

  const getTypeLabel = (type: News['type']) => {
    const labels = {
      news: 'Actualité',
      event: 'Événement',
      announcement: 'Annonce'
    };
    return labels[type];
  };

  const getPriorityColor = (priority: News['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Actualités de l'École</h1>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nouvelle actualité</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tous les types</option>
          <option value="news">Actualités</option>
          <option value="event">Événements</option>
          <option value="announcement">Annonces</option>
        </select>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((newsItem) => (
          <div key={newsItem.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {newsItem.imageUrl && (
              <img 
                src={newsItem.imageUrl} 
                alt={newsItem.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(newsItem.priority)}`}>
                  {getTypeLabel(newsItem.type)}
                </span>
                {!newsItem.isPublished && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Brouillon
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{newsItem.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{newsItem.content}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(newsItem.publishDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{db.getUsers().find(u => u.id === newsItem.authorId)?.name}</span>
                </div>
              </div>

              {(user?.role === 'admin' || user?.role === 'teacher') && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => togglePublish(newsItem.id, newsItem.isPublished)}
                    className={`flex-1 px-3 py-2 text-sm rounded-md ${
                      newsItem.isPublished 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {newsItem.isPublished ? (
                      <>
                        <EyeOff className="h-4 w-4 inline mr-1" />
                        Masquer
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 inline mr-1" />
                        Publier
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(newsItem)}
                    className="px-3 py-2 text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(newsItem.id)}
                    className="px-3 py-2 text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingNews ? 'Modifier l\'actualité' : 'Nouvelle actualité'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as News['type']})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="news">Actualité</option>
                    <option value="event">Événement</option>
                    <option value="announcement">Annonce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priorité</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as News['priority']})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contenu</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image (URL)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de publication</label>
                  <input
                    type="date"
                    required
                    value={formData.publishDate}
                    onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Publier immédiatement</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingNews ? 'Modifier' : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage;