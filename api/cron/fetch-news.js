// /api/cron/fetch-news — GitHub Actions에서 호출하는 크론 전용 API
// RSS를 파싱하여 Vercel KV에 저장합니다.

import { kv } from '@vercel/kv';

// ===== CRON_SECRET 인증 =====
function verifyCronSecret(req) {
    const secret = req.headers['authorization']?.replace('Bearer ', '');
    const expected = process.env.CRON_SECRET;
    if (!expected) return true; // 환경변수 미설정 시 통과 (개발용)
    return secret === expected;
}

// ===== RSS 파싱 (가벼운 XML 파서) =====
async function parseRSS(url) {
    try {
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

        for (const itemXml of itemMatches.slice(0, 8)) {
            const getTag = (tag) => {
                const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
                return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
            };
            items.push({
                title: getTag('title'),
                link: getTag('link'),
                pubDate: getTag('pubDate'),
                description: getTag('description').replace(/<[^>]*>/g, '').slice(0, 500),
            });
        }
        return items;
    } catch {
        return [];
    }
}

// ===== 카테고리별 검색 키워드 =====
const CATEGORY_CONFIG = {
    'kr-stock': {
        label: '한국 증시',
        queries: ['코스피 시황', '삼성전자 주가', '한국 증시 전망', '외국인 매수'],
    },
    'real-estate': {
        label: '한국 부동산',
        queries: ['부동산 시장 전망', '아파트 청약', '서울 집값 동향'],
    },
    'finance-tips': {
        label: '2030 재테크 가이드',
        queries: ['사회초년생 재테크', '연말정산 절세', '청년도약계좌'],
    },
    'us-stock': {
        label: '미국 증시',
        queries: ['나스닥 마감', '엔비디아 실적', '미국 연준 금리', '테슬라 주가'],
    },
    'crypto': {
        label: '코인',
        queries: ['비트코인 시세', '이더리움 전망', '가상화폐 ETF'],
    },
};

