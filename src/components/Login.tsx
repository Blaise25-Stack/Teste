import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/database';
import { User, Message } from '../types';
import { School, User as UserIcon, Lock, AlertCircle, UserPlus } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const { login } = useAuth();

  // Form data for creating parent account
  const [parentFormData, setParentFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      const success = login(username.trim(), password);
      if (!success) {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateParentAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!parentFormData.name || !parentFormData.email || !parentFormData.phone || 
        !parentFormData.username || !parentFormData.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (parentFormData.password !== parentFormData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (parentFormData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Check if username already exists
    const existingUsers = db.getUsers();
    if (existingUsers.find(u => u.username.toLowerCase() === parentFormData.username.toLowerCase())) {
      setError('Ce nom d\'utilisateur existe déjà');
      return;
    }

    try {
      // Create parent account with limited permissions
      const newParentUser: User = {
        id: Date.now().toString(),
        username: parentFormData.username.trim(),
        password: parentFormData.password,
        role: 'parent',
        name: parentFormData.name.trim(),
        email: parentFormData.email.trim(),
        phone: parentFormData.phone.trim(),
        permissions: [
          'students.view',
          'grades.view',
          'attendance.view',
          'homework.view',
          'payments.view',
          'news.view',
          'calendar.view',
          'videos.view'
        ],
        childrenIds: [],
        isActive: true,
        createdAt: new Date().toISOString()
      };

      // Save to database
      db.addUser(newParentUser);
      
      // Create a message for account creation
      if (parentFormData.message.trim()) {
        const accountMessage: Message = {
          id: Date.now().toString() + '_msg',
          senderName: parentFormData.name.trim(),
          senderEmail: parentFormData.email.trim(),
          senderPhone: parentFormData.phone.trim(),
          subject: 'Création de compte parent',
          message: `Bonjour,\n\nJe viens de créer mon compte parent sur votre plateforme.\n\nMessage: ${parentFormData.message.trim()}\n\nCordialement,\n${parentFormData.name.trim()}`,
          type: 'account_creation',
          status: 'unread',
          priority: 'medium',
          createdAt: new Date().toISOString()
        };
        
        db.addMessage(accountMessage);
      }
      
      console.log('Nouveau compte parent créé:', newParentUser);
      
      // Auto-login the new parent
      const success = login(parentFormData.username.trim(), parentFormData.password);
      if (success) {
        // Success message will be shown in the dashboard
        console.log('Connexion automatique réussie');
      } else {
        setError('Compte créé mais erreur de connexion. Veuillez vous connecter manuellement.');
        setShowCreateAccount(false);
        // Reset login form
        setUsername(parentFormData.username);
        setPassword('');
      }
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      setError('Erreur lors de la création du compte. Veuillez réessayer.');
    }
  };

  const resetParentForm = () => {
    setParentFormData({
      name: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      confirmPassword: '',
      message: ''
    });
    setError('');
  };

  if (showCreateAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4">
              <School className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Créer un compte parent</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Accès en consultation uniquement</p>
          </div>

          <form onSubmit={handleCreateParentAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={parentFormData.name}
                onChange={(e) => setParentFormData({...parentFormData, name: e.target.value})}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Votre nom complet"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={parentFormData.email}
                  onChange={(e) => setParentFormData({...parentFormData, email: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={parentFormData.phone}
                  onChange={(e) => setParentFormData({...parentFormData, phone: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="+225 XX XX XX XX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur *
              </label>
              <input
                type="text"
                required
                value={parentFormData.username}
                onChange={(e) => setParentFormData({...parentFormData, username: e.target.value})}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Choisissez un nom d'utilisateur"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  required
                  value={parentFormData.password}
                  onChange={(e) => setParentFormData({...parentFormData, password: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Min. 6 caractères"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer *
                </label>
                <input
                  type="password"
                  required
                  value={parentFormData.confirmPassword}
                  onChange={(e) => setParentFormData({...parentFormData, confirmPassword: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Répétez le mot de passe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message pour l'administration (optionnel)
              </label>
              <textarea
                value={parentFormData.message}
                onChange={(e) => setParentFormData({...parentFormData, message: e.target.value})}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                rows={3}
                placeholder="Questions, demandes d'informations, etc."
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Avec ce compte, vous pourrez :</h3>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                <li>• Inscrire vos enfants en ligne</li>
                <li>• Consulter les actualités de l'école</li>
                <li>• Voir le calendrier des événements</li>
                <li>• Accéder aux vidéos de l'école</li>
                <li>• Contacter l'administration</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                Note: L'accès aux notes et présences sera activé après inscription de vos enfants.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              Créer mon compte
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setShowCreateAccount(false);
                resetParentForm();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <School className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">École Numérique</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Système de gestion scolaire</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Entrez votre nom d'utilisateur"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Entrez votre mot de passe"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Account Creation Options */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Pas encore de compte ?</p>
          </div>
          
          <button
            onClick={() => {
              setShowCreateAccount(true);
              resetParentForm();
            }}
            className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm sm:text-base"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Créer un compte parent
          </button>
          
          <Link
            to="/public-register"
            className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            Inscription d'un élève
          </Link>
        </div>

       
      </div>
    </div>
  );
};

export default Login;
