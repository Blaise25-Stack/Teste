export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'teacher' | 'parent';
  name: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
  assignedClasses?: string[];
  childrenIds?: string[]; // For parents
  permissions?: string[]; // Custom permissions
  isActive: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  classId: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address: string;
  enrollmentDate: string;
  profilePhoto?: string;
  studentNumber: string;
  isActive: boolean;
  medicalInfo?: string;
}

export interface Class {
  id: string;
  name: string;
  level: string;
  teacherId: string;
  academicYear: string;
  subjects: string[];
  maxStudents: number;
  schedule?: ClassSchedule[];
}

export interface ClassSchedule {
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  room: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  coefficient: number;
  description?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  value: number;
  maxValue: number;
  type: 'devoir' | 'composition' | 'examen';
  date: string;
  term: 'trimestre1' | 'trimestre2' | 'trimestre3';
  teacherId: string;
  comment?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  type: 'inscription' | 'scolarite' | 'cantine' | 'transport' | 'autre';
  description: string;
  date: string;
  method: 'especes' | 'cheque' | 'virement' | 'mobile';
  status: 'pending' | 'completed' | 'cancelled';
  receiptNumber: string;
  academicYear: string;
  dueDate?: string;
  paidBy: string; // Parent name
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  position: string;
  department: string;
  education: string;
  experience: string;
  hireDate: string;
  phone: string;
  email: string;
  address: string;
  observations?: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: 'excellent' | 'bon' | 'moyen' | 'mauvais';
  location: string;
  purchaseDate?: string;
  value?: number;
  observations?: string;
  lastUpdated: string;
}

export interface ReportCard {
  studentId: string;
  classId: string;
  term: string;
  academicYear: string;
  grades: Grade[];
  average: number;
  rank: number;
  totalStudents: number;
  generatedDate: string;
  teacherComment?: string;
  directorComment?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  reason?: string;
  recordedBy: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  type: 'news' | 'event' | 'announcement';
  date: string;
  publishDate: string;
  authorId: string;
  isPublished: boolean;
  imageUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'exam' | 'holiday' | 'cultural' | 'meeting' | 'other';
  isPublic: boolean;
  createdBy: string;
  participants?: string[];
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  dueDate: string;
  attachments?: string[];
  isPublished: boolean;
  createdAt: string;
}

export interface OnlineRegistration {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  desiredClass: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: string;
  documents?: string[];
  notes?: string;
  profilePhoto?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'classroom' | 'lab' | 'library' | 'gym' | 'office';
  equipment: string[];
  isAvailable: boolean;
}

export interface RoomSchedule {
  id: string;
  roomId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  day: string;
  startTime: string;
  endTime: string;
  academicYear: string;
}

export interface SchoolVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: 'presentation' | 'activities' | 'events' | 'testimonials';
  uploadDate: string;
  uploadedBy: string;
  isPublished: boolean;
}

export interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject: string;
  message: string;
  type: 'contact' | 'account_creation' | 'general';
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
  reply?: string;
  priority: 'low' | 'medium' | 'high';
  // New fields for bidirectional messaging
  recipientId?: string; // User ID of the recipient (for replies to parents)
  parentMessageId?: string; // Reference to original message if this is a reply
  isFromAdmin?: boolean; // True if message is from admin to parent
}

export interface ParentNotification {
  id: string;
  parentId: string;
  messageId: string;
  title: string;
  content: string;
  type: 'message_reply' | 'general' | 'urgent';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}