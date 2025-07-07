import React from 'react';
import { Check } from 'lucide-react';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PermissionsSelectorProps {
  selectedPermissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  userRole: 'admin' | 'teacher' | 'parent';
}

const allPermissions: Permission[] = [
  // Gestion des élèves
  { id: 'students.view', name: 'Voir les élèves', description: 'Consulter la liste des élèves', category: 'Élèves' },
  { id: 'students.create', name: 'Ajouter des élèves', description: 'Inscrire de nouveaux élèves', category: 'Élèves' },
  { id: 'students.edit', name: 'Modifier les élèves', description: 'Modifier les informations des élèves', category: 'Élèves' },
  { id: 'students.delete', name: 'Supprimer des élèves', description: 'Supprimer des élèves du système', category: 'Élèves' },

  // Gestion des notes
  { id: 'grades.view', name: 'Voir les notes', description: 'Consulter les notes des élèves', category: 'Notes' },
  { id: 'grades.create', name: 'Saisir des notes', description: 'Ajouter de nouvelles notes', category: 'Notes' },
  { id: 'grades.edit', name: 'Modifier les notes', description: 'Modifier les notes existantes', category: 'Notes' },
  { id: 'grades.delete', name: 'Supprimer des notes', description: 'Supprimer des notes', category: 'Notes' },

  // Gestion des présences
  { id: 'attendance.view', name: 'Voir les présences', description: 'Consulter les présences', category: 'Présences' },
  { id: 'attendance.manage', name: 'Gérer les présences', description: 'Marquer les présences/absences', category: 'Présences' },

  // Gestion des devoirs
  { id: 'homework.view', name: 'Voir les devoirs', description: 'Consulter les devoirs', category: 'Devoirs' },
  { id: 'homework.create', name: 'Créer des devoirs', description: 'Ajouter de nouveaux devoirs', category: 'Devoirs' },
  { id: 'homework.edit', name: 'Modifier les devoirs', description: 'Modifier les devoirs existants', category: 'Devoirs' },
  { id: 'homework.delete', name: 'Supprimer des devoirs', description: 'Supprimer des devoirs', category: 'Devoirs' },

  // Gestion des paiements
  { id: 'payments.view', name: 'Voir les paiements', description: 'Consulter les paiements', category: 'Paiements' },
  { id: 'payments.create', name: 'Enregistrer des paiements', description: 'Ajouter de nouveaux paiements', category: 'Paiements' },
  { id: 'payments.edit', name: 'Modifier les paiements', description: 'Modifier les paiements', category: 'Paiements' },

  // Gestion des actualités
  { id: 'news.view', name: 'Voir les actualités', description: 'Consulter les actualités', category: 'Actualités' },
  { id: 'news.create', name: 'Créer des actualités', description: 'Publier de nouvelles actualités', category: 'Actualités' },
  { id: 'news.edit', name: 'Modifier les actualités', description: 'Modifier les actualités', category: 'Actualités' },
  { id: 'news.delete', name: 'Supprimer des actualités', description: 'Supprimer des actualités', category: 'Actualités' },

  // Gestion du calendrier
  { id: 'calendar.view', name: 'Voir le calendrier', description: 'Consulter le calendrier', category: 'Calendrier' },
  { id: 'calendar.create', name: 'Créer des événements', description: 'Ajouter des événements', category: 'Calendrier' },
  { id: 'calendar.edit', name: 'Modifier des événements', description: 'Modifier les événements', category: 'Calendrier' },
  { id: 'calendar.delete', name: 'Supprimer des événements', description: 'Supprimer des événements', category: 'Calendrier' },

  // Gestion des salles
  { id: 'rooms.view', name: 'Voir les salles', description: 'Consulter les salles et horaires', category: 'Salles' },
  { id: 'rooms.manage', name: 'Gérer les salles', description: 'Gérer les salles et plannings', category: 'Salles' },

  // Gestion des vidéos
  { id: 'videos.view', name: 'Voir les vidéos', description: 'Consulter les vidéos de l\'école', category: 'Vidéos' },
  { id: 'videos.create', name: 'Ajouter des vidéos', description: 'Publier de nouvelles vidéos', category: 'Vidéos' },
  { id: 'videos.edit', name: 'Modifier les vidéos', description: 'Modifier les vidéos', category: 'Vidéos' },
  { id: 'videos.delete', name: 'Supprimer des vidéos', description: 'Supprimer des vidéos', category: 'Vidéos' },

  // Administration
  { id: 'users.manage', name: 'Gérer les utilisateurs', description: 'Créer, modifier, supprimer des utilisateurs', category: 'Administration' },
  { id: 'classes.manage', name: 'Gérer les classes', description: 'Créer, modifier, supprimer des classes', category: 'Administration' },
  { id: 'subjects.manage', name: 'Gérer les matières', description: 'Créer, modifier, supprimer des matières', category: 'Administration' },
  { id: 'staff.manage', name: 'Gérer le personnel', description: 'Gérer les informations du personnel', category: 'Administration' },
  { id: 'inventory.manage', name: 'Gérer l\'inventaire', description: 'Gérer l\'inventaire de l\'école', category: 'Administration' },
  { id: 'reports.generate', name: 'Générer des bulletins', description: 'Créer et imprimer des bulletins', category: 'Administration' },
  { id: 'registrations.manage', name: 'Gérer les inscriptions', description: 'Traiter les inscriptions en ligne', category: 'Administration' }
];

