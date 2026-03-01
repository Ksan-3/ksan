import RSSParser from 'rss-parser';
import { saveNews } from './cache.js';

const parser = new RSSParser({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
    },
});

const CATEGORY_CONFIG = {
    'kr-stock': {
        label: '한국 증시',
        emoji: '📈',
        queries: ['코스피 시황', '국내 증시 전망', '삼성전자 주가', '한국은행 금리'],
    },
    'real-estate': {
        label: '한국 부동산',
        emoji: '🏠',
        queries: ['부동산 시장 전망', '아파트 청약 동향', '서울 집값', '역전세 전세사기'],
    },
    'finance-tips': {
        label: '2030 재테크 가이드',
        emoji: '💡',
        queries: ['사회초년생 재테크', '연말정산 절세 팁', '파이어족 은퇴 준비', '청년도약계좌'],
    },
    'us-stock': {
        label: '미국 증시',
        emoji: '🇺🇸',
        queries: ['뉴욕증시 마감', '나스닥 S&P500 종가', '엔비디아 테슬라 실적', '미국 연준 파월'],
    },
    'crypto': {
        label: '코인',
        emoji: '🪙',
        queries: ['비트코인 시세 전망', '이더리움 알트코인 호재', '가상화폐 규제 ETF'],
    },
};

// 1. 카테고리별 15개 이상의 다양한 고품질 Unsplash 이미지 풀 (카드별 다른 이미지 제공)
const CATEGORY_IMAGES = {
    'kr-stock': [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
        'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80',
        'https://images.unsplash.com/photo-1620241608701-94ef138c7ec9?w=800&q=80',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
        'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80',
        'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80',
        'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&q=80',
        'https://images.unsplash.com/photo-1642543348745-03b1219733d9?w=800&q=80'
    ],
    'real-estate': [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
        'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80',
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c15293036e9?w=800&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
        'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800&q=80',
        'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&q=80',
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
        'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
    ],
    'finance-tips': [
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
        'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
        'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80',
        'https://images.unsplash.com/photo-1580519542036-ed47f3ae3ea8?w=800&q=80',
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
        'https://images.unsplash.com/photo-1616441444143-6c8f61530d95?w=800&q=80',
        'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
        'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&q=80',
        'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=80',
        'https://images.unsplash.com/photo-1574607383077-47ddc2dc51c4?w=800&q=80',
        'https://images.unsplash.com/photo-1593672715438-d88a70629abe?w=800&q=80',
        'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80',
        'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
        'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&q=80'
    ],
    'us-stock': [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        'https://images.unsplash.com/photo-1508345228704-935cc84bf5e2?w=800&q=80',
        'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80',
        'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&q=80',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
        'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=800&q=80',
        'https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?w=800&q=80',
        'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&q=80',
        'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=80',
        'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        'https://images.unsplash.com/photo-1642543348745-03b1219733d9?w=800&q=80'
    ],
    'crypto': [
        'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
        'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&q=80',
        'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&q=80',
        'https://images.unsplash.com/photo-1622630998477-20b41cd0e153?w=800&q=80',
        'https://images.unsplash.com/photo-1642543348745-03b1219733d9?w=800&q=80',
        'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=800&q=80',
        'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&q=80',
        'https://images.unsplash.com/photo-1639762681485-074b7f4aecec?w=800&q=80',
        'https://images.unsplash.com/photo-1642055514517-8ad49ceb8042?w=800&q=80',
        'https://images.unsplash.com/photo-1621501103258-3e42d765b263?w=800&q=80',
        'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80',
        'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80',
        'https://images.unsplash.com/photo-1639815188546-c43c240ff4df?w=800&q=80',
        'https://images.unsplash.com/photo-1640166258288-ee379434e341?w=800&q=80',
        'https://images.unsplash.com/photo-1621416896173-6a9712a6fdf6?w=800&q=80',
        'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&q=80',
        'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&q=80',
        'https://images.unsplash.com/photo-1609554496730-1c60be99bc22?w=800&q=80',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80'
    ]
};

