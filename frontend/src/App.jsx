import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  User,
  Clipboard,
  Check,
  Edit2,
  Trash2,
  X,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDark from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";
import {
  loginUser,
  registerUser,
  getSnippets,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  searchSnippets,
} from "./services/api";
import "./App.css";
import "./index.css";

export default function App() {
  const [snippets, setSnippets] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSnippetId, setCurrentSnippetId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newLanguage, setNewLanguage] = useState("Java");
  const [newTags, setNewTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [newCode, setNewCode] = useState("");

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const languages = ["All", "TypeScript", "Java", "SQL", "Python", "Rust"];

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        const data = await getSnippets();
        setSnippets(data);
      } catch (error) {
        console.error("Failed to load snippets:", error);
      }
    };
    fetchSnippets();
  }, []);

  const handleSearch = async (lang, query) => {
    try {
      const data = await searchSnippets(lang, query);
      setSnippets(data);
    } catch (error) {
      console.error("Failed to search snippets:", error);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    handleSearch(selectedLanguage === "All" ? "" : selectedLanguage, val);
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    setShowFilterDropdown(false);
    handleSearch(lang === "All" ? "" : lang, searchQuery);
  };

  const filteredSnippets = snippets;

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSnippet(id);
      setSnippets(snippets.filter((s) => s.id !== id));
    } catch (error) {
      alert("Error deleting snippet");
    }
  };

  const handleEdit = (id) => {
    const snippet = snippets.find((s) => s.id === id);
    if (snippet) {
      setNewTitle(snippet.title);
      setNewLanguage(snippet.language);
      setNewTags(snippet.tags || []);
      setNewCode(snippet.code);
      setCurrentSnippetId(id);
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setNewTitle("");
    setNewLanguage("Java");
    setNewTags([]);
    setNewCode("");
    setIsEditing(false);
    setCurrentSnippetId(null);
    setIsModalOpen(false);
  };

  const handleTagInput = (e) => {
    const val = e.target.value;
    if (val.endsWith(" ")) {
      const trimmed = val.trim();
      if (trimmed && !newTags.includes(`#${trimmed.replace("#", "")}`)) {
        setNewTags([...newTags, `#${trimmed.replace("#", "")}`]);
      }
      setTagInput("");
    } else {
      setTagInput(val);
    }
  };

  const removeTag = (indexToRemove) => {
    setNewTags(newTags.filter((_, i) => i !== indexToRemove));
  };

  const handleSaveSnippet = async (e) => {
    e.preventDefault();

    const snippetData = {
      title: newTitle || "Untitled Snippet",
      tags: newTags.length > 0 ? newTags : ["#untagged"],
      code: newCode || "// No code provided",
      language: newLanguage,
    };

    try {
      if (isEditing) {
        const updated = await updateSnippet(currentSnippetId, snippetData);
        setSnippets(
          snippets.map((s) => (s.id === currentSnippetId ? updated : s)),
        );
      } else {
        const created = await createSnippet(snippetData);
        setSnippets([created, ...snippets]);
      }
      closeModal();
    } catch (error) {
      alert("Error saving snippet. Please log in again if session expired.");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({
        email: loginEmail,
        password: loginPassword,
      });

      if (data && data.token) {
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        setIsLoginModalOpen(false);
        setLoginEmail("");
        setLoginPassword("");
        const snippetsData = await getSnippets();
        setSnippets(snippetsData);
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.message || "Login failed! Please check your credentials.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser({
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
      });

      if (data && data.token) {
        localStorage.setItem("token", data.token);
        alert("Registration successful! Logged in.");
        setIsRegisterModalOpen(false);
        setRegisterUsername("");
        setRegisterEmail("");
        setRegisterPassword("");
        const snippetsData = await getSnippets();
        setSnippets(snippetsData);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="app-container">
      <main className="main-dashboard">
        <header className="dashboard-header">
          <div className="header-title-section">
            <div className="title-left">
              <p>Clean Code</p>
              <h1>Snippet Library</h1>
            </div>
            <button
              className="profile-btn header-profile"
              onClick={() => setIsLoginModalOpen(true)}
              title="Profile / Login"
            >
              <User size={20} />
            </button>
          </div>

          <div className="toolbar-container">
            <div className="toolbar">
              <div className="search-group">
                <Search size={16} color="#475569" />
                <input
                  type="text"
                  placeholder="Search snippets (Ctrl+F)"
                  className="search-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <span className="search-shortcut">/ F</span>
              </div>

              <div className="filter-container">
                <button
                  className="filter-select"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <Filter size={14} />
                  {selectedLanguage === "All"
                    ? "Filter by Language"
                    : selectedLanguage}
                </button>

                {showFilterDropdown && (
                  <div className="filter-dropdown">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        className={`filter-option ${selectedLanguage === lang ? "active" : ""}`}
                        onClick={() => handleLanguageChange(lang)}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="btn-new-snippet"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={22} />
              </button>
            </div>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="snippet-grid">
            {filteredSnippets.length > 0 ? (
              filteredSnippets.map((s) => (
                <div key={s.id} className="snippet-card">
                  <div>
                    <div className="card-title-area">
                      <h3>{s.title}</h3>
                      <div className="card-actions">
                        <button
                          className="btn-action"
                          onClick={() => handleEdit(s.id)}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn-action btn-action-delete"
                          onClick={() => handleDelete(s.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="tags-row">
                      {s.tags &&
                        s.tags.map((t, index) => (
                          <span key={index} className="tag-badge">
                            {t}
                          </span>
                        ))}
                    </div>

                    <div className="card-code-block">
                      <SyntaxHighlighter
                        language={
                          s.language ? s.language.toLowerCase() : "java"
                        }
                        style={vscDark}
                        customStyle={{
                          background: "transparent",
                          padding: "0",
                          margin: "0",
                          fontSize: "0.45rem",
                          fontFamily: '"JetBrains Mono", monospace',
                          height: "100%",
                        }}
                      >
                        {s.code}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="lang-badge">
                      <div className="lang-badge-dot"></div>
                      <span>
                        Language:{" "}
                        <span className="lang-badge-name">{s.language}</span>
                      </span>
                    </div>

                    <button
                      className={`btn-copy ${copiedId === s.id ? "copied" : ""}`}
                      onClick={() => handleCopy(s.id, s.code)}
                    >
                      {copiedId === s.id ? (
                        <>
                          <Check size={14} /> Copied!
                        </>
                      ) : (
                        <>
                          <Clipboard size={14} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#64748b" }}>
                No snippets found matching your criteria.
              </p>
            )}
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Sparkles size={18} className="text-primary-accent" />
                <h2>{isEditing ? "Edit Snippet" : "Add New Snippet"}</h2>
              </div>
              <button className="btn-modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSnippet} className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="e.g. useDebounce Hook"
                  className="modal-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Language</label>
                  <select
                    className="modal-select-input"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                  >
                    {languages
                      .filter((l) => l !== "All")
                      .map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group flex-2">
                  <label>Tags (Separate with space)</label>
                  <div className="tags-input-container">
                    {newTags.map((tag, index) => (
                      <span key={index} className="tag-badge modal-tag">
                        {tag}
                        <button type="button" onClick={() => removeTag(index)}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="react hook"
                      value={tagInput}
                      onChange={handleTagInput}
                      className="tag-sub-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Code</label>
                <textarea
                  placeholder="Paste your source code here..."
                  className="modal-textarea"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-primary">
                  {isEditing ? "Update Snippet" : "Save Snippet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <UserCircle size={18} className="text-primary-accent" />
                <h2>Login</h2>
              </div>
              <button
                className="btn-modal-close"
                onClick={() => setIsLoginModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="modal-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="modal-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="modal-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <div className="modal-footer modal-footer-auth">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setIsRegisterModalOpen(true);
                  }}
                  className="btn-copy"
                >
                  Don't have an account? Register
                </button>
                <div className="modal-footer-group">
                  <button
                    type="button"
                    className="btn-modal-secondary"
                    onClick={() => setIsLoginModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-primary">
                    Login
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRegisterModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <UserCircle size={18} className="text-primary-accent" />
                <h2>Register</h2>
              </div>
              <button
                className="btn-modal-close"
                onClick={() => setIsRegisterModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="modal-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="johndoe"
                  className="modal-input"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="modal-input"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="modal-input"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>

              <div className="modal-footer modal-footer-auth">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterModalOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="btn-copy"
                >
                  Already have an account? Login
                </button>
                <div className="modal-footer-group">
                  <button
                    type="button"
                    className="btn-modal-secondary"
                    onClick={() => setIsRegisterModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-primary">
                    Register
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