const defaultPermissionsByRole = {
  admin: allPermissions.map(p => p.id),
  teacher: [
    'students.view', 'students.edit',
    'grades.view', 'grades.create', 'grades.edit',
    'attendance.view', 'attendance.manage',
    'homework.view', 'homework.create', 'homework.edit', 'homework.delete',
    'news.view', 'news.create', 'news.edit',
    'calendar.view', 'calendar.create', 'calendar.edit',
    'rooms.view',
    'videos.view',
    'reports.generate'
  ],
  parent: [
    'students.view',
    'grades.view',
    'attendance.view',
    'homework.view',
    'payments.view',
    'news.view',
    'calendar.view',
    'videos.view'
  ]
};

const PermissionsSelector: React.FC<PermissionsSelectorProps> = ({
  selectedPermissions,
  onPermissionsChange,
  userRole
}) => {
  const availablePermissions = allPermissions.filter(permission => 
    defaultPermissionsByRole[userRole].includes(permission.id)
  );

  const categories = [...new Set(availablePermissions.map(p => p.category))];

  const togglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      onPermissionsChange(selectedPermissions.filter(id => id !== permissionId));
    } else {
      onPermissionsChange([...selectedPermissions, permissionId]);
    }
  };

  const toggleCategory = (category: string) => {
    const categoryPermissions = availablePermissions
      .filter(p => p.category === category)
      .map(p => p.id);
    
    const allSelected = categoryPermissions.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      onPermissionsChange(selectedPermissions.filter(id => !categoryPermissions.includes(id)));
    } else {
      const newPermissions = [...selectedPermissions];
      categoryPermissions.forEach(id => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id);
        }
      });
      onPermissionsChange(newPermissions);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">Permissions</h4>
        <button
          type="button"
          onClick={() => onPermissionsChange(defaultPermissionsByRole[userRole])}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Permissions par défaut
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
        {categories.map(category => {
          const categoryPermissions = availablePermissions.filter(p => p.category === category);
          const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p.id));
          const someSelected = categoryPermissions.some(p => selectedPermissions.includes(p.id));

          return (
            <div key={category} className="border-b border-gray-100 last:border-b-0">
              <div 
                className="flex items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleCategory(category)}
              >
                <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                  allSelected ? 'bg-blue-600 border-blue-600' : 
                  someSelected ? 'bg-blue-200 border-blue-400' : 'border-gray-300'
                }`}>
                  {allSelected && <Check className="h-3 w-3 text-white" />}
                  {someSelected && !allSelected && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                </div>
                <span className="font-medium text-sm text-gray-900">{category}</span>
              </div>
              
              <div className="pl-6">
                {categoryPermissions.map(permission => (
                  <div 
                    key={permission.id}
                    className="flex items-start p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => togglePermission(permission.id)}
                  >
                    <div className={`w-4 h-4 border-2 rounded mr-3 mt-0.5 flex items-center justify-center ${
                      selectedPermissions.includes(permission.id) 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300'
                    }`}>
                      {selectedPermissions.includes(permission.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                      <div className="text-xs text-gray-500">{permission.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-500">
        {selectedPermissions.length} permission(s) sélectionnée(s)
      </div>
    </div>
  );
};

export default PermissionsSelector;
export { defaultPermissionsByRole };