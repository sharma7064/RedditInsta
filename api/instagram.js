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

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to our format
    const posts = transformInstagramData(data, country);

    return res.status(200).json({ posts });
  } catch (error) {
    console.error('Instagram API error:', error);
    return res.status(500).json({ error: 'Failed to fetch Instagram posts' });
  }
}

function transformInstagramData(data, country) {
  try {
    // Handle different API response structures
    const items = data.data?.items || data.items || data.edge_hashtag_to_media?.edges || [];

    return items.slice(0, 9).map((item, index) => {
      // Handle different data structures from the API
      const node = item.node || item;

      return {
        id: node.id || index,
        country: country,
        image: node.display_url || node.thumbnail_url || node.image_versions2?.candidates?.[0]?.url || '',
        caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || node.caption?.text || 'Travel moment',
        username: node.owner?.username || node.user?.username || 'traveler',
        likes: node.edge_liked_by?.count || node.like_count || Math.floor(Math.random() * 5000) + 500,
        date: getRelativeTime(node.taken_at_timestamp || node.taken_at)
      };
    });
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
