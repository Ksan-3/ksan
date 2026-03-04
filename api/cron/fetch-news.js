// /api/cron/fetch-news — GitHub Actions에서 호출하는 크론 전용 API
// RSS를 파싱하여 Redis에 저장합니다.

import Redis from 'ioredis';

// Redis 연결
let redis;
function getRedis() {
    if (!redis) {
        const url = process.env.REDIS_URL;
        if (!url) return null;
        redis = new Redis(url, {
            maxRetriesPerRequest: 2,
            connectTimeout: 8000,
            lazyConnect: true,
        });
    }
    return redis;
}

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

// ===== 카테고리별 본문 구성 템플릿 =====
const CATEGORY_TEMPLATES = {
    'kr-stock': {
        sections: [
            {
                title: '코스피·코스닥 시장 흐름', icon: 'border-red-500',
                body: (t, d) => `<p class="mb-4 text-lg leading-loose">오늘 국내 증시에서 <strong>${t}</strong>가 투자자들의 집중 관심을 받고 있습니다. ${d} 코스피 시가총액 상위 종목들의 수급 흐름을 보면, 외국인과 기관의 동향이 개인 투자자와 뚜렷한 차이를 보이고 있어 주목됩니다.</p><p class="mb-8 text-lg leading-loose">특히 반도체·2차전지·바이오 등 주도 섹터의 업종별 등락률과 거래대금 변화를 교차 분석하면, 단기 모멘텀 트레이딩과 중장기 밸류 투자의 접점을 발견할 수 있습니다. 증권사 리서치센터들은 현재 시장의 PER(주가수익비율)과 PBR(주가순자산비율) 밴드를 기준으로 매수·매도 구간을 설정할 것을 권고하고 있습니다.</p>`
            },
            {
                title: '외국인·기관 수급 분석', icon: 'border-blue-500',
                body: (t) => `<p class="mb-4 text-lg leading-loose">프로그램 매매와 외국인 순매수·순매도 동향은 ${t} 관련 섹터의 향후 방향성을 가늠하는 핵심 지표입니다. 최근 외국인 연속 순매수 종목군과 기관 순매도 종목군이 교차하는 현상이 나타나고 있어, 스마트 머니의 포지션 전환을 시사합니다.</p><p class="mb-8 text-lg leading-loose">공매도 잔고율 변화, 대차잔고 추이, 그리고 옵션시장의 풋콜비율(PCR)을 종합적으로 검토하면 시장 센티먼트를 보다 정밀하게 진단할 수 있습니다. 현 시점에서 투자자들은 변동성 확대에 대비한 헤지 전략을 병행하는 것이 바람직합니다.</p>`
            },
            {
                title: '실전 투자 전략', icon: 'border-emerald-500',
                body: () => `<p class="mb-4 text-lg leading-loose">국내 증시에서 성공적인 투자를 위해서는 종목 선정 시 재무제표 기반의 기본적 분석과 차트 기반의 기술적 분석을 모두 활용해야 합니다. 특히 분기 실적 시즌에는 어닝 서프라이즈·쇼크 가능성을 사전에 점검하는 습관이 중요합니다.</p><p class="mb-8 text-lg leading-loose">포트폴리오 구성 시 단일 종목 집중보다는 섹터 분산, 시가총액 분산을 통해 비체계적 리스크를 줄이되, 확신이 높은 테마주에는 비중을 다소 높이는 '코어-새틀라이트' 전략이 유효합니다.</p>`
            },
        ],
        insight: ['코스피 200 지수 기술적 지지·저항 레벨 점검 필수', '업종별 실적 컨센서스 대비 괴리율 모니터링', '프로그램 매매·외국인 수급의 방향성 전환 시그널 포착'],
    },
    'us-stock': {
        sections: [
            {
                title: '월가 핵심 이슈와 매크로 환경', icon: 'border-blue-600',
                body: (t, d) => `<p class="mb-4 text-lg leading-loose">미국 증시에서 <strong>${t}</strong>가 핵심 이슈로 떠오르고 있습니다. ${d} S&P 500과 나스닥 지수의 흐름은 연준(Fed)의 통화정책 방향, 고용지표, CPI(소비자물가지수) 등 매크로 데이터에 민감하게 반응하고 있습니다.</p><p class="mb-8 text-lg leading-loose">현재 시장은 금리 인하 시기와 폭을 둘러싼 베팅이 치열합니다. CME FedWatch 툴에 따르면 시장 참여자들의 금리 전망이 최근 급격히 변화하고 있으며, 이는 채권 수익률 변동을 통해 주식시장 밸류에이션에 직접적인 영향을 미칩니다.</p>`
            },
            {
                title: '빅테크·AI 섹터 분석', icon: 'border-purple-500',
                body: (t) => `<p class="mb-4 text-lg leading-loose">${t}의 파급효과는 특히 빅테크 기업들의 실적과 가이던스에서 극명하게 드러납니다. 마이크로소프트, 애플, 엔비디아, 구글, 아마존, 메타, 테슬라 등 매그니피센트 7의 합산 시가총액 변동은 전체 시장 지수를 좌우할 만큼 막대한 영향력을 보유하고 있습니다.</p><p class="mb-8 text-lg leading-loose">특히 AI 혁명이 가속화되면서 반도체(GPU·NPU), 클라우드 인프라, 엔터프라이즈 SaaS 등 AI 밸류체인 전반에 걸친 실적 호조가 기대됩니다. 다만, 높아진 밸류에이션에 대한 경계심도 간과할 수 없는 요소입니다.</p>`
            },
            {
                title: '미국 주식 투자 전략', icon: 'border-emerald-500',
                body: () => `<p class="mb-4 text-lg leading-loose">해외 주식 투자 시 환율 리스크 관리가 수익률에 큰 영향을 미칩니다. 원·달러 환율 추이를 모니터링하면서 환헤지 여부를 결정하고, 적립식 매수를 통해 환율 변동 리스크를 분산하는 전략이 효과적입니다.</p><p class="mb-8 text-lg leading-loose">ETF를 활용한 인덱스 투자와 개별 종목 직접 투자를 병행하되, 미국 시장의 세금 체계(배당소득세 15%, 양도소득세 250만원 공제)를 이해하고 절세 전략을 미리 수립하는 것이 현명한 투자자의 자세입니다.</p>`
            },
        ],
        insight: ['FOMC 회의 일정 및 연준 위원 발언 스케줄 추적', '미국 10년물 국채 수익률과 기술주 상관관계 모니터링', '빅테크 분기 실적 발표 일정별 옵션 스트래들 전략 검토'],
    },
    'real-estate': {
        sections: [
            {
                title: '부동산 시장 현황 분석', icon: 'border-emerald-600',
                body: (t, d) => `<p class="mb-4 text-lg leading-loose">국내 부동산 시장에서 <strong>${t}</strong>가 주요 관심사로 떠올랐습니다. ${d} 한국부동산원과 KB부동산의 주간 시세 데이터를 종합 분석하면, 수도권과 지방의 양극화 현상이 뚜렷하게 나타나고 있습니다.</p><p class="mb-8 text-lg leading-loose">서울 핵심 입지의 아파트 매매가는 전주 대비 상승세를 유지하는 반면, 외곽 지역과 지방 중소도시는 하락 압력이 지속되고 있습니다. 전세시장 역시 금리 변동에 따른 수요 이동이 활발하며, 전세가율 변화를 통해 향후 매매가 방향을 예측할 수 있습니다.</p>`
            },
            {
                title: '정책·규제 변화와 영향', icon: 'border-amber-500',
                body: (t) => `<p class="mb-4 text-lg leading-loose">${t}와 관련하여 정부의 부동산 정책 방향이 시장에 미치는 영향은 절대적입니다. 대출 규제(DSR·LTV), 세제 변화(취득세·종합부동산세·양도소득세), 그리고 신규 택지 공급 계획 등을 면밀히 추적해야 합니다.</p><p class="mb-8 text-lg leading-loose">최근 발표된 청약 제도 개편안, 재개발·재건축 규제 완화 등 정책 시그널은 특정 지역과 물건 유형에 직접적인 가격 영향을 미칩니다. 투자자들은 관보와 국토교통부 보도자료를 통해 정책 변화를 선제적으로 파악하는 것이 중요합니다.</p>`
            },
            {
                title: '부동산 실전 투자 전략', icon: 'border-blue-500',
                body: () => `<p class="mb-4 text-lg leading-loose">부동산 투자에서 가장 중요한 원칙은 '입지'입니다. 교통(GTX·신규 지하철), 학군, 생활 인프라, 개발 호재 등 입지 요소를 종합적으로 평가한 뒤, 실거주 수요가 탄탄한 지역을 중심으로 접근해야 합니다.</p><p class="mb-8 text-lg leading-loose">레버리지(대출)를 활용할 경우 금리 변동 시나리오별 상환 능력을 사전에 점검하고, 공실 리스크와 유지보수 비용을 감안한 실질 수익률을 계산하는 습관이 필요합니다. 무리한 갭투자보다는 안정적인 현금흐름을 확보하는 전략이 장기적으로 유리합니다.</p>`
            },
        ],
        insight: ['주간 아파트 매매·전세 가격 지수 추이 추적', 'GTX·신규 교통 노선 개통 일정별 수혜 지역 사전 분석', '정부 부동산 정책 발표 캘린더 모니터링'],
    },
    'finance-tips': {
        sections: [
            {
                title: '2030 세대 맞춤 재테크 현황', icon: 'border-amber-500',
                body: (t, d) => `<p class="mb-4 text-lg leading-loose"><strong>${t}</strong>는 사회초년생과 2030 세대에게 매우 실용적인 재테크 주제입니다. ${d} 월급 관리부터 시작하여 비상금 확보, 소액 투자, 절세 전략까지 체계적인 재무 설계가 미래의 자산 격차를 결정합니다.</p><p class="mb-8 text-lg leading-loose">통계청에 따르면 2030 세대의 평균 저축률은 전 세대 대비 낮은 편이지만, 투자에 대한 관심도는 가장 높습니다. 이런 세대적 특성을 감안하면 '저축 → 투자 → 절세' 순서의 단계별 접근이 효과적이며, 각 단계별 구체적 실행 방법을 숙지하는 것이 중요합니다.</p>`
            },
            {
                title: '실전 절세·저축 가이드', icon: 'border-green-500',
                body: (t) => `<p class="mb-4 text-lg leading-loose">${t}와 관련하여 가장 먼저 챙겨야 할 것은 세금 혜택이 있는 금융 상품입니다. 청년도약계좌, ISA(개인종합자산관리계좌), 연금저축펀드, IRP(개인형 퇴직연금) 등은 소득공제와 비과세 혜택을 동시에 누릴 수 있는 필수 상품입니다.</p><p class="mb-8 text-lg leading-loose">연말정산 시즌에는 신용카드·체크카드 사용 비율 최적화, 월세 세액공제, 의료비·교육비 공제 등 놓치기 쉬운 항목들을 미리 체크리스트로 관리하면 수십만 원의 환급액 차이가 발생합니다. 매달 자동이체를 통해 '지출 전 저축'을 습관화하는 것도 핵심 전략입니다.</p>`
            },
            {
                title: '소액 투자 실전 전략', icon: 'border-purple-500',
                body: () => `<p class="mb-4 text-lg leading-loose">월 10만 원부터 시작할 수 있는 적립식 펀드, ETF 자동매수, 소수점 주식 투자 등은 투자 경험이 적은 사회초년생에게 최적의 시작점입니다. 중요한 것은 금액의 크기가 아니라 '꾸준함'과 '복리의 마법'을 이해하는 것입니다.</p><p class="mb-8 text-lg leading-loose">CMA 통장을 비상금 통장으로 활용하면서, 여유 자금은 글로벌 분산 ETF에 정기적으로 투자하는 방식이 리스크 대비 기대수익률이 가장 뛰어난 전략으로 검증되어 있습니다. 투자 일지를 작성하며 매매 근거를 기록하면 실력 향상에도 크게 도움이 됩니다.</p>`
            },
        ],
        insight: ['청년도약계좌 가입 조건 및 정부 기여금 한도 확인', 'ISA·연금저축·IRP 절세 한도 최적 분배 시뮬레이션', '72의 법칙으로 복리 수익률 목표 설정하기'],
    },
    'crypto': {
        sections: [
            {
                title: '가상자산 시장 동향', icon: 'border-orange-500',
                body: (t, d) => `<p class="mb-4 text-lg leading-loose">암호화폐 시장에서 <strong>${t}</strong>가 핵심 토픽으로 부상했습니다. ${d} 비트코인(BTC) 도미넌스 지수, 총 시가총액(Total Market Cap), 그리고 공포·탐욕 지수(Fear & Greed Index) 등 매크로 지표를 종합적으로 분석하면 현재 시장의 온도를 파악할 수 있습니다.</p><p class="mb-8 text-lg leading-loose">온체인 데이터 분석 결과, 장기 보유자(LTH)와 단기 보유자(STH)의 행동 패턴이 뚜렷하게 분기하고 있습니다. 거래소 유·출입 물량, 채굴자 보유량 변화, 고래(대량 보유 지갑) 동향 등은 가격 움직임을 선행하는 중요한 시그널로 작용합니다.</p>`
            },
            {
                title: '규제·제도 변화와 시장 영향', icon: 'border-red-500',
                body: (t) => `<p class="mb-4 text-lg leading-loose">${t} 이슈와 함께 주목해야 할 것은 각국의 규제 동향입니다. 미국 SEC의 비트코인·이더리움 현물 ETF 승인, 한국의 가상자산이용자보호법, EU의 MiCA 규제 프레임워크 등은 시장 구조를 근본적으로 변화시키고 있습니다.</p><p class="mb-8 text-lg leading-loose">제도권 편입이 가속화될수록 기관 투자자들의 자금 유입이 확대되며, 이는 시장의 변동성을 점차 줄이는 방향으로 작용합니다. 다만 각국별 규제 속도 차이에 따른 차익거래 기회와 규제 리스크를 동시에 고려해야 합니다.</p>`
            },
            {
                title: '가상자산 투자 전략', icon: 'border-emerald-500',
                body: () => `<p class="mb-4 text-lg leading-loose">암호화폐 투자에서 가장 중요한 원칙은 '비중 관리'입니다. 전체 투자 포트폴리오에서 가상자산 비중을 5~15% 범위 내로 설정하고, BTC·ETH 등 시가총액 상위 대형 코인 중심으로 포트폴리오를 구성하는 것이 리스크 관리의 기본입니다.</p><p class="mb-8 text-lg leading-loose">DCA(Dollar Cost Averaging, 분할매수) 전략을 통해 변동성에 대응하고, 콜드월렛을 활용한 자산 보관, 이중 인증(2FA) 설정 등 보안 조치도 반드시 병행해야 합니다. 레버리지·선물 거래는 고위험 상품이므로 충분한 학습 후 소액으로 시작하시기 바랍니다.</p>`
            },
        ],
        insight: ['비트코인 반감기 사이클과 과거 가격 패턴 비교 분석', '온체인 지표(MVRV, SOPR, NVT) 활용한 고·저평가 판단', '거래소별 김치 프리미엄 모니터링으로 시장 과열 감지'],
    },
};

