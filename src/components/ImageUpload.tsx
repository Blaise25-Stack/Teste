import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  label: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageChange, 
  label, 
  className = "" 
}) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }

      setIsUploading(true);
      
      // Créer un aperçu local
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onImageChange(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInput = (url: string) => {
    setPreview(url);
    onImageChange(url);
  };

  const clearImage = () => {
    setPreview('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Aperçu" 
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
            onError={() => {
              setPreview('');
              onImageChange('');
            }}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Upload Options */}
      <div className="flex flex-col space-y-2">
        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${label.replace(/\s+/g, '-')}`}
          />
          <label
            htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Chargement...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choisir un fichier
              </>
            )}
          </label>
        </div>

        {/* URL Input */}
        <div>
          <input
            type="url"
            placeholder="Ou coller une URL d'image"
            value={preview.startsWith('data:') ? '' : preview}
            onChange={(e) => handleUrlInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
      </p>
    </div>
  );
};

export default ImageUpload;