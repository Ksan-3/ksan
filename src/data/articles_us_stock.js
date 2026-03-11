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

export const usStockData = [
    // === 2026-03-11 신규 기사 ===
    a('us11', 'us-stock',
        '나스닥 18,500 돌파 최고가 경신 💥 AI 모멘텀 건재',
        null,
        '나스닥 사상 최고치 경신, AI 및 소프트웨어 섹터 강세 지속',
        '연준 금리 인하 기대감과 기술주 실적 호조 시너지',
        '초대형 기술주 중심 포트폴리오 유지, TIGER 나스닥100 적립식 분할',
        `<p class="text-xl font-black mb-6">나스닥 끝을 모르고 날아오른다 💥 역대 최고가!</p>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-8 border-l-4 border-blue-500">
            <p class="text-lg font-bold text-blue-700 dark:text-blue-300">📌 오늘 시황 (3/11)</p>
            <p class="text-2xl font-black">나스닥 지수 18,500 돌파 · 사상 최고가 경신</p>
            <p class="text-base mt-2">AI 및 클라우드 기업 중심 랠리</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 원인은?</h3>
        <p class="mb-4 text-lg leading-relaxed">어제 발표된 미국의 2월 물가지표가 시장 예상에 부합하며 연준의 금리 인하 기대감이 높아졌습니다. 이에 따라 AI 반도체뿐만 아니라 엔터프라이즈 소프트웨어 기업들까지 동반 강세를 보이고 있습니다.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 투자 가이드</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 빅테크 편식보단 QQQ, VGT 등 ETF 분할 매수</li>
                <li>✅ AI 밸류체인 2·3차 수혜주(전력, 인프라) 관심</li>
                <li>⚠️ 심리적 고점에 따른 단기 조정 가능성 대비 현금 20%</li>
            </ul>
        </div>`,
        '2026-03-11T09:00:00+09:00'),

    a('us12', 'us-stock',
        '아마존 AWS AI 모델 전면 도입 🚀 성장률 재점화',
        null,
        '아마존 클라우드(AWS) 전 영역에 차세대 AI 모델 탑재 발표',
        'B2B 클라우드 시장 점유율 1위 수성 의지, 주가 +4% 상승',
        'AMZN 200달러 돌파 기대, 눌림목 매수',
        `<p class="text-xl font-black mb-6">아마존이 드디어 AI에 승부수를 던졌다 🚀</p>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-8 border-l-4 border-blue-500">
            <p class="text-lg font-bold text-blue-700 dark:text-blue-300">📌 핵심 내용</p>
            <p class="text-2xl font-black">AWS 차세대 AI 모델 도입 · 성장 가속화</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 무슨 일이야?</h3>
        <p class="mb-4 text-lg leading-relaxed">아마존 앤디 재시 CEO가 AWS 클라우드 서비스 전반에 걸친 대대적인 AI 모델 통합 계획을 발표했습니다. 마이크로소프트 애저와의 격차를 벌리기 위한 강력한 이니셔티브로 평가되며 시장이 즉각 화답했습니다.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 투자 포인트</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 클라우드 부문 수익성 개선 확인 시 추세적 장기 상승</li>
                <li>✅ e커머스 비용 절감 효과도 기대 — AMZN 비중 확대</li>
            </ul>
        </div>`,
        '2026-03-11T09:00:00+09:00'),

    a('us13', 'us-stock',
        'CPI 예상치 부합, 안도하는 시장 📉 연준 금리 스텝은?',
        null,
        '미국 2월 소비자물가지수(CPI) 2.6% 상승 (예상 부합)',
        '물가 안정세 재확인, 투심 회복으로 채권 금리 안정',
        '주식 강세, 장기 국채 ETF 분할 매수 기회',
        `<p class="text-xl font-black mb-6">2월 CPI 물가 무사통과! 안도하는 시장 📉</p>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-8 border-l-4 border-blue-500">
            <p class="text-lg font-bold text-blue-700 dark:text-blue-300">📌 CPI 지표 결과</p>
            <p class="text-2xl font-black">2월 CPI 전년비 2.6% 상승 · 시장 예상치 부합</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 경제 읽기</h3>
        <p class="mb-4 text-lg leading-relaxed">시장 최대 관심사였던 2월 CPI 결과가 우려를 불식시켰습니다. 끈적한 물가 우려가 완화되면서 연준의 금리 인하 경로(연 2~3회)가 유지될 것이란 기대감이 다시 자리를 잡았습니다.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 투자 가이드</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 위험자산 선호 지속 — 성장주 매력 우위</li>
                <li>✅ 금리 하락 베팅 관련 TLT, IEF 등 채권 ETF 비중 조절</li>
            </ul>
        </div>`,
        '2026-03-11T09:00:00+09:00'),

    // === 2026-03-10 신규 기사 ===
    a('us8', 'us-stock',
        '애플 AI 아이폰 18 효과 💥 매출 $124B 사상 최고',
        null,
        '3/6 발표: FY2026 Q2 매출 $124.3B, 전년비 +18%',
        'AI 기능 탑재 아이폰 18 판매 폭발, 서비스 매출 $26B 신기록',
        'AAPL $210 이하 분할 매수, AI 생태계 확장 수혜',
        `<p class="text-xl font-black mb-6">애플 AI 아이폰이 실적을 터뜨렸다 💥🔥</p>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-8 border-l-4 border-blue-500">
            <p class="text-lg font-bold text-blue-700 dark:text-blue-300">📌 실적 핵심 숫자</p>
            <p class="text-2xl font-black">매출 $124.3B(+18%) · 아이폰 $71.2B(+23%)</p>
            <p class="text-base mt-2">서비스 매출: <strong>$26B</strong> 역대 최고</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 무슨 일이야?</h3>
        <p class="mb-4 text-lg leading-relaxed">애플이 AI를 본격 탑재한 아이폰 18 시리즈가 글로벌에서 폭발적 판매를 기록. 특히 Apple Intelligence 기능이 중국·인도 시장에서 대히트. 아이폰 매출 $71.2B로 전년비 23% 급증.</p>
        <p class="mb-6 text-lg leading-relaxed">팀 쿡 CEO: "AI가 애플 생태계의 새로운 시대를 열고 있다." 서비스 부문(앱스토어·애플TV+·애플뮤직)도 $26B로 사상 최고치 경신.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 지금 어떻게 해?</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ <strong>AAPL</strong> — $210 이하에서 분할 매수 적극 검토</li>
                <li>✅ <strong>서비스 매출</strong> 고마진 성장 → 장기 홀딩 매력 ↑</li>
                <li>⚠️ 실적 발표 직후 변동성 주의 — 추격 매수 자제</li>
            </ul>
        </div>`,
        '2026-03-10T09:00:00+09:00'),

    a('us9', 'us-stock',
        '연준 3월 금리 동결 📊 "6월 인하 시사" 파월 발언',
        null,
        '3/8 FOMC: 기준금리 4.25~4.50% 동결, 만장일치',
        '파월 의장 "6월 인하 가능성 열려있다" — 시장 환호',
        '기술주·성장주 비중 확대, 금리 인하 수혜주 주목',
        `<p class="text-xl font-black mb-6">파월이 드디어 힌트를 줬다 📊💰</p>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-8 border-l-4 border-blue-500">
            <p class="text-lg font-bold text-blue-700 dark:text-blue-300">📌 FOMC 핵심</p>
            <p class="text-2xl font-black">금리 4.25~4.50% 동결 · 6월 인하 시사</p>
            <p class="text-base mt-2">점도표: 연내 <strong>2회 인하</strong> 전망 우세</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 의미</h3>
        <p class="mb-4 text-lg leading-relaxed">3월 FOMC에서 예상대로 금리를 동결했지만, 파월 의장이 기자회견에서 "6월 인하 가능성이 열려있다"고 발언하면서 시장이 환호. 나스닥 +2.1% 급등.</p>
        <p class="mb-6 text-lg leading-relaxed">점도표(dot plot)에서는 연내 2회 인하가 다수 의견으로 나타남. 인플레이션이 2.5% 수준으로 안정되면서 연준의 스탠스가 확실히 비둘기파로 전환 중.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 투자 전략</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 금리 인하 수혜주: <strong>기술주·리츠·성장주</strong> 비중 확대</li>
                <li>✅ QQQ·VGT 등 기술주 ETF 분할 매수</li>
                <li>⚠️ 6월까지 경제지표 따라 변동성 → 분할 접근</li>
            </ul>
        </div>`,
        '2026-03-10T09:00:00+09:00'),

    a('us10', 'us-stock',
        '테슬라 로보택시 10개 도시 확대 🚗 주가 +15% 폭등',
        null,
        '테슬라 로보택시 텍사스 이어 캘리포니아 등 10개 도시 확대',
        'FSD V14 업데이트 완료, 월 구독 $99 모델 공개',
        'TSLA 모빌리티 플랫폼 재평가 — 중장기 관점 매수',
        `<p class="text-xl font-black mb-6">테슬라 로보택시 10개 도시로 확대! 🚗💨</p>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-5 mb-8 border-l-4 border-purple-500">
            <p class="text-lg font-bold text-purple-700 dark:text-purple-300">📌 핵심</p>
            <p class="text-base">로보택시 <strong>10개 도시</strong> 확대 · FSD V14 · 월 $99 구독</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 상황</h3>
        <p class="mb-4 text-lg leading-relaxed">테슬라가 로보택시 서비스를 텍사스에서 시작한 지 2주 만에 캘리포니아, 플로리다, 애리조나 등 10개 도시로 확대 발표. FSD V14 업데이트로 사고율이 인간 운전자 대비 80% 감소.</p>
        <p class="mb-6 text-lg leading-relaxed">머스크 CEO는 "2026년 말까지 50개 도시"를 목표로 제시. 월 $99 구독 모델로 일반 소비자도 자기 차를 로보택시로 운영 가능.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 투자 포인트</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 자동차 회사 → <strong>모빌리티 플랫폼</strong> 전환 본격화</li>
                <li>✅ 구독 모델 = 반복 수익 → 밸류에이션 리레이팅</li>
                <li>⚠️ 규제 리스크 + 변동성 여전 — 분할 매수 필수</li>
            </ul>
        </div>`,
        '2026-03-10T09:00:00+09:00'),

    // === 기존 기사 (2026-02-26) ===
    a('us1', 'us-stock',
        'NVIDIA 매출 $68.1B 폭발 🔥 역대 최고 분기 실적',
        null,
        '2/25 발표: FY2026 Q4 매출 $68.1B, 전년비 +73%',
        '데이터센터 $62.3B(+75%), 다음 분기 가이던스 $78B',
        'AI 반도체 수혜주 분할 매수, NVDA·AVGO·TSM 주목',
        `<p class="text-xl font-black mb-6">엔비디아가 어제(2/25) 실적을 터뜨렸다 🔥🔥🔥</p>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-8 border-l-4 border-blue-500">
            <p class="text-lg font-bold text-blue-700 dark:text-blue-300">📌 실적 핵심 숫자</p>
            <p class="text-2xl font-black">매출 $68.1B(+73%) · 데이터센터 $62.3B(+75%)</p>
            <p class="text-base mt-2">다음 분기 가이던스: <strong>$78B</strong> (±2%)</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 무슨 일이야?</h3>
        <p class="mb-4 text-lg leading-relaxed">어제(2월 25일) 발표된 엔비디아 FY2026 4분기 실적이 역대 최고를 갈아치웠음. 매출 $68.1B으로 전년비 73% 폭증. 특히 데이터센터 매출이 $62.3B로 전체의 91%를 차지.</p>
        <p class="mb-6 text-lg leading-relaxed">젠슨 황 CEO: "에이전트 AI의 변곡점에 도달했다." 다음 분기 매출 가이던스 $78B 제시 → 시장 예상($75B)을 상회.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 지금 어떻게 해?</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ <strong>NVDA</strong> — 실적 서프라이즈 확인, 눌림목 분할 매수</li>
                <li>✅ <strong>AVGO·TSM</strong> — AI 반도체 수혜 함께 주목</li>
                <li>⚠️ 시간외 변동성 주의 — 추격 매수보다 분할 접근</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('us2', 'us-stock',
        '엔비디아 연간 매출 $215.9B 🚀 전년비 65% 성장',
        null,
        'FY2026 전체 매출 $215.9B, 역대 최고 연간 실적',
        'AI 컴퓨팅 수요 기하급수적 증가 — 젠슨 황',
        'AI 투자 사이클 지속 확인, 장기 홀딩 전략',
        `<p class="text-xl font-black mb-6">엔비디아 연매출 $216B 💰 미국 GDP 끌어올리는 수준</p>
        <div class="bg-accent-50 dark:bg-accent-900/20 rounded-2xl p-5 mb-8 border-l-4 border-accent-500">
            <p class="text-lg font-bold text-accent-700 dark:text-accent-300">📌 연간 실적</p>
            <p class="text-2xl font-black">FY2026 매출 $215.9B · 전년비 +65%</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">📊 의미</h3>
        <p class="mb-6 text-lg leading-relaxed">1년 만에 매출 65% 성장. 이건 웬만한 국가의 GDP 성장률보다 빠름. AI 반도체 시장을 엔비디아가 독점 중이라는 뜻.</p>
        <h3 class="text-xl font-black mt-8 mb-4">💡 투자 포인트</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ AI 투자 사이클 최소 2028년까지 지속 전망</li>
                <li>✅ 단기 변동성 무시, 장기 홀딩이 답</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('us3', 'us-stock',
        '나스닥 사상 최고 임박 📈 엔비디아 효과 확산',
        null,
        '엔비디아 실적 발표 후 AI 관련주 동반 랠리',
        '나스닥 사상 최고치 재도전, 매그니피센트7 전반 상승',
        'AI·반도체 ETF(SOXX, SMH) 분할 매수',
        `<p class="text-xl font-black mb-6">엔비디아 발 나스닥 랠리 📈</p>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-8 border-l-4 border-blue-500">
            <p class="text-lg font-bold">📌 핵심</p>
            <p class="text-base">엔비디아 호실적 → AI 관련주 전체 동반 상승</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">💡 전략</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ AI·반도체 ETF(SOXX, SMH) 분할 매수</li>
                <li>✅ 개별주보다 ETF가 리스크 분산에 유리</li>
                <li>⚠️ 고점 추격 매수 금지 → 조정 시 진입</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('us4', 'us-stock',
        '테슬라 로보택시 텍사스 시범 운영 시작 🚗',
        null,
        '테슬라 로보택시 텍사스에서 첫 시범 서비스',
        'FSD V13 탑재, 2026년 내 10개 도시 확대 계획',
        'TSLA 모빌리티 플랫폼 재평가, 중장기 관점 매수',
        `<p class="text-xl font-black mb-6">테슬라가 진짜 로보택시 시작했다 🚗💨</p>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-5 mb-8 border-l-4 border-purple-500">
            <p class="text-lg font-bold text-purple-700 dark:text-purple-300">📌 핵심</p>
            <p class="text-base">텍사스 시범 운행 시작 · 연내 <strong>10개 도시</strong> 확대</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">💡 투자 포인트</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 로보택시 성공 → 자동차 → 모빌리티 플랫폼 전환</li>
                <li>⚠️ 규제 리스크 존재 — 분할 매수 필수</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('us5', 'us-stock',
        'MS Azure AI 매출 +60% 💎 클라우드 1위 탈환',
        null,
        'Azure AI 서비스 매출 전분기 대비 60% 급증',
        'OpenAI 파트너십 효과 본격화, 클라우드 1위',
        'MSFT $420 이하 분할 매수',
        `<p class="text-xl font-black mb-6">MS가 AWS 잡았다 💎 클라우드 왕좌 교체</p>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-8 border-l-4 border-blue-500">
            <p class="text-lg font-bold">📌 핵심</p>
            <p class="text-base">Azure AI +60% → 클라우드 점유율 <strong>1위</strong></p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">💡 전략</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ MSFT $420 이하에서 분할 매수</li>
                <li>✅ AI 클라우드 장기 성장 베팅</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('us6', 'us-stock',
        'FY2027 Q1 가이던스 $78B 💪 시장 예상 상회',
        null,
        '엔비디아 다음 분기 예상 매출 $78B±2% 제시',
        '월가 컨센서스($75B) 상회, AI 수요 가속 확인',
        '실적 모멘텀 지속, AI 반도체 비중 확대',
        `<p class="text-xl font-black mb-6">다음 분기 $78B? 엔비디아 미쳤다 💪</p>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 mb-8 border-l-4 border-green-500">
            <p class="text-lg font-bold text-green-700 dark:text-green-300">📌 가이던스</p>
            <p class="text-2xl font-black">FY2027 Q1: $78B (±2%) · 컨센 $75B 상회</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">💡 의미</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ AI 수요 둔화 우려 → <strong>완전 해소</strong></li>
                <li>✅ 다음 분기도 서프라이즈 가능성 높음</li>
                <li>✅ AI 반도체 포트폴리오 비중 유지/확대</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),

    a('us7', 'us-stock',
        '메타 AI 광고 매출 +22% 🚀 릴스 $5B 돌파',
        null,
        'AI 기반 광고 타겟팅 → 매출 +22% 성장',
        '릴스 광고 수익 분기 $5B 첫 돌파',
        'META AI 광고 독점 지속, 장기 홀딩',
        `<p class="text-xl font-black mb-6">메타 AI 광고가 돈을 쓸어담고 있다 🚀</p>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-8 border-l-4 border-blue-500">
            <p class="text-lg font-bold">📌 핵심</p>
            <p class="text-base">AI 광고 매출 <strong>+22%</strong> · 릴스 <strong>$5B</strong> 돌파</p>
        </div>
        <h3 class="text-xl font-black mt-8 mb-4">💡 포인트</h3>
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-6">
            <ul class="space-y-3 text-base">
                <li>✅ 디지털 광고 AI 독점 → 장기 성장</li>
                <li>✅ META $500 이하에서 매수</li>
            </ul>
        </div>`,
        '2026-02-26T09:00:00+09:00'),
];
