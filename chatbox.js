function toggleChat() {
    const chatBox = document.getElementById('chat-box');
    if(chatBox.classList.contains('hidden')) {
        chatBox.classList.remove('hidden');
    } else {
        chatBox.classList.add('hidden');
    }
}

async function getMovieSuggestions(query, type = 'all', genreId = '') {
    const apiKey = config.API_KEY;
    try {
        let endpoint = `https://api.themoviedb.org/3/trending/${type}/day?api_key=${apiKey}`;
        
        if (query) {
            endpoint = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
        }

        if (genreId) {
            endpoint = `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&with_genres=${genreId}`;
        }
        
        const response = await fetch(endpoint);
        const data = await response.json();
        return data.results.slice(0, 5);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    const userText = input.value.trim();
    
    if(userText) {
        // Add user message
        const userMessage = `
            <div class="flex items-end justify-end">
                <div class="bg-blue-600 rounded-lg p-3 max-w-[80%]">
                    <p class="text-white">${userText}</p>
                </div>
            </div>
        `;
        messages.innerHTML += userMessage;

        // Get bot response
        let botResponse = '';
        const userTextLower = userText.toLowerCase();

        // Update search input with chat query
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.value = userText;
            // Trigger search event
            searchInput.dispatchEvent(new Event('input'));
        }
        
        if(userTextLower.includes('creator') || userTextLower.includes('bossgen') || userTextLower.includes('moviesite')) {
            botResponse = `
                <div class="flex items-start mt-2 mb-2">
                    <div class="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                        <p class="text-white">This website was created by Genie James Arsenal.</p>
                    </div>
                </div>
            `;
        } else if(userTextLower.includes('anime')) {
            const suggestions = await getMovieSuggestions('anime', 'movie');
            botResponse = `
                <div class="flex items-start mt-2 mb-2">
                    <div class="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                        <p class="text-white">Here are some anime recommendations:</p>
                        ${suggestions.map(item => `
                            <div class="mt-2 flex gap-4">
                                <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" 
                                     alt="${item.title || item.name}" 
                                     class="w-32 h-48 object-cover rounded-lg">
                                <div>
                                    <p class="text-white font-bold">${item.title || item.name}</p>
                                    <p class="text-gray-300 text-sm">Rating: ${item.vote_average}/10</p>
                                    <p class="text-gray-300 text-sm">Release: ${item.release_date || item.first_air_date}</p>
                                    <p class="text-gray-300 text-sm">${item.overview?.slice(0, 100)}...</p>
                                    <a href="javascript:void(0)" onclick="playMovie(${item.id}, 'movie')" class="inline-block mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Watch Now</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if(userTextLower.includes('action')) {
            const suggestions = await getMovieSuggestions('', 'movie', '28');
            botResponse = `
                <div class="flex items-start mt-2 mb-2">
                    <div class="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                        <p class="text-white">Here are some action movie recommendations:</p>
                        ${suggestions.map(item => `
                            <div class="mt-2 flex gap-4">
                                <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" 
                                     alt="${item.title}" 
                                     class="w-32 h-48 object-cover rounded-lg">
                                <div>
                                    <p class="text-white font-bold">${item.title}</p>
                                    <p class="text-gray-300 text-sm">Rating: ${item.vote_average}/10</p>
                                    <p class="text-gray-300 text-sm">Release: ${item.release_date}</p>
                                    <p class="text-gray-300 text-sm">${item.overview?.slice(0, 100)}...</p>
                                    <a href="javascript:void(0)" onclick="playMovie(${item.id}, 'movie')" class="inline-block mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Watch Now</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if(userTextLower.includes('comedy')) {
            const suggestions = await getMovieSuggestions('', 'movie', '35');
            botResponse = `
                <div class="flex items-start mt-2 mb-2">
                    <div class="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                        <p class="text-white">Here are some comedy movie recommendations:</p>
                        ${suggestions.map(item => `
                            <div class="mt-2 flex gap-4">
                                <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" 
                                     alt="${item.title}" 
                                     class="w-32 h-48 object-cover rounded-lg">
                                <div>
                                    <p class="text-white font-bold">${item.title}</p>
                                    <p class="text-gray-300 text-sm">Rating: ${item.vote_average}/10</p>
                                    <p class="text-gray-300 text-sm">Release: ${item.release_date}</p>
                                    <p class="text-gray-300 text-sm">${item.overview?.slice(0, 100)}...</p>
                                    <a href="javascript:void(0)" onclick="playMovie(${item.id}, 'movie')" class="inline-block mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Watch Now</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if(userTextLower.includes('drama')) {
            const suggestions = await getMovieSuggestions('', 'movie', '18');
            botResponse = `
                <div class="flex items-start mt-2 mb-2">
                    <div class="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                        <p class="text-white">Here are some drama movie recommendations:</p>
                        ${suggestions.map(item => `
                            <div class="mt-2 flex gap-4">
                                <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" 
                                     alt="${item.title}" 
                                     class="w-32 h-48 object-cover rounded-lg">
                                <div>
                                    <p class="text-white font-bold">${item.title}</p>
                                    <p class="text-gray-300 text-sm">Rating: ${item.vote_average}/10</p>
                                    <p class="text-gray-300 text-sm">Release: ${item.release_date}</p>
                                    <p class="text-gray-300 text-sm">${item.overview?.slice(0, 100)}...</p>
                                    <a href="javascript:void(0)" onclick="playMovie(${item.id}, 'movie')" class="inline-block mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Watch Now</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if(userTextLower.includes('horror')) {
            const suggestions = await getMovieSuggestions('', 'movie', '27');
            botResponse = `
                <div class="flex items-start mt-2 mb-2">
                    <div class="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                        <p class="text-white">Here are some horror movie recommendations:</p>
                        ${suggestions.map(item => `
                            <div class="mt-2 flex gap-4">
                                <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" 
                                     alt="${item.title}" 
                                     class="w-32 h-48 object-cover rounded-lg">
                                <div>
                                    <p class="text-white font-bold">${item.title}</p>
                                    <p class="text-gray-300 text-sm">Rating: ${item.vote_average}/10</p>
                                    <p class="text-gray-300 text-sm">Release: ${item.release_date}</p>
                                    <p class="text-gray-300 text-sm">${item.overview?.slice(0, 100)}...</p>
                                    <a href="javascript:void(0)" onclick="playMovie(${item.id}, 'movie')" class="inline-block mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Watch Now</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if(userTextLower.includes('movie')) {
            const suggestions = await getMovieSuggestions(userText, 'movie');
            botResponse = `
                <div class="flex items-start mt-2 mb-2">
                    <div class="bg-gray-700 rounded-lg p-3 max-w-[80%] mt-2 mb-2">
                        <p class="text-white">Here are some movie suggestions based on your request:</p>
                        ${suggestions.map(item => `
                            <div class="mt-2 flex gap-4">
                                <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" 
                                     alt="${item.title}" 
                                     class="w-32 h-48 object-cover rounded-lg">
                                <div>
                                    <p class="text-white font-bold">${item.title}</p>
                                    <p class="text-gray-300 text-sm">Rating: ${item.vote_average}/10</p>
                                    <p class="text-gray-300 text-sm">Release: ${item.release_date}</p>
                                    <p class="text-gray-300 text-sm">${item.overview?.slice(0, 100)}...</p>
                                    <a href="javascript:void(0)" onclick="playMovie(${item.id}, 'movie')" class="inline-block mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Watch Now</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if(userTextLower.includes('series') || userTextLower.includes('show')) {
            const suggestions = await getMovieSuggestions(userText, 'tv');
            botResponse = `
                <div class="flex items-start mt-2 mb-2">
                    <div class="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                        <p class="text-white">Here are some TV series suggestions based on your request:</p>
                        ${suggestions.map(item => `
                            <div class="mt-2 flex gap-4">
                                <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" 
                                     alt="${item.name}" 
                                     class="w-32 h-48 object-cover rounded-lg">
                                <div>
                                    <p class="text-white font-bold">${item.name}</p>
                                    <p class="text-gray-300 text-sm">Rating: ${item.vote_average}/10</p>
                                    <p class="text-gray-300 text-sm">First Air Date: ${item.first_air_date}</p>
                                    <p class="text-gray-300 text-sm">${item.overview?.slice(0, 100)}...</p>
                                    <a href="javascript:void(0)" onclick="playMovie(${item.id}, 'tv')" class="inline-block mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Watch Now</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            botResponse = `
                <div class="flex items-start mt-2 mb-2">
                    <div class="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                        <p class="text-white">I can help you discover movies and shows! Try asking me about:</p>
                        <ul class="text-gray-300 list-disc list-inside mt-2">
                            <li>Action movies</li>
                            <li>Comedy movies</li>
                            <li>Drama movies</li>
                            <li>Horror movies</li>
                            <li>Anime movies</li>
                            <li>TV series recommendations</li>
                            <li>Latest trending shows</li>
                        </ul>
                    </div>
                </div>
            `;
        }
        messages.innerHTML += botResponse;
        
        // Clear input
        input.value = '';
        
        // Auto scroll to bottom
        messages.scrollTop = messages.scrollHeight;
    }
}

// Allow sending message with Enter key
document.getElementById('chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Function to handle movie playback
function playMovie(movieId, type = 'movie') {
    window.location.href = `/watch.html?type=${type}&id=${movieId}`;
}