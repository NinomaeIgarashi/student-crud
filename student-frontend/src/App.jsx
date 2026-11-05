import React, { useState, useEffect, useCallback, useRef } from 'react';
import { studentApi, getApiBaseUrl, getSavedApiUrl, setApiUrl } from './api/studentApi';
import { StudentForm } from './components/StudentForm';
import { StudentTable } from './components/StudentTable';
import { StatsCards } from './components/StatsCards';
import { NotificationBanner } from './components/NotificationBanner';
import { School, Database, CheckCircle2, AlertOctagon, Settings, Link2, RotateCcw } from 'lucide-react';

// App: Main root component coordinating Student CRUD application lifecycle and data flow
export function App() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [notification, setNotification] = useState(null);
  const [backendStatus, setBackendStatus] = useState('connecting');
  const [showConfig, setShowConfig] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(getSavedApiUrl());

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
      setShowConfig(true);
      showNotification(
        `Unable to reach Student API at ${getApiBaseUrl()}: ${err.message || 'Connection failed'}. You can paste your backend URL below to connect.`,
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

  // Critical: Saves custom backend URL from input and triggers immediate data reload. If misconfigured, backend host updates will not persist across browser sessions.
  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    setApiUrl(customUrlInput);
    showNotification(`API URL updated to: ${getApiBaseUrl()}`, 'info', 3000);
    loadStudents();
  };

  const handleResetApiUrl = () => {
    setApiUrl('');
    setCustomUrlInput('');
    showNotification('API URL reset to local default (/reyes/students)', 'info', 3000);
    loadStudents();
  };

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

          {/* Backend Status & API Settings Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowConfig((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                backendStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : backendStatus === 'connecting'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
              title="Click to view or edit backend connection settings"
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {backendStatus === 'connected'
                  ? 'API: Connected'
                  : backendStatus === 'connecting'
                  ? 'API: Connecting...'
                  : 'API: Disconnected (Configure)'}
              </span>
              {backendStatus === 'connected' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {backendStatus === 'error' && <AlertOctagon className="w-3.5 h-3.5" />}
              <Settings className="w-3.5 h-3.5 ml-1 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Non-Modal In-Page API Connection Settings Banner */}
        {showConfig && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 sm:p-5 shadow-sm animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-blue-200/60">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-blue-900">Backend API Connection Manager</h3>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                Active Endpoint: {getApiBaseUrl()}
              </span>
            </div>

            <form onSubmit={handleSaveApiUrl} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="e.g. https://student-api.onrender.com"
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Link2 className="w-3.5 h-3.5" /> Connect API
              </button>
              <button
                type="button"
                onClick={handleResetApiUrl}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-xl border border-slate-300 transition cursor-pointer flex items-center justify-center gap-1.5"
                title="Reset to local proxy default (/reyes/students)"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-2">
              💡 <strong>Render Deployment Tip:</strong> Copy the public URL of your <code>student-api</code> web service from the Render Dashboard and paste it here to connect directly.
            </p>
          </div>
        )}

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
          Student CRUD System &bull; Course: WMD3A &bull; Active API: <code className="font-mono text-slate-500">{getApiBaseUrl()}</code>
        </footer>
      </div>
    </div>
  );
}

export default App;
