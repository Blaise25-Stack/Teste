import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/database';
import { Attendance, Student, Class } from '../types';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>(db.getAttendance());
  const [students] = useState<Student[]>(db.getStudents());
  const [classes] = useState<Class[]>(db.getClasses());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Filter data based on user role
  const userClasses = user?.role === 'admin' 
    ? classes 
    : classes.filter(c => user?.assignedClasses?.includes(c.id));

  const getStudentsByClass = (classId: string) => {
    return students.filter(s => s.classId === classId);
  };

  const getAttendanceForDate = (studentId: string, date: string) => {
    return attendance.find(a => a.studentId === studentId && a.date === date);
  };

  const markAttendance = (studentId: string, status: Attendance['status'], reason?: string) => {
    const existingAttendance = getAttendanceForDate(studentId, selectedDate);
    
    if (existingAttendance) {
      db.updateAttendance(existingAttendance.id, { status, reason });
    } else {
      const newAttendance: Attendance = {
        id: Date.now().toString(),
        studentId,
        classId: selectedClass,
        date: selectedDate,
        status,
        reason,
        recordedBy: user?.id || ''
      };
      db.addAttendance(newAttendance);
    }
    
    setAttendance(db.getAttendance());
  };

  const getAttendanceStats = (studentId: string, period: 'week' | 'month') => {
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const studentAttendance = attendance.filter(a => 
      a.studentId === studentId && 
      new Date(a.date) >= startDate && 
      new Date(a.date) <= now
    );

    const total = studentAttendance.length;
    const present = studentAttendance.filter(a => a.status === 'present').length;
    const absent = studentAttendance.filter(a => a.status === 'absent').length;
    const late = studentAttendance.filter(a => a.status === 'late').length;
    const excused = studentAttendance.filter(a => a.status === 'excused').length;

    return { total, present, absent, late, excused };
  };

  const getStatusColor = (status: Attendance['status']) => {
    const colors = {
      present: 'text-green-600',
      absent: 'text-red-600',
      late: 'text-yellow-600',
      excused: 'text-blue-600'
    };
    return colors[status];
  };

  const getStatusIcon = (status: Attendance['status']) => {
    const icons = {
      present: CheckCircle,
      absent: XCircle,
      late: Clock,
      excused: AlertCircle
    };
    return icons[status];
  };

  const classStudents = selectedClass ? getStudentsByClass(selectedClass) : [];

  // Parent view - show only their children's attendance
  if (user?.role === 'parent') {
    const childrenAttendance = students
      .filter(s => user.childrenIds?.includes(s.id))
      .map(student => {
        const weekStats = getAttendanceStats(student.id, 'week');
        const monthStats = getAttendanceStats(student.id, 'month');
        return { student, weekStats, monthStats };
      });

    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Présences de mes enfants</h1>
        
        <div className="space-y-6">
          {childrenAttendance.map(({ student, weekStats, monthStats }) => (
            <div key={student.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-4">
                  {student.profilePhoto ? (
                    <img 
                      src={student.profilePhoto} 
                      alt={`${student.firstName} ${student.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {classes.find(c => c.id === student.classId)?.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Cette semaine</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Présent :</span>
                      <span className="font-medium text-green-600">{weekStats.present}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Absent :</span>
                      <span className="font-medium text-red-600">{weekStats.absent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>En retard :</span>
                      <span className="font-medium text-yellow-600">{weekStats.late}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Ce mois</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Présent :</span>
                      <span className="font-medium text-green-600">{monthStats.present}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Absent :</span>
                      <span className="font-medium text-red-600">{monthStats.absent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux de présence :</span>
                      <span className="font-medium text-blue-600">
                        {monthStats.total > 0 ? Math.round((monthStats.present / monthStats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Présences</h1>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner une classe</option>
            {userClasses.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Attendance List */}
      {selectedClass && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Présences du {new Date(selectedDate).toLocaleDateString()} - {classes.find(c => c.id === selectedClass)?.name}
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {classStudents.map((student) => {
              const studentAttendance = getAttendanceForDate(student.id, selectedDate);
              const weekStats = getAttendanceStats(student.id, 'week');
              
              return (
                <div key={student.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-4">
                        {student.profilePhoto ? (
                          <img 
                            src={student.profilePhoto} 
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Présent {weekStats.present}/{weekStats.total} cette semaine
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {studentAttendance && (
                        <div className="flex items-center mr-4">
                          {(() => {
                            const StatusIcon = getStatusIcon(studentAttendance.status);
                            return (
                              <StatusIcon className={`h-5 w-5 mr-2 ${getStatusColor(studentAttendance.status)}`} />
                            );
                          })()}
                          <span className={`text-sm font-medium ${getStatusColor(studentAttendance.status)}`}>
                            {studentAttendance.status === 'present' ? 'Présent' :
                             studentAttendance.status === 'absent' ? 'Absent' :
                             studentAttendance.status === 'late' ? 'En retard' : 'Excusé'}
                          </span>
                        </div>
                      )}

                      <div className="flex space-x-1">
                        <button
                          onClick={() => markAttendance(student.id, 'present')}
                          className={`px-3 py-1 text-xs rounded-full ${
                            studentAttendance?.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                          }`}
                        >
                          Présent
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'absent')}
                          className={`px-3 py-1 text-xs rounded-full ${
                            studentAttendance?.status === 'absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'late')}
                          className={`px-3 py-1 text-xs rounded-full ${
                            studentAttendance?.status === 'late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                          }`}
                        >
                          Retard
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'excused')}
                          className={`px-3 py-1 text-xs rounded-full ${
                            studentAttendance?.status === 'excused'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                          }`}
                        >
                          Excusé
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;