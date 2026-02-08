// Vercel Serverless Function - Instagram API via Apify (pre-scraped tasks)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const country = 'Japan';

  const taskId = process.env.APIFY_TASK_JAPAN;

  if (!taskId) {
    return res.status(500).json({ error: 'APIFY_TASK_JAPAN env var not configured' });
  }

  const token = process.env.APIFY_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'API token not configured' });
  }

  try {
    // Fetch dataset items from the last successful run of the pre-configured task
    const response = await fetch(
      `https://api.apify.com/v2/actor-tasks/${taskId}/runs/last/dataset/items?status=SUCCEEDED`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apify API Error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Instagram API error',
        details: `Apify returned status ${response.status}`
      });
    }

    const data = await response.json();

    // Transform the data to our format
    const posts = transformInstagramData(data, country);

    if (posts.length === 0) {
      return res.status(200).json({
        posts: [],
        debug: 'No posts found in API response'
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
    // Apify returns an array of post objects directly
    const items = Array.isArray(data) ? data : [];

    return items.slice(0, 9).map((item, index) => {
      const image = item.displayUrl || '';
      const caption = item.caption || 'Travel moment';
      const username = item.ownerUsername || 'traveler';
      const likes = item.likesCount || 0;
      const timestamp = item.timestamp ? new Date(item.timestamp).getTime() / 1000 : null;

      return {
        id: item.id || item.shortCode || index,
        country: country,
        image: image,
        caption: typeof caption === 'string' ? caption.slice(0, 200) : 'Travel moment',
        username: username,
        likes: likes,
        date: getRelativeTime(timestamp)
      };
    }).filter(post => post.image);
  } catch (error) {
    console.error('Error transforming data:', error);
    return [];
  }
}

function getRelativeTime(timestamp) {
  if (!timestamp) return 'recently';

  const now = Date.now();
  const time = timestamp * 1000;
  const diff = now - time;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min ago`;
  return 'just now';
}
