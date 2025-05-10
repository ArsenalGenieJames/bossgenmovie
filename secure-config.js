// Function to fetch API key securely
async function getApiKey() {
    try {
        const response = await fetch('api-config.php');
        if (!response.ok) {
            throw new Error('Failed to fetch API key');
        }
        const data = await response.json();
        return data.apiKey;
    } catch (error) {
        console.error('Error fetching API key:', error);
        return null;
    }
}

// Export the function
export { getApiKey }; 