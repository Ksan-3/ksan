// /api/cron/generate-articles — Gemini AI 기반 오리지널 기사 생성 크론 API
// 매일 오전 9시 KST에 GitHub Actions에서 호출
// 1) Google News RSS에서 오늘의 핵심 뉴스 수집
// 2) Gemini AI로 인스타 스타일 오리지널 분석 기사 생성
// 3) Vercel KV(Redis)에 저장

import Redis from 'ioredis';

// ===== Redis 연결 =====
let redis;
function getRedis() {
    if (!redis) {
        const url = process.env.REDIS_URL || process.env.KV_URL;
        if (!url) return null;
        redis = new Redis(url, {
            maxRetriesPerRequest: 2,
            connectTimeout: 8000,
            lazyConnect: true,
            tls: url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
        });
    }
    return redis;
}

// ===== CRON_SECRET 인증 =====
function verifyCronSecret(req) {
    const secret = req.headers['authorization']?.replace('Bearer ', '');
    const expected = process.env.CRON_SECRET;
    if (!expected) return true;
    return secret === expected;
}

// ===== RSS 뉴스 수집 (간단한 XML 파서) =====
async function fetchNewsFromRSS(query) {
    try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml',
            },
            signal: AbortSignal.timeout(10000),
        });
        const text = await response.text();
        const items = [];
        const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];

        for (const itemXml of itemMatches.slice(0, 5)) {
            const getTag = (tag) => {
                const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i'));
                return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
            };
            items.push({
                title: getTag('title').replace(/ - .+$/, '').trim(),
                description: getTag('description').replace(/<[^>]*>/g, '').slice(0, 500),
                pubDate: getTag('pubDate'),
                link: getTag('link'),
            });
        }
        return items;
    } catch {
        return [];
    }
}

// ===== 카테고리 설정 =====
const CATEGORIES = {
    'kr-stock': {
        label: '한국 증시', emoji: '📈',
        queries: ['코스피 시황 오늘', '한국 증시 핵심 뉴스'],
    },
    'us-stock': {
        label: '미국 증시', emoji: '🇺🇸',
        queries: ['나스닥 마감 오늘', '미국 증시 핵심 뉴스'],
    },
    'real-estate': {
        label: '한국 부동산', emoji: '🏠',
        queries: ['부동산 시장 오늘 뉴스', '아파트 매매 동향'],
    },
    'finance-tips': {
        label: '2030 재테크 가이드', emoji: '💡',
        queries: ['사회초년생 재테크 팁', '절세 재테크 방법'],
    },
    'crypto': {
        label: '코인', emoji: '🪙',
        queries: ['비트코인 시세 오늘', '가상화폐 시장 동향'],
    },
};

// ===== 카테고리별 Unsplash 이미지 =====
const CATEGORY_IMAGES = {
    'kr-stock': [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
    ],
    'us-stock': [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        'https://images.unsplash.com/photo-1508345228704-935cc84bf5e2?w=800&q=80',
        'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&q=80',
    ],
    'real-estate': [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    ],
    'finance-tips': [
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
        'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
        'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80',
    ],
    'crypto': [
        'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
        'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&q=80',
        'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&q=80',
    ],
};

function getImage(category, seed) {
    const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['kr-stock'];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    return images[Math.abs(hash) % images.length];
}

// ===== 고유 ID 생성 =====
function generateId(prefix) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).slice(2, 6);
    return `${prefix}_${dateStr}_${rand}`;
}

