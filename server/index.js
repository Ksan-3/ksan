import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { fetchAllNews, CATEGORY_CONFIG } from './newsFetcher.js';
import { getNews, getArticleById, getAllNews, getCacheStats } from './cache.js';

const app = express();
const PORT = 3001;

// CORS 설정 (프론트엔드 Vite 서버 및 기타 로컬 주소 허용)
app.use(cors({
    origin: '*', // 개발 단계에서는 전체 허용
    methods: ['GET'],
}));

app.use(express.json());

// === API 라우트 ===

// 전체 뉴스 조회
app.get('/api/news', (req, res) => {
    try {
        const allNews = getAllNews();
        res.json({ success: true, data: allNews });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 캐시 상태 조회
app.get('/api/stats', (req, res) => {
    try {
        const stats = getCacheStats();
        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 카테고리별 뉴스 조회
app.get('/api/news/:category', (req, res) => {
    try {
        const { category } = req.params;
        if (!CATEGORY_CONFIG[category]) {
            return res.status(400).json({ success: false, error: '유효하지 않은 카테고리입니다.' });
        }
        const news = getNews(category);
        res.json({ success: true, category, data: news });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 특정 기사 조회 (상세 모달용)
app.get('/api/news/:category/:id', (req, res) => {
    try {
        const { category, id } = req.params;
        const article = getArticleById(category, id);
        if (!article) {
            return res.status(404).json({ success: false, error: '기사를 찾을 수 없습니다.' });
        }
        res.json({ success: true, data: article });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 수동 뉴스 갱신 엔드포인트
app.get('/api/refresh', async (req, res) => {
    try {
        console.log('[API] 수동 뉴스 갱신 요청');
        await fetchAllNews();
        const stats = getCacheStats();
        res.json({ success: true, message: '뉴스 갱신 완료', data: stats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 카테고리 목록 조회
app.get('/api/categories', (req, res) => {
    const categories = Object.entries(CATEGORY_CONFIG).map(([id, config]) => ({
        id,
        label: config.label,
        emoji: config.emoji,
    }));
    res.json({ success: true, data: categories });
});

// === 크론 스케줄러 ===
// 매 6시간마다 뉴스 자동 수집 (00:00, 06:00, 12:00, 18:00)
cron.schedule('0 */6 * * *', async () => {
    console.log('[크론] 정기 뉴스 수집 시작...');
    await fetchAllNews();
    console.log('[크론] 정기 뉴스 수집 완료');
});

// === 서버 시작 ===
app.listen(PORT, async () => {
    console.log(`\n📊 데일리 재테크 픽 API 서버`);
    console.log(`📡 http://localhost:${PORT}`);
    console.log(`📊 카테고리: ${Object.values(CATEGORY_CONFIG).map(c => c.emoji + ' ' + c.label).join(' | ')}`);
    console.log(`⏰ 자동 수집: 매 6시간\n`);

    // 서버 시작 시 초기 뉴스 수집
    console.log('[서버 시작] 초기 뉴스 수집 중...');
    try {
        await fetchAllNews();
        console.log('[서버 시작] 초기 뉴스 수집 완료!\n');
    } catch (err) {
        console.error('[서버 시작] 초기 수집 실패:', err.message);
    }
});
