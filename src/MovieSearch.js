// MovieSearch.js

import React, { useEffect, useState } from 'react';
import { Card, Typography, CardMedia } from '@material-ui/core/';
import axios from 'axios';
import './App.css';

const MovieSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `https://www.omdbapi.com/?apikey=98e6a5e9&s=${searchQuery}`
      );
      setMovies(response.data.Search || []);
    } catch (error) {
      console.error('Error fetching data from OMDB API:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search movies..."
      />
      <button onClick={handleSearch}>Search</button>

      <ul>
        {movies.map((movie) => (
          <Card
            raised
            elevation={6}
            // style={{ borderRadius: '10px', width: '300px', height: '450px', backgroundColor: '#f3eff1', margin: '10px 0' }}
            key={movie.imdbID}
          >
            <CardMedia
              className="media"
              component="img"
              image={movie.Poster}
              alt={movie.Title}
            />
            <Typography variant="h5" gutterBottom>
              {movie.Title}
            </Typography>
          </Card>
        ))}
      </ul>
    </div>
  );
};

export default MovieSearch;