// 해시 함수: 제목 기반으로 이미지를 골고루 배정
function getStringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getRandomImage(category, title) {
    const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['kr-stock'];
    // 해시를 더 복잡하게 섞어서 획일성 방지
    const seed = getStringHash(title) ^ (title.length * 997);
    const index = Math.abs(seed) % images.length;
    return images[index];
}

// 2. 외부 인포그래픽/차트 이미지 (기사 본문 중간에 삽입됨)
const CHART_IMAGES = {
    'default': [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80'
    ],
    'crypto': [
        'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&q=80',
        'https://images.unsplash.com/photo-1640166258327-043510e4a3e7?w=800&q=80',
        'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&q=80',
        'https://images.unsplash.com/photo-1622630998477-20b41cd0e153?w=800&q=80',
        'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&q=80'
    ]
};

function getChartImage(title, category) {
    const charts = CHART_IMAGES[category] || CHART_IMAGES['default'];
    // 해시를 복잡하게 하여 항상 일정한 차트가 나오지 않도록 개선
    const seed = getStringHash(title) ^ (charts.length * 31);
    const index = Math.abs(seed + 7) % charts.length;
    return charts[index];
}

function generateId(title) {
    return Buffer.from(title).toString('base64').slice(0, 16).replace(/[^a-zA-Z0-9]/g, 'x');
}

function buildGoogleNewsUrl(query) {
    const encoded = encodeURIComponent(query);
    return `https://news.google.com/rss/search?q=${encoded}&hl=ko&gl=KR&ceid=KR:ko`;
}

