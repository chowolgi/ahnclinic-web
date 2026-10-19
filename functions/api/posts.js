// 글 저장하기 (POST 요청)
export async function onRequestPost(context) {
    try {
        // 프론트엔드(작성 화면)에서 보낸 데이터 받기
        const body = await context.request.json();
        const { category, title, slug, content, is_published } = body;

        // D1 데이터베이스에 데이터 밀어넣기
        const info = await context.env.DB.prepare(
            "INSERT INTO posts (category, title, slug, content, is_published) VALUES (?, ?, ?, ?, ?)"
        ).bind(
            category, 
            title, 
            slug || title, // 슬러그가 없으면 제목을 슬러그로 사용
            content, 
            is_published ? 1 : 0
        ).run();

        // 성공했다고 프론트엔드에 알려주기
        return new Response(JSON.stringify({ success: true, message: "칼럼이 성공적으로 저장되었습니다." }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

// 저장된 글 불러오기 (GET 요청)
export async function onRequestGet(context) {
    try {
        // D1 데이터베이스에서 최신순으로 데이터 가져오기
        const { results } = await context.env.DB.prepare(
            "SELECT * FROM posts ORDER BY created_at DESC"
        ).all();

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
