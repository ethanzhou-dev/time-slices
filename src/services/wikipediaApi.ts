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
    // 1. Fetch nearby pages from CHINESE Wikipedia
    const geoUrl = `https://zh.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=${safeRadius}&gslimit=30&format=json&origin=*`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    
    if (!geoData.query || !geoData.query.geosearch || geoData.query.geosearch.length === 0) {
      return [];
    }

    const pages = geoData.query.geosearch;
    const pageIds = pages.map((p: any) => p.pageid).join('|');

    // 2. Fetch details (extracts and images) for these pages
    const detailsUrl = `https://zh.wikipedia.org/w/api.php?action=query&pageids=${pageIds}&prop=extracts|pageimages|coordinates&exintro=1&explaintext=1&pithumbsize=400&format=json&origin=*`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    const articles: WikiArticle[] = [];
    const pageMap = detailsData.query.pages;

    for (const page of pages) {
      const detail = pageMap[page.pageid];
      if (detail && detail.extract) {
        // Attempt to find a year in the extract (Chinese format: 1994年, 公元前221年, etc.)
        let yearHint: number | undefined = undefined;
        
        // Match "1234年" or "公元前123年"
        const yearMatch = detail.extract.match(/(公元前)?(\d{2,4})年/);
        if (yearMatch) {
          const isBCE = !!yearMatch[1];
          const year = parseInt(yearMatch[2], 10);
          yearHint = isBCE ? -year : year;
        } else {
          // Fallback: just look for 3-4 digit numbers that might be a year
          const genericMatch = detail.extract.match(/(1[0-9]{3}|20[0-2][0-9])/);
          if (genericMatch) {
            yearHint = parseInt(genericMatch[1], 10);
          }
        }

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

    // Sort articles chronologically
    return articles.sort((a, b) => {
      if (a.yearHint !== undefined && b.yearHint !== undefined) {
        return a.yearHint - b.yearHint;
      }
      if (a.yearHint !== undefined) return -1;
      if (b.yearHint !== undefined) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Failed to fetch Wikipedia data:", error);
    return [];
  }
}
