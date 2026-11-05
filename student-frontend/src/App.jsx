import React, { useState, useEffect, useCallback, useRef } from 'react';
import { studentApi } from './api/studentApi';
import { StudentForm } from './components/StudentForm';
import { StudentTable } from './components/StudentTable';
import { StatsCards } from './components/StatsCards';
import { NotificationBanner } from './components/NotificationBanner';
import { School, Database, CheckCircle2, AlertOctagon } from 'lucide-react';

// App: Main root component coordinating Student CRUD application lifecycle and data flow
export function App() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [notification, setNotification] = useState(null);
  const [backendStatus, setBackendStatus] = useState('connecting');

  const formSectionRef = useRef(null);

  // showNotification: Helper to display temporary feedback banners with auto-dismiss
  const showNotification = useCallback((message, type = 'info', durationMs = 4500) => {
    setNotification({ message, type });
    if (durationMs > 0) {
      setTimeout(() => {
        setNotification((current) => (current?.message === message ? null : current));
      }, durationMs);
    }
  }, []);

  // Critical: Fetches all student records from the Spring Boot API upon mount or reload. If misconfigured, the student data table will fail to populate or stay in an endless loading state.
  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await studentApi.getAll();
      const studentList = Array.isArray(data) ? data : [];
      setStudents(studentList);
      setBackendStatus('connected');
    } catch (err) {
      setBackendStatus('error');
      showNotification(
        `Unable to reach Student API: ${err.message || 'Make sure Spring Boot backend is running on port 8080'}.`,
        'error',
        7000
      );
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  // Initial data load on component mount
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Critical: Handles saving student entity by either dispatching HTTP POST (create) or HTTP PUT (update). If misconfigured, form submits will corrupt data or fail to persist changes to the database.
  const handleSaveStudent = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingStudent && editingStudent.id) {
        // UPDATE existing student
        const updated = await studentApi.update(editingStudent.id, formData);
        setStudents((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? { ...s, ...updated } : s))
        );
        showNotification(
          `Student "${updated.firstname} ${updated.lastname}" (ID #${editingStudent.id}) was successfully updated!`,
          'success'
        );
        setEditingStudent(null);
      } else {
        // CREATE new student
        const created = await studentApi.create(formData);
        setStudents((prev) => [...prev, created]);
        showNotification(
          `Student "${created.firstname} ${created.lastname}" successfully registered!`,
          'success'
        );
      }
    } catch (err) {
      showNotification(`Operation failed: ${err.message}`, 'error', 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Critical: Executes DELETE request to remove student entity from backend by ID. If misconfigured, UI may fall out of sync with database or remove incorrect records.
  const handleDeleteStudent = async (id) => {
    setIsDeletingId(id);
    try {
      await studentApi.delete(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (editingStudent && editingStudent.id === id) {
        setEditingStudent(null);
      }
      showNotification(`Student ID #${id} has been deleted.`, 'success');
    } catch (err) {
      showNotification(`Failed to delete student ID #${id}: ${err.message}`, 'error', 6000);
    } finally {
      setIsDeletingId(null);
    }
  };

  // handleEditSelect: Selects student for editing in the non-modal form and smoothly scrolls to the form section
  const handleEditSelect = (student) => {
    setEditingStudent(student);
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Application Header Bar */}
        <header className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-200">
              <School className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Student Management System
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                  WMD3A Fullstack
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-Stack CRUD Application • Spring Boot REST API &amp; React + Vite Frontend
              </p>
            </div>
          </div>

          {/* Backend Status Indicator */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                backendStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : backendStatus === 'connecting'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {backendStatus === 'connected'
                  ? 'API: Connected (:8080)'
                  : backendStatus === 'connecting'
                  ? 'API: Connecting...'
                  : 'API: Disconnected'}
              </span>
              {backendStatus === 'connected' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {backendStatus === 'error' && <AlertOctagon className="w-3.5 h-3.5" />}
            </div>
          </div>
        </header>

        {/* Global In-Page Non-Modal Notification Banner */}
        {notification && (
          <NotificationBanner
            notification={notification}
            onDismiss={() => setNotification(null)}
          />
        )}

        {/* Statistics Metric Cards */}
        <StatsCards students={students} />

        {/* Non-Modal Embedded Form Section */}
        <div ref={formSectionRef}>
          <StudentForm
            editingStudent={editingStudent}
            onSubmit={handleSaveStudent}
            onCancelEdit={handleCancelEdit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Searchable, Filterable Student Table */}
        <StudentTable
          students={students}
          isLoading={isLoading}
          editingStudentId={editingStudent?.id}
          onEditStudent={handleEditSelect}
          onDeleteStudent={handleDeleteStudent}
          onRefresh={loadStudents}
          isDeletingId={isDeletingId}
        />

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-slate-400">
          Student CRUD System &bull; Course: WMD3A &bull; API endpoint:{' '}
          <code className="font-mono text-slate-500">/reyes/students</code>
        </footer>
      </div>
    </div>
  );
}

export default App;
