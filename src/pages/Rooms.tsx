import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/database';
import { Room, RoomSchedule, Class, Subject } from '../types';
import { Plus, Search, Edit, Trash2, Calendar, Clock, MapPin, Eye } from 'lucide-react';

const Rooms: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(db.getRooms());
  const [schedules, setSchedules] = useState<RoomSchedule[]>(db.getRoomSchedules());
  const [classes] = useState<Class[]>(db.getClasses());
  const [subjects] = useState<Subject[]>(db.getSubjects());
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showScheduleView, setShowScheduleView] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [roomFormData, setRoomFormData] = useState({
    name: '',
    capacity: '',
    type: 'classroom' as Room['type'],
    equipment: [] as string[],
    isAvailable: true
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    roomId: '',
    classId: '',
    subjectId: '',
    teacherId: '',
    day: '',
    startTime: '',
    endTime: '',
    academicYear: '2024-2025'
  });

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRoom) {
      db.updateRoom(editingRoom.id, {
        ...roomFormData,
        capacity: parseInt(roomFormData.capacity)
      });
      setRooms(db.getRooms());
    } else {
      const newRoom: Room = {
        id: Date.now().toString(),
        ...roomFormData,
        capacity: parseInt(roomFormData.capacity)
      };
      db.addRoom(newRoom);
      setRooms(db.getRooms());
    }
    
    resetRoomForm();
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSchedule: RoomSchedule = {
      id: Date.now().toString(),
      ...scheduleFormData
    };
    
    db.addRoomSchedule(newSchedule);
    setSchedules(db.getRoomSchedules());
    resetScheduleForm();
  };

  const resetRoomForm = () => {
    setRoomFormData({
      name: '',
      capacity: '',
      type: 'classroom',
      equipment: [],
      isAvailable: true
    });
    setEditingRoom(null);
    setShowRoomModal(false);
  };

  const resetScheduleForm = () => {
    setScheduleFormData({
      roomId: '',
      classId: '',
      subjectId: '',
      teacherId: '',
      day: '',
      startTime: '',
      endTime: '',
      academicYear: '2024-2025'
    });
    setShowScheduleModal(false);
  };

  const handleEditRoom = (room: Room) => {
    setRoomFormData({
      name: room.name,
      capacity: room.capacity.toString(),
      type: room.type,
      equipment: room.equipment,
      isAvailable: room.isAvailable
    });
    setEditingRoom(room);
    setShowRoomModal(true);
  };

  const handleDeleteRoom = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      db.deleteRoom(id);
      setRooms(db.getRooms());
    }
  };

  const getRoomSchedule = (roomId: string, day?: string) => {
    return schedules.filter(s => {
      if (day) {
        return s.roomId === roomId && s.day === day;
      }
      return s.roomId === roomId;
    });
  };

  const getTypeLabel = (type: Room['type']) => {
    const labels = {
      classroom: 'Salle de classe',
      lab: 'Laboratoire',
      library: 'Bibliothèque',
      gym: 'Gymnase',
      office: 'Bureau'
    };
    return labels[type];
  };

  const getTypeColor = (type: Room['type']) => {
    const colors = {
      classroom: 'bg-blue-100 text-blue-800',
      lab: 'bg-purple-100 text-purple-800',
      library: 'bg-green-100 text-green-800',
      gym: 'bg-orange-100 text-orange-800',
      office: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const getDayFromDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return dayNames[date.getDay()];
  };

  const getTodaySchedules = () => {
    const today = getDayFromDate(selectedDate);
    return schedules.filter(s => s.day === today);
  };

  if (user?.role !== 'admin' && user?.role !== 'teacher') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Accès réservé aux administrateurs et enseignants</p>
      </div>
    );
  }

  if (showScheduleView) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Planning des Salles</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowScheduleView(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Retour aux salles
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Ajouter un cours</span>
              </button>
            )}
          </div>
        </div>

        {/* View Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode d'affichage</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'daily' | 'weekly')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Vue journalière</option>
              <option value="weekly">Vue hebdomadaire</option>
            </select>
          </div>
          {viewMode === 'daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Schedule Display */}
        {viewMode === 'daily' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Planning du {new Date(selectedDate).toLocaleDateString()} - {getDayFromDate(selectedDate)}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                    {rooms.map(room => (
                      <th key={room.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {room.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timeSlots.map(time => (
                    <tr key={time}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {time}
                      </td>
                      {rooms.map(room => {
                        const daySchedules = getRoomSchedule(room.id, getDayFromDate(selectedDate));
                        const currentSchedule = daySchedules.find(s => 
                          s.startTime <= time && s.endTime > time
                        );
                        
                        return (
                          <td key={room.id} className="px-6 py-4 whitespace-nowrap">
                            {currentSchedule ? (
                              <div className="bg-blue-100 p-2 rounded text-xs">
                                <div className="font-medium text-blue-900">
                                  {classes.find(c => c.id === currentSchedule.classId)?.name}
                                </div>
                                <div className="text-blue-700">
                                  {subjects.find(s => s.id === currentSchedule.subjectId)?.name}
                                </div>
                                <div className="text-blue-600">
                                  {currentSchedule.startTime} - {currentSchedule.endTime}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-xs">Libre</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Planning hebdomadaire</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salle</th>
                    {days.map(day => (
                      <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rooms.map(room => (
                    <tr key={room.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        <div>
                          <div className="font-medium">{room.name}</div>
                          <div className="text-xs text-gray-500">{getTypeLabel(room.type)}</div>
                        </div>
                      </td>
                      {days.map(day => {
                        const daySchedules = getRoomSchedule(room.id, day);
                        
                        return (
                          <td key={day} className="px-6 py-4">
                            <div className="space-y-1">
                              {daySchedules.map(schedule => {
                                const scheduleClass = classes.find(c => c.id === schedule.classId);
                                const subject = subjects.find(s => s.id === schedule.subjectId);
                                
                                return (
                                  <div key={schedule.id} className="bg-blue-100 p-2 rounded text-xs">
                                    <div className="font-medium text-blue-900">
                                      {scheduleClass?.name}
                                    </div>
                                    <div className="text-blue-700">{subject?.name}</div>
                                    <div className="text-blue-600">
                                      {schedule.startTime} - {schedule.endTime}
                                    </div>
                                  </div>
                                );
                              })}
                              {daySchedules.length === 0 && (
                                <div className="text-gray-400 text-xs">Libre</div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Salles</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowScheduleView(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2"
          >
            <Eye className="h-5 w-5" />
            <span>Voir les horaires</span>
          </button>
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>Planifier</span>
              </button>
              <button
                onClick={() => setShowRoomModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Nouvelle salle</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une salle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const roomSchedule = getRoomSchedule(room.id);
          
          return (
            <div key={room.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(room.type)}`}>
                      {getTypeLabel(room.type)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {room.isAvailable ? 'Disponible' : 'Occupée'}
                    </span>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Capacité: {room.capacity} personnes</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Équipements:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {room.equipment.map((item, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Planning cette semaine</span>
                  <span className="text-xs text-gray-500">{roomSchedule.length} créneaux</span>
                </div>
                <div className="space-y-1">
                  {roomSchedule.slice(0, 3).map((schedule) => {
                    const scheduleClass = classes.find(c => c.id === schedule.classId);
                    const subject = subjects.find(s => s.id === schedule.subjectId);
                    
                    return (
                      <div key={schedule.id} className="text-xs bg-blue-50 p-2 rounded">
                        <div className="font-medium">{schedule.day} {schedule.startTime}-{schedule.endTime}</div>
                        <div className="text-gray-600">{scheduleClass?.name} - {subject?.name}</div>
                      </div>
                    );
                  })}
                  {roomSchedule.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{roomSchedule.length - 3} autres créneaux
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingRoom ? 'Modifier la salle' : 'Nouvelle salle'}
            </h3>
            
            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de la salle</label>
                <input
                  type="text"
                  required
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({...roomFormData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={roomFormData.type}
                    onChange={(e) => setRoomFormData({...roomFormData, type: e.target.value as Room['type']})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="classroom">Salle de classe</option>
                    <option value="lab">Laboratoire</option>
                    <option value="library">Bibliothèque</option>
                    <option value="gym">Gymnase</option>
                    <option value="office">Bureau</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacité</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData({...roomFormData, capacity: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Équipements</label>
                <textarea
                  value={roomFormData.equipment.join(', ')}
                  onChange={(e) => setRoomFormData({...roomFormData, equipment: e.target.value.split(', ').filter(item => item.trim())})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Séparez les équipements par des virgules"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={roomFormData.isAvailable}
                    onChange={(e) => setRoomFormData({...roomFormData, isAvailable: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Salle disponible</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetRoomForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingRoom ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Planifier un cours</h3>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Salle</label>
                <select
                  required
                  value={scheduleFormData.roomId}
                  onChange={(e) => setScheduleFormData({...scheduleFormData, roomId: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une salle</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Classe</label>
                <select
                  required
                  value={scheduleFormData.classId}
                  onChange={(e) => setScheduleFormData({...scheduleFormData, classId: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Matière</label>
                <select
                  required
                  value={scheduleFormData.subjectId}
                  onChange={(e) => setScheduleFormData({...scheduleFormData, subjectId: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une matière</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Jour</label>
                <select
                  required
                  value={scheduleFormData.day}
                  onChange={(e) => setScheduleFormData({...scheduleFormData, day: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un jour</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heure de début</label>
                  <input
                    type="time"
                    required
                    value={scheduleFormData.startTime}
                    onChange={(e) => setScheduleFormData({...scheduleFormData, startTime: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heure de fin</label>
                  <input
                    type="time"
                    required
                    value={scheduleFormData.endTime}
                    onChange={(e) => setScheduleFormData({...scheduleFormData, endTime: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetScheduleForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Planifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;