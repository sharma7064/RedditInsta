// Travel Itinerary Generator - Main Script

let postsData = null;

// Country flag mapping
const countryFlags = {
    'Japan': '🇯🇵',
    'Italy': '🇮🇹',
    'Thailand': '🇹🇭',
    'France': '🇫🇷',
    'Mexico': '🇲🇽',
    'Australia': '🇦🇺'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await loadPostsData();
    setupCountrySelector();
});

// Load posts data from JSON file
async function loadPostsData() {
    try {
        const response = await fetch('data/posts.json');
        postsData = await response.json();
    } catch (error) {
        console.error('Error loading posts data:', error);
    }
}

// Setup country selector event listener
function setupCountrySelector() {
    const selector = document.getElementById('country-select');

    selector.addEventListener('change', (e) => {
        const country = e.target.value;

        if (country) {
            displayPosts(country);
        } else {
            hidePosts();
        }
    });
}

// Display posts for selected country
function displayPosts(country) {
    const postsContainer = document.getElementById('posts-container');
    const emptyState = document.getElementById('empty-state');
    const instagramGrid = document.getElementById('instagram-grid');
    const redditList = document.getElementById('reddit-list');

    // Show posts container, hide empty state
    postsContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // Filter posts by country
    const instagramPosts = postsData.instagram.filter(post => post.country === country);
    const redditPosts = postsData.reddit.filter(post => post.country === country);

    // Render Instagram posts
    instagramGrid.innerHTML = instagramPosts.map(post => createInstagramCard(post)).join('');

    // Render Reddit posts
    redditList.innerHTML = redditPosts.map(post => createRedditCard(post)).join('');

    // Smooth scroll to posts
    postsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Hide posts and show empty state
function hidePosts() {
    const postsContainer = document.getElementById('posts-container');
    const emptyState = document.getElementById('empty-state');

    postsContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
}

// Create Instagram card HTML
function createInstagramCard(post) {
    return `
        <div class="instagram-card bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
            <div class="aspect-square overflow-hidden">
                <img
                    src="${post.image}"
                    alt="${post.caption}"
                    class="w-full h-full object-cover"
                    loading="lazy"
                >
            </div>
            <div class="p-4">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                    <span class="font-medium text-gray-900">@${post.username}</span>
                </div>
                <p class="text-gray-700 text-sm mb-3 line-clamp-2">${post.caption}</p>
                <div class="flex items-center justify-between text-gray-500 text-sm">
                    <div class="flex items-center gap-1">
                        <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span>${formatNumber(post.likes)}</span>
                    </div>
                    <span>${post.date}</span>
                </div>
            </div>
        </div>
    `;
}

// Create Reddit card HTML
function createRedditCard(post) {
    return `
        <div class="reddit-card bg-gray-50 rounded-xl p-5 border border-gray-200 cursor-pointer">
            <div class="flex gap-4">
                <div class="flex flex-col items-center gap-1 text-gray-500">
                    <svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4l-8 8h6v8h4v-8h6z"/>
                    </svg>
                    <span class="font-semibold text-gray-900">${formatNumber(post.upvotes)}</span>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 20l8-8h-6V4H10v8H4z"/>
                    </svg>
                </div>
                <div class="flex-1">
                    <span class="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        ${post.subreddit}
                    </span>
                    <h3 class="text-lg font-semibold text-gray-900 mt-2 mb-2 hover:text-indigo-600 transition">
                        ${post.title}
                    </h3>
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                        <span>${post.author}</span>
                        <span>•</span>
                        <span>${post.date}</span>
                        <span>•</span>
                        <div class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            <span>${post.comments} comments</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Format large numbers (e.g., 1500 -> 1.5K)
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

// Handle email form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            if (email) {
                alert(`Thanks for signing up! We'll send updates to ${email}`);
                form.reset();
            }
        });
    }
});
