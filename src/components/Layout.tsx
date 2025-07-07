import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, School, User, Users, BookOpen, FileText, Settings, CreditCard, UserCheck, Package, Calendar, Newspaper, Home, MessageCircle, Video, Eye, EyeOff, Mail, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../utils/database';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user has permission for a specific action
  const hasPermission = (permission: string) => {
    if (user?.role === 'admin') return true;
    return user?.permissions?.includes(permission) || false;
  };

  // Get unread messages count
  const getUnreadMessagesCount = () => {
    if (user?.role === 'admin') {
      return db.getMessages().filter(m => m.status === 'unread' && !m.isFromAdmin).length;
    } else if (user?.role === 'parent') {
      const messages = db.getMessagesForParent(user.id);
      const notifications = db.getNotificationsForParent(user.id);
      return messages.filter(m => m.status === 'unread').length + 
             notifications.filter(n => !n.isRead).length;
    }
    return 0;
  };

  const unreadMessagesCount = getUnreadMessagesCount();

  const navigation = [
    { 
      name: 'Tableau de bord', 
      href: '/dashboard', 
      icon: School, 
      roles: ['admin', 'teacher', 'parent'],
      permission: null
    },
    { 
      name: 'Actualités', 
      href: '/news', 
      icon: Newspaper, 
      roles: ['admin', 'teacher', 'parent'],
      permission: 'news.view'
    },
    { 
      name: 'Calendrier', 
      href: '/calendar', 
      icon: Calendar, 
      roles: ['admin', 'teacher', 'parent'],
      permission: 'calendar.view'
    },
    { 
      name: 'Inscription', 
      href: '/register', 
      icon: Home, 
      roles: ['admin'],
      permission: 'registrations.manage'
    },
    { 
      name: 'Élèves', 
      href: '/students', 
      icon: Users, 
      roles: ['admin', 'teacher'],
      permission: 'students.view'
    },
    { 
      name: 'Classes', 
      href: '/classes', 
      icon: BookOpen, 
      roles: ['admin'],
      permission: 'classes.manage'
    },
    { 
      name: 'Notes', 
      href: '/grades', 
      icon: FileText, 
      roles: ['admin', 'teacher', 'parent'],
      permission: 'grades.view'
    },
    { 
      name: 'Devoirs', 
      href: '/homework', 
      icon: FileText, 
      roles: ['admin', 'teacher', 'parent'],
      permission: 'homework.view'
    },
    { 
      name: 'Présences', 
      href: '/attendance', 
      icon: UserCheck, 
      roles: ['admin', 'teacher', 'parent'],
      permission: 'attendance.view'
    },
    { 
      name: 'Bulletins', 
      href: '/reports', 
      icon: FileText, 
      roles: ['admin', 'teacher', 'parent'],
      permission: 'reports.generate'
    },
    { 
      name: 'Paiements', 
      href: '/payments', 
      icon: CreditCard, 
      roles: ['admin', 'parent'],
      permission: 'payments.view'
    },
    { 
      name: 'Salles', 
      href: '/rooms', 
      icon: Calendar, 
      roles: ['admin', 'teacher'],
      permission: 'rooms.view'
    },
    { 
      name: 'Personnel', 
      href: '/staff', 
      icon: UserCheck, 
      roles: ['admin'],
      permission: 'staff.manage'
    },
    { 
      name: 'Inventaire', 
      href: '/inventory', 
      icon: Package, 
      roles: ['admin'],
      permission: 'inventory.manage'
    },
    { 
      name: 'Utilisateurs', 
      href: '/users', 
      icon: User, 
      roles: ['admin'],
      permission: 'users.manage'
    },
    { 
      name: 'Matières', 
      href: '/subjects', 
      icon: Settings, 
      roles: ['admin'],
      permission: 'subjects.manage'
    },
    { 
      name: 'Vidéos', 
      href: '/videos', 
      icon: Video, 
      roles: ['admin', 'teacher', 'parent'],
      permission: 'videos.view'
    },
    { 
      name: 'Messages', 
      href: '/messages', 
      icon: Mail, 
      roles: ['admin', 'parent'],
      permission: null,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined
    },
    { 
      name: 'Contact', 
      href: '/contact', 
      icon: MessageCircle, 
      roles: ['admin', 'teacher', 'parent'],
      permission: null
    }
  ];

  const filteredNavigation = navigation.filter(item => {
    const hasRole = item.roles.includes(user?.role || '');
    const hasRequiredPermission = !item.permission || hasPermission(item.permission);
    return hasRole && hasRequiredPermission;
  });

  // Show read-only indicator for parents with limited access
  const isReadOnlyAccess = (href: string) => {
    if (user?.role !== 'parent') return false;
    
    const restrictedPaths = ['/grades', '/attendance', '/homework', '/payments'];
    return restrictedPaths.includes(href) && (!user.childrenIds || user.childrenIds.length === 0);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <School className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-lg font-bold text-gray-900">École Numérique</span>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
     {isMobileMenuOpen && (
  <div className="lg:hidden fixed inset-0 z-50 bg-gray-600 bg-opacity-50" onClick={toggleMobileMenu}>
    <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
      
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center">
          <School className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">École Numérique</span>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Scrollable menu */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            const readOnly = isReadOnlyAccess(item.href);

            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={toggleMobileMenu}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : readOnly
                      ? 'text-gray-400 hover:bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full ml-2">
                      {item.badge}
                    </span>
                  )}
                  {readOnly && (
                    <EyeOff className="h-4 w-4 text-gray-400 ml-2" title="Accès limité" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Parent Account Info - Mobile */}
        {user?.role === 'parent' && (!user.childrenIds || user.childrenIds.length === 0) && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Eye className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">Accès en consultation</span>
            </div>
            <p className="text-xs text-yellow-700 mb-3">
              Inscrivez vos enfants pour accéder à leurs notes, présences et devoirs.
            </p>
            <Link
              to="/register"
              onClick={toggleMobileMenu}
              className="inline-flex items-center px-3 py-1 bg-yellow-600 text-white text-xs rounded-md hover:bg-yellow-700"
            >
              Inscrire un enfant
            </Link>
          </div>
        )}
      </div>

      {/* Footer - Profil + Déconnexion */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center mb-4">
          {user?.profilePhoto ? (
            <img 
              src={user.profilePhoto} 
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role === 'admin' ? 'Administrateur' :
               user?.role === 'teacher' ? 'Professeur' : 'Parent'}
            </p>
            {user?.role === 'parent' && user.childrenIds && user.childrenIds.length > 0 && (
              <p className="text-xs text-green-600">
                {user.childrenIds.length} enfant(s) inscrit(s)
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            toggleMobileMenu();
          }}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </button>
      </div>
    </div>
  </div>
)}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white lg:shadow-lg lg:overflow-y-auto">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <School className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">École Numérique</span>
        </div>
        
        <nav className="mt-8 px-4 flex-1">
          <ul className="space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              const readOnly = isReadOnlyAccess(item.href);
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : readOnly
                        ? 'text-gray-400 hover:bg-gray-50'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {readOnly && (
                      <EyeOff className="h-4 w-4 text-gray-400" title="Accès limité - Inscrivez vos enfants pour accéder" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Parent Account Info - Desktop */}
          {user?.role === 'parent' && (!user.childrenIds || user.childrenIds.length === 0) && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Eye className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">Accès en consultation</span>
              </div>
              <p className="text-xs text-yellow-700 mb-3">
                Inscrivez vos enfants pour accéder à leurs notes, présences et devoirs.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center px-3 py-1 bg-yellow-600 text-white text-xs rounded-md hover:bg-yellow-700"
              >
                Inscrire un enfant
              </Link>
            </div>
          )}
        </nav>

        {/* User Profile and Logout - Desktop */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center mb-4">
            {user?.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role === 'admin' ? 'Administrateur' : 
                 user?.role === 'teacher' ? 'Professeur' : 'Parent'}
              </p>
              {user?.role === 'parent' && user.childrenIds && user.childrenIds.length > 0 && (
                <p className="text-xs text-green-600">
                  {user.childrenIds.length} enfant(s) inscrit(s)
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
