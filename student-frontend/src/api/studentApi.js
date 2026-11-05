/**
 * Student API Client
 * Facilitates HTTP communication between Vite frontend and Spring Boot Student API
 */

// Critical: Base API URL routing to the Spring Boot student endpoints with support for production cloud URLs (VITE_API_URL). If misconfigured, all CRUD requests will target invalid paths and fail with 404 or connection refused errors.
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/reyes/students';
  const cleanBase = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
  return `${cleanBase.replace(/\/$/, '')}/reyes/students`;
};

const API_BASE_URL = getApiBaseUrl();

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
    const response = await fetch(API_BASE_URL);
    return handleResponse(response);
  },

  // Critical: Fetches a single student record by primary ID. If misconfigured, edit mode cannot pre-populate the selected student data.
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return handleResponse(response);
  },

  // Critical: Submits a new student entity via HTTP POST. If misconfigured, new student submissions will not be saved into PostgreSQL database.
  async create(studentData) {
    const response = await fetch(API_BASE_URL, {
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
    const response = await fetch(`${API_BASE_URL}/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};
