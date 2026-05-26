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

export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'too_large';

export interface WikiScanResult {
  status: SearchStatus;
  data: WikiArticle[];
}

export async function fetchArticlesInBounds(north: number, west: number, south: number, east: number): Promise<WikiScanResult> {
  try {
    const geoUrl = `https://zh.wikipedia.org/w/api.php?action=query&list=geosearch&gsbbox=${north}|${west}|${south}|${east}&gslimit=100&format=json&origin=*`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    
    if (geoData.error && geoData.error.code === 'toobig') {
      return { status: 'too_large', data: [] };
    }

    if (!geoData.query || !geoData.query.geosearch || geoData.query.geosearch.length === 0) {
      return { status: 'empty', data: [] };
    }

    const pages = geoData.query.geosearch;

    // 2. Fetch details (extracts and images) for these pages
    // Note: If more than 50 pages, we might need multiple requests, but Wikipedia allows 50 pageids per request for normal users (or 500 for bots).
    // To handle up to 100, we should split pageIds into chunks of 50.
    const chunks = [];
    for (let i = 0; i < pages.length; i += 50) {
      chunks.push(pages.slice(i, i + 50));
    }

    const articles: WikiArticle[] = [];

    // 性能优化：并行发送所有分块请求，而非串行等待
    const chunkResults = await Promise.all(chunks.map(async (chunk) => {
      const chunkIds = chunk.map((p: any) => p.pageid).join('|');
      const detailsUrl = `https://zh.wikipedia.org/w/api.php?action=query&pageids=${chunkIds}&prop=extracts|pageimages|coordinates&exintro=1&explaintext=1&pithumbsize=400&format=json&origin=*`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();
      return { chunk, pageMap: detailsData.query.pages };
    }));

    for (const { chunk, pageMap } of chunkResults) {
      for (const page of chunk) {
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
            distance: page.dist || 0,
            yearHint
          });
        }
      }
    }

    // Sort articles chronologically
    const sorted = articles.sort((a, b) => {
      if (a.yearHint !== undefined && b.yearHint !== undefined) {
        return a.yearHint - b.yearHint;
      }
      if (a.yearHint !== undefined) return -1;
      if (b.yearHint !== undefined) return 1;
      return 0;
    });

    return { status: 'success', data: sorted };
  } catch (error) {
    console.error("Failed to fetch Wikipedia data:", error);
    return { status: 'empty', data: [] };
  }
}