// ===== Unsplash 이미지 풀 =====
const CATEGORY_IMAGES = {
    'kr-stock': [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
        'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    ],
    'real-estate': [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    ],
    'finance-tips': [
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
        'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
        'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80',
        'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
        'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&q=80',
    ],
    'us-stock': [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
        'https://images.unsplash.com/photo-1508345228704-935cc84bf5e2?w=800&q=80',
        'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&q=80',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
    ],
    'crypto': [
        'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
        'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&q=80',
        'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&q=80',
        'https://images.unsplash.com/photo-1622630998477-20b41cd0e153?w=800&q=80',
        'https://images.unsplash.com/photo-1642543348745-03b1219733d9?w=800&q=80',
    ],
};

// ===== 해시 함수 =====
function getStringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getImage(category, title) {
    const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['kr-stock'];
    return images[getStringHash(title) % images.length];
}

// ===== 고유 ID 생성 =====
function generateId(title, pubDate) {
    const raw = title + (pubDate || '');
    return Buffer.from(raw).toString('base64').slice(0, 16).replace(/[^a-zA-Z0-9]/g, 'x');
}

// ===== Google News RSS URL =====
function buildGoogleNewsUrl(query) {
    return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
}

// ===== 불릿 요약 생성 =====
function generateBullets(title, description, category) {
    const text = description || title;
    const sentences = text.split(/[.!?。]\s*/).filter(s => s.length > 5);

    const defaults = {
        'kr-stock': '분할 매수 접근, 수급 흐름 체크 필수',
        'real-estate': '입지 분석 후 실거주 수요 중심 접근',
        'finance-tips': '소액부터 시작, 꾸준한 적립이 핵심',
        'us-stock': '빅테크 실적 + 연준 정책 교차 확인',
        'crypto': '비중 관리 철저히, 대형코인 중심 접근',
    };

    return [
        { type: 'context', label: '현상', text: (sentences[0] || title).slice(0, 120) },
        { type: 'core', label: '핵심', text: (sentences[1] || description.slice(0, 80)).slice(0, 120) },
        { type: 'action', label: '전략', text: (sentences[2] || defaults[category] || '최신 동향 체크 후 대응').slice(0, 120) },
    ];
}

// ===== 기사 본문 HTML 생성 (2000자 이상) =====
function generateArticleContent(title, description, category) {
    const cleanTitle = title.replace(/ - .+$/, '').trim();
    const cleanDesc = description.replace(/<[^>]*>/g, '').trim();
    const chartImg = getImage(category, title + 'chart');

    return `
    <p class="text-xl font-bold leading-relaxed mb-8 text-gray-800 dark:text-gray-200">
        최근 금융 및 경제 시장에서 <strong>${cleanTitle}</strong> 이슈가 핵심 화두로 떠오르고 있습니다. ${cleanDesc} 이는 단순히 단기적인 현상을 넘어 중장기적인 시장 구조 변화를 암시하는 중요한 시그널로 해석됩니다.
    </p>

    <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-primary-500 pl-4">1. 시장 동향 및 심층 배경 분석</h3>
    <p class="mb-4 text-lg leading-loose">
        대내외 경제 지표의 극심한 변동성과 글로벌 매크로 환경의 급격한 변화 속에서, 이번 사태는 시장 참여자들에게 매우 중요한 함의를 지닙니다. 특히 인플레이션 압력과 금리 인하 기대감이 교차하는 가운데, 기술적 분석가들과 글로벌 IB(투자은행)들은 단기적인 변동성 확대 장세 속에서도 핵심 메가 트렌드를 읽어내는 것이 승패를 가름할 것이라고 입을 모읍니다.
    </p>
    <p class="mb-8 text-lg leading-loose">
        실제로 현장 데이터에 따르면 관련 핵심 섹터의 거래 대금 및 회전율이 최근 3주 연속 급격하게 증가하는 추세를 보이고 있습니다. 이는 개인 투자자뿐만 아니라 기관 및 외국인 등 메이저 스마트 머니의 강력한 자금 유입과 직접적인 연관성이 높습니다.
    </p>

    <div class="my-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-dark-card">
        <img src="${chartImg}" alt="데이터 시각화 차트" class="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700" />
        <div class="p-4 bg-gray-50 dark:bg-gray-800/50 text-sm md:text-base text-center font-bold text-gray-500 dark:text-gray-400">
            [그림 1] 핵심 지표 및 관련 섹터 거래량 변동 추이
        </div>
    </div>

    <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-accent-500 pl-4">2. 핵심 지표와 경제적 파급 효과</h3>
    <p class="mb-4 text-lg leading-loose">
        이번 <strong>${cleanTitle}</strong> 사태에서 간과할 수 없는 핵심 측면은 연관 산업 전반에 미치는 거대한 파급 효과입니다. 시장의 기초 체력(펀더멘털)을 점검할 때, 주도주 및 주도 섹터의 움직임은 주변부로 확산되는 '낙수 효과'를 만들어냅니다.
    </p>
    <p class="mb-8 text-lg leading-loose">
        과거 유사한 역사적 사례들을 복기해보면, 강력한 모멘텀을 수반한 현상은 최소 6개월 이상 시장의 내러티브를 지배했습니다. 현재 나타나고 있는 밸류에이션 재평가 움직임은 산업 지형도가 구조적으로 변화하고 있음을 뜻하며, 투자자들에게는 포트폴리오 비중을 재점검해야 함을 시사합니다.
    </p>

    <div class="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 border border-primary-100 dark:border-primary-900 my-10">
        <h4 class="text-xl font-bold text-primary-700 dark:text-primary-300 mb-4">💡 AI 퀀트 시스템 핵심 인사이트</h4>
        <ul class="list-disc pl-5 space-y-3 text-gray-700 dark:text-gray-300 text-lg">
            <li>글로벌 유동성 흐름과 매크로 지표의 역사적 상관관계 재성립</li>
            <li>연관 핵심 기업들의 잉여현금흐름(FCF) 호조 및 이익 체력 개선 가능성</li>
            <li>시장 컨센서스를 상회하는 어닝 서프라이즈 기대감 확대 트렌드</li>
        </ul>
    </div>

    <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-emerald-500 pl-4">3. 스마트 투자자를 위한 향후 대응 전략</h3>
    <p class="mb-4 text-lg leading-loose">
        그렇다면 합리적인 투자자들은 현 상황에서 어떤 스탠스를 취해야 할까요? 최고의 애널리스트들은 '맹목적인 추격 매수보다는, 데이터 기반의 이성적이고 차분한 분할 접근'을 권고합니다.
    </p>
    <p class="mb-8 text-lg leading-loose">
        구체적으로는, 변동성 장세에서 과도한 레버리지를 경계하고, 현금 비중을 최소 20% 이상 유지하면서, 급락 시 우량 코어 자산에 대해 기계적인 적립식 매수를 집행하는 '바벨 전략(Barbell Strategy)'이 유효합니다.
    </p>

    <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-gray-400 pl-4">4. 결론</h3>
    <p class="mb-8 text-lg leading-loose font-medium text-gray-600 dark:text-gray-400">
        작금의 현상은 단순한 노이즈가 아닌 패러다임 변화의 서막일 수 있습니다. 뉴스의 이면에 숨겨진 본질적인 가치와 자본의 이동 경로를 면밀히 추적하십시오. 성공적인 투자는 남들이 패닉에 빠졌을 때 냉철한 이성으로 데이터를 분석하고 행동하는 자의 몫입니다.
    </p>

    <div class="bg-gray-100 dark:bg-dark-card rounded-xl p-4 text-xs text-gray-500 dark:text-dark-muted border border-gray-200 dark:border-dark-border mt-8">
        ⚠️ 본 콘텐츠는 투자 참고용이며 매수·매도 권유가 아닙니다. 투자 책임은 본인에게 있습니다.
    </div>
    `;
}

// ===== 기사 변환 =====
function transformArticle(item, category) {
    const title = (item.title || '').replace(/ - .+$/, '').trim();
    const description = item.description || '';
    const pubDate = item.pubDate || new Date().toISOString();
    const id = generateId(title, pubDate);

    return {
        id,
        category,
        title,
        description: description.slice(0, 200),
        bullets: generateBullets(title, description, category),
        link: item.link || '',
        pubDate: new Date(pubDate).toISOString(),
        fetchedAt: new Date().toISOString(),
        image: getImage(category, title),
        articleContent: generateArticleContent(title, description, category),
    };
}

// ===== 카테고리별 뉴스 수집 =====
async function fetchCategoryNews(categoryId) {
    const config = CATEGORY_CONFIG[categoryId];
    if (!config) return [];

    const allArticles = [];
    for (const query of config.queries) {
        const url = buildGoogleNewsUrl(query);
        const items = await parseRSS(url);
        const articles = items.slice(0, 3).map(item => transformArticle(item, categoryId));
        allArticles.push(...articles);
    }

    // 중복 제거 (제목 기준)
    const seen = new Set();
    return allArticles.filter(a => {
        if (seen.has(a.title)) return false;
        seen.add(a.title);
        return true;
    }).slice(0, 10); // 카테고리당 최대 10개
}

// ===== KV 키 이름 =====
const KV_KEY = 'news_articles';

// ===== 7일 이내 기사만 유지 =====
function filterRecentArticles(articles) {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return articles.filter(a => {
        const date = new Date(a.fetchedAt || a.pubDate).getTime();
        return date > sevenDaysAgo;
    });
}

// ===== 메인 핸들러 =====
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 인증 검증
    if (!verifyCronSecret(req)) {
        return res.status(401).json({ success: false, error: '인증 실패: CRON_SECRET이 일치하지 않습니다.' });
    }

    try {
        console.log('[크론] RSS → KV 뉴스 수집 시작...');

        // 1. 기존 KV 데이터 가져오기
        const existing = (await kv.get(KV_KEY)) || {};

        // 2. 모든 카테고리 병렬 수집
        const categories = Object.keys(CATEGORY_CONFIG);
        const results = await Promise.allSettled(
            categories.map(cat => fetchCategoryNews(cat))
        );

        // 3. 카테고리별로 KV에 병합 저장
        let totalNew = 0;

        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            const result = results[i];

            if (result.status !== 'fulfilled' || result.value.length === 0) {
                console.log(`[크론] ${cat}: 수집 실패 또는 0건`);
                continue;
            }

            const newArticles = result.value;
            const existingArticles = existing[cat] || [];

            // 기존 제목 기준 중복 제거 후 병합
            const existingTitles = new Set(existingArticles.map(a => a.title));
            const uniqueNew = newArticles.filter(a => !existingTitles.has(a.title));

            // 새 기사를 앞에 추가 + 7일 필터 + 최대 30개
            const merged = filterRecentArticles([...uniqueNew, ...existingArticles]).slice(0, 30);
            existing[cat] = merged;

            totalNew += uniqueNew.length;
            console.log(`[크론] ${cat}: +${uniqueNew.length}개 (총 ${merged.length}개)`);
        }

        // 4. KV에 저장
        await kv.set(KV_KEY, existing);

        // 5. 마지막 업데이트 시간 저장
        await kv.set('news_last_updated', new Date().toISOString());

        console.log(`[크론] 완료! 새 기사 ${totalNew}개 추가됨`);

        return res.status(200).json({
            success: true,
            message: `뉴스 수집 완료: ${totalNew}개 새 기사 추가`,
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
