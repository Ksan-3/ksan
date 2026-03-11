function a(id, cat, title, img, b1, b2, b3, content, date) {
    const uniqueImg = `https://picsum.photos/seed/${id}/800/600`;
    return {
        id, category: cat, title, image: uniqueImg, bullets: [
            { type: 'context', label: '현상', text: b1 },
            { type: 'core', label: '핵심', text: b2 },
            { type: 'action', label: '전략', text: b3 },
        ], pubDate: date || '2026-02-26T09:00:00+09:00', articleContent: content
    };
}

export const krStockData = [
    // === 2026-03-11 신규 기사 ===
    a('kr11', 'kr-stock',
        '코스피 3,100 돌파 임박 🚀 외국인 8일째 "Buy Korea"',
        null,
        '코스피 장중 3,080 터치, 외국인 8거래일 연속 순매수',
        '삼성전자·SK하이닉스 쌍끌이 매수 지속, 반도체·금융주 주도',
        '대형 기술주 중심 홀딩, 지수 상승 모멘텀 동참',
        `<p class="text-xl font-black mb-6">코스피 3,100이 눈앞이다! 🚀🔥</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold text-red-700 dark:text-red-300">📌 오늘 시황 (3/11)</p>
            <p class="text-2xl font-black">코스피 3,080선 안착 · 외국인 8일 연속 순매수</p>
            <p class="text-base mt-2">반도체 투톱 강세 지속</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 왜 오르나?</h3>
        <p class="mb-4 text-lg leading-relaxed">미증시 훈풍과 우호적 환율 환경, AI 반도체 수출 실적 개선 기대감이 외국인 자금을 지속적으로 끌어들이고 있습니다.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 지금은 이렇게 대처하세요</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 주도주(반도체, 금융) 비중 유지 전략</li>
                <li>✅ 저평가된 KOSPI 200 종목 탐색</li>
                <li>⚠️ 단기 급등에 따른 차익 매물 출회 주의</li>
            </ul>
        </div>`,
        '2026-03-11T09:00:00+09:00'),

    a('kr12', 'kr-stock',
        '밸류업 수혜주 2차 랠리 🏦 금융주 배당+자사주 소각 "훨훨"',
        null,
        '은행·증권주 일제히 강세, 밸류업 프로그램 효과 본격화',
        '추가 주주환원 기대감에 기관·외인 쌍끌이 매수',
        '저PBR·고배당주 조정 시 매수 관점',
        `<p class="text-xl font-black mb-6">금융주 2차 랠리 시작! 밸류업 효과 톡톡 🏦</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold text-red-700 dark:text-red-300">📌 핵심 내용</p>
            <p class="text-2xl font-black">은행·증권주 동반 상승 · 주주환원율 40% 기대</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 무슨 일이야?</h3>
        <p class="mb-4 text-lg leading-relaxed">국내 주요 금융지주들이 역대급 실적을 바탕으로 추가적인 자사주 매입 및 소각을 예고하며 주가가 다시 뛰고 있습니다. 밸류업 프로그램이 구체화되면서 외국인 매수세도 거셉니다.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 투자 가이드</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 4대 금융지주 등 핵심 밸류업 테마 비중 확대</li>
                <li>✅ 배당락일 전후 단기 변동성 활용</li>
            </ul>
        </div>`,
        '2026-03-11T09:00:00+09:00'),

    a('kr13', 'kr-stock',
        '2차전지 반등 성공 🔋 테슬라 훈풍에 K-배터리 급등',
        null,
        '에코프로·LG엔솔 등 2차전지 관련주 5~8% 반등',
        '테슬라 판매 호조 및 미국 IRA 보조금 유지 전망 훈풍',
        '낙폭과대 배터리주 트레이딩 접근 유효',
        `<p class="text-xl font-black mb-6">오랜만에 웃은 2차전지 개미들 🔋 테슬라 훈풍!</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold text-red-700 dark:text-red-300">📌 시장 체크</p>
            <p class="text-2xl font-black">K-배터리 주요 종목 일제히 반등 성공</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 왜 오르는 걸까?</h3>
        <p class="mb-4 text-lg leading-relaxed">간밤 테슬라가 중국 및 유럽에서 기대 이상의 판매량을 기록했다는 소식과, 미국 IRA 정책의 정책 기조가 당분간 배터리 업계에 우호적일 것이라는 전망이 작용했습니다.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 접근법</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 단기 낙폭 과대에 따른 기술적 반등 성격 유의</li>
                <li>✅ 확실한 실적 개선이 보이는 소재주 위주 선별 접근</li>
            </ul>
        </div>`,
        '2026-03-11T09:00:00+09:00'),

    // === 2026-03-10 신규 기사 ===
    a('kr8', 'kr-stock',
        '코스피 3,050 돌파 📈 외국인 7거래일 연속 매수',
        null,
        '코스피 3,050선 안착, 외국인 7거래일 연속 순매수 2.3조',
        'WGBI 편입 확정 + 반도체 수출 호조 → 외국인 자금 유입 가속',
        '외국인 순매수 상위 종목 추적 + KOSPI ETF 분할 매수',
        `<p class="text-xl font-black mb-6">코스피가 3,050을 뚫었다! 📈🔥</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold text-red-700 dark:text-red-300">📌 오늘 시황 (3/10)</p>
            <p class="text-2xl font-black">코스피 3,052 · 외국인 7일 연속 순매수</p>
            <p class="text-base mt-2">누적 순매수: <strong>2.3조원</strong></p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 왜 올라?</h3>
        <p class="mb-4 text-lg leading-relaxed">WGBI(세계국채지수) 편입이 확정되면서 글로벌 채권 자금이 한국으로 유입 중. 여기에 2월 반도체 수출이 전년비 +45% 급증하면서 삼성전자·SK하이닉스가 주도주 역할.</p>
        <p class="mb-6 text-lg leading-relaxed">원/달러 환율도 1,310원대로 안정되면서 외국인 매수에 우호적 환경. 투자자 예탁금 115조로 역대 최고 → 대기 자금 풍부.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 지금 뭐 해?</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 외국인 순매수 상위: 삼성전자·하이닉스·현대차</li>
                <li>✅ KOSPI200 ETF 분할 매수로 시장 전체 동참</li>
                <li>⚠️ 급등 후 차익실현 매물 주의 — 분산 투자 필수</li>
            </ul>
        </div>`,
        '2026-03-10T09:00:00+09:00'),

    a('kr9', 'kr-stock',
        'SK하이닉스 HBM4 양산 시작 🚀 목표가 상향 러시',
        null,
        'SK하이닉스 HBM4 양산 세계 최초 가동, 엔비디아 독점 납품',
        '증권사 12곳 목표가 상향, 평균 목표가 28만원',
        'SK하이닉스 25만원 이하 분할 매수, AI 반도체 대장주',
        `<p class="text-xl font-black mb-6">SK하이닉스 HBM4 세계 최초 양산! 🚀</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold text-red-700 dark:text-red-300">📌 핵심</p>
            <p class="text-2xl font-black">HBM4 양산 시작 · 엔비디아 독점 납품</p>
            <p class="text-base mt-2">증권사 평균 목표가: <strong>28만원</strong></p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 상황</h3>
        <p class="mb-4 text-lg leading-relaxed">SK하이닉스가 세계 최초로 HBM4 양산을 시작했다고 공식 발표. 엔비디아 차세대 GPU(블랙웰 울트라)에 독점 납품. 2분기부터 본격 매출 반영 예상.</p>
        <p class="mb-6 text-lg leading-relaxed">12개 증권사가 목표가를 일제히 상향. 가장 높은 목표가는 KB증권의 32만원. AI 반도체 슈퍼사이클이 계속되고 있다는 증거.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 전략</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ <strong>SK하이닉스</strong> — 25만원 이하 분할 매수</li>
                <li>✅ AI 반도체 소재·장비주(한미반도체·이오테크닉스)도 주목</li>
                <li>⚠️ 단기 급등 구간 — 추격 매수보다 조정 시 매수</li>
            </ul>
        </div>`,
        '2026-03-10T09:00:00+09:00'),

    a('kr10', 'kr-stock',
        '삼성전자 자사주 5조 매입 발표 💎 주주환원 강화',
        null,
        '삼성전자 5조원 규모 자사주 매입 발표, 3개월 내 완료',
        '밸류업 프로그램 일환, 주당 배당금도 +20% 인상',
        '삼성전자 7만원 이하 매수 기회, 배당+자사주 이중 수혜',
        `<p class="text-xl font-black mb-6">삼성전자가 자사주 5조를 산다고? 💎</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold text-red-700 dark:text-red-300">📌 주주환원</p>
            <p class="text-2xl font-black">자사주 5조 매입 + 배당 +20% 인상</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 왜 중요해?</h3>
        <p class="mb-4 text-lg leading-relaxed">삼성전자가 밸류업 프로그램의 일환으로 5조원 규모 자사주 매입을 전격 발표. 3개월 내에 시장에서 직접 매입 후 소각 예정. 주당 배당금도 전년 대비 20% 인상.</p>
        <p class="mb-6 text-lg leading-relaxed">코리아 디스카운트 해소를 위한 삼성의 강력한 의지 표명. 시가총액 대비 자사주 비중이 높아지면서 주가 하방 지지력 강화.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 투자 포인트</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 7만원 이하에서 매수 기회 — 자사주 매입이 하방 지지</li>
                <li>✅ 배당수익률 약 3% + 자사주 소각 = 이중 수혜</li>
                <li>✅ 반도체 업황 회복 + 밸류업 = 중장기 매력</li>
            </ul>
        </div>`,
        '2026-03-10T09:00:00+09:00'),

    // === 기존 기사 (2026-02-26) ===
    a('kr1', 'kr-stock', '코스피 6,200 돌파 🚀 역사적 신고가 행진!', null,
        '코스피 사상 최고치 6,200 돌파, 장중 6,300까지',
        '엔비디아 발 반도체 랠리 + 외국인 매수세 폭발',
        '반도체·증권주 중심 수급 따라가기',
        `<p class="text-xl font-black mb-6">코스피가 역사를 쓰고 있다 🚀 6,200 돌파!</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold text-red-700 dark:text-red-300">📌 오늘 시황</p>
            <p class="text-2xl font-black">코스피 6,200 돌파 · 장중 6,300 터치</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 왜 이렇게 올라?</h3>
        <p class="mb-4 text-lg leading-relaxed">어제 엔비디아 실적이 역대급으로 터지면서 → 글로벌 AI·반도체 랠리 → 삼성전자·SK하이닉스 동반 폭등 → 코스피 사상 최고치 경신.</p>
        <p class="mb-6 text-lg leading-relaxed">추가 상승 요인: 1월 한국 수출 +33.9%(반도체가 30% 비중) + 투자자 예탁금 108조 대기 + WGBI 편입 기대감으로 외국인 자금 유입.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 지금 뭐 해?</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 반도체(삼전·하이닉스) + 증권주 수급 좋음</li>
                <li>✅ KOSPI ETF 분할 매수로 시장 전체 동참</li>
                <li>⚠️ 쏠림 주의 — 분산 투자 필수</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('kr2', 'kr-stock', 'SK하이닉스·삼성전자 엔비디아 수혜 폭등 📈', null,
        '엔비디아 실적 호조 → HBM 수혜주 동반 랠리',
        '한미반도체 1년 최고가 경신, AI 반도체 대장주 질주',
        'AI 반도체 소재·장비주도 함께 주목',
        `<p class="text-xl font-black mb-6">엔비디아가 터지면 한국도 터진다 📈</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold">📌 수혜주</p>
            <p class="text-base">한미반도체 <strong>1년 최고가</strong> · SK하이닉스·삼전 동반 급등</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">💡 전략</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ SK하이닉스 — HBM4 양산, NVDA 납품 독점</li>
                <li>✅ 한미반도체 — 반도체 장비 핵심, 수주 폭증</li>
                <li>✅ 소재·장비주까지 낙수효과 확인</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('kr3', 'kr-stock', '증권주 52주 신고가 🏦 거래대금 폭발', null,
        '코스피 거래대금 급증 → 증권주 손익 직결',
        '상상인증권·SK증권 52주 신고가, 증권 섹터 전체 강세',
        '증권주 단기 모멘텀 트레이딩 유효',
        `<p class="text-xl font-black mb-6">증시 활황 = 증권주 대박 🏦</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold">📌 핵심</p>
            <p class="text-base">거래대금 ↑ → 수수료 수입 ↑ → 증권주 52주 신고가</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">💡 전략</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 시장 활황기 = 증권주 호실적 구간</li>
                <li>✅ 단기 스윙 트레이딩 유효</li>
                <li>⚠️ 시장 조정 시 빠질 수도 — 스탑로스 철저히</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('kr4', 'kr-stock', 'LG전자 자사주 소각 + 피지컬AI 🤖 급등', null,
        'LG전자 자사주 소각 발표 + 피지컬 AI(로봇) 진출',
        '상법 개정안 통과 → 자사주 소각 의무화 기대',
        '밸류업 수혜 대형주 편입 검토',
        `<p class="text-xl font-black mb-6">LG전자 자사주 소각 + AI 로봇?! 🤖</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold">📌 이중 호재</p>
            <p class="text-base">자사주 소각(밸류업) + 피지컬 AI <strong>로봇 산업 진출</strong></p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">💡 포인트</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 밸류업 프로그램 + 상법 개정 → 주주환원 기대</li>
                <li>✅ AI 로봇 내러티브 → 중장기 성장 모멘텀</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('kr5', 'kr-stock', '외국인 매수 폭발 💰 예탁금 108조 대기', null,
        '투자자 예탁금 108조 사상 최대 + 외국인 연속 순매수',
        'WGBI 편입 기대감 → 외국인 자금 유입 가속',
        '외국인 선호주 + KOSPI대형 ETF 편입 전략',
        `<p class="text-xl font-black mb-6">108조가 증시에 들어올 준비를 하고 있다 💰</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold">📌 대기 자금</p>
            <p class="text-2xl font-black">예탁금 108조 · 부동산→증시 머니무브</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">💡 전략</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 대기 자금 유입 → 추가 상승 여력 존재</li>
                <li>✅ 외국인 매수 상위 종목 추적</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('kr6', 'kr-stock', '상법 개정안 통과 ⚡ 자사주 소각 의무화', null,
        '상법 개정안 국회 통과 — 자사주 소각 의무화 포함',
        '코리아 디스카운트 해소 기대감 최고조',
        '밸류업 수혜주(금융, 지주사) 비중 확대',
        `<p class="text-xl font-black mb-6">상법 개정 통과! 자사주 소각 의무화 ⚡</p>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 mb-8 border-l-4 border-red-500">
            <p class="text-lg font-bold">📌 의미</p>
            <p class="text-base">코리아 디스카운트 해소 → <strong>PBR 리레이팅</strong></p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">💡 전략</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 금융·지주사 등 저PBR 종목 재평가</li>
                <li>✅ 배당 + 자사주 소각 이중 수익</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('kr7', 'kr-stock', '⚠️ 공매도 잔고 사상 최대 — 과열 신호?', null,
        '코스피 공매도 잔고 사상 최대 수준 확대',
        '급등 구간에서 숏 포지션 → 변동성 확대 주의',
        '과열 구간에서는 현금 비중 20% 유지',
        `<p class="text-xl font-black mb-6">주의! 공매도 잔고 사상 최대 ⚠️</p>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-5 mb-8 border-l-4 border-yellow-500">
            <p class="text-lg font-bold text-yellow-700 dark:text-yellow-300">⚠️ 경고 신호</p>
            <p class="text-base">코스피 급등 속 공매도 잔고 <strong>사상 최대</strong></p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">💡 대응</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>⚠️ 쏠림 현상 + 공매도 = 단기 변동성 ↑</li>
                <li>✅ 현금 비중 최소 20% 확보</li>
                <li>✅ 레버리지 ETF 사용 자제</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),
];
