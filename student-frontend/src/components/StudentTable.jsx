import React, { useState, useMemo } from 'react';
import { StudentRow } from './StudentRow';
import { Search, RefreshCw, Filter, ArrowUpDown, UserX } from 'lucide-react';

// StudentTable: Renders the interactive, searchable, and sortable table of students
export function StudentTable({
  students,
  isLoading,
  editingStudentId,
  onEditStudent,
  onDeleteStudent,
  onRefresh,
  isDeletingId,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [sortBy, setSortBy] = useState('id-asc');

  // Extract unique course list for filtering
  const availableCourses = useMemo(() => {
    const list = students.map((s) => s.course?.trim()).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [students]);

  // Critical: Filters and sorts the students array based on user input. If misconfigured, table rows will not match search criteria or could crash on undefined properties.
  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        const matchesSearch =
          (student.firstname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.lastname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.course || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.section || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(student.id || '').includes(searchTerm);

        const matchesCourse =
          selectedCourse === 'ALL' ||
          (student.course || '').trim().toUpperCase() === selectedCourse.toUpperCase();

        return matchesSearch && matchesCourse;
      })
      .sort((a, b) => {
        if (sortBy === 'id-asc') return (a.id || 0) - (b.id || 0);
        if (sortBy === 'id-desc') return (b.id || 0) - (a.id || 0);
        if (sortBy === 'name-asc')
          return (a.lastname || '').localeCompare(b.lastname || '');
        if (sortBy === 'name-desc')
          return (b.lastname || '').localeCompare(a.lastname || '');
        return 0;
      });
  }, [students, searchTerm, selectedCourse, sortBy]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Table Toolbar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-base">Student Records</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {filteredStudents.length} of {students.length}
          </span>
        </div>

        {/* Search, Filter, Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Course Filter */}
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="text-xs sm:text-sm py-1.5 pl-3 pr-8 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Courses</option>
              {availableCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs sm:text-sm py-1.5 pl-3 pr-8 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="id-asc">ID (Low to High)</option>
              <option value="id-desc">ID (High to Low)</option>
              <option value="name-asc">Last Name (A-Z)</option>
              <option value="name-desc">Last Name (Z-A)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-300 disabled:opacity-50"
            title="Reload from API"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">First Name</th>
              <th className="py-3 px-4">Last Name</th>
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">Section</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && students.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-sm font-medium">Loading students from database...</span>
                  </div>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserX className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No students found</p>
                    <p className="text-xs text-slate-400">
                      {searchTerm || selectedCourse !== 'ALL'
                        ? 'Try clearing your search or filter options.'
                        : 'Use the form above to register your first student.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  isEditing={editingStudentId === student.id}
                  onEdit={onEditStudent}
                  onDelete={onDeleteStudent}
                  isDeleting={isDeletingId === student.id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
