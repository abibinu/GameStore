import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar, 
  X, 
  RefreshCw,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { 
  getGames, 
  getGenres, 
  getGame, 
  createGame, 
  updateGame, 
  deleteGame 
} from './client';

export default function App() {
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGameId, setEditingGameId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    genreId: '',
    price: '',
    releaseDate: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gamesData, genresData] = await Promise.all([getGames(), getGenres()]);
      setGames(gamesData);
      setGenres(genresData);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Please verify the ASP.NET Core API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteGame(id);
        setGames(games.filter(g => g.id !== id));
      } catch (err) {
        alert('Failed to delete the game. Please try again.');
      }
    }
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingGameId(null);
    setFormData({
      name: '',
      genreId: genres.length > 0 ? genres[0].id : '',
      price: '',
      releaseDate: new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = async (id) => {
    setEditingGameId(id);
    setFormErrors({});
    try {
      const game = await getGame(id);
      setFormData({
        name: game.name,
        genreId: game.genreId,
        price: game.price.toString(),
        releaseDate: game.releaseDate
      });
      setIsModalOpen(true);
    } catch (err) {
      alert('Failed to load game details.');
    }
  };

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for that field when user types
    if (formErrors[name] || formErrors[name === 'genreId' ? 'GenreId' : name.charAt(0).toUpperCase() + name.slice(1)]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null,
        [name === 'genreId' ? 'GenreId' : name.charAt(0).toUpperCase() + name.slice(1)]: null
      }));
    }
  };

  // Form Client Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
    }

    if (!formData.genreId) {
      errors.genreId = 'Genre is required';
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum)) {
      errors.price = 'Price must be a number';
    } else if (priceNum < 1 || priceNum > 500) {
      errors.price = 'Price must be between $1.00 and $500.00';
    }

    if (!formData.releaseDate) {
      errors.releaseDate = 'Release date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      genreId: parseInt(formData.genreId),
      price: parseFloat(formData.price),
      releaseDate: formData.releaseDate
    };

    try {
      if (editingGameId) {
        await updateGame(editingGameId, payload);
      } else {
        await createGame(payload);
      }
      setIsModalOpen(false);
      // Reload game list to reflect changes
      await loadData();
    } catch (err) {
      console.error('API Error:', err);
      if (err.errors) {
        // Map backend validation errors (e.g. Name, GenreId, Price) to our error state
        setFormErrors(err.errors);
      } else {
        alert(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filter games based on search & category
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === '' || game.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  // Calculate statistics
  const totalGamesCount = games.length;
  const avgPrice = games.length > 0 
    ? (games.reduce((sum, g) => sum + g.price, 0) / games.length).toFixed(2)
    : '0.00';

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Gamepad2 size={26} color="#070913" strokeWidth={2.5} />
          </div>
          <span className="logo-text">GameVault</span>
        </div>

        <div className="stats-container">
          <div className="stat-pill">
            <TrendingUp size={16} color="#00f2fe" />
            <span>Total: <strong className="stat-value">{totalGamesCount}</strong></span>
          </div>
          <div className="stat-pill">
            <DollarSign size={16} color="#fbbf24" />
            <span>Avg Price: <strong className="stat-value">${avgPrice}</strong></span>
          </div>
          <button onClick={loadData} className="btn btn-secondary btn-icon-only" title="Refresh Database">
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* Main error alert */}
      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid var(--color-danger)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem',
          color: '#fda4af',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button onClick={loadData} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Retry Connection
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="action-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search games by title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <select 
          value={selectedGenre} 
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="select-filter"
        >
          <option value="">All Genres</option>
          {genres.map(genre => (
            <option key={genre.id} value={genre.name}>{genre.name}</option>
          ))}
        </select>

        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          <Plus size={18} />
          Add Game
        </button>
      </div>

      {/* Games Display */}
      {loading ? (
        <div className="games-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-card">
              <div className="shimmer"></div>
              <div className="skeleton-badge"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-footer">
                <div className="skeleton-price"></div>
                <div className="skeleton-date"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Gamepad2 size={32} />
          </div>
          <h3 className="empty-state-title">No Games Found</h3>
          <p className="empty-state-text">
            {searchQuery || selectedGenre 
              ? 'No games match your search filters. Try adjusting your query or category selection.'
              : 'The store catalog is currently empty. Click "Add Game" to get started!'}
          </p>
          {(searchQuery || selectedGenre) && (
            <button 
              onClick={() => { setSearchQuery(''); setSelectedGenre(''); }} 
              className="btn btn-secondary"
              style={{ marginTop: '0.5rem' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <main className="games-grid">
          {filteredGames.map(game => (
            <article key={game.id} className="game-card">
              <div>
                <span className="game-genre-badge">{game.genre}</span>
                <h2 className="game-title">{game.name}</h2>
              </div>
              
              <div>
                <div className="game-meta">
                  <span className="game-price">${game.price.toFixed(2)}</span>
                  <span className="game-date">
                    <Calendar size={13} />
                    {game.releaseDate}
                  </span>
                </div>
                
                <div className="card-actions">
                  <button 
                    onClick={() => handleOpenEditModal(game.id)} 
                    className="btn btn-secondary btn-icon-only" 
                    title="Edit Game"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(game.id)} 
                    className="btn btn-danger btn-icon-only" 
                    title="Delete Game"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </main>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingGameId ? 'Edit Game Information' : 'Add New Game'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Name */}
                <div className="form-group">
                  <label className="form-label">Game Title</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    className={`form-control ${
                      (formErrors.name || formErrors.Name) ? 'is-invalid' : ''
                    }`}
                    placeholder="e.g. Elden Ring"
                    autoFocus
                  />
                  {(formErrors.name || formErrors.Name) && (
                    <span className="invalid-feedback">
                      {formErrors.name || formErrors.Name[0]}
                    </span>
                  )}
                </div>

                {/* Genre */}
                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <select 
                    name="genreId" 
                    value={formData.genreId} 
                    onChange={handleInputChange}
                    className={`form-control ${
                      (formErrors.genreId || formErrors.GenreId) ? 'is-invalid' : ''
                    }`}
                  >
                    {genres.map(genre => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                  </select>
                  {(formErrors.genreId || formErrors.GenreId) && (
                    <span className="invalid-feedback">
                      {formErrors.genreId || formErrors.GenreId[0]}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="form-group">
                  <label className="form-label">Price (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange}
                    className={`form-control ${
                      (formErrors.price || formErrors.Price) ? 'is-invalid' : ''
                    }`}
                    placeholder="e.g. 59.99"
                  />
                  {(formErrors.price || formErrors.Price) && (
                    <span className="invalid-feedback">
                      {formErrors.price || formErrors.Price[0]}
                    </span>
                  )}
                </div>

                {/* Release Date */}
                <div className="form-group">
                  <label className="form-label">Release Date</label>
                  <input 
                    type="date" 
                    name="releaseDate" 
                    value={formData.releaseDate} 
                    onChange={handleInputChange}
                    className={`form-control ${
                      (formErrors.releaseDate || formErrors.ReleaseDate) ? 'is-invalid' : ''
                    }`}
                  />
                  {(formErrors.releaseDate || formErrors.ReleaseDate) && (
                    <span className="invalid-feedback">
                      {formErrors.releaseDate || formErrors.ReleaseDate[0]}
                    </span>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
