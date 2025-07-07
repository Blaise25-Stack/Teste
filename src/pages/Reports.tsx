import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/database';
import { Student, Grade, Subject, Class } from '../types';
import { FileText, Download, Eye, User } from 'lucide-react';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [students] = useState<Student[]>(db.getStudents());
  const [grades] = useState<Grade[]>(db.getGrades());
  const [subjects] = useState<Subject[]>(db.getSubjects());
  const [classes] = useState<Class[]>(db.getClasses());
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<'trimestre1' | 'trimestre2' | 'trimestre3'>('trimestre1');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showReportCard, setShowReportCard] = useState(false);

  // Filter data based on user role
  const userClasses = user?.role === 'admin' 
    ? classes 
    : classes.filter(c => user?.assignedClasses?.includes(c.id));

  const getStudentsByClass = (classId: string) => {
    return students.filter(s => s.classId === classId);
  };

  const calculateStudentReport = (student: Student, term: string) => {
    const studentGrades = grades.filter(g => 
      g.studentId === student.id && 
      g.term === term
    );

    const subjectAverages = subjects.map(subject => {
      const subjectGrades = studentGrades.filter(g => g.subjectId === subject.id);
      if (subjectGrades.length === 0) {
        return {
          subject,
          average: 0,
          grades: [],
          coefficient: subject.coefficient
        };
      }

      const totalPoints = subjectGrades.reduce((sum, g) => sum + (g.value / g.maxValue * 20), 0);
      const average = totalPoints / subjectGrades.length;

      return {
        subject,
        average: parseFloat(average.toFixed(2)),
        grades: subjectGrades,
        coefficient: subject.coefficient
      };
    });

    const totalPoints = subjectAverages.reduce((sum, sa) => sum + (sa.average * sa.coefficient), 0);
    const totalCoefficients = subjectAverages.reduce((sum, sa) => sum + sa.coefficient, 0);
    const generalAverage = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;

    // Calculate rank
    const classStudents = getStudentsByClass(student.classId);
    const classAverages = classStudents.map(s => {
      const sGrades = grades.filter(g => g.studentId === s.id && g.term === term);
      const sSubjectAverages = subjects.map(subject => {
        const sSubjectGrades = sGrades.filter(g => g.subjectId === subject.id);
        if (sSubjectGrades.length === 0) return { average: 0, coefficient: subject.coefficient };
        const sAvg = sSubjectGrades.reduce((sum, g) => sum + (g.value / g.maxValue * 20), 0) / sSubjectGrades.length;
        return { average: sAvg, coefficient: subject.coefficient };
      });
      const sTotalPoints = sSubjectAverages.reduce((sum, sa) => sum + (sa.average * sa.coefficient), 0);
      const sTotalCoeff = sSubjectAverages.reduce((sum, sa) => sum + sa.coefficient, 0);
      return sTotalCoeff > 0 ? sTotalPoints / sTotalCoeff : 0;
    }).sort((a, b) => b - a);

    const rank = classAverages.findIndex(avg => avg <= generalAverage) + 1;

    return {
      student,
      subjectAverages,
      generalAverage: parseFloat(generalAverage.toFixed(2)),
      rank,
      totalStudents: classStudents.length,
      term
    };
  };

  const generateReportCard = (student: Student) => {
    setSelectedStudent(student);
    setShowReportCard(true);
  };

  const printReportCard = () => {
    window.print();
  };

  const getAppreciation = (average: number) => {
    if (average >= 16) return { text: 'Très bien', color: 'text-green-600' };
    if (average >= 14) return { text: 'Bien', color: 'text-blue-600' };
    if (average >= 12) return { text: 'Assez bien', color: 'text-yellow-600' };
    if (average >= 10) return { text: 'Passable', color: 'text-orange-600' };
    return { text: 'Insuffisant', color: 'text-red-600' };
  };

  const reportData = selectedStudent ? calculateStudentReport(selectedStudent, selectedTerm) : null;
  const studentClass = selectedStudent ? classes.find(c => c.id === selectedStudent.classId) : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bulletins de Notes</h1>
      </div>

      {!showReportCard ? (
        <>
          {/* Filters */}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Trimestre</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="trimestre1">1er Trimestre</option>
                <option value="trimestre2">2ème Trimestre</option>
                <option value="trimestre3">3ème Trimestre</option>
              </select>
            </div>
          </div>

          {/* Students List */}
          {selectedClass && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Élèves de {classes.find(c => c.id === selectedClass)?.name}
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {getStudentsByClass(selectedClass).map((student) => {
                  const report = calculateStudentReport(student, selectedTerm);
                  const appreciation = getAppreciation(report.generalAverage);
                  
                  return (
                    <div key={student.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-4">
                          {student.profilePhoto ? (
                            <img 
                              src={student.profilePhoto} 
                              alt={`${student.firstName} ${student.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Moyenne: {report.generalAverage}/20 - 
                            Rang: {report.rank}/{report.totalStudents} - 
                            <span className={appreciation.color}>{appreciation.text}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => generateReportCard(student)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir le bulletin
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Report Card */
        <div className="bg-white">
          <div className="max-w-4xl mx-auto p-8 print:p-4">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">BULLETIN DE NOTES</h1>
              <p className="text-lg text-gray-700">Année Scolaire {studentClass?.academicYear}</p>
              <p className="text-md text-gray-600 capitalize">{selectedTerm.replace('trimestre', '')} Trimestre</p>
            </div>

            {/* Student Info with Photo */}
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de l'élève</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Nom :</span> {selectedStudent?.lastName}</p>
                  <p><span className="font-medium">Prénom :</span> {selectedStudent?.firstName}</p>
                  <p><span className="font-medium">N° Élève :</span> {selectedStudent?.studentNumber}</p>
                  <p><span className="font-medium">Classe :</span> {studentClass?.name}</p>
                  <p><span className="font-medium">Date de naissance :</span> {selectedStudent && new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo</h3>
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300">
                  {selectedStudent?.profilePhoto ? (
                    <img 
                      src={selectedStudent.profilePhoto} 
                      alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                      className="w-32 h-32 object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résultats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Moyenne générale</p>
                  <p className="text-2xl font-bold text-blue-600">{reportData?.generalAverage}/20</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Rang</p>
                  <p className="text-2xl font-bold text-green-600">{reportData?.rank}/{reportData?.totalStudents}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Appréciation</p>
                  <p className={`text-lg font-bold ${getAppreciation(reportData?.generalAverage || 0).color}`}>
                    {getAppreciation(reportData?.generalAverage || 0).text}
                  </p>
                </div>
              </div>
            </div>

            {/* Grades Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail des notes par matière</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Matière</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Coefficient</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Notes obtenues</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Moyenne</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Appréciation</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.subjectAverages.map((subjectAvg) => {
                    const appreciation = getAppreciation(subjectAvg.average);
                    return (
                      <tr key={subjectAvg.subject.id}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {subjectAvg.subject.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {subjectAvg.coefficient}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {subjectAvg.grades.map(g => `${g.value}/${g.maxValue}`).join(', ') || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                          {subjectAvg.average > 0 ? `${subjectAvg.average}/20` : '-'}
                        </td>
                        <td className={`border border-gray-300 px-4 py-2 text-center font-medium ${appreciation.color}`}>
                          {subjectAvg.average > 0 ? appreciation.text : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-300 px-4 py-2">MOYENNE GÉNÉRALE</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {reportData?.subjectAverages.reduce((sum, sa) => sum + sa.coefficient, 0)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {reportData?.generalAverage}/20
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-center ${getAppreciation(reportData?.generalAverage || 0).color}`}>
                      {getAppreciation(reportData?.generalAverage || 0).text}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <p className="font-medium mb-8">Le Directeur</p>
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm text-gray-600">Signature et cachet</p>
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium mb-8">Le Professeur Principal</p>
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm text-gray-600">Signature</p>
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium mb-8">Le Parent/Tuteur</p>
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm text-gray-600">Signature</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4 mt-8 print:hidden">
              <button
                onClick={() => setShowReportCard(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                onClick={printReportCard}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;