export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // 构造目标维基百科 API 的 URL
  const targetUrl = new URL('https://zh.wikipedia.org/w/api.php');
  // 转发所有的查询参数 (比如 action, format, geosearch 等)
  targetUrl.search = url.search;

  // 构造新的请求，携带原始请求的 method 和 headers
  const targetRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers: request.headers,
  });

  try {
    const response = await fetch(targetRequest);
    
    // 返回代理的结果
    const newResponse = new Response(response.body, response);
    // 可选：添加 CORS 头，虽然在同一域名下通常不需要，但为了严谨加上
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    
    return newResponse;
  } catch {
    return new Response(JSON.stringify({ error: 'Proxy fetch failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
