import React, { useState } from 'react';
import { Pencil, Trash2, Check, X, AlertTriangle } from 'lucide-react';

// StudentRow: Non-modal table row component rendering student attributes and inline CRUD actions
export function StudentRow({ student, isEditing, onEdit, onDelete, isDeleting }) {
  const [showInlineDeleteConfirm, setShowInlineDeleteConfirm] = useState(false);

  // Critical: Triggers inline deletion confirmation for this student ID without a popup modal. If misconfigured, records may be deleted immediately without user consent.
  const handleConfirmDelete = () => {
    onDelete(student.id);
    setShowInlineDeleteConfirm(false);
  };

  return (
    <tr
      className={`border-b border-slate-100 transition-colors ${
        isEditing
          ? 'bg-amber-50/70 border-amber-200'
          : 'hover:bg-slate-50/80 bg-white'
      }`}
    >
      {/* Student ID */}
      <td className="py-3.5 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          #{student.id}
        </span>
      </td>

      {/* First Name */}
      <td className="py-3.5 px-4 text-sm font-medium text-slate-900 whitespace-nowrap">
        {student.firstname}
      </td>

      {/* Last Name */}
      <td className="py-3.5 px-4 text-sm font-medium text-slate-900 whitespace-nowrap">
        {student.lastname}
      </td>

      {/* Course Badge */}
      <td className="py-3.5 px-4 text-sm whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {student.course}
        </span>
      </td>

      {/* Section Badge */}
      <td className="py-3.5 px-4 text-sm whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {student.section}
        </span>
      </td>

      {/* Actions (Non-modal inline Edit and Delete) */}
      <td className="py-3.5 px-4 text-sm text-right whitespace-nowrap">
        {showInlineDeleteConfirm ? (
          // Inline Non-Modal Delete Confirmation Box
          <div className="inline-flex items-center gap-2 p-1 bg-rose-50 border border-rose-200 rounded-lg animate-fadeIn">
            <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Confirm delete?
            </span>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-2 py-0.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Confirm Delete"
            >
              <Check className="w-3.5 h-3.5" /> Yes
            </button>
            <button
              onClick={() => setShowInlineDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-2 py-0.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded transition flex items-center gap-1 cursor-pointer"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" /> No
            </button>
          </div>
        ) : (
          // Standard Action Buttons
          <div className="inline-flex items-center gap-1.5">
            <button
              onClick={() => onEdit(student)}
              className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                isEditing
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title="Edit student in form above"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              onClick={() => setShowInlineDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
              title="Delete student"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