// ===== 기사 본문 HTML 생성 (카테고리별 차별화) =====
function generateArticleContent(title, description, category) {
    const cleanTitle = title.replace(/ - .+$/, '').trim();
    const cleanDesc = description.replace(/<[^>]*>/g, '').trim();
    const chartImg = getImage(category, title + 'chart');
    const template = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES['kr-stock'];

    const sectionsHtml = template.sections.map((sec, i) => `
    <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 ${sec.icon} pl-4">${i + 1}. ${sec.title}</h3>
    ${sec.body(cleanTitle, cleanDesc)}
    `).join('');

    const insightHtml = template.insight.map(item => `<li>${item}</li>`).join('');

    return `
    <p class="text-xl font-bold leading-relaxed mb-8 text-gray-800 dark:text-gray-200">
        <strong>${cleanTitle}</strong> — ${cleanDesc || '최신 시장 동향을 심층 분석합니다.'}
    </p>

    ${sectionsHtml}

    <div class="my-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-dark-card">
        <img src="${chartImg}" alt="${cleanTitle} 관련 데이터 시각화" class="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700" />
        <div class="p-4 bg-gray-50 dark:bg-gray-800/50 text-sm md:text-base text-center font-bold text-gray-500 dark:text-gray-400">
            [그림] ${cleanTitle} 관련 핵심 지표 추이
        </div>
    </div>

    <div class="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 border border-primary-100 dark:border-primary-900 my-10">
        <h4 class="text-xl font-bold text-primary-700 dark:text-primary-300 mb-4">💡 AI 분석 핵심 인사이트</h4>
        <ul class="list-disc pl-5 space-y-3 text-gray-700 dark:text-gray-300 text-lg">
            ${insightHtml}
        </ul>
    </div>

    <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-gray-400 pl-4">결론</h3>
    <p class="mb-8 text-lg leading-loose font-medium text-gray-600 dark:text-gray-400">
        <strong>${cleanTitle}</strong>은(는) 단기적 이벤트를 넘어 중장기 시장 구조에 영향을 미칠 수 있는 중요한 시그널입니다. 감정에 휘둘리지 않고 데이터에 기반한 냉철한 분석으로 대응하시기 바랍니다. 성공적인 투자의 핵심은 정보의 양이 아니라 정보 해석의 질입니다.
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
        console.log('[크론] RSS → Redis 뉴스 수집 시작...');

        const client = getRedis();
        if (!client) {
            return res.status(500).json({ success: false, error: 'Redis 연결 실패: REDIS_URL 환경변수가 없습니다.' });
        }

        await client.connect().catch(() => { });

        // 1. 기존 Redis 데이터 가져오기
        const raw = await client.get(KV_KEY);
        const existing = raw ? JSON.parse(raw) : {};

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

        // 4. Redis에 저장
        await client.set(KV_KEY, JSON.stringify(existing));

        // 5. 마지막 업데이트 시간 저장
        await client.set('news_last_updated', new Date().toISOString());

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
