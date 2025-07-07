import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/database';
import { Class, User } from '../types';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';

const Classes: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>(db.getClasses());
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const teachers = users.filter(u => u.role === 'teacher');

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    name: '',
    level: '',
    teacherId: '',
    academicYear: '2024-2025',
    subjects: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClass) {
      db.updateClass(editingClass.id, formData);
      setClasses(db.getClasses());
    } else {
      const newClass: Class = {
        id: Date.now().toString(),
        ...formData
      };
      db.addClass(newClass);
      setClasses(db.getClasses());
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: '',
      teacherId: '',
      academicYear: '2024-2025',
      subjects: []
    });
    setEditingClass(null);
    setShowModal(false);
  };

  const handleEdit = (cls: Class) => {
    setFormData({
      name: cls.name,
      level: cls.level,
      teacherId: cls.teacherId,
      academicYear: cls.academicYear,
      subjects: cls.subjects
    });
    setEditingClass(cls);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      db.deleteClass(id);
      setClasses(db.getClasses());
    }
  };

  const getStudentCount = (classId: string) => {
    return db.getStudents().filter(s => s.classId === classId).length;
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Classes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter une classe</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => {
          const teacher = teachers.find(t => t.id === cls.teacherId);
          const studentCount = getStudentCount(cls.id);
          
          return (
            <div key={cls.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-600">{cls.level}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(cls)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{studentCount} élèves</span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Professeur principal :</span> {teacher?.name || 'Non assigné'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Année scolaire :</span> {cls.academicYear}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-2">Matières enseignées :</p>
                <div className="flex flex-wrap gap-1">
                  {cls.subjects.slice(0, 3).map((subjectId) => {
                    const subject = db.getSubjects().find(s => s.id === subjectId);
                    return (
                      <span key={subjectId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {subject?.code}
                      </span>
                    );
                  })}
                  {cls.subjects.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{cls.subjects.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingClass ? 'Modifier la classe' : 'Ajouter une classe'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de la classe</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: CM2 A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Niveau</label>
                <select
                  required
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un niveau</option>
                  <option value="CP">CP</option>
                  <option value="CE1">CE1</option>
                  <option value="CE2">CE2</option>
                  <option value="CM1">CM1</option>
                  <option value="CM2">CM2</option>
                  <option value="6ème">6ème</option>
                  <option value="5ème">5ème</option>
                  <option value="4ème">4ème</option>
                  <option value="3ème">3ème</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Professeur principal</label>
                <select
                  required
                  value={formData.teacherId}
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un professeur</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Année scolaire</label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2024-2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Matières enseignées</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {db.getSubjects().map(subject => (
                    <label key={subject.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, subjects: [...formData.subjects, subject.id]});
                          } else {
                            setFormData({...formData, subjects: formData.subjects.filter(id => id !== subject.id)});
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{subject.name}</span>
                    </label>
                  ))}
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
                  {editingClass ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;