import { useState, useEffect } from "react"
import "./index.css"
import "./App.css"

function App() {
  const [movies, setMovies] = useState([])
  const [yearMovies, setYearMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [castDetails, setCastDetails] = useState([])
  const [directorMovies, setDirectorMovies] = useState([])
  const [actorMovies, setActorMovies] = useState([])
  const [showDirectorMovies, setShowDirectorMovies] = useState(false)
  const [showActorMovies, setShowActorMovies] = useState(false)
  const [selectedActor, setSelectedActor] = useState("")
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [randomYearsAgo, setRandomYearsAgo] = useState(null)
  const [randomYear, setRandomYear] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating: '',
    runtime: ''
  })

  // Function to generate random search keywords
  const getRandomKeyword = () => {
    const keywords = [
      "action", "drama", "comedy", "thriller", "adventure", "fantasy", 
      "horror", "romance", "mystery", "sci-fi", "crime", "family", 
      "animation", "war", "western", "documentary", "musical", "sport",
      "superhero", "zombie", "vampire", "alien", "space", "time",
      "love", "death", "revenge", "hero", "detective", "gangster",
      "police", "school", "hospital", "prison", "island", "journey",
      "magic", "dragon", "robot", "future", "past", "secret",
      "treasure", "escape", "survival", "mission", "heist", "chase"
    ]
    return keywords[Math.floor(Math.random() * keywords.length)]
  }

  const [searchTerm, setSearchTerm] = useState(getRandomKeyword())

  // Function to get streaming platforms (mock data since OMDb doesn't provide this)
  const getStreamingPlatforms = (movie) => {
    const platforms = ['Netflix', 'Amazon Prime', 'Disney+', 'HBO Max', 'Hulu', 'Apple TV+']
    const availableOn = platforms.filter(() => Math.random() > 0.6) // Random availability
    return availableOn.length > 0 ? availableOn : ['Not available on major platforms']
  }

  // Function to get actor photo (using a placeholder API)
  const getActorPhoto = (actorName) => {
    // Using Lorem Picsum for placeholder actor photos
    const hash = actorName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return `https://picsum.photos/150/200?random=${Math.abs(hash)}`
  }

  // Function to filter movies with valid posters
  const filterMoviesWithPosters = (movieList) => {
    return movieList.filter(movie => 
      movie.Poster && 
      movie.Poster !== "N/A" && 
      movie.Poster.trim() !== ""
    )
  }

  // Function to apply filters to movies
  const applyFilters = (movieList) => {
    return movieList.filter(movie => {
      if (filters.genre && !movie.Genre?.toLowerCase().includes(filters.genre.toLowerCase())) {
        return false
      }
      if (filters.year && movie.Year !== filters.year) {
        return false
      }
      if (filters.rating && parseFloat(movie.imdbRating) < parseFloat(filters.rating)) {
        return false
      }
      if (filters.runtime) {
        const runtime = parseInt(movie.Runtime?.replace(' min', '')) || 0
        if (filters.runtime === 'short' && runtime > 90) return false
        if (filters.runtime === 'medium' && (runtime <= 90 || runtime > 150)) return false
        if (filters.runtime === 'long' && runtime <= 150) return false
      }
      return true
    })
  }

  // Function to generate random years ago and calculate the year
  const generateRandomYearsAgo = () => {
    const currentYear = new Date().getFullYear()
    const yearsAgo = Math.floor(Math.random() * (currentYear - 1970 + 1))
    const calculatedYear = currentYear - yearsAgo
    return { yearsAgo, calculatedYear }
  }

  const fetchMovies = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=95fb18a5`)
      const data = await response.json()
      
      let filteredMovies = filterMoviesWithPosters(data.Search || [])
      
      // Apply filters if any are set
      if (filters.genre || filters.year || filters.rating || filters.runtime) {
        // Fetch detailed info for filtering
        const detailedMovies = await Promise.all(
          filteredMovies.slice(0, 10).map(async (movie) => {
            const detailResponse = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=95fb18a5`)
            const detailData = await detailResponse.json()
            return { ...movie, ...detailData }
          })
        )
        filteredMovies = applyFilters(detailedMovies)
      }
      
      setMovies(filteredMovies)

      const { yearsAgo, calculatedYear } = generateRandomYearsAgo()
      setRandomYearsAgo(yearsAgo)
      setRandomYear(calculatedYear)

      const popularSearchTerms = [
        'batman', 'superman', 'star', 'love', 'war', 'man', 'the', 'king', 
        'life', 'death', 'american', 'big', 'last', 'first', 'good', 'bad'
      ]
      
      let yearMoviesWithPosters = []
      
      for (const term of popularSearchTerms) {
        if (yearMoviesWithPosters.length >= 15) break
        
        const yearResponse = await fetch(`https://www.omdbapi.com/?s=${term}&y=${calculatedYear}&apikey=95fb18a5`)
        const yearData = await yearResponse.json()
        
        if (yearData.Search) {
          const filteredYearMovies = filterMoviesWithPosters(yearData.Search)
          yearMoviesWithPosters = [...yearMoviesWithPosters, ...filteredYearMovies]
        }
      }
      
      const uniqueYearMovies = yearMoviesWithPosters.filter((movie, index, self) =>
        index === self.findIndex(m => m.imdbID === movie.imdbID)
      )
      
      setYearMovies(uniqueYearMovies)
      
    } catch (error) {
      console.error("Error fetching movies:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch movies by director
  const fetchDirectorMovies = async (director) => {
    try {
      setLoading(true)
      const response = await fetch(`https://www.omdbapi.com/?s=${director}&apikey=95fb18a5`)
      const data = await response.json()
      const filteredMovies = filterMoviesWithPosters(data.Search || [])
      setDirectorMovies(filteredMovies.slice(0, 6))
      setShowDirectorMovies(true)
    } catch (error) {
      console.error("Error fetching director movies:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch movies by actor
  const fetchActorMovies = async (actor) => {
    try {
      setLoading(true)
      const response = await fetch(`https://www.omdbapi.com/?s=${actor}&apikey=95fb18a5`)
      const data = await response.json()
      const filteredMovies = filterMoviesWithPosters(data.Search || [])
      setActorMovies(filteredMovies.slice(0, 6))
      setSelectedActor(actor)
      setShowActorMovies(true)
    } catch (error) {
      console.error("Error fetching actor movies:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchMovies()
  }, [searchTerm])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [selectedMovie, loading])

  // Process cast when movie is selected
  useEffect(() => {
    if (selectedMovie && selectedMovie.Actors) {
      const actors = selectedMovie.Actors.split(', ').slice(0, 4) // Show top 4 actors
      const castWithPhotos = actors.map(actor => ({
        name: actor,
        photo: getActorPhoto(actor)
      }))
      setCastDetails(castWithPhotos)
    }
  }, [selectedMovie])

  const handleSearch = () => {
    setSearchTerm(getRandomKeyword())
    setSelectedMovie(null)
    setShowDirectorMovies(false)
    setShowActorMovies(false)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const applyFiltersAndSearch = () => {
    fetchMovies()
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({ genre: '', year: '', rating: '', runtime: '' })
    fetchMovies()
  }

  const handleImageClick = () => {
    setIsFullScreen(!isFullScreen)
  }

  const handleMovieClick = async (movie) => {
    try {
      setLoading(true)
      const response = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=95fb18a5`)
      const data = await response.json()
      setSelectedMovie(data || null)
      setShowDirectorMovies(false)
      setShowActorMovies(false)
    } catch (error) {
      console.error("Error fetching movie details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    setSelectedMovie(null)
    setCastDetails([])
    setShowDirectorMovies(false)
    setShowActorMovies(false)
  }

  const streamingPlatforms = selectedMovie ? getStreamingPlatforms(selectedMovie) : []

  return (
    <div className="app">
      <nav className="navbar">
        <h1>cinematrix</h1>
        <div className="search-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch}>Random Search</button>
            <button 
              className="filter-btn" 
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </button>
          </div>
        </div>
      </nav>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Genre:</label>
            <select 
              value={filters.genre} 
              onChange={(e) => handleFilterChange('genre', e.target.value)}
            >
              <option value="">All Genres</option>
              <option value="action">Action</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="horror">Horror</option>
              <option value="romance">Romance</option>
              <option value="thriller">Thriller</option>
              <option value="sci-fi">Sci-Fi</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Year:</label>
            <select 
              value={filters.year} 
              onChange={(e) => handleFilterChange('year', e.target.value)}
            >
              <option value="">Any Year</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Min Rating:</label>
            <select 
              value={filters.rating} 
              onChange={(e) => handleFilterChange('rating', e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="7">7+ IMDb</option>
              <option value="8">8+ IMDb</option>
              <option value="9">9+ IMDb</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Runtime:</label>
            <select 
              value={filters.runtime} 
              onChange={(e) => handleFilterChange('runtime', e.target.value)}
            >
              <option value="">Any Length</option>
              <option value="short">Short (≤90 min)</option>
              <option value="medium">Medium (90-150 min)</option>
              <option value="long">Long (150+ min)</option>
            </select>
          </div>

          <div className="filter-actions">
            <button onClick={applyFiltersAndSearch}>Apply Filters</button>
            <button onClick={clearFilters}>Clear All</button>
          </div>
        </div>
      )}

      {loading && (
        <div className="tetrominos">
          <div className="tetromino box1"></div>
          <div className="tetromino box2"></div>
          <div className="tetromino box3"></div>
          <div className="tetromino box4"></div>
        </div>
      )}

      {!loading && selectedMovie ? (
        <div className="selected-movie-info">
          <img
            className={`imag ${isFullScreen ? "fullscreen" : ""}`}
            src={selectedMovie.Poster}
            alt={`${selectedMovie.Title} Poster`}
            onClick={handleImageClick}
          />
          <div className="textinfo">
            <h1>{selectedMovie.Title}</h1>
            <p>IMDB: &nbsp;{selectedMovie.imdbRating}⭐</p>
            <p>Year: &nbsp;{selectedMovie.Year}</p>
            <p>
              Director: &nbsp;
              <span 
                className="clickable-link" 
                onClick={() => fetchDirectorMovies(selectedMovie.Director)}
              >
                {selectedMovie.Director}
              </span>
            </p>
            <p>Rating: &nbsp;{selectedMovie.Rated}</p>
            <p>Cast: &nbsp;{selectedMovie.Actors}</p>
            <p>Runtime: &nbsp;{selectedMovie.Runtime}</p>
            <p>Released: &nbsp;{selectedMovie.Released}</p>
            <p>Genre: &nbsp;{selectedMovie.Genre}</p>
            <p>Plot: &nbsp;{selectedMovie.Plot}</p>
            <p>Awards: &nbsp;{selectedMovie.Awards}</p>

            {/* Streaming Platforms */}
            <div className="streaming-section">
              <h3>Available On:</h3>
              <div className="streaming-platforms">
                {streamingPlatforms.map((platform, index) => (
                  <span key={index} className="platform-tag">{platform}</span>
                ))}
              </div>
            </div>

            {/* Cast Photos */}
            {castDetails.length > 0 && (
              <div className="cast-section">
                <h3>Cast:</h3>
                <div className="cast-grid">
                  {castDetails.map((actor, index) => (
                    <div key={index} className="cast-member">
                      <img 
                        src={actor.photo} 
                        alt={actor.name}
                        className="cast-photo"
                        onClick={() => fetchActorMovies(actor.name)}
                      />
                      <p 
                        className="cast-name clickable-link"
                        onClick={() => fetchActorMovies(actor.name)}
                      >
                        {actor.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="goback" onClick={handleGoBack}>
              Go Back
            </button>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="movies-container">
            {/* Director Movies Section */}
            {showDirectorMovies && (
              <div className="director-section">
                <h2>More movies by {selectedMovie?.Director}</h2>
                <div className="movies-grid">
                  {directorMovies.map((movie) => (
                    <div key={movie.imdbID} className="movie-card" onClick={() => handleMovieClick(movie)}>
                      <img src={movie.Poster} alt={`${movie.Title} Poster`} />
                      <h2>{movie.Title}</h2>
                      <p>{movie.Year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actor Movies Section */}
            {showActorMovies && (
              <div className="actor-section">
                <h2>More movies with {selectedActor}</h2>
                <div className="movies-grid">
                  {actorMovies.map((movie) => (
                    <div key={movie.imdbID} className="movie-card" onClick={() => handleMovieClick(movie)}>
                      <img src={movie.Poster} alt={`${movie.Title} Poster`} />
                      <h2>{movie.Title}</h2>
                      <p>{movie.Year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Movies Grid */}
            {!showDirectorMovies && !showActorMovies && (
              <>
                <div className="movies-grid">
                  {movies.slice(0, 8).map((movie) => (
                    <div key={movie.imdbID} className="movie-card" onClick={() => handleMovieClick(movie)}>
                      <img src={movie.Poster} alt={`${movie.Title} Poster`} />
                      <h2>{movie.Title}</h2>
                      <p>{movie.Year}</p>
                    </div>
                  ))}
                </div>

                {randomYearsAgo !== null && randomYear && (
                  <div className="year-divider">
                    <p>Movies released {randomYearsAgo} years ago</p>
                  </div>
                )}

                {yearMovies.length > 0 && (
                  <div className="movies-grid">
                    {yearMovies.slice(0, 10).map((movie) => (
                      <div key={movie.imdbID} className="movie-card" onClick={() => handleMovieClick(movie)}>
                        <img src={movie.Poster} alt={`${movie.Title} Poster`} />
                        <h2>{movie.Title}</h2>
                        <p>{movie.Year}</p>
                      </div>
                    ))}
                  </div>
                )}

                {yearMovies.length === 0 && randomYearsAgo !== null && (
                  <div className="no-movies-message">
                    <p>No movies with posters found from {randomYear}. Try searching again!</p>
                  </div>
                )}
              </>
            )}
          </div>
        )
      )}

      <footer className="footer">
        <p id="footername">&copy; 2024 cinematrix</p>
        <p>Made by raskolnikov </p>
        <a
          href="https://github.com/Rugved76/movieapp"
          target="blank_"
          style={{ textDecoration: "none", color: "white" }}
        >
          Github
        </a>
      </footer>
    </div>
  )
}

export default App
