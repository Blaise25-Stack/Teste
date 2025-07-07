import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/database';
import { Users, BookOpen, FileText, TrendingUp, CreditCard, UserPlus, Clock, Award, Eye, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const students = db.getStudents();
  const classes = db.getClasses();
  const grades = db.getGrades();
  const payments = db.getPayments();

  // Filter data based on user role
  const userClasses = user?.role === 'admin' 
    ? classes 
    : classes.filter(c => user?.assignedClasses?.includes(c.id));
  
  const userStudents = user?.role === 'admin'
    ? students
    : students.filter(s => userClasses.some(c => c.id === s.classId));

  // Recent grades (last 10)
  const recentGrades = grades
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Recent payments (last 10)
  const recentPayments = payments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const stats = [
    {
      name: 'Élèves',
      value: userStudents.length,
      icon: Users,
      color: 'bg-blue-500',
      link: '/students'
    },
    {
      name: 'Classes',
      value: userClasses.length,
      icon: BookOpen,
      color: 'bg-green-500',
      link: '/classes'
    },
    {
      name: 'Notes saisies',
      value: grades.length,
      icon: FileText,
      color: 'bg-yellow-500',
      link: '/grades'
    },
    {
      name: 'Paiements ce mois',
      value: payments.filter(p => {
        const paymentDate = new Date(p.date);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear();
      }).length,
      icon: CreditCard,
      color: 'bg-purple-500',
      link: '/payments'
    }
  ];

  // Parent with no children enrolled
  const isParentWithoutChildren = user?.role === 'parent' && (!user.childrenIds || user.childrenIds.length === 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Bienvenue, {user?.name} - {user?.role === 'admin' ? 'Administrateur' : user?.role === 'teacher' ? 'Professeur' : 'Parent'}
        </p>
      </div>

      {/* Parent Welcome Message */}
      {isParentWithoutChildren && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
                Bienvenue dans votre espace parent !
              </h3>
              <p className="text-blue-800 mb-4 text-sm sm:text-base">
                Votre compte a été créé avec succès. Vous pouvez maintenant consulter les informations générales de l'école et inscrire vos enfants.
              </p>
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-blue-900 text-sm sm:text-base">Ce que vous pouvez faire actuellement :</h4>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1 ml-4">
                  <li>• Consulter les actualités de l'école</li>
                  <li>• Voir le calendrier des événements</li>
                  <li>• Regarder les vidéos de présentation</li>
                  <li>• Contacter l'administration</li>
                  <li>• Inscrire vos enfants en ligne</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Inscrire un enfant
                </Link>
                <Link
                  to="/news"
                  className="inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm sm:text-base"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir les actualités
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Show for all users but with different data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isAccessible = user?.role !== 'parent' || !isParentWithoutChildren || 
                              ['news', 'calendar', 'videos', 'contact'].some(path => stat.link.includes(path));
          
          return (
            <div key={stat.name} className={`block ${!isAccessible ? 'opacity-50' : ''}`}>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {isAccessible ? stat.value : '—'}
                    </p>
                    {!isAccessible && (
                      <p className="text-xs text-gray-500">Accès après inscription</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/students"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-blue-900 text-sm sm:text-base">Ajouter un élève</p>
                <p className="text-xs sm:text-sm text-blue-600">Inscrire un nouvel élève</p>
              </div>
            </Link>
            <Link
              to="/payments"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-green-900 text-sm sm:text-base">Gérer les paiements</p>
                <p className="text-xs sm:text-sm text-green-600">Enregistrer un paiement</p>
              </div>
            </Link>
            <Link
              to="/reports"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-purple-900 text-sm sm:text-base">Générer bulletins</p>
                <p className="text-xs sm:text-sm text-purple-600">Créer les bulletins de notes</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Parent Quick Actions */}
      {isParentWithoutChildren && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Actions disponibles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/register"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-green-900 text-sm sm:text-base">Inscrire un enfant</p>
                <p className="text-xs sm:text-sm text-green-600">Formulaire d'inscription en ligne</p>
              </div>
            </Link>
            <Link
              to="/contact"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-blue-900 text-sm sm:text-base">Contacter l'école</p>
                <p className="text-xs sm:text-sm text-blue-600">Questions et informations</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity - Only show if user has access */}
      {!isParentWithoutChildren && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Recent Grades */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Notes récentes</h2>
              <Link to="/grades" className="text-blue-600 hover:text-blue-800 text-sm">
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {recentGrades.slice(0, 5).map((grade) => {
                const student = students.find(s => s.id === grade.studentId);
                const subject = db.getSubjects().find(s => s.id === grade.subjectId);
                const percentage = (grade.value / grade.maxValue * 20).toFixed(1);
                
                return (
                  <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {student?.firstName} {student?.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{subject?.name}</p>
                      </div>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{percentage}/20</p>
                      <p className="text-xs text-gray-500">{new Date(grade.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Paiements récents</h2>
              <Link to="/payments" className="text-blue-600 hover:text-blue-800 text-sm">
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {recentPayments.slice(0, 5).map((payment) => {
                const student = students.find(s => s.id === payment.studentId);
                
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {student?.firstName} {student?.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 capitalize truncate">{payment.type}</p>
                      </div>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <p className="font-bold text-green-600 text-sm sm:text-base">{payment.amount.toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* My Classes - Only show if user has access */}
      {!isParentWithoutChildren && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            {user?.role === 'admin' ? 'Toutes les classes' : 'Mes classes'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userClasses.map((classItem) => (
              <div key={classItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{classItem.name}</h3>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2 flex-shrink-0">{classItem.level}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">{classItem.academicYear}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {userStudents.filter(s => s.classId === classItem.id).length} élèves
                  </span>
                  <Link
                    to={`/classes/${classItem.id}`}
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                  >
                    Voir détails
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;