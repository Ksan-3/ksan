import Redis from 'ioredis';

// Redis 연결 (REDIS_URL 또는 KV_URL 환경변수 사용)
let redis;
function getRedis() {
    if (!redis) {
        const url = process.env.REDIS_URL || process.env.KV_URL;
        if (!url) {
            console.log('[사이트맵 API] Redis URL 환경변수 없음');
            return null;
        }
        redis = new Redis(url, {
            maxRetriesPerRequest: 1,
            connectTimeout: 5000,
            lazyConnect: true,
            tls: url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
        });
    }
    return redis;
}

const KV_KEY = 'news_articles';
const DOMAIN = 'https://investment-pick.co.kr';

export default async function handler(req, res) {
    // 1. 응답 타입을 XML로 설정
    res.setHeader('Content-Type', 'text/xml');

    // 2. 캐시 헤더 설정 (1시간 캐싱, 2시간까지 stale 허용)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

    try {
        const client = getRedis();
        let dynamicArticles = [];

        // 3. Redis에서 동적 뉴스 기사 가져오기
        if (client) {
            await client.connect().catch(() => { });
            const raw = await client.get(KV_KEY);
            if (raw) {
                const newsData = JSON.parse(raw);
                for (const articles of Object.values(newsData)) {
                    if (Array.isArray(articles)) {
                        dynamicArticles.push(...articles);
                    }
                }
            }
        }

        const today = new Date().toISOString().split('T')[0];

        // 4. 고정된 정적 페이지 목록
        const staticPages = [
            { url: '/', priority: '1.0', changefreq: 'daily' },
            { url: '/about', priority: '0.5', changefreq: 'monthly' },
            { url: '/terms', priority: '0.3', changefreq: 'monthly' },
            { url: '/privacy', priority: '0.3', changefreq: 'monthly' },
        ];

        // 5. 로컬 데이터 기사 (기존 35개)
        const staticArticleIds = [
            'kr1', 'kr2', 'kr3', 'kr4', 'kr5', 'kr6', 'kr7',
            'us1', 'us2', 'us3', 'us4', 'us5', 'us6', 'us7',
            're1', 're2', 're3', 're4', 're5', 're6', 're7',
            'ft1', 'ft2', 'ft3', 'ft4', 'ft5', 'ft6', 'ft7',
            'cr1', 'cr2', 'cr3', 'cr4', 'cr5', 'cr6', 'cr7'
        ];

        // 6. XML sitemap 조립 시작
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // 정적 페이지 추가
        staticPages.forEach(page => {
            xml += `  <url>\n`;
            xml += `    <loc>${DOMAIN}${page.url}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += `  </url>\n`;
        });

        // 기존 정적 기사 추가
        staticArticleIds.forEach(id => {
            xml += `  <url>\n`;
            xml += `    <loc>${DOMAIN}/article/${id}</loc>\n`;
            xml += `    <lastmod>2026-03-02</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.8</priority>\n`;
            xml += `  </url>\n`;
        });

        // Redis 동적 기사 추가 (중복 방지 및 최신순)
        const seenIds = new Set();
        dynamicArticles.forEach(article => {
            if (seenIds.has(article.id)) return;
            seenIds.add(article.id);

            const pubDate = article.pubDate ? article.pubDate.split('T')[0] : today;
            xml += `  <url>\n`;
            xml += `    <loc>${DOMAIN}/article/${article.id}</loc>\n`;
            xml += `    <lastmod>${pubDate}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.9</priority>\n`;
            xml += `  </url>\n`;
        });

        xml += `</urlset>`;

        return res.status(200).send(xml);
    } catch (err) {
        console.error('[사이트맵 API] 오류:', err.message);
        // 에러 시 빈 urlset 반환 (구글봇 에러 방지용)
        return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
}
