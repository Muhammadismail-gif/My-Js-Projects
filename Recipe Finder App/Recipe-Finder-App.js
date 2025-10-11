document.addEventListener('DOMContentLoaded', () => {
    // 1. Get DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const recipeContainer = document.getElementById('recipeContainer');
    const statusMessage = document.getElementById('statusMessage');

    // 2. Event Listeners
    searchButton.addEventListener('click', () => {
        handleSearch();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 3. Main Search Handler
    function handleSearch() {
        const query = searchInput.value.trim();
        if (query) {
            fetchRecipes(query);
        } else {
            // Display message if input is empty
            recipeContainer.innerHTML = '';
            statusMessage.textContent = 'Please enter a meal or ingredient name to search.';
        }
    }

    // 4. Asynchronous Data Fetching Function
    async function fetchRecipes(query) {
        // Prepare the UI for search
        recipeContainer.innerHTML = '';
        statusMessage.textContent = `Searching for recipes with "${query}"...`;
        
        // TheMealDB API Endpoint for searching by name
        const API_URL = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;

        try {
            const response = await fetch(API_URL);
            
            // Check for non-200 HTTP status codes
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check if any meals were returned
            if (data.meals) {
                statusMessage.textContent = `Found ${data.meals.length} wonderful recipes!`;
                displayRecipes(data.meals);
            } else {
                statusMessage.textContent = `Sorry, no recipes found for "${query}". Try a simpler ingredient!`;
            }

        } catch (error) {
            // Handle network failure or parsing errors
            console.error('Fetch error:', error);
            statusMessage.textContent = 'An error occurred while fetching data. Check your connection or try again.';
        }
    }

    // 5. Recipe Rendering Function
    function displayRecipes(meals) {
        meals.forEach(meal => {
            // Create the recipe card structure
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            
            // Use innerHTML for easy creation of complex structure
            recipeCard.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}>
                <div class="recipe-info">
                    <h2>${meal.strMeal}</h2>
                    <p>Category: ${meal.strCategory}</p>
                    
                    <a href="${meal.strSource || meal.strYoutube}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       title="View Full Recipe or Tutorial">
                       View Recipe
                    </a>
                </div>
            `;
            
            recipeContainer.appendChild(recipeCard);
        });
    }
});