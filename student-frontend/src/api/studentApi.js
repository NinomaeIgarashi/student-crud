/**
 * Student API Client
 * Facilitates HTTP communication between Vite frontend and Spring Boot Student API
 */

const PRODUCTION_BACKEND_URL = 'https://student-api-swv1.onrender.com';

// Critical: Base API URL routing to the Spring Boot student endpoints with dynamic resolution (localStorage override > VITE_API_URL > Render production URL > local dev proxy). If misconfigured, all CRUD requests will target invalid paths and fail with 404 or connection refused errors.
export const getApiBaseUrl = () => {
  // 1. User manual override in localStorage
  try {
    const saved = localStorage.getItem('STUDENT_API_URL');
    if (saved && saved.trim()) {
      const clean = saved.trim().startsWith('http') ? saved.trim() : `https://${saved.trim()}`;
      return `${clean.replace(/\/$/, '')}/reyes/students`;
    }
  } catch (e) {
    // Ignore localStorage access issues
  }

  // 2. Build-time environment variable (if explicitly configured)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes('localhost')) {
    const clean = envUrl.trim().startsWith('http') ? envUrl.trim() : `https://${envUrl.trim()}`;
    return `${clean.replace(/\/$/, '')}/reyes/students`;
  }

  // 3. Automatic Render Cloud Discovery: When running on onrender.com, target live backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return `${PRODUCTION_BACKEND_URL}/reyes/students`;
  }

  // 4. Default for local development (uses Vite dev server proxy to localhost:8080)
  return '/reyes/students';
};

// setApiUrl: Saves or clears an active backend API root URL in client localStorage
export const setApiUrl = (url) => {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem('STUDENT_API_URL');
    } else {
      const clean = url.trim().replace(/\/$/, '').replace(/\/reyes\/students\/?$/, '');
      localStorage.setItem('STUDENT_API_URL', clean);
    }
  } catch (e) {
    console.error('Failed to save API URL to localStorage', e);
  }
};

// getSavedApiUrl: Retrieves stored or environment backend URL for UI display
export const getSavedApiUrl = () => {
  try {
    const saved = localStorage.getItem('STUDENT_API_URL');
    if (saved) return saved;
  } catch {}

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost')) return envUrl;

  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return PRODUCTION_BACKEND_URL;
  }

  return '';
};

// Critical: Centralized HTTP response error validator. If misconfigured or bypassed, failed HTTP responses (e.g. 404, 500) will be incorrectly parsed as valid data and corrupt frontend application state.
async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP request failed with status ${response.status}`);
  }
  // DELETE endpoint returns plain text message or empty body
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
}

// studentApi: Encapsulates all RESTful CRUD network operations for student resources
export const studentApi = {
  // Critical: Retrieves all student records from the database. If misconfigured, the student table will remain empty or crash during data rendering.
  async getAll() {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(baseUrl);
    return handleResponse(response);
  },

  // Critical: Fetches a single student record by primary ID. If misconfigured, edit mode cannot pre-populate the selected student data.
  async getById(id) {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/${id}`);
    return handleResponse(response);
  },

  // Critical: Submits a new student entity via HTTP POST. If misconfigured, new student submissions will not be saved into PostgreSQL database.
  async create(studentData) {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  // Critical: Dispatches an HTTP PUT request to update an existing student record by ID. If misconfigured, user edits will either overwrite wrong records or fail silently.
  async update(id, studentData) {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  // Critical: Sends an HTTP DELETE request to remove a student record by ID. If misconfigured, student records cannot be deleted or unintended records could be removed.
  async delete(id) {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};
