// Initialize the application
function initialize() {
    const apiKey = config.API_KEY;
    
    const player = document.getElementById('watch-movie');
    const detailsContainer = document.getElementById('movie-details');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const watch_id = urlParams.get('id');
    const type = urlParams.get('type') || 'movie';
    const season = urlParams.get('season') || '1';
    const episode = urlParams.get('episode') || '1';

    if (watch_id) {
        const embedSources = [
            type === 'tv' 
                ? `https://vidsrc.cc/v2/embed/tv/${watch_id}/${season}/${episode}?autoPlay=false`
                : `https://vidsrc.cc/v2/embed/movie/${watch_id}?autoPlay=false`,
            type === 'tv'
                ? `https://www.2embed.to/embed/tmdb/tv?id=${watch_id}&s=${season}&e=${episode}`
                : `https://www.2embed.to/embed/tmdb/movie?id=${watch_id}`,
            type === 'tv'
                ? `https://multiembed.mov/?video_id=${watch_id}&tmdb=1&s=${season}&e=${episode}`
                : `https://multiembed.mov/?video_id=${watch_id}&tmdb=1`
        ];

        let currentSourceIndex = 0;

        function loadPlayer(index) {
            player.innerHTML = `
                <div class="relative pt-[56.25%]">
                    <iframe 
                        class="absolute top-0 left-0 w-full h-full"
                        src="${embedSources[index]}" 
                        frameborder="0" 
                        allow="autoplay; fullscreen" 
                        allowfullscreen
                        onerror="this.onerror=null; switchSource();">
                    </iframe>
                </div>
                <div class="mt-2 text-center space-x-2 mt-2">
                     <p class="text-white mb-2 text-lg font-bold">Switch Server</p>
                    <button onclick="loadPlayer(0)" class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">
                        Server 1 (VidSrc)
                    </button>
                    <button onclick="loadPlayer(1)" class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">
                        Server 2 (2Embed)
                    </button>
                    <button onclick="loadPlayer(2)" class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2">
                        Server 3 (MultiEmbed)
                    </button>
                </div>
            `;
        }

        function switchSource() {
            currentSourceIndex = (currentSourceIndex + 1) % embedSources.length;
            loadPlayer(currentSourceIndex);
        }

        loadPlayer(currentSourceIndex);

        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'switch-server') {
                switchSource();
            }
        });

        const detailsUrl = `https://api.themoviedb.org/3/${type}/${watch_id}?api_key=${apiKey}&language=en-US`;
        const recommendationsUrl = `https://api.themoviedb.org/3/${type}/${watch_id}/recommendations?api_key=${apiKey}&language=en-US`;
        const trendingMoviesUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&language=en-US`;
        const trendingSeriesUrl = `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}&language=en-US`;

        // Fetch season details if it's a TV series
        const seasonUrl = type === 'tv' 
            ? `https://api.themoviedb.org/3/${type}/${watch_id}/season/${season}?api_key=${apiKey}&language=en-US`
            : null;

        const fetchPromises = [
            fetch(detailsUrl).then(response => {
                if (!response.ok) throw new Error(`Details API error: ${response.status}`);
                return response.json();
            }),
            fetch(recommendationsUrl).then(response => {
                if (!response.ok) throw new Error(`Recommendations API error: ${response.status}`);
                return response.json();
            }),
            fetch(trendingMoviesUrl).then(response => {
                if (!response.ok) throw new Error(`Trending Movies API error: ${response.status}`);
                return response.json();
            }),
            fetch(trendingSeriesUrl).then(response => {
                if (!response.ok) throw new Error(`Trending Series API error: ${response.status}`);
                return response.json();
            })
        ];

        if (seasonUrl) {
            fetchPromises.push(
                fetch(seasonUrl).then(response => {
                    if (!response.ok) throw new Error(`Season API error: ${response.status}`);
                    return response.json();
                })
            );
        }

        Promise.all(fetchPromises)
            .then(([detailsData, recommendationsData, trendingMoviesData, trendingSeriesData, seasonData]) => {
                const title = detailsData.title || detailsData.name;
                const overview = detailsData.overview;
                const posterPath = detailsData.poster_path;
                const releaseDate = detailsData.release_date || detailsData.first_air_date;
                const genres = detailsData.genres.map(genre => genre.name).join(', ');
                const rating = detailsData.vote_average.toFixed(1);

                // Generate episodes list if it's a TV series
                let episodesList = '';
                if (type === 'tv' && seasonData) {
                    episodesList = `
                        <div class="mt-8">
                            <h2 class="text-2xl font-bold text-white mb-4">Season ${season} Episodes</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${seasonData.episodes.map(ep => `
                                    <div class="bg-gray-800 rounded-lg p-4 ${ep.episode_number == episode ? 'ring-2 ring-blue-500' : ''}">
                                        <div class="flex items-start gap-4">
                                            <img src="https://image.tmdb.org/t/p/w300${ep.still_path || posterPath}" 
                                                 alt="${ep.name}" 
                                                 class="w-32 h-20 object-cover rounded">
                                            <div class="flex-1">
                                                <h3 class="text-white font-semibold">${ep.episode_number}. ${ep.name}</h3>
                                                <p class="text-gray-400 text-sm">${ep.air_date}</p>
                                                <p class="text-gray-300 text-sm mt-2 line-clamp-2">${ep.overview}</p>
                                                <a href="/watch.html?type=tv&id=${watch_id}&season=${season}&episode=${ep.episode_number}" 
                                                   class="inline-block mt-2 text-blue-400 hover:text-blue-300">
                                                    Watch Episode
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>`;
                }

                const recommendations = recommendationsData.results.slice(0, 6);
                const trendingMovies = trendingMoviesData.results.slice(0, 6);
                const trendingSeries = trendingSeriesData.results.slice(0, 6);

                const createMediaCard = (item, mediaType) => `
                    <div class="relative group">
                        <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" 
                             alt="${item.title || item.name}" 
                             class="w-full rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
                        <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                            <a href="/watch.html?type=${mediaType}&id=${item.id}" 
                               class="text-white font-semibold hover:text-blue-400">
                                ${item.title || item.name}
                            </a>
                        </div>
                    </div>
                `;

                const recommendationsHTML = recommendations.map(item => 
                    createMediaCard(item, item.media_type || type)
                ).join('');

                const trendingMoviesHTML = trendingMovies.map(item => 
                    createMediaCard(item, 'movie')
                ).join('');

                const trendingSeriesHTML = trendingSeries.map(item => 
                    createMediaCard(item, 'tv')
                ).join('');

                detailsContainer.innerHTML = `
                    <div class="max-w-screen-xl mx-auto p-4">
                        <div class="flex flex-col md:flex-row gap-8">
                            <div class="md:w-1/3">
                                <img src="https://image.tmdb.org/t/p/w500${posterPath}" 
                                     alt="${title}" 
                                     class="w-[350px] h-[500px] rounded-lg shadow-lg object-cover">
                            </div>
                            <div class="md:w-2/3">
                                <h1 class="text-3xl font-bold text-white mb-2">${title}</h1>
                                <div class="flex items-center gap-4 text-gray-400 mb-4">
                                    <span>${releaseDate.split('-')[0]}</span>
                                    <span>•</span>
                                    <span>${genres}</span>
                                    <span>•</span>
                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                        </svg>
                                        <span class="ml-1">${rating}/10</span>
                                    </div>
                                </div>
                                <p class="text-gray-300 text-lg mb-6">${overview}</p>
                            </div>
                        </div>
                        ${episodesList}
                        <div class="mt-12">
                            <h2 class="text-2xl font-bold text-white mb-6">Recommended</h2>
                            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                ${recommendationsHTML}
                            </div>
                        </div>
                        <div class="mt-12">
                            <h2 class="text-2xl font-bold text-white mb-6">Trending Movies</h2>
                            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                ${trendingMoviesHTML}
                            </div>
                        </div>
                        <div class="mt-12">
                            <h2 class="text-2xl font-bold text-white mb-6">Trending Series</h2>
                            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                ${trendingSeriesHTML}
                            </div>
                        </div>
                    </div>`;
            })
            .catch(error => {
                console.error('Error fetching details:', error);
                detailsContainer.innerHTML = `
                    <div class="max-w-screen-xl mx-auto p-4">
                        <p class="text-red-500">Failed to load content details: ${error.message}</p>
                    </div>`;
            });
    } else {
        player.innerHTML = `
            <div class="max-w-screen-xl mx-auto p-4">
                <p class="text-red-500">Error: Content ID is missing or invalid.</p>
            </div>`;
    }

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            searchContent(query, apiKey);
        } else {
            alert('Please enter a search term.');
        }
    });
}

function searchContent(query, apiKey) {
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US`;

    fetch(searchUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching search results');
            }
            return response.json();
        })
        .then(data => {
            searchResults.innerHTML = `
                <div class="max-w-screen-xl mx-auto p-4">
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        ${data.results
                            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
                            .map(item => {
                                const title = item.title || item.name;
                                const posterPath = item.poster_path 
                                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
                                    : 'https://via.placeholder.com/500x750?text=No+Poster';
                                return `
                                    <div class="relative group">
                                        <img src="${posterPath}" 
                                             alt="${title}" 
                                             class="w-full rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
                                        <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                            <a href="/watch.html?type=${item.media_type}&id=${item.id}" 
                                               class="text-white font-semibold hover:text-blue-400">
                                                ${title}
                                            </a>
                                        </div>
                                    </div>`;
                            }).join('')}
                    </div>
                </div>`;
        })
        .catch(error => {
            console.error('Error:', error);
            searchResults.innerHTML = `
                <div class="max-w-screen-xl mx-auto p-4">
                    <p class="text-red-500">An error occurred while fetching results.</p>
                </div>`;
        });
}

// Start the application
initialize();