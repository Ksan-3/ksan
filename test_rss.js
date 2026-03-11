const query1 = '코스피 시황 오늘';
const query2 = '나스닥 마감 오늘';

async function fetchNewsFromRSS(query) {
    try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
        console.log("Fetching: ", url);
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
                const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
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
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function run() {
    const res1 = await fetchNewsFromRSS(query1);
    console.log("res1: ", res1.length);
    console.log(res1[0]?.title);
    const res2 = await fetchNewsFromRSS(query2);
    console.log("res2: ", res2.length);
    console.log(res2[0]?.title);
}
run();
