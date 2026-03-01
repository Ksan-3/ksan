// /api/news — Vercel KV에서 뉴스 데이터를 읽어 반환
// 크론(/api/cron/fetch-news)이 KV에 저장한 데이터를 읽기만 합니다.

import { kv } from '@vercel/kv';

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
        // KV에서 뉴스 데이터 읽기
        const newsData = await kv.get(KV_KEY);
        const lastUpdate = await kv.get('news_last_updated');

        if (!newsData || Object.keys(newsData).length === 0) {
            // KV에 데이터가 없으면 빈 배열 반환
            // 프론트엔드에서 정적 폴백 데이터를 사용합니다.
            return res.status(200).json({
                success: true,
                data: [],
                lastUpdate: null,
                count: 0,
                source: 'empty',
            });
        }

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
            source: 'kv',
        });
    } catch (err) {
        console.error('[뉴스API] KV 읽기 오류:', err);
        // KV 연결 실패 시에도 빈 배열 반환 (프론트엔드 폴백 사용)
        return res.status(200).json({
            success: true,
            data: [],
            lastUpdate: null,
            count: 0,
            source: 'error',
            error: err.message,
        });
    }
}
