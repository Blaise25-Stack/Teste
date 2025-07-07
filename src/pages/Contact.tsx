import React, { useState } from 'react';
import { db } from '../utils/database';
import { Message } from '../types';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a message for the admin
      const contactMessage: Message = {
        id: Date.now().toString(),
        senderName: formData.name.trim(),
        senderEmail: formData.email.trim(),
        senderPhone: formData.phone.trim() || undefined,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        type: 'contact',
        status: 'unread',
        priority: formData.subject.toLowerCase().includes('urgent') ? 'high' : 'medium',
        createdAt: new Date().toISOString()
      };

      db.addMessage(contactMessage);
      
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Téléphone',
      details: ['+225 01 23 45 67 89', '+225 07 89 12 34 56'],
      color: 'text-blue-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['contact@ecole-numerique.ci', 'direction@ecole-numerique.ci'],
      color: 'text-green-600'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      details: ['123 Avenue de l\'Éducation', 'Abidjan, Côte d\'Ivoire'],
      color: 'text-purple-600'
    },
    {
      icon: Clock,
      title: 'Horaires',
      details: ['Lun - Ven: 7h00 - 17h00', 'Sam: 8h00 - 12h00'],
      color: 'text-orange-600'
    }
  ];

  const whatsappNumbers = [
    { name: 'Direction', number: '+22501234567', department: 'Administration' },
    { name: 'Secrétariat', number: '+22507891234', department: 'Inscriptions' },
    { name: 'Comptabilité', number: '+22505678912', department: 'Paiements' }
  ];

  if (isSubmitted) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Message envoyé !</h1>
          <p className="text-gray-600">
            Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Message reçu</h2>
          <p className="text-gray-600 mb-6">
            Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Envoyer un autre message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contactez-nous</h1>
        <p className="text-gray-600">
          Nous sommes là pour répondre à toutes vos questions. N'hésitez pas à nous contacter !
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de contact</h2>
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="flex items-start">
                    <Icon className={`h-6 w-6 ${info.color} mr-3 mt-1`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Contact */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <MessageCircle className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">WhatsApp</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Contactez-nous directement via WhatsApp pour une réponse rapide
            </p>
            <div className="space-y-3">
              {whatsappNumbers.map((contact, index) => (
                <a
                  key={index}
                  href={`https://wa.me/${contact.number.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-900">{contact.name}</p>
                      <p className="text-sm text-green-700">{contact.department}</p>
                    </div>
                    <p className="text-sm text-green-600">{contact.number}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Envoyez-nous un message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom complet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+225 XX XX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un sujet</option>
                    <option value="inscription">Inscription</option>
                    <option value="information">Demande d'information</option>
                    <option value="paiement">Question sur les paiements</option>
                    <option value="pedagogie">Questions pédagogiques</option>
                    <option value="technique">Support technique</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez votre demande en détail..."
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Temps de réponse :</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Email : Réponse sous 24h en jours ouvrables</li>
                  <li>• WhatsApp : Réponse immédiate pendant les heures d'ouverture</li>
                  <li>• Téléphone : Disponible de 7h à 17h du lundi au vendredi</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
                <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notre localisation</h2>
        <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Carte interactive disponible</p>
            <p className="text-sm text-gray-500">123 Avenue de l'Éducation, Abidjan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;