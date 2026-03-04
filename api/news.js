// /api/news — Redis에서 뉴스 데이터를 읽어 반환
// 크론(/api/cron/generate-articles)이 Redis에 저장한 데이터를 읽기만 합니다.

import Redis from 'ioredis';

// Redis 연결 (REDIS_URL 또는 KV_URL 환경변수 사용)
let redis;
function getRedis() {
    if (!redis) {
        const url = process.env.REDIS_URL || process.env.KV_URL;
        if (!url) {
            console.log('[뉴스API] Redis URL 환경변수 없음 (REDIS_URL, KV_URL 모두 미설정)');
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

export default async function handler(req, res) {
    // CORS 허용
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    // CDN 캐시: 10분간 캐시, 30분 동안 stale 허용
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'GET만 허용됩니다' });
    }

    try {
        const client = getRedis();
        if (!client) {
            return res.status(200).json({
                success: true, data: [], lastUpdate: null, count: 0,
                source: 'no-redis',
                debug: 'REDIS_URL 또는 KV_URL 환경변수를 Vercel 대시보드에서 설정하세요.',
            });
        }

        await client.connect().catch(() => { });

        // Redis에서 뉴스 데이터 읽기
        const raw = await client.get(KV_KEY);
        const lastUpdate = await client.get('news_last_updated');

        if (!raw) {
            return res.status(200).json({
                success: true, data: [], lastUpdate: null, count: 0,
                source: 'empty',
                debug: 'Redis에 데이터가 없습니다. /api/cron/generate-articles를 먼저 호출하세요.',
            });
        }

        const newsData = JSON.parse(raw);

        // 모든 카테고리의 기사를 플랫 배열로 합치기
        const allArticles = [];
        for (const articles of Object.values(newsData)) {
            if (Array.isArray(articles)) {
                allArticles.push(...articles);
            }
        }

        // 최신순 정렬
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        return res.status(200).json({
            success: true,
            data: allArticles,
            lastUpdate: lastUpdate || null,
            count: allArticles.length,
            source: 'redis',
        });
    } catch (err) {
        console.error('[뉴스API] Redis 읽기 오류:', err.message);
        return res.status(200).json({
            success: true, data: [], lastUpdate: null, count: 0,
            source: 'error', error: err.message,
        });
    }
}
