import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Lock } from 'lucide-react';

interface PermissionGuardProps {
  permission?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  fallback, 
  children 
}) => {
  const { user } = useAuth();

  // Admin has all permissions
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  // Check if user has the required permission
  const hasPermission = !permission || user?.permissions?.includes(permission);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Accès restreint</h3>
          <p className="text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.
          </p>
          {user?.role === 'parent' && (!user.childrenIds || user.childrenIds.length === 0) && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-800">
                Inscrivez vos enfants pour accéder à leurs informations scolaires.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;