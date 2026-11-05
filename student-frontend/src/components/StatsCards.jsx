import React from 'react';
import { Users, GraduationCap, Layers } from 'lucide-react';

// StatsCards: Displays summary statistics derived from the student list
export function StatsCards({ students }) {
  const totalStudents = students.length;
  const uniqueCourses = new Set(students.map((s) => s.course?.trim()).filter(Boolean)).size;
  const uniqueSections = new Set(students.map((s) => s.section?.trim()).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalStudents}</p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Users className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Courses</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{uniqueCourses}</p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <GraduationCap className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Sections</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{uniqueSections}</p>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <Layers className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
