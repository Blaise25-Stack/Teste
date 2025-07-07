import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Play, Plus, Edit, Trash2, Video, Calendar, User } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

interface SchoolVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: 'presentation' | 'activities' | 'events' | 'testimonials';
  uploadDate: string;
  uploadedBy: string;
  isPublished: boolean;
}

const Videos: React.FC = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<SchoolVideo[]>([
    {
      id: '1',
      title: 'Présentation de l\'École Numérique',
      description: 'Découvrez notre école, nos valeurs et notre approche pédagogique innovante.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.pexels.com/photos/289740/pexels-photo-289740.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'presentation',
      uploadDate: '2024-01-15',
      uploadedBy: '1',
      isPublished: true
    },
    {
      id: '2',
      title: 'Journée Culturelle 2024',
      description: 'Revivez les moments forts de notre journée culturelle avec les performances de nos élèves.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'events',
      uploadDate: '2024-03-20',
      uploadedBy: '1',
      isPublished: true
    },
    {
      id: '3',
      title: 'Activités Sportives',
      description: 'Nos élèves en action lors des activités sportives et des compétitions inter-écoles.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'activities',
      uploadDate: '2024-02-10',
      uploadedBy: '2',
      isPublished: true
    }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<SchoolVideo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<SchoolVideo | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    category: 'presentation' as SchoolVideo['category'],
    isPublished: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVideo) {
      setVideos(videos.map(v => v.id === editingVideo.id ? { ...v, ...formData } : v));
    } else {
      const newVideo: SchoolVideo = {
        id: Date.now().toString(),
        ...formData,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: user?.id || ''
      };
      setVideos([...videos, newVideo]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      category: 'presentation',
      isPublished: true
    });
    setEditingVideo(null);
    setShowModal(false);
  };

  const handleEdit = (video: SchoolVideo) => {
    setFormData({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      category: video.category,
      isPublished: video.isPublished
    });
    setEditingVideo(video);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  const getCategoryLabel = (category: SchoolVideo['category']) => {
    const labels = {
      presentation: 'Présentation',
      activities: 'Activités',
      events: 'Événements',
      testimonials: 'Témoignages'
    };
    return labels[category];
  };

  const getCategoryColor = (category: SchoolVideo['category']) => {
    const colors = {
      presentation: 'bg-blue-100 text-blue-800',
      activities: 'bg-green-100 text-green-800',
      events: 'bg-purple-100 text-purple-800',
      testimonials: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category];
  };

  const filteredVideos = videos.filter(video => {
    const matchesCategory = !selectedCategory || video.category === selectedCategory;
    const isVisible = video.isPublished || user?.role === 'admin' || user?.role === 'teacher';
    return matchesCategory && isVisible;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vidéos de l'École</h1>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter une vidéo</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Toutes les catégories</option>
          <option value="presentation">Présentation</option>
          <option value="activities">Activités</option>
          <option value="events">Événements</option>
          <option value="testimonials">Témoignages</option>
        </select>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              {video.thumbnailUrl ? (
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => setSelectedVideo(video)}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity"
              >
                <Play className="h-12 w-12 text-white" />
              </button>
              {!video.isPublished && (
                <span className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  Brouillon
                </span>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(video.category)}`}>
                  {getCategoryLabel(video.category)}
                </span>
                {(user?.role === 'admin' || user?.role === 'teacher') && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{video.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>École</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="aspect-video mb-4">
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedVideo.category)}`}>
                  {getCategoryLabel(selectedVideo.category)}
                </span>
                <span className="text-sm text-gray-500">
                  Publié le {new Date(selectedVideo.uploadDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Video Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingVideo ? 'Modifier la vidéo' : 'Ajouter une vidéo'}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as SchoolVideo['category']})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="presentation">Présentation</option>
                  <option value="activities">Activités</option>
                  <option value="events">Événements</option>
                  <option value="testimonials">Témoignages</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">URL de la vidéo</label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.youtube.com/embed/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Utilisez l'URL d'intégration YouTube (embed)
                </p>
              </div>

              {/* Thumbnail Upload */}
              <ImageUpload
                currentImage={formData.thumbnailUrl}
                onImageChange={(imageUrl) => setFormData({...formData, thumbnailUrl: imageUrl})}
                label="Image de couverture"
              />

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
                  {editingVideo ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;