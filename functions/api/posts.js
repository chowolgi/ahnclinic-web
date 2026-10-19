// 1. 새 글 저장하기 (POST 요청)
export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { category, title, slug, content, is_published } = body;

        await context.env.DB.prepare(
            "INSERT INTO posts (category, title, slug, content, is_published) VALUES (?, ?, ?, ?, ?)"
        ).bind(
            category, 
            title, 
            slug || title, 
            content, 
            is_published ? 1 : 0
        ).run();

        return new Response(JSON.stringify({ success: true, message: "저장 성공" }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}

// 2. 글 불러오기 (GET 요청 - 목록 전체 조회 & 개별 조회)
export async function onRequestGet(context) {
    try {
        const url = new URL(context.request.url);
        const id = url.searchParams.get("id");

        if (id) {
            // id가 있으면 (수정 화면): 해당 글 1개만 가져오기
            const post = await context.env.DB.prepare(
                "SELECT * FROM posts WHERE id = ?"
            ).bind(id).first();
            return new Response(JSON.stringify(post), { headers: { "Content-Type": "application/json" } });
        } else {
            // id가 없으면 (목록 화면): 전체 글 가져오기
            const { results } = await context.env.DB.prepare(
                "SELECT * FROM posts ORDER BY created_at DESC"
            ).all();
            return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

// 3. 글 삭제하기 (DELETE 요청)
export async function onRequestDelete(context) {
    try {
        const url = new URL(context.request.url);
        const id = url.searchParams.get("id");

        if (!id) throw new Error("ID가 없습니다.");

        await context.env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();

        return new Response(JSON.stringify({ success: true, message: "삭제 완료" }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}

// 4. ★ 글 수정하기 (PUT 요청 - 새롭게 추가된 기능) ★
export async function onRequestPut(context) {
    try {
        const body = await context.request.json();
        const { id, category, title, slug, content, is_published } = body;

        if (!id) throw new Error("수정할 글의 ID가 없습니다.");

        // 기존 데이터를 새 데이터로 덮어쓰기 (UPDATE)
        await context.env.DB.prepare(
            "UPDATE posts SET category = ?, title = ?, slug = ?, content = ?, is_published = ? WHERE id = ?"
        ).bind(
            category,
            title,
            slug || title,
            content,
            is_published ? 1 : 0,
            id
        ).run();

        return new Response(JSON.stringify({ success: true, message: "수정 완료" }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}
