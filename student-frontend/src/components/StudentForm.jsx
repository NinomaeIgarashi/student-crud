import React, { useState, useEffect } from 'react';
import { UserPlus, Save, XCircle, RotateCcw } from 'lucide-react';

// StudentForm: Non-modal embedded form component handling both creation and update operations for students
export function StudentForm({ editingStudent, onSubmit, onCancelEdit, isSubmitting }) {
  const initialFormState = {
    firstname: '',
    lastname: '',
    course: '',
    section: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Sync form inputs when an existing student is selected for edit
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        firstname: editingStudent.firstname || '',
        lastname: editingStudent.lastname || '',
        course: editingStudent.course || '',
        section: editingStudent.section || '',
      });
      setFormErrors({});
    } else {
      setFormData(initialFormState);
    }
  }, [editingStudent]);

  // Critical: Form field input change handler that synchronizes state with controlled inputs. If misconfigured, user input keystrokes will be blocked or drop letters.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for the field being modified
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Critical: Validates required student fields before submitting payload to backend API. If misconfigured, invalid or null values could be posted, leading to 400/500 database errors.
  const validateForm = () => {
    const errors = {};
    if (!formData.firstname.trim()) errors.firstname = 'First name is required.';
    if (!formData.lastname.trim()) errors.lastname = 'Last name is required.';
    if (!formData.course.trim()) errors.course = 'Course is required.';
    if (!formData.section.trim()) errors.section = 'Section is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // handleSubmit: Validates user input and delegates validated student data payload to parent submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      course: formData.course.trim().toUpperCase(),
      section: formData.section.trim().toUpperCase(),
    };

    onSubmit(payload);
  };

  const handleReset = () => {
    if (editingStudent) {
      onCancelEdit();
    } else {
      setFormData(initialFormState);
      setFormErrors({});
    }
  };

  const isEditMode = Boolean(editingStudent && editingStudent.id);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8 transition-all">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isEditMode ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {isEditMode ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditMode ? `Edit Student (ID: ${editingStudent.id})` : 'Register New Student'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditMode
                ? 'Update student information and save changes directly to database.'
                : 'Fill in the required information to add a student to the system.'}
            </p>
          </div>
        </div>

        {isEditMode && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Editing Mode
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* First Name Field */}
          <div>
            <label htmlFor="firstname" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="e.g. John"
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                formErrors.firstname
                  ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-400 focus:border-rose-400'
                  : 'border-slate-300 bg-white focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {formErrors.firstname && (
              <p className="text-xs text-rose-500 mt-1">{formErrors.firstname}</p>
            )}
          </div>

          {/* Last Name Field */}
          <div>
            <label htmlFor="lastname" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Last Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="e.g. Doe"
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                formErrors.lastname
                  ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-400 focus:border-rose-400'
                  : 'border-slate-300 bg-white focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {formErrors.lastname && (
              <p className="text-xs text-rose-500 mt-1">{formErrors.lastname}</p>
            )}
          </div>

          {/* Course Field */}
          <div>
            <label htmlFor="course" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Course <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g. BSIT, BSCS"
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                formErrors.course
                  ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-400 focus:border-rose-400'
                  : 'border-slate-300 bg-white focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {formErrors.course && (
              <p className="text-xs text-rose-500 mt-1">{formErrors.course}</p>
            )}
          </div>

          {/* Section Field */}
          <div>
            <label htmlFor="section" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Section <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              placeholder="e.g. 3A, 3B"
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                formErrors.section
                  ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-400 focus:border-rose-400'
                  : 'border-slate-300 bg-white focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {formErrors.section && (
              <p className="text-xs text-rose-500 mt-1">{formErrors.section}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isEditMode ? (
              <>
                <XCircle className="w-4 h-4" /> Cancel Edit
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" /> Clear Form
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-5 py-2 text-sm font-semibold rounded-xl text-white transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm ${
              isEditMode
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:ring-amber-200'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : isEditMode ? (
              <>
                <Save className="w-4 h-4" /> Update Student
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Add Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
