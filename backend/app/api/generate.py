from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import OpenAI
from typing import Optional
import asyncio
import os
from app.services.config_service import config_service
from app.services.theme_service import theme_service

# 禁用代理
os.environ.pop('http_proxy', None)
os.environ.pop('https_proxy', None)
os.environ.pop('HTTP_PROXY', None)
os.environ.pop('HTTPS_PROXY', None)


router = APIRouter()


class GenerateRequest(BaseModel):
    content: str
    theme_id: Optional[str] = None
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.8
    top_p: Optional[float] = 0.9
    suggestion: Optional[str] = None
    outline: Optional[str] = None
    generate_mode: Optional[str] = "continue"  # "continue" or "complete"


@router.post("/")
async def generate(request: GenerateRequest):
    config = config_service.get_config()

    if not config.get("api_key"):
        raise HTTPException(status_code=400, detail="API key not configured")

    # Get theme settings
    system_prompt = "你是一个小说写作助手。"
    if request.theme_id:
        theme = theme_service.get_theme(request.theme_id)
        if theme:
            system_prompt = f"""你是一个小说写作助手。请根据以下风格和设定来创作：

风格类型：{theme.genre}
写作风格：{theme.style}
世界观/背景：{theme.background}
角色设定：{theme.characters}
其他设定：{theme.other_settings}

请继续保持当前的故事风格和节奏进行续写。"""

    # Build user prompt with outline if provided
    user_prompt = f"请根据以下内容续写故事。要求：\n1. 保持段落分明，使用换行分隔不同段落\n2. 每个段落应该是一个完整的叙事单元\n3. 保持故事的连贯性和风格一致\n\n待续写内容：\n\n{request.content}"

    if request.outline:
        user_prompt += f"\n\n【故事大纲】\n{request.outline}"

    # Add suggestion if provided
    if request.suggestion:
        user_prompt += f"\n\n改进建议：{request.suggestion}"

    client = OpenAI(
        base_url=config.get("base_url", "https://api.openai.com/v1"),
        api_key=config["api_key"],
    )

    model = config.get("model", "gpt-3.5-turbo")

    async def generate_stream():
        try:
            # Check if generating from outline only (empty content)
            if not request.content and request.outline:
                if request.generate_mode == "complete":
                    user_prompt = f"""请根据以下故事大纲创作一个完整的中篇小说。

【故事大纲】
{request.outline}

要求：
1. 保持段落分明，使用换行分隔不同段落
2. 每个段落应该是一个完整的叙事单元
3. 故事要有完整的开头、发展、高潮、结局
4. 开头要有吸引力，结局要令人满意
5. 字数要求：2000-4000字左右
6. 一次性生成完整的故事，不要分段生成
"""
                else:
                    user_prompt = f"""请根据以下故事大纲创作小说正文。

【故事大纲】
{request.outline}

要求：
1. 保持段落分明，使用换行分隔不同段落
2. 每个段落应该是一个完整的叙事单元
3. 故事要从开头开始，保持连贯性和风格一致
4. 开头要有吸引力，能吸引读者继续阅读
"""
            else:
                if request.generate_mode == "complete":
                    user_prompt = f"""请根据以下内容续写，创作一个完整的故事结尾。

当前内容：
{request.content}

要求：
1. 保持段落分明，使用换行分隔不同段落
2. 续写要有完整的结局，给读者一个满意的结尾
3. 字数要求：1500-3000字左右
4. 一次性生成完整的故事结尾
"""
                else:
                    user_prompt = f"请根据以下内容续写故事。要求：\n1. 保持段落分明，使用换行分隔不同段落\n2. 每个段落应该是一个完整的叙事单元\n3. 保持故事的连贯性和风格一致\n4. 句子之间要自然衔接，不要在句子中间断开\n\n待续写内容：\n\n{request.content}"

                # Add outline if provided
                if request.outline:
                    user_prompt += f"\n\n【故事大纲】\n{request.outline}"

            # Add suggestion if provided
            if request.suggestion:
                user_prompt += f"\n\n改进建议：{request.suggestion}"

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=request.max_tokens if request.generate_mode == "continue" else 4000,
                temperature=request.temperature or 0.8,
                top_p=request.top_p or 0.9,
                stream=True,
            )

            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    yield f"data: {content}\n\n"
                    await asyncio.sleep(0.01)

            yield "data: [DONE]\n\n"
        except Exception as e:
            import traceback
            yield f"data: [ERROR] {str(e)}\n\n{traceback.format_exc()}\n\n"

    return StreamingResponse(generate_stream(), media_type="text/event-stream")