// Initialize the application
function initialize() {
    const apiKey = config.API_KEY;
    const movieDataContainer = document.getElementById("movie-list");
    const seriesDataContainer = document.getElementById("series-list");
    const indicatorsContainer = document.querySelector('#indicators-carousel .absolute.z-30.flex');

    // Function to generate carousel indicators
    function generateIndicators(count) {
        let indicatorsHTML = '';
        for (let i = 0; i < count; i++) {
            indicatorsHTML += `
                <button type="button" 
                        class="w-3 h-3 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/70'}" 
                        aria-current="${i === 0 ? 'true' : 'false'}" 
                        aria-label="Slide ${i + 1}" 
                        data-carousel-slide-to="${i}">
                </button>`;
        }
        indicatorsContainer.innerHTML = indicatorsHTML;
    }

    // Function to fetch trailer for a movie
    async function getMovieTrailer(movieId) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`);
            const data = await response.json();
            const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
            return trailer ? trailer.key : null;
        } catch (error) {
            console.error('Error fetching trailer:', error);
            return null;
        }
    }

    // Function to fetch trailer for a TV show
    async function getTVTrailer(seriesId) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/videos?api_key=${apiKey}`);
            const data = await response.json();
            const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
            return trailer ? trailer.key : null;
        } catch (error) {
            console.error('Error fetching trailer:', error);
            return null;
        }
    }

    // Function to create video controls
    function createVideoControls() {
        return `
            <div class="absolute top-4 right-4 z-40 flex items-center space-x-2">
                <button class="video-control bg-black/50 hover:bg-black/70 text-white rounded-full p-2" onclick="toggleMute(this)">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                    </svg>
                </button>
            </div>`;
    }

    // Function to load trending movies for carousel
    async function loadTrendingMovies() {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`);
            const data = await response.json();
            const movies = data.results.slice(0, 10); // Get first 10 trending movies
            let carouselHTML = '';
            
            // First item as trailer
            const firstMovie = movies[0];
            const trailerKey = await getMovieTrailer(firstMovie.id);
            
            carouselHTML += `
                <div class="hidden duration-700 ease-in-out" data-carousel-item="active">
                    <div class="relative w-full h-full">
                        <div class="absolute inset-0 bg-black bg-opacity-60"></div>
                        ${trailerKey ? `
                            <div class="relative w-full h-full">
                                <iframe 
                                    id="movie-trailer-${firstMovie.id}"
                                    class="absolute inset-0 w-full h-full"
                                    src="https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=1&loop=1&playlist=${trailerKey}&modestbranding=1&enablejsapi=1" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                                ${createVideoControls()}
                            </div>
                        ` : `
                            <img class="absolute inset-0 w-full h-full object-cover" 
                                 src="https://image.tmdb.org/t/p/original${firstMovie.backdrop_path}"
                                 alt="${firstMovie.title}">
                        `}
                        <div class="absolute bottom-0 left-0 right-0 p-8">
                            <h2 class="text-4xl font-bold text-white mb-2">${firstMovie.title}</h2>
                            <p class="text-gray-300 mb-4">${firstMovie.overview}</p>
                            <button onclick="watchContent('movie', ${firstMovie.id})" 
                                    class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded">
                                Watch Now
                            </button>
                        </div>
                    </div>
                </div>`;

            // Rest as images
            for (let i = 1; i < movies.length; i++) {
                const movie = movies[i];
                carouselHTML += `
                    <div class="hidden duration-700 ease-in-out" data-carousel-item>
                        <div class="relative w-full h-full">
                            <div class="absolute inset-0 bg-black bg-opacity-60"></div>
                            <img class="absolute inset-0 w-full h-full object-cover" 
                                 src="https://image.tmdb.org/t/p/original${movie.backdrop_path}"
                                 alt="${movie.title}">
                            <div class="absolute bottom-0 left-0 right-0 p-8">
                                <h2 class="text-4xl font-bold text-white mb-2">${movie.title}</h2>
                                <p class="text-gray-300 mb-4">${movie.overview}</p>
                                <button onclick="watchContent('movie', ${movie.id})" 
                                        class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded">
                                    Watch Now
                                </button>
                            </div>
                        </div>
                    </div>`;
            }

            movieDataContainer.innerHTML = carouselHTML;
            generateIndicators(movies.length);
        } catch (error) {
            console.error('Error:', error);
        }
    } 

    // Function to load trending series for carousel
    async function loadTrendingSeries() {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}`);
            const data = await response.json();
            const series = data.results.slice(0, 10); // Get first 10 trending series
            let carouselHTML = '';
            
            // First item as trailer
            const firstSeries = series[0];
            const trailerKey = await getTVTrailer(firstSeries.id);
            
            carouselHTML += `
                <div class="hidden duration-700 ease-in-out" data-carousel-item="active">
                    <div class="relative w-full h-full">
                        <div class="absolute inset-0 bg-black bg-opacity-60"></div>
                        ${trailerKey ? `
                            <div class="relative w-full h-full">
                                <iframe 
                                    id="series-trailer-${firstSeries.id}"
                                    class="absolute inset-0 w-full h-full"
                                    src="https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=1&loop=1&playlist=${trailerKey}&modestbranding=1&enablejsapi=1" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                                ${createVideoControls()}
                            </div>
                        ` : `
                            <img class="absolute inset-0 w-full h-full object-cover"
                                 src="https://image.tmdb.org/t/p/original${firstSeries.backdrop_path}"
                                 alt="${firstSeries.name}">
                        `}
                        <div class="absolute bottom-0 left-0 right-0 p-8">
                            <h2 class="text-4xl font-bold text-white mb-2">${firstSeries.name}</h2>
                            <p class="text-gray-300 mb-4">${firstSeries.overview}</p>
                            <button onclick="watchContent('tv', ${firstSeries.id})" 
                                    class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded">
                                Watch Now
                            </button>
                        </div>
                    </div>
                </div>`;

            // Rest as images
            for (let i = 1; i < series.length; i++) {
                const show = series[i];
                carouselHTML += `
                    <div class="hidden duration-700 ease-in-out" data-carousel-item>
                        <div class="relative w-full h-full">
                            <div class="absolute inset-0 bg-black bg-opacity-60"></div>
                            <img class="absolute inset-0 w-full h-full object-cover"
                                 src="https://image.tmdb.org/t/p/original${show.backdrop_path}"
                                 alt="${show.name}">
                            <div class="absolute bottom-0 left-0 right-0 p-8">
                                <h2 class="text-4xl font-bold text-white mb-2">${show.name}</h2>
                                <p class="text-gray-300 mb-4">${show.overview}</p>
                                <button onclick="watchContent('tv', ${show.id})" 
                                        class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded">
                                    Watch Now
                                </button>
                            </div>
                        </div>
                    </div>`;
            }

            seriesDataContainer.innerHTML = carouselHTML;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Function to load latest movies
    function loadLatestMovies() {
        fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const latestMoviesGrid = document.querySelector('#latest-movies .grid');
                latestMoviesGrid.innerHTML = ''; // Clear existing content

                data.results.forEach(movie => {
                    const movieCard = document.createElement('div');
                    movieCard.classList.add('movie-card');
                    movieCard.innerHTML = `
                        <img class="h-auto max-w-full rounded-lg" 
                             src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                             alt="${movie.title}">
                        <div class="p-4">
                            <h3 class="text-white font-bold">${movie.title}</h3>
                            <p class="text-gray-400">${movie.release_date.split('-')[0]} | Movie</p>
                            <button onclick="watchContent('movie', ${movie.id})" 
                                    class="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                Watch Now
                            </button>
                        </div>
                    `;
                    latestMoviesGrid.appendChild(movieCard);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Function to load latest series 
    function loadLatestSeries() {
        fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const latestSeriesGrid = document.querySelector('#latest-series .grid');
                latestSeriesGrid.innerHTML = ''; // Clear existing content

                data.results.forEach(series => {
                    const seriesCard = document.createElement('div');
                    seriesCard.classList.add('series-card');
                    seriesCard.innerHTML = `
                        <img class="h-auto max-w-full rounded-lg" 
                             src="https://image.tmdb.org/t/p/w500${series.poster_path}" 
                             alt="${series.name}">
                        <div class="p-4">
                            <h3 class="text-white font-bold">${series.name}</h3>
                            <p class="text-gray-400">${series.first_air_date.split('-')[0]} | Series</p>
                            <button onclick="watchContent('tv', ${series.id})" 
                                    class="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                Watch Now
                            </button>
                        </div>
                    `;
                    latestSeriesGrid.appendChild(seriesCard);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Function to handle watch button clicks
    window.watchContent = function(type, id) {
        window.location.href = `watch.html?type=${type}&id=${id}`;
    }

    // Function to filter content by genre
    window.filterByGenre = function(genreId) {
        document.getElementById('latest-movies').style.display = 'none';
        document.getElementById('latest-series').style.display = 'none';
        document.getElementById('search-results').style.display = 'block';
        const resultsGrid = document.getElementById('results-grid');
        resultsGrid.innerHTML = '';

        // Fetch movies by genre
        fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}`)
            .then(response => response.json())
            .then(movieData => {
                // Fetch TV shows by genre
                return fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${genreId}`)
                    .then(response => response.json())
                    .then(tvData => {
                        return { movies: movieData.results, tvShows: tvData.results };
                    });
            })
            .then(data => {
                // Display movies
                data.movies.forEach(movie => {
                    const resultCard = document.createElement('div');
                    resultCard.classList.add('search-result-card');
                    resultCard.innerHTML = `
                        <img class="h-auto max-w-full rounded-lg" 
                             src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : 'https://source.unsplash.com/random/300x400/?movie'}" 
                             alt="${movie.title}">
                        <div class="p-4">
                            <h3 class="text-white font-bold">${movie.title}</h3>
                            <p class="text-gray-400">${movie.release_date.split('-')[0]} | Movie</p>
                            <button onclick="watchContent('movie', ${movie.id})" 
                                    class="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                Watch Now
                            </button>
                        </div>
                    `;
                    resultsGrid.appendChild(resultCard);
                });

                // Display TV shows
                data.tvShows.forEach(show => {
                    const resultCard = document.createElement('div');
                    resultCard.classList.add('search-result-card');
                    resultCard.innerHTML = `
                        <img class="h-auto max-w-full rounded-lg" 
                             src="${show.poster_path ? 'https://image.tmdb.org/t/p/w500' + show.poster_path : 'https://source.unsplash.com/random/300x400/?tv'}" 
                             alt="${show.name}">
                        <div class="p-4">
                            <h3 class="text-white font-bold">${show.name}</h3>
                            <p class="text-gray-400">${show.first_air_date.split('-')[0]} | Series</p>
                            <button onclick="watchContent('tv', ${show.id})" 
                                    class="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                Watch Now
                            </button>
                        </div>
                    `;
                    resultsGrid.appendChild(resultCard);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                resultsGrid.innerHTML = '<p class="text-white">An error occurred while fetching results.</p>';
            });
    }

    // Carousel functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll('#movie-list > div, #series-list > div');
    const indicators = document.querySelectorAll('[data-carousel-indicator]');

    function showSlide(index) {
        if (!slides || slides.length === 0) return;
        
        // Remove active class from all slides
        slides.forEach(slide => {
            if (slide) slide.classList.remove('block');
            if (slide) slide.classList.add('hidden');
        });
        
        // Remove active class from all indicators
        indicators.forEach(indicator => {
            if (indicator) indicator.setAttribute('aria-current', 'false');
        });
        
        // Show the current slide
        if (slides[index]) {
            slides[index].classList.remove('hidden');
            slides[index].classList.add('block');
        }
        
        // Update the active indicator
        if (indicators[index]) {
            indicators[index].setAttribute('aria-current', 'true');
        }
        
        currentSlide = index;
    }

    function nextSlide() {
        if (!slides || slides.length === 0) return;
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function prevSlide() {
        if (!slides || slides.length === 0) return;
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    // Initialize carousel
    document.addEventListener('DOMContentLoaded', () => {
        if (slides.length > 0) {
            showSlide(0);
            
            // Add click handlers for next/prev buttons
            const prevButton = document.querySelector('[data-carousel-prev]');
            const nextButton = document.querySelector('[data-carousel-next]');
            
            if (prevButton) {
                prevButton.addEventListener('click', prevSlide);
            }
            
            if (nextButton) {
                nextButton.addEventListener('click', nextSlide);
            }
            
            // Auto-advance slides every 5 seconds
            setInterval(nextSlide, 5000);
        }
    });

    // Add global mute toggle function
    window.toggleMute = function(button) {
        const iframe = button.closest('.relative').querySelector('iframe');
        if (iframe) {
            const currentSrc = iframe.src;
            const isMuted = currentSrc.includes('mute=1');
            const newSrc = currentSrc.replace(
                isMuted ? 'mute=1' : 'mute=0',
                isMuted ? 'mute=0' : 'mute=1'
            );
            iframe.src = newSrc;
            
            // Update button icon
            button.innerHTML = isMuted ? 
                `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                </svg>` :
                `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                </svg>`;
        }
    };

    // Load content when page loads
    document.addEventListener('DOMContentLoaded', () => {
        loadTrendingMovies();
        loadTrendingSeries();
        loadLatestMovies();
        loadLatestSeries();
    });

    // Search functionality
    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const searchQuery = document.getElementById('search-input').value;
        const resultsGrid = document.getElementById('results-grid');
        
        document.getElementById('latest-movies').style.display = 'none';
        document.getElementById('latest-series').style.display = 'none';
        document.getElementById('search-results').style.display = 'block';

        fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${searchQuery}`)
            .then(response => response.json())
            .then(data => {
                resultsGrid.innerHTML = '';
                
                data.results.forEach(item => {
                    if (item.media_type === 'movie' || item.media_type === 'tv') {
                        const posterPath = item.poster_path;
                        const title = item.title || item.name;
                        const year = (item.release_date || item.first_air_date || '').split('-')[0];
                        const mediaType = item.media_type === 'movie' ? 'Movie' : 'Series';
                        
                        const resultCard = document.createElement('div');
                        resultCard.classList.add('search-result-card');
                        resultCard.innerHTML = `
                            <img class="h-auto max-w-full rounded-lg" 
                                 src="${posterPath ? 'https://image.tmdb.org/t/p/w500' + posterPath : 'https://source.unsplash.com/random/300x400/?movie'}" 
                                 alt="${title}">
                            <div class="p-4">
                                <h3 class="text-white font-bold">${title}</h3>
                                <p class="text-gray-400">${year} | ${mediaType}</p>
                                <button onclick="watchContent('${item.media_type}', ${item.id})" 
                                        class="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                    Watch Now
                                </button>
                            </div>
                        `;
                        resultsGrid.appendChild(resultCard);
                    }
                });
            })
            .catch(error => {
                console.error('Error:', error);
                resultsGrid.innerHTML = '<p class="text-white">An error occurred while fetching results.</p>';
            });
    });
}

// Start the application
initialize();

function createHeroSection(item, type) {
    const heroSection = document.createElement('div');
    heroSection.className = 'hidden duration-700 ease-in-out';
    heroSection.setAttribute('data-carousel-item', 'active');
    
    const content = document.createElement('div');
    content.className = 'relative w-full h-full';
    
    // Background Image
    const bgImage = document.createElement('div');
    bgImage.className = 'absolute inset-0 w-full h-full';
    bgImage.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${item.backdrop_path})`;
    bgImage.style.backgroundSize = 'cover';
    bgImage.style.backgroundPosition = 'center';
    bgImage.style.filter = 'brightness(0.7)';
    
    // Content Container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'relative z-10 flex flex-col justify-center h-full px-4 md:px-8 lg:px-16';
    
    // Title
    const title = document.createElement('h1');
    title.className = 'text-3xl md:text-5xl font-bold text-white mb-4';
    title.textContent = type === 'movie' ? item.title : item.name;
    
    // Overview
    const overview = document.createElement('p');
    overview.className = 'text-white text-sm md:text-base max-w-2xl mb-6';
    overview.textContent = item.overview;
    
    // Watch Now Button
    const watchButton = document.createElement('a');
    watchButton.href = `#${type}-${item.id}`;
    watchButton.className = 'inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors';
    watchButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Watch Now
    `;
    
    contentDiv.appendChild(title);
    contentDiv.appendChild(overview);
    contentDiv.appendChild(watchButton);
    
    content.appendChild(bgImage);
    content.appendChild(contentDiv);
    heroSection.appendChild(content);
    
    return heroSection;
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('indicators-carousel');
    if (carousel) {
        const items = carousel.querySelectorAll('[data-carousel-item]');
        const indicators = carousel.querySelectorAll('[data-carousel-indicator]');
        let currentIndex = 0;

        function showSlide(index) {
            items.forEach((item, i) => {
                item.classList.toggle('hidden', i !== index);
                item.classList.toggle('block', i === index);
            });
            
            indicators.forEach((indicator, i) => {
                indicator.setAttribute('aria-current', i === index);
            });
        }

        // Previous button
        const prevButton = carousel.querySelector('[data-carousel-prev]');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                showSlide(currentIndex);
            });
        }

        // Next button
        const nextButton = carousel.querySelector('[data-carousel-next]');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % items.length;
                showSlide(currentIndex);
            });
        }

        // Auto-advance
        const interval = carousel.getAttribute('data-carousel-interval') || 5000;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % items.length;
            showSlide(currentIndex);
        }, interval);

        // Show first slide
        showSlide(0);
    }
});
