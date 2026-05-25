export interface WikiArticle {
  pageid: number;
  title: string;
  extract: string;
  thumbnail?: string;
  lat: number;
  lon: number;
  distance: number;
  yearHint?: number;
}

export async function fetchNearbyHistoricalArticles(lat: number, lon: number, radius = 10000): Promise<WikiArticle[]> {
  try {
    // Wikipedia API max radius is 10000m
    const safeRadius = Math.min(radius, 10000);
    // 1. Fetch nearby pages
    const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=${safeRadius}&gslimit=20&format=json&origin=*`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    
    if (!geoData.query || !geoData.query.geosearch || geoData.query.geosearch.length === 0) {
      return [];
    }

    const pages = geoData.query.geosearch;
    const pageIds = pages.map((p: any) => p.pageid).join('|');

    // 2. Fetch details (extracts and images) for these pages
    const detailsUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageIds}&prop=extracts|pageimages|coordinates&exintro=1&explaintext=1&pithumbsize=400&format=json&origin=*`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    const articles: WikiArticle[] = [];
    const pageMap = detailsData.query.pages;

    for (const page of pages) {
      const detail = pageMap[page.pageid];
      if (detail && detail.extract) {
        // Attempt to find a year in the extract (simple regex looking for 3-4 digit numbers that look like years)
        const yearMatch = detail.extract.match(/\b([1-9][0-9]{2,3})\b/);
        const yearHint = yearMatch ? parseInt(yearMatch[1]) : undefined;

        articles.push({
          pageid: page.pageid,
          title: page.title,
          extract: detail.extract,
          thumbnail: detail.thumbnail?.source,
          lat: page.lat,
          lon: page.lon,
          distance: page.dist,
          yearHint
        });
      }
    }

    return articles;
  } catch (error) {
    console.error("Failed to fetch Wikipedia data:", error);
    return [];
  }
}
