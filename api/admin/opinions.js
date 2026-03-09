import Redis from 'ioredis';

let redis;
function getRedis() {
    if (!redis) {
        const url = process.env.REDIS_URL || process.env.KV_URL;
        if (!url) return null;
        redis = new Redis(url, {
            maxRetriesPerRequest: 1,
            connectTimeout: 5000,
            lazyConnect: true,
            tls: url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
        });
    }
    return redis;
}

export default async function handler(req, res) {
    // CORS 처리
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const client = getRedis();
        if (!client) {
            return res.status(500).json({ success: false, error: 'Redis 연결 실패' });
        }
        await client.connect().catch(() => { });

        if (req.method === 'GET') {
            const raw = await client.get('expert_opinions');
            const opinions = raw ? JSON.parse(raw) : {};
            return res.status(200).json({ success: true, data: opinions });
        }

        if (req.method === 'POST') {
            const { articleId, customContent, password } = req.body;

            // 관리자 비밀번호 검증
            const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';
            if (password !== ADMIN_PASSWORD) {
                return res.status(401).json({ success: false, error: 'Authorization failed' });
            }

            if (!articleId || !customContent) {
                return res.status(400).json({ success: false, error: 'Missing parameters' });
            }

            // 기존 의견 가져오기
            const raw = await client.get('expert_opinions');
            const opinions = raw ? JSON.parse(raw) : {};

            // 의견 추가/수정
            opinions[articleId] = {
                content: customContent,
                updatedAt: new Date().toISOString()
            };

            await client.set('expert_opinions', JSON.stringify(opinions));
            return res.status(200).json({ success: true, message: 'Opinion saved successfully' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('[Admin API Error]:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}
