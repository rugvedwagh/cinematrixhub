import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fetchMovies = async () => {
    try {
      const response = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=95fb18a5`);
      const data = await response.json();
      setMovies(data.Search || []);
    } catch (error) { 
      console.error('Error fetching movies:', error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [searchTerm]);

  const handleSearch = () => {
    fetchMovies();
    setSelectedMovie(null);
  };

  const handleMovieClick = async (movie) => {
    try {
      const response = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=95fb18a5`);
      const data = await response.json();
      setSelectedMovie(data || null);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <h1>Movie App</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </nav>
      {selectedMovie ? (
        <div className="selected-movie-info">
          <img src={selectedMovie.Poster} alt={`${selectedMovie.Title} Poster`} />
          <div className='textinfo'>
            <h2>{selectedMovie.Title}</h2>
            <p>Year: {selectedMovie.Year}</p>
            <p>Runtime: {selectedMovie.Runtime}</p>
            <p>Rating: {selectedMovie.Rated}</p>
            <p>Genre: {selectedMovie.Genre}</p>
            <p>Plot: {selectedMovie.Plot}</p>
            <p>Cast: {selectedMovie.Actors}</p>
            <button className='goback' onClick={() => setSelectedMovie(null)}>Go Back</button>
          </div>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map(movie => (
            <div
              key={movie.imdbID}
              className="movie-card"
              onClick={() => handleMovieClick(movie)}
            >
              <img src={movie.Poster} alt={`${movie.Title} Poster`} />
              <h2>{movie.Title}</h2>
              <p>{movie.Year}</p>
              {/* Add other movie information as needed */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
