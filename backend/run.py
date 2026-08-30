import os
import sys
import uvicorn

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.config import settings

if __name__ == "__main__":
    print(f"[FastAPI] Starting MoSPI PAIMANA Backend Server on http://localhost:{settings.PORT}")
    print(f"[Swagger Docs] Interactive API Documentation at http://localhost:{settings.PORT}/docs")
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
