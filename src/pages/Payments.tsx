import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/database';
import { Payment, Student } from '../types';
import { Plus, Search, Eye, Download, CreditCard, Filter } from 'lucide-react';

const Payments: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>(db.getPayments());
  const [students] = useState<Student[]>(db.getStudents());
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredPayments = payments.filter(payment => {
    const student = students.find(s => s.id === payment.studentId);
    const matchesSearch = student ? 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesType = !filterType || payment.type === filterType;
    const matchesStatus = !filterStatus || payment.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    type: 'scolarite' as Payment['type'],
    description: '',
    method: 'especes' as Payment['method'],
    paidBy: '',
    dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPayment: Payment = {
      id: Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      receiptNumber: `REC${Date.now()}`,
      academicYear: '2024-2025'
    };
    
    db.addPayment(newPayment);
    setPayments(db.getPayments());
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      amount: '',
      type: 'scolarite',
      description: '',
      method: 'especes',
      paidBy: '',
      dueDate: ''
    });
    setShowModal(false);
  };

  const generateReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const printReceipt = () => {
    window.print();
  };

  const getPaymentTypeLabel = (type: Payment['type']) => {
    const labels = {
      inscription: 'Inscription',
      scolarite: 'Scolarité',
      cantine: 'Cantine',
      transport: 'Transport',
      autre: 'Autre'
    };
    return labels[type];
  };

  const getStatusColor = (status: Payment['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const totalAmount = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Paiements</h1>
          <p className="text-gray-600 mt-1">
            Total encaissé: <span className="font-bold text-green-600">{totalAmount.toLocaleString()} FCFA</span>
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau paiement</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tous les types</option>
          <option value="inscription">Inscription</option>
          <option value="scolarite">Scolarité</option>
          <option value="cantine">Cantine</option>
          <option value="transport">Transport</option>
          <option value="autre">Autre</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tous les statuts</option>
          <option value="completed">Payé</option>
          <option value="pending">En attente</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Élève
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment) => {
              const student = students.find(s => s.id === payment.studentId);
              
              return (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        {student?.profilePhoto ? (
                          <img 
                            src={student.profilePhoto} 
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {student?.firstName?.[0]}{student?.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student?.firstName} {student?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">N° {payment.receiptNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getPaymentTypeLabel(payment.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.amount.toLocaleString()} FC
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{payment.method}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status === 'completed' ? 'Payé' : 
                       payment.status === 'pending' ? 'En attente' : 'Annulé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => generateReceipt(payment)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Voir le reçu"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nouveau paiement</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Élève</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un élève</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type de paiement</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as Payment['type']})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="inscription">Inscription</option>
                  <option value="scolarite">Scolarité</option>
                  <option value="cantine">Cantine</option>
                  <option value="transport">Transport</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Montant (FC)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Frais de scolarité - 1er trimestre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Méthode de paiement</label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({...formData, method: e.target.value as Payment['method']})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="mobile">Mobile Money</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Payé par</label>
                <input
                  type="text"
                  required
                  value={formData.paidBy}
                  onChange={(e) => setFormData({...formData, paidBy: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom du parent/tuteur"
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="print:block">
              {/* Receipt Header */}
              <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">ÉCOLE NUMÉRIQUE</h1>
                <p className="text-gray-600">REÇU DE PAIEMENT</p>
                <p className="text-sm text-gray-500 mt-2">N° {selectedPayment.receiptNumber}</p>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de l'élève</h3>
                  {(() => {
                    const student = students.find(s => s.id === selectedPayment.studentId);
                    return (
                      <div className="space-y-2">
                        <p><span className="font-medium">Nom :</span> {student?.firstName} {student?.lastName}</p>
                        <p><span className="font-medium">N° Élève :</span> {student?.studentNumber}</p>
                        <p><span className="font-medium">Classe :</span> {db.getClasses().find(c => c.id === student?.classId)?.name}</p>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails du paiement</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Type :</span> {getPaymentTypeLabel(selectedPayment.type)}</p>
                    <p><span className="font-medium">Montant :</span> {selectedPayment.amount.toLocaleString()} FCFA</p>
                    <p><span className="font-medium">Date :</span> {new Date(selectedPayment.date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Méthode :</span> {selectedPayment.method}</p>
                    <p><span className="font-medium">Payé par :</span> {selectedPayment.paidBy}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedPayment.description}</p>
              </div>

              {/* Footer */}
              <div className="border-t pt-6 mt-8">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Date d'émission: {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Signature et cachet</p>
                    <div className="mt-8 border-t border-gray-400 w-32"></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-4 mt-8 print:hidden">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  onClick={printReceipt}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
