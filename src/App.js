import { useState, useEffect } from "react"
import "./index.css"
import "./App.css"

function App() {
  const [movies, setMovies] = useState([])
  const [yearMovies, setYearMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [randomYearsAgo, setRandomYearsAgo] = useState(null)
  const [randomYear, setRandomYear] = useState(null)

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

  // Function to filter movies with valid posters
  const filterMoviesWithPosters = (movieList) => {
    return movieList.filter(movie =>
      movie.Poster &&
      movie.Poster !== "N/A" &&
      movie.Poster.trim() !== ""
    )
  }

  // Function to generate random years ago and calculate the year
  const generateRandomYearsAgo = () => {
    const currentYear = new Date().getFullYear()
    // Limit to years where movies are more likely to have posters (1970+)
    const yearsAgo = Math.floor(Math.random() * (currentYear - 1970 + 1))
    const calculatedYear = currentYear - yearsAgo
    return { yearsAgo, calculatedYear }
  }

  const fetchMovies = async () => {
    try {
      setLoading(true)

      // Fetch random movies first
      const response = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=95fb18a5`)
      const data = await response.json()
      console.log(data)

      // Filter movies with valid posters
      const filteredMovies = filterMoviesWithPosters(data.Search || [])
      setMovies(filteredMovies)

      // Generate random years ago and year
      const { yearsAgo, calculatedYear } = generateRandomYearsAgo()
      setRandomYearsAgo(yearsAgo)
      setRandomYear(calculatedYear)

      // Use popular movie search terms to get better results for the calculated year
      const popularSearchTerms = [
        'batman', 'superman', 'star', 'love', 'war', 'man', 'the', 'king',
        'life', 'death', 'american', 'big', 'last', 'first', 'good', 'bad'
      ]

      let yearMoviesWithPosters = []

      for (const term of popularSearchTerms) {
        if (yearMoviesWithPosters.length >= 20) break

        const yearResponse = await fetch(`https://www.omdbapi.com/?s=${term}&y=${calculatedYear}&apikey=95fb18a5`)
        const yearData = await yearResponse.json()

        if (yearData.Search) {
          const filteredYearMovies = filterMoviesWithPosters(yearData.Search)
          yearMoviesWithPosters = [...yearMoviesWithPosters, ...filteredYearMovies]
        }
      }

      // Remove duplicates based on imdbID
      const uniqueYearMovies = yearMoviesWithPosters.filter((movie, index, self) =>
        index === self.findIndex(m => m.imdbID === movie.imdbID)
      )

      // If you want to sort by IMDb rating (requires additional API calls)
      // This is optional and will slow down the app but gives better results
      const moviesWithRatings = await Promise.all(
        uniqueYearMovies.slice(0, 15).map(async (movie) => {
          try {
            const detailResponse = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=95fb18a5`)
            const detailData = await detailResponse.json()
            return {
              ...movie,
              imdbRating: parseFloat(detailData.imdbRating) || 0
            }
          } catch (error) {
            return { ...movie, imdbRating: 0 }
          }
        })
      )

      // Sort by IMDb rating (highest first)
      const sortedMovies = moviesWithRatings.sort((a, b) => b.imdbRating - a.imdbRating)

      setYearMovies(sortedMovies)

    } catch (error) {
      console.error("Error fetching movies:", error)
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

  const handleSearch = () => {
    // Generate a new random keyword when searching
    setSearchTerm(getRandomKeyword())
    setSelectedMovie(null)
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
    } catch (error) {
      console.error("Error fetching movie details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    setSelectedMovie(null)
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1>cinematrix</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Random Search</button>
        </div>
      </nav>
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
            <p>Director: &nbsp;{selectedMovie.Director}</p>
            <p>Rating: &nbsp;{selectedMovie.Rated}</p>
            <p>Cast: &nbsp;{selectedMovie.Actors}</p>
            <p>Runtime: &nbsp;{selectedMovie.Runtime}</p>
            <p>Released: &nbsp;{selectedMovie.Released}</p>
            <p>Genre: &nbsp;{selectedMovie.Genre}</p>
            <p>Plot: &nbsp;{selectedMovie.Plot}</p>
            <p>Awards: &nbsp;{selectedMovie.Awards}</p>
            <button className="goback" onClick={handleGoBack}>
              Go Back
            </button>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="movies-container">
            {/* First two rows of random movies (8 movies total) */}
            <div className="movies-grid">
              {movies.slice(0, 8).map((movie) => (
                <div key={movie.imdbID} className="movie-card" onClick={() => handleMovieClick(movie)}>
                  <img src={movie.Poster} alt={`${movie.Title} Poster`} />
                  <h2>{movie.Title}</h2>
                  <p>{movie.Year}</p>
                </div>
              ))}
            </div>

            {/* Year divider */}
            {randomYearsAgo !== null && randomYear && (
              <div className="year-divider">
                <p>Movies released in {randomYear}</p>
              </div>
            )}

            {/* Movies from the calculated year - only show if we have movies with posters */}
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

            {/* Fallback message if no movies with posters found for that year */}
            {yearMovies.length === 0 && randomYearsAgo !== null && (
              <div className="no-movies-message">
                <p>No movies with posters found from {randomYear}. Try searching again!</p>
              </div>
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
