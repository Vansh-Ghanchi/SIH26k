from fastapi import APIRouter
from pydantic import BaseModel
from app.services.assistant_service import assistant_service

router = APIRouter(prefix="/ai-assistant", tags=["MoSPI AI Copilot"])

class ChatMessageRequest(BaseModel):
    message: str

@router.post("/chat")
def chat_with_copilot(payload: ChatMessageRequest):
    """Conversational NLP AI Copilot assistant querying MoSPI Central Data Lake."""
    response = assistant_service.answer_query(payload.message)
    return {
        "success": True,
        "reply": response["reply"],
        "sources": response.get("sources", ["MoSPI Central Data Lake"])
    }