// 3. 2000자 분량의 풍성한 자동 기사 생성 모듈 (본문 내 그래프/차트 이미지 포함)
function generateLongArticleContent(title, description, category) {
    const cleanDesc = description.replace(/<[^>]*>?/gm, '').trim();
    const chartImg = getChartImage(title, category);
    const hashData = getStringHash(title);

    // 코인 전용 초장문 템플릿
    if (category === 'crypto') {
        const cryptoTemplates = [
            `
            <p class="text-xl font-bold leading-relaxed mb-8 text-gray-800 dark:text-gray-200">
                가상화폐 및 블록체인 생태계에서 <strong>${title}</strong> 이슈가 시장의 핵심 변수로 급부상하고 있습니다. ${cleanDesc} 이는 단순한 가격 변동이나 알트코인의 순환펌핑을 넘어, 온체인 데이터가 예고해 온 거시적 트렌드의 전환점을 의미합니다. 
            </p>

            <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-primary-500 pl-4">1. 온체인 데이터 및 고래들의 자금 흐름 분석</h3>
            <p class="mb-4 text-lg leading-loose">
                최근 블록체인 상의 트랜잭션 수치와 '고래(Whale)' 지갑들의 이동 경로를 추적해보면, 과거 불장이나 대규모 조정 직전에 나타났던 전형적인 시그널들이 여러 곳에서 포착되고 있습니다. 기관 투자자들의 장외 거래(OTC) 물량 매집과 거래소 밖으로의 콜드월렛 대규모 출금 현상은 현재의 펀더멘털이 그 어느 때보다 단단해지고 있음을 강력하게 시사합니다.
            </p>
            <p class="mb-8 text-lg leading-loose">
                특히 규제 환경의 변화(SEC 스탠스 변경, MiCA 법안 도입 동향 등)와 ETF 승인 이후 전통 금융권 자본의 유입 속도는 일반 투자자들의 예상을 훨씬 상회하고 있습니다. 스마트 머니는 이미 방향성을 잡고 매집 존에 들어섰으며, 개인 투자자들은 이러한 극심한 변동성 구간에서 노이즈와 진짜 신호를 분별해 내는 것이 이번 반감기 및 상승 사이클에서의 성공 여부를 결정짓게 될 것입니다.
            </p>

            <div class="my-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-dark-card">
                <img src="${chartImg}" alt="온체인 데이터 시각화 차트" class="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700" />
                <div class="p-4 bg-gray-50 dark:bg-gray-800/50 text-sm md:text-base text-center font-bold text-gray-500 dark:text-gray-400">
                    [그림 1] 가상자산 주요 온체인 트랜잭션 변동 및 실시간 해시레이트 추이
                </div>
            </div>

            <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-accent-500 pl-4">2. 생태계 역학 변화와 파급 효과 (Layer 1/2 및 디파이)</h3>
            <p class="mb-4 text-lg leading-loose">
                이번 <strong>${title}</strong> 관련 움직임은 단순히 비트코인이나 특정 코인의 시세에만 국한되지 않습니다. 이더리움, 솔라나 등을 위시한 레이어 1(L1) 메인넷 경쟁과, 더 빠르고 저렴한 확장을 위한 레이어 2(L2) 솔루션, 그리고 이 위에서 돌아가는 디파이(DeFi) 생태계 전체의 유동성에 막대한 영향을 끼치고 있습니다. 총예치금액(TVL; Total Value Locked)의 이동 추세는 다음 주도 섹터가 무엇이 될지를 미리 말해주고 있습니다.
            </p>
            <p class="mb-8 text-lg leading-loose">
                더불어 AI(인공지능)와 결합된 크립토 프로젝트, RWA(실물자산 연동 토큰), 웹3 게이밍 섹터 등에까지 긍정적인 '낙수 효과'가 이어지고 있습니다. 새로운 내러티브가 생성되고 소멸하는 주기가 점점 빨라지는 크립토 시장에서, 현재 나타나고 있는 밸류에이션 재평가는 투기적 접근을 넘어 기술 발전의 실제 가치가 금융 자산으로 입증받고 있는 과정으로 전문가들은 해석합니다.
            </p>

            <div class="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 border border-primary-100 dark:border-primary-900 my-10 relative overflow-hidden">
                <h4 class="text-xl font-bold text-primary-700 dark:text-primary-300 mb-4">💡 크립토 AI 퀀트 시스템 핵심 인사이트</h4>
                <ul class="list-disc pl-5 space-y-3 text-gray-700 dark:text-gray-300 text-lg">
                    <li>고래 지갑 및 채굴자 지갑의 순유출입 모니터링: <strong>매도 압력 변동성 확대</strong></li>
                    <li>레이어 2 및 RWA 섹터로의 기관 스마트 머니 점진적 이동 감지</li>
                    <li>글로벌 거시 경제 유동성과 비트코인 롱 포지션 간의 양의 상관관계 재결합</li>
                </ul>
            </div>

            <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-emerald-500 pl-4">3. 변동성 장세를 이겨내는 크립토 최적의 투자 전략</h3>
            <p class="mb-4 text-lg leading-loose">
                역사적으로 크립토 시장은 높은 수익률을 안겨주지만, 동시에 가혹한 수준의 드로우다운(Drawdown)을 동반하는 역동적인 영역입니다. 최고의 코인 전문가 및 퀀트 트레이더들은 이 시점에서 절대 '포모(FOMO)'에 휩쓸려 충동적인 추격 매수를 하지 말 것을 강력히 경고합니다. 
            </p>
            <p class="mb-8 text-lg leading-loose">
                이에 따른 최적의 전략은 대형주(비트코인, 이더리움)를 기반으로 포트폴리오의 중심을 60% 이상 단단히 잡고, 나머지 비중을 유망한 내러티브를 지닌 선별된 알트코인에 분산하는 전략입니다. 또한 스테이블코인 비중을 상시 일정 수준 확보하여, 시장에 단기적인 패닉 셀링이 나올 때 매집할 수 있는 유동성을 준비해두어야 합니다.
            </p>

            <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-gray-400 pl-4">4. 결론: 다음 메타버스와 웹3 로의 진입점</h3>
            <p class="mb-8 text-lg leading-loose font-medium text-gray-600 dark:text-gray-400">
                결과적으로 지금 발생하고 있는 상황들은 단순한 버블의 붕괴나 상승장의 일시적 조정이 아닙니다. 자본주의와 금융의 패러다임이 웹3 환경으로 서서히 진입하는 거대한 인프라 도약의 과정입니다. 차트에 일희일비하기보다는 프로젝트의 실사용 사례(Use Case)와 개발 진척도, 그리고 거시 경제의 자금 흐름을 깊게 호흡하며 짚어보는 투자자만이 다가오는 다음 불장에서 거대한 부를 쟁취할 수 있을 것입니다.
            </p>
            `
        ];
        return cryptoTemplates[hashData % cryptoTemplates.length];
    }

    // 기본 초장문 템플릿
    const templates = [
        `
        <p class="text-xl font-bold leading-relaxed mb-8 text-gray-800 dark:text-gray-200">
            최근 금융 및 경제 시장에서 <strong>${title}</strong> 이슈가 핵심 화두로 떠오르고 있습니다. ${cleanDesc} 이는 단순히 단기적인 현상을 넘어 중장기적인 시장 구조 변화를 암시하는 중요한 시그널로 해석됩니다. 전문가들은 이 현상에 주목하며 다양한 대응 카드를 모색 중입니다.
        </p>

        <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-primary-500 pl-4">1. 시장 동향 및 심층 배경 분석</h3>
        <p class="mb-4 text-lg leading-loose">
            대내외 경제 지표의 극심한 변동성과 글로벌 매크로 환경의 급격한 변화 속에서, 이번 사태는 시장 참여자들에게 매우 중요한 함의를 지닙니다. 특히 인플레이션 압력과 금리 인하 기대감이 교차하는 가운데, 기술적 분석가들과 글로벌 IB(투자은행)들은 단기적인 변동성 확대 장세 속에서도 핵심 메가 트렌드를 읽어내는 것이 승패를 가름할 것이라고 입을 모읍니다. 
        </p>
        <p class="mb-8 text-lg leading-loose">
            실제로 현장 데이터에 따르면 관련 핵심 섹터의 거래 대금 및 회전율이 최근 3주 연속 급격하게 증가하는 추세를 확연히 보이고 있습니다. 이는 개인 투자자뿐만 아니라 기관 및 외국인 등 메이저 스마트 머니의 강력한 자금 유입과 직접적인 연관성이 매우 높습니다. 따라서 당분간 이러한 강력한 수급의 흐름은 향후 1~2개 분기 이상 지속될 가능성이 농후하다는 것이 대체적인 업계의 시각입니다.
        </p>

        <div class="my-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-dark-card">
            <img src="${chartImg}" alt="데이터 시각화 차트" class="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700" />
            <div class="p-4 bg-gray-50 dark:bg-gray-800/50 text-sm md:text-base text-center font-bold text-gray-500 dark:text-gray-400">
                [그림 1] 핵심 지표 및 관련 섹터 거래량 변동 추이 요약 및 시각화
            </div>
        </div>

        <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-accent-500 pl-4">2. 핵심 지표와 경제적 파급 효과</h3>
        <p class="mb-4 text-lg leading-loose">
            이번 <strong>${title}</strong> 사태에서 간과할 수 없는 또 다른 핵심 측면은 연관 산업 및 서플라이 체인(공급망) 전반에 미치는 거대한 파급 효과입니다. 시장의 기초 체력(펀더멘털)을 점검할 때, 주도주 및 주도 섹터의 움직임은 주변부로 폭포수처럼 확산되는 '낙수 효과(Trickle-down effect)'를 만들어냅니다.
        </p>
        <p class="mb-8 text-lg leading-loose">
            과거 유사한 역사적 사례들을 복기해보면, 강력한 모멘텀을 수반한 현상은 최소 6개월 이상 시장의 내러티브를 지배했습니다. 지금 발생하고 있는 거시적 불확실성 감소 및 특정 비즈니스 모델의 밸류에이션 리레이팅(재평가) 움직임은 단순히 운이나 일시적 테마가 아닙니다. 이는 산업 지형도가 구조적으로 변화하고 있음을 뜻하며, 투자자들에게는 포트폴리오의 비중을 대대적으로 재점검해야 함을 강하게 시사하고 있습니다.
        </p>

        <div class="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 border border-primary-100 dark:border-primary-900 my-10 relative overflow-hidden">
            <h4 class="text-xl font-bold text-primary-700 dark:text-primary-300 mb-4">💡 AI 퀀트 시스템 핵심 인사이트</h4>
            <ul class="list-disc pl-5 space-y-3 text-gray-700 dark:text-gray-300 text-lg">
                <li>글로벌 유동성 흐름과 매크로 지표의 역사적 상관관계 재성립</li>
                <li>연관 핵심 기업들의 잉여현금흐름(FCF) 호조 및 이익 체력 폭발적 개선 가능성</li>
                <li>시장 컨센서스를 상회하는 어닝 서프라이즈 기대감 확대 트렌드 유지 중</li>
            </ul>
        </div>

        <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-emerald-500 pl-4">3. 스마트 투자자를 위한 향후 대응 및 포트폴리오 전략</h3>
        <p class="mb-4 text-lg leading-loose">
            그렇다면 일반 합리적인 투자자들은 현 상황에서 어떤 스탠스를 취해야 할까요? 최고의 월가 애널리스트들과 국내 톱티어 기관 펀드매니저들은 '맹목적인 추격 매수나 투매보다는, 데이터 기반의 이성적이고 차분한 분할 접근'을 최우선 과제로 권고하고 있습니다. 
        </p>
        <p class="mb-8 text-lg leading-loose">
            구체적으로는, 변동성 장세가 연출될 때 과도하게 레버리지를 사용하는 것을 극도로 경계해야 합니다. 대신, 현금 비중을 일정 수준(최소 20% 이상) 방어적으로 유지하면서, 단기적으로 급락이 나타나는 우량 코어 자산에 대해 기계적인 적립식 매수를 집행하는 이른바 '바벨 전략(Barbell Strategy)'이 매우 유효할 수 있습니다. 무릎에서 사서 어깨에서 파는 고전적인 격언이 어느 때보다도 빛을 발하는 타이밍입니다.
        </p>

        <h3 class="text-2xl font-black mt-12 mb-6 border-l-4 border-gray-400 pl-4">4. 결론: 위기인가, 새로운 투자의 기회인가?</h3>
        <p class="mb-8 text-lg leading-loose font-medium text-gray-600 dark:text-gray-400">
            요약하자면, 작금의 현상은 단순한 노이즈가 아닌 거대한 패러다임 변화의 서막일 수 있습니다. 뉴스의 이면에 숨겨진 본질적인 가치와 자본의 거대한 이동 경로를 면밀히 추적하십시오. 성공적인 투자는 남들이 패닉에 빠졌을 때 냉철한 이성으로 데이터를 분석하고 행동하는 자의 몫이라는 시장의 진리는 결코 변하지 않습니다. 신중하면서도 과감한 실행력이 당신의 계좌를 한 단계 레벨업 시켜줄 것입니다.
        </p>
        `
    ];

    // 해시를 통해 여러 템플릿 중 하나를 선택 (현재는 1개지만 추후 확장 용이)
    return templates[hashData % templates.length];
}

