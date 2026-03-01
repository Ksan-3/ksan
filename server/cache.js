import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 캐시 파일 경로
const CACHE_DIR = path.join(__dirname, 'data');
const CACHE_FILE = path.join(CACHE_DIR, 'cache.json');

// 7일 (밀리초)
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// 캐시 초기화
function initCache() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    if (!fs.existsSync(CACHE_FILE)) {
        fs.writeFileSync(CACHE_FILE, JSON.stringify({}, null, 2), 'utf-8');
    }
}

// 캐시 읽기
function readCache() {
    try {
        initCache();
        const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('[캐시] 읽기 오류:', err.message);
        return {};
    }
}

// 캐시 저장
function writeCache(data) {
    try {
        initCache();
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error('[캐시] 저장 오류:', err.message);
    }
}

// 카테고리별 뉴스 저장 (7일치 유지)
export function saveNews(category, articles) {
    const cache = readCache();

    if (!cache[category]) {
        cache[category] = [];
    }

    // 새 기사 추가 (중복 제거: 제목 기준)
    const existingTitles = new Set(cache[category].map(a => a.title));
    const newArticles = articles.filter(a => !existingTitles.has(a.title));

    cache[category] = [...newArticles, ...cache[category]];

    // 7일 초과 데이터 삭제
    const cutoff = Date.now() - SEVEN_DAYS;
    cache[category] = cache[category].filter(a => {
        const articleDate = new Date(a.fetchedAt || a.pubDate).getTime();
        return articleDate > cutoff;
    });

    // 최대 50개 유지
    cache[category] = cache[category].slice(0, 50);

    writeCache(cache);
    console.log(`[캐시] ${category}: ${newArticles.length}개 추가, 총 ${cache[category].length}개 보관 중`);
}

// 카테고리별 뉴스 조회
export function getNews(category) {
    const cache = readCache();
    return cache[category] || [];
}

// 특정 기사 조회 (ID 기준)
export function getArticleById(category, articleId) {
    const articles = getNews(category);
    return articles.find(a => a.id === articleId) || null;
}

// 전체 카테고리 뉴스 조회 (플랫 배열로 반환 — 프론트엔드 호환)
export function getAllNews() {
    const cache = readCache();
    const allArticles = [];
    for (const articles of Object.values(cache)) {
        if (Array.isArray(articles)) {
            allArticles.push(...articles);
        }
    }
    // 최신순 정렬
    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    return allArticles;
}

// 캐시 상태 정보
export function getCacheStats() {
    const cache = readCache();
    const stats = {};
    for (const [cat, articles] of Object.entries(cache)) {
        stats[cat] = {
            count: articles.length,
            oldest: articles.length > 0 ? articles[articles.length - 1].pubDate : null,
            newest: articles.length > 0 ? articles[0].pubDate : null,
        };
    }
    return stats;
}