// ===== Gemini AI 기사 생성 =====
async function generateArticleWithGemini(category, catConfig, newsList) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log('[AI] GEMINI_API_KEY 미설정, 폴백 기사 생성');
        return generateFallbackArticle(category, catConfig, newsList);
    }

    const newsContext = newsList.map((n, i) => `${i + 1}. ${n.title}\n   ${n.description}`).join('\n');

    const prompt = `당신은 '데일리 재테크 픽'의 전문 금융 라이터입니다.
아래 오늘의 뉴스를 기반으로 ${catConfig.label} 분야의 분석 기사를 작성하세요.

[오늘의 핵심 뉴스]
${newsContext}

[작성 규칙]
1. 제목: 이모지 + 강렬하고 호기심을 자극하는 제목 (30자 이내)
2. 3줄 요약: "현상", "핵심", "전략" 각 1줄씩 (각 50자 이내)
3. 본문: 아래 HTML 형식으로 1500자 이상 오리지널 분석 작성
4. 뉴스를 그대로 복사하지 말고, 자체적인 시각과 분석을 담아 새롭게 작성
5. 투자 판단에 도움이 되는 실질적 인사이트 제공
6. 감정적 표현보다 데이터와 논리 기반 분석

[본문 HTML 형식]
- 도입부: <p class="text-xl font-black mb-6">강렬한 첫 문장</p>
- 핵심 박스: <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">수치/팩트</div>
- 소제목: <h3 class="text-xl font-black mt-8 mb-4">📊 소제목</h3>
- 본문: <p class="mb-4 text-lg leading-relaxed">분석 단락</p>
- 전략 박스: <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6"><ul class="space-y-3 text-base"><li>✅ 전략1</li><li>⚠️ 주의사항</li></ul></div>

[출력 형식 — JSON만 반환, 다른 텍스트 없이]
{
  "title": "이모지 + 제목",
  "bullet_context": "현상 요약",
  "bullet_core": "핵심 포인트",
  "bullet_action": "투자 전략",
  "articleContent": "<본문 HTML>"
}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.85,
                        topP: 0.95,
                        maxOutputTokens: 4096,
                        responseMimeType: 'application/json',
                    },
                }),
                signal: AbortSignal.timeout(30000),
            }
        );

        const result = await response.json();
        const textContent = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            console.log('[AI] Gemini 응답 비어있음, 폴백 기사 생성');
            return generateFallbackArticle(category, catConfig, newsList);
        }

        // JSON 파싱 (코드블록 제거)
        const cleanJson = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
            title: parsed.title || `${catConfig.emoji} ${catConfig.label} 오늘의 분석`,
            bullets: [
                { type: 'context', label: '현상', text: (parsed.bullet_context || '').slice(0, 120) },
                { type: 'core', label: '핵심', text: (parsed.bullet_core || '').slice(0, 120) },
                { type: 'action', label: '전략', text: (parsed.bullet_action || '').slice(0, 120) },
            ],
            articleContent: parsed.articleContent || '',
            source: 'ai-generated',
        };
    } catch (err) {
        console.error('[AI] Gemini API 오류:', err.message);
        return generateFallbackArticle(category, catConfig, newsList);
    }
}

// ===== 폴백 기사 (Gemini API 키 없을 때) =====
function generateFallbackArticle(category, catConfig, newsList) {
    const topNews = newsList[0] || { title: `${catConfig.label} 시장 동향`, description: '' };
    const title = `${catConfig.emoji} ${topNews.title}`;
    const desc = topNews.description || '오늘의 시장 핵심 동향을 분석합니다.';

    return {
        title,
        bullets: [
            { type: 'context', label: '현상', text: topNews.title.slice(0, 120) },
            { type: 'core', label: '핵심', text: desc.slice(0, 120) },
            { type: 'action', label: '전략', text: '자세한 분석은 본문을 확인해주세요.' },
        ],
        articleContent: `
        <p class="text-xl font-black mb-6">${title}</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold text-red-700 dark:text-red-300">📌 오늘의 핵심</p>
            <p class="text-base">${desc}</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 시장 분석</h3>
        <p class="mb-4 text-lg leading-relaxed">${desc} 현재 시장 상황을 면밀히 분석한 결과, 이번 이슈는 단기적인 변동성을 넘어 중장기적인 시장 구조에 영향을 미칠 수 있는 중요한 시그널입니다.</p>
        <p class="mb-6 text-lg leading-relaxed">투자자들은 감정에 휘둘리지 않고 데이터 기반의 냉철한 분석으로 대응하는 것이 바람직합니다. 분할 매수와 포트폴리오 분산을 통해 리스크를 관리하면서 기회를 포착하시기 바랍니다.</p>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 핵심 뉴스 기반 시장 흐름 파악</li>
                <li>✅ 분할 매수로 리스크 관리</li>
                <li>⚠️ 과도한 레버리지 사용 자제</li>
            </ul>
        </div>
        <div class="bg-gray-100 dark:bg-dark-card rounded-xl p-4 text-xs text-gray-500 dark:text-dark-muted border border-gray-200 dark:border-dark-border mt-8">
            ⚠️ 본 콘텐츠는 투자 참고용이며 매수·매도 권유가 아닙니다. 투자 책임은 본인에게 있습니다.
        </div>`,
        source: 'fallback',
    };
}

// ===== 오늘 어떤 카테고리를 생성할지 결정 =====
function getTodayCategories() {
    // 매일 5개 기사: 5개 카테고리에서 각 1개씩
    return Object.keys(CATEGORIES);
}

// ===== KV 키 이름 =====
const KV_KEY = 'news_articles';

// ===== 30일 이내 기사만 유지 =====
function filterRecentArticles(articles) {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return articles.filter(a => {
        const date = new Date(a.fetchedAt || a.pubDate).getTime();
        return date > thirtyDaysAgo;
    });
}

// ===== 메인 핸들러 =====
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 인증 검증
    if (!verifyCronSecret(req)) {
        return res.status(401).json({ success: false, error: '인증 실패' });
    }

    try {
        console.log('[크론] AI 기사 생성 시작...');

        const client = getRedis();
        if (!client) {
            return res.status(500).json({
                success: false,
                error: 'Redis 연결 실패: REDIS_URL 또는 KV_URL 환경변수가 없습니다.',
            });
        }

        await client.connect().catch(() => { });

        // 1. 기존 Redis 데이터 가져오기
        const raw = await client.get(KV_KEY);
        const existing = raw ? JSON.parse(raw) : {};

        // 2. 오늘 생성할 카테고리들
        const todayCategories = getTodayCategories();
        let totalGenerated = 0;

        for (const catId of todayCategories) {
            const catConfig = CATEGORIES[catId];
            console.log(`[크론] ${catConfig.emoji} ${catConfig.label} 기사 생성 중...`);

            // 2a. RSS에서 오늘의 뉴스 수집
            let allNews = [];
            for (const query of catConfig.queries) {
                const items = await fetchNewsFromRSS(query);
                allNews.push(...items);
            }

            // 중복 제거
            const seen = new Set();
            allNews = allNews.filter(n => {
                if (seen.has(n.title)) return false;
                seen.add(n.title);
                return true;
            }).slice(0, 5);

            if (allNews.length === 0) {
                console.log(`[크론] ${catId}: 뉴스 수집 실패, 스킵`);
                continue;
            }

            // 2b. Gemini AI로 기사 생성
            const generated = await generateArticleWithGemini(catId, catConfig, allNews);

            // 2c. 기사 객체 조립
            const articleId = generateId(catId);
            const now = new Date().toISOString();
            const article = {
                id: articleId,
                category: catId,
                title: generated.title,
                description: (generated.bullets[0]?.text || '') + ' ' + (generated.bullets[1]?.text || ''),
                bullets: generated.bullets,
                pubDate: now,
                fetchedAt: now,
                image: getImage(catId, articleId),
                articleContent: generated.articleContent,
                source: generated.source || 'ai-generated',
                newsReferences: allNews.slice(0, 3).map(n => ({ title: n.title, link: n.link })),
            };

            // 2d. 기존 데이터에 병합
            const existingArticles = existing[catId] || [];
            const merged = filterRecentArticles([article, ...existingArticles]).slice(0, 50);
            existing[catId] = merged;

            totalGenerated++;
            console.log(`[크론] ${catId}: ✅ "${generated.title}" 생성 완료 (${generated.source})`);
        }

        // 3. Redis에 저장
        await client.set(KV_KEY, JSON.stringify(existing));
        await client.set('news_last_updated', new Date().toISOString());

        console.log(`[크론] 완료! ${totalGenerated}개 기사 생성됨`);

        return res.status(200).json({
            success: true,
            message: `AI 기사 생성 완료: ${totalGenerated}개`,
            lastUpdate: new Date().toISOString(),
            stats: Object.fromEntries(
                Object.entries(existing).map(([cat, articles]) => [cat, articles.length])
            ),
        });
    } catch (err) {
        console.error('[크론] 치명적 오류:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}