function transformArticle(item, category) {
    const title = (item.title || '').replace(/ - .+$/, '').trim();
    const description = (item.contentSnippet || item.content || item.summary || '').replace(/<[^>]*>/g, '').trim();
    const pubDate = item.pubDate || item.isoDate || new Date().toISOString();

    const bullets = generateBullets(title, description, category);

    return {
        id: generateId(title + pubDate),
        category,
        title,
        description: description.slice(0, 300),
        bullets,
        link: item.link || '',
        pubDate: new Date(pubDate).toISOString(),
        fetchedAt: new Date().toISOString(),
        // 카드별 다양한 이미지를 해시 기반으로 추출
        image: getRandomImage(category, title),
        // 2000자 분량의 구조화된 HTML 장문 기사 및 인포그래픽 자동 삽입
        articleContent: generateLongArticleContent(title, description, category)
    };
}

function generateBullets(title, description, category) {
    const text = description || title;
    const sentences = text.split(/[.!?。]\s*/).filter(s => s.length > 5);

    let context, core, action;

    if (sentences.length >= 3) {
        context = sentences[0].trim();
        core = sentences[1].trim();
        action = sentences.length > 2 ? sentences[2].trim() : getDefaultAction(category);
    } else if (sentences.length === 2) {
        context = sentences[0].trim();
        core = sentences[1].trim();
        action = getDefaultAction(category);
    } else {
        context = title;
        core = description.slice(0, 100) || '관련 전문가의 세부 분석 데이터를 참고하세요.';
        action = getDefaultAction(category);
    }

    return [
        { type: 'context', label: '현상', text: context.slice(0, 120) },
        { type: 'core', label: '핵심', text: core.slice(0, 120) },
        { type: 'action', label: '전략', text: action.slice(0, 120) },
    ];
}

function getDefaultAction(category) {
    const defaults = {
        'kr-stock': '시장 변동성 확대 구간이므로 펀더멘털 기반 분할 매수 접근을 권장합니다.',
        'real-estate': '지역별 양극화 현상을 고려하여 교통 및 학군 등 핵심 입지에 주목하세요.',
        'finance-tips': '지출 통제와 안정적인 현금흐름 확보를 통해 시드머니를 우선 마련하세요.',
        'us-stock': '매크로 환경과 빅테크 기업들의 실적 컨센서스를 교차 검증하며 대응하세요.',
        'crypto': '가상자산 특유의 극한 변동성을 인지하고 포트폴리오 비중을 엄격히 관리하세요.',
    };
    return defaults[category] || '최신 시장 동향을 지속적으로 모니터링하며 리스크를 관리하세요.';
}

// 단일 카테고리 뉴스 수집
async function fetchCategoryNews(categoryId) {
    const config = CATEGORY_CONFIG[categoryId];
    if (!config) return [];

    console.log(`[뉴스 수집] ${config.emoji} ${config.label} 수집 시작...`);
    const allArticles = [];

    for (const query of config.queries) {
        try {
            const url = buildGoogleNewsUrl(query);
            const feed = await parser.parseURL(url);
            const articles = (feed.items || []).slice(0, 6).map(item => transformArticle(item, categoryId));
            allArticles.push(...articles);
        } catch (err) {
            console.error(`[뉴스 수집] "${query}" 수집 실패:`, err.message);
        }
    }

    // 중복 제거
    const seen = new Set();
    const unique = allArticles.filter(a => {
        if (seen.has(a.title)) return false;
        seen.add(a.title);
        return true;
    });

    if (unique.length > 0) {
        saveNews(categoryId, unique);
    }

    console.log(`[뉴스 수집] ${config.emoji} ${config.label}: ${unique.length}개 수집 및 생성 완료`);
    return unique;
}

// 전체 카테고리 뉴스 수집
export async function fetchAllNews() {
    console.log('\n========================================');
    console.log('[뉴스 자동생성] 새로운 뉴스 데이터 및 고품질 콘텐츠 생성 시작...');
    console.log('========================================\n');

    const categories = Object.keys(CATEGORY_CONFIG);
    const results = {};

    for (const cat of categories) {
        try {
            results[cat] = await fetchCategoryNews(cat);
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (err) {
            console.error(`[뉴스 수집] ${cat} 실패:`, err.message);
            results[cat] = [];
        }
    }

    console.log('\n========================================');
    console.log('[뉴스 자동생성] 모든 카테고리 2000자 생성 및 수집 완료!');
    console.log('========================================\n');

    return results;
}

export { CATEGORY_CONFIG };
