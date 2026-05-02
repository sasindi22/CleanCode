const API_BASE_URL = "http://localhost:8080";

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Registration failed. Please try again.",
    );
  }
  return response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Login failed! Please check your credentials.",
    );
  }
  return response.json();
};

export const getSnippets = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/api/snippets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch snippets");
  const data = await response.json();

  return data.map((item) => ({
    ...item,
    code: item.content || item.code,
  }));
};

export const createSnippet = async (snippetData) => {
  const token = localStorage.getItem("token");

  const payload = {
    ...snippetData,
    content: snippetData.code,
  };

  const response = await fetch(`${API_BASE_URL}/api/snippets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to create snippet");
  const data = await response.json();
  return { ...data, code: data.content };
};

export const updateSnippet = async (id, snippetData) => {
  const token = localStorage.getItem("token");

  const payload = {
    ...snippetData,
    content: snippetData.code,
  };

  const response = await fetch(`${API_BASE_URL}/api/snippets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update snippet");
  const data = await response.json();
  return { ...data, code: data.content };
};

export const deleteSnippet = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/api/snippets/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete snippet");
};

export const searchSnippets = async (language, keyword) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (language && language !== "All") params.append("language", language);
  if (keyword) params.append("keyword", keyword);

  const response = await fetch(
    `${API_BASE_URL}/api/snippets/search?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) throw new Error("Failed to search snippets");
  const data = await response.json();

  return data.map((item) => ({
    ...item,
    code: item.content || item.code,
  }));
};
