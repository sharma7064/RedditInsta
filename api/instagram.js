// Vercel Serverless Function - Instagram API via RapidAPI

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { country } = req.query;

  if (!country) {
    return res.status(400).json({ error: 'Country parameter is required' });
  }

  // Map countries to popular travel hashtags
  const countryHashtags = {
    'Japan': 'japantravel',
    'Italy': 'italytravel',
    'Thailand': 'thailandtravel',
    'France': 'francetravel',
    'Mexico': 'mexicotravel',
    'Australia': 'australiatravel'
  };

  const hashtag = countryHashtags[country];

  if (!hashtag) {
    return res.status(400).json({ error: 'Invalid country' });
  }

  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Using RapidAPI Instagram Scraper API
    const response = await fetch(
      `https://instagram-scraper-api2.p.rapidapi.com/v1/hashtag?hashtag=${hashtag}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error Response:', JSON.stringify(data));
      return res.status(response.status).json({
        error: 'Instagram API error',
        details: data.message || data.error || `Status: ${response.status}`
      });
    }

    // Transform the data to our format
    const posts = transformInstagramData(data, country);

    if (posts.length === 0) {
      return res.status(200).json({
        posts: [],
        debug: 'No posts found in API response',
        rawKeys: Object.keys(data || {})
      });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    console.error('Instagram API error:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch Instagram posts',
      details: error.message
    });
  }
}

function transformInstagramData(data, country) {
  try {
    // Handle the instagram-scraper-api2 response structure
    const items = data.data?.items ||
                  data.items ||
                  data.data?.edges?.map(e => e.node) ||
                  data.edge_hashtag_to_media?.edges?.map(e => e.node) ||
                  [];

    return items.slice(0, 9).map((item, index) => {
      // Handle different data structures from the API
      const node = item.node || item;

      // Get image URL from various possible locations
      const image = node.display_url ||
                    node.thumbnail_url ||
                    node.image_versions2?.candidates?.[0]?.url ||
                    node.thumbnail_src ||
                    node.display_resources?.[0]?.src ||
                    '';

      // Get caption from various possible locations
      const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text ||
                      node.caption?.text ||
                      node.caption ||
                      'Travel moment';

      // Get username
      const username = node.owner?.username ||
                       node.user?.username ||
                       'traveler';

      // Get likes
      const likes = node.edge_liked_by?.count ||
                    node.like_count ||
                    node.likes?.count ||
                    Math.floor(Math.random() * 5000) + 500;

      return {
        id: node.id || node.pk || index,
        country: country,
        image: image,
        caption: typeof caption === 'string' ? caption.slice(0, 200) : 'Travel moment',
        username: username,
        likes: likes,
        date: getRelativeTime(node.taken_at_timestamp || node.taken_at)
      };
    }).filter(post => post.image); // Only return posts with images
  } catch (error) {
    console.error('Error transforming data:', error);
    return [];
  }
}

function getRelativeTime(timestamp) {
  if (!timestamp) return 'recently';

  const now = Date.now();
  const time = timestamp * 1000; // Convert to milliseconds if needed
  const diff = now - time;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min ago`;
  return 'just now';
}
