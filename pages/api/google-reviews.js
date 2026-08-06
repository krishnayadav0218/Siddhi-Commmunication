export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    // Not configured — not an error, just nothing to show live. The site
    // still shows the static "Rate us on Google" button either way.
    return res.status(200).json({ configured: false, reviews: [], rating: null, totalRatings: 0 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=rating,user_ratings_total,reviews&key=${apiKey}`;
    const r = await fetch(url);
    const data = await r.json();

    if (data.status !== 'OK') {
      return res.status(200).json({ configured: true, reviews: [], rating: null, totalRatings: 0 });
    }

    const result = data.result || {};
    const reviews = (result.reviews || []).slice(0, 6).map((rv) => ({
      author: rv.author_name,
      rating: rv.rating,
      text: rv.text,
      relativeTime: rv.relative_time_description,
      profilePhoto: rv.profile_photo_url,
    }));

    return res.status(200).json({
      configured: true,
      reviews,
      rating: result.rating || null,
      totalRatings: result.user_ratings_total || 0,
    });
  } catch (e) {
    return res.status(200).json({ configured: true, reviews: [], rating: null, totalRatings: 0 });
  }
}
