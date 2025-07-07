import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/database';
import { Grade, Student, Subject, Class } from '../types';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const Grades: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>(db.getGrades());
  const [students, setStudents] = useState<Student[]>(db.getStudents());
  const [subjects, setSubjects] = useState<Subject[]>(db.getSubjects());
  const [classes, setClasses] = useState<Class[]>(db.getClasses());
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [selectedClass, setSelectedClass] = useState('');

  // Filter data based on user role
  const userClasses = user?.role === 'admin' 
    ? classes 
    : classes.filter(c => user?.assignedClasses?.includes(c.id));

  const filteredGrades = grades.filter(grade => {
    const student = students.find(s => s.id === grade.studentId);
    const subject = subjects.find(s => s.id === grade.subjectId);
    const hasAccess = user?.role === 'admin' || userClasses.some(c => c.id === grade.classId);
    const matchesSearch = student ? `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesClass = !selectedClass || grade.classId === selectedClass;
    
    return hasAccess && matchesSearch && matchesClass;
  });

  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    classId: '',
    value: '',
    maxValue: '20',
    type: 'devoir' as 'devoir' | 'composition' | 'examen',
    date: new Date().toISOString().split('T')[0],
    term: 'trimestre1' as 'trimestre1' | 'trimestre2' | 'trimestre3'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGrade) {
      db.updateGrade(editingGrade.id, {
        ...formData,
        value: parseFloat(formData.value),
        maxValue: parseFloat(formData.maxValue),
        teacherId: user?.id || ''
      });
      setGrades(db.getGrades());
    } else {
      const newGrade: Grade = {
        id: Date.now().toString(),
        ...formData,
        value: parseFloat(formData.value),
        maxValue: parseFloat(formData.maxValue),
        teacherId: user?.id || ''
      };
      db.addGrade(newGrade);
      setGrades(db.getGrades());
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      subjectId: '',
      classId: '',
      value: '',
      maxValue: '20',
      type: 'devoir',
      date: new Date().toISOString().split('T')[0],
      term: 'trimestre1'
    });
    setEditingGrade(null);
    setShowModal(false);
  };

  const handleEdit = (grade: Grade) => {
    setFormData({
      studentId: grade.studentId,
      subjectId: grade.subjectId,
      classId: grade.classId,
      value: grade.value.toString(),
      maxValue: grade.maxValue.toString(),
      type: grade.type,
      date: grade.date,
      term: grade.term
    });
    setEditingGrade(grade);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      db.deleteGrade(id);
      setGrades(db.getGrades());
    }
  };

  const getStudentsByClass = (classId: string) => {
    return students.filter(s => s.classId === classId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Notes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter une note</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Toutes les classes</option>
          {userClasses.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Élève
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matière
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGrades.map((grade) => {
              const student = students.find(s => s.id === grade.studentId);
              const subject = subjects.find(s => s.id === grade.subjectId);
              const gradeClass = classes.find(c => c.id === grade.classId);
              const percentage = (grade.value / grade.maxValue * 20).toFixed(1);
              
              return (
                <tr key={grade.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student?.firstName} {student?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{gradeClass?.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {subject?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {grade.value}/{grade.maxValue}
                    </div>
                    <div className="text-sm text-gray-500">({percentage}/20)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      grade.type === 'examen' ? 'bg-red-100 text-red-800' :
                      grade.type === 'composition' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {grade.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(grade.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(grade)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(grade.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingGrade ? 'Modifier la note' : 'Ajouter une note'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Classe</label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value, studentId: ''})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une classe</option>
                  {userClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Élève</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!formData.classId}
                >
                  <option value="">Sélectionner un élève</option>
                  {formData.classId && getStudentsByClass(formData.classId).map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Matière</label>
                <select
                  required
                  value={formData.subjectId}
                  onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une matière</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Note obtenue</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Note maximale</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={formData.maxValue}
                    onChange={(e) => setFormData({...formData, maxValue: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type d'évaluation</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="devoir">Devoir</option>
                    <option value="composition">Composition</option>
                    <option value="examen">Examen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trimestre</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({...formData, term: e.target.value as any})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="trimestre1">1er Trimestre</option>
                    <option value="trimestre2">2ème Trimestre</option>
                    <option value="trimestre3">3ème Trimestre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                  {editingGrade ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;