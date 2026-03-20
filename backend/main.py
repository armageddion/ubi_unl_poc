from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="UBI UNL POC API")

ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SOLUME_BASE_URL = os.getenv("SOLUME_BASE_URL")
SOLUME_USERNAME = os.getenv("SOLUME_USERNAME")
SOLUME_PASSWORD = os.getenv("SOLUME_PASSWORD")
SOLUME_COMPANY = os.getenv("SOLUME_COMPANY")
SOLUME_STORE = os.getenv("SOLUME_STORE")
SOLUME_ENDPOINT_1 = os.getenv("SOLUME_ENDPOINT_1", "/common/api/v2/labels/page")
SOLUME_ENDPOINT_2 = os.getenv("SOLUME_ENDPOINT_2", "/common/api/v2/labels/led")


class Trigger1Request(BaseModel):
    labelCodes: List[str]
    page: int


class Trigger2Request(BaseModel):
    labelCodes: List[str]
    color: str
    duration: str


class TriggerResponse(BaseModel):
    status: str
    message: str
    data: Optional[dict] = None


async def get_solume_cookies() -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SOLUME_BASE_URL}/common/api/v2/token",
            json={
                "username": SOLUME_USERNAME,
                "password": SOLUME_PASSWORD
            },
            headers={"Content-Type": "application/json"},
            timeout=30.0
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Auth failed: {response.text}"
            )
        set_cookie = response.headers.get("set-cookie", "")
        return set_cookie


def parse_response(response: httpx.Response) -> dict:
    try:
        text = response.text.strip()
        if not text:
            return {"status_code": response.status_code, "body": ""}
        return response.json()
    except Exception:
        return {"status_code": response.status_code, "body": response.text}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/trigger-1", response_model=TriggerResponse)
async def trigger_1(request: Trigger1Request):
    try:
        cookies = await get_solume_cookies()
        
        page_change_list = [
            {"labelCode": labelCode, "page": request.page}
            for labelCode in request.labelCodes
        ]
        
        url = f"{SOLUME_BASE_URL}{SOLUME_ENDPOINT_1}?company={SOLUME_COMPANY}&store={SOLUME_STORE}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json={"pageChangeList": page_change_list},
                headers={
                    "Cookie": cookies,
                    "Content-Type": "application/json"
                },
                timeout=60.0
            )
            
        if response.status_code >= 400:
            return TriggerResponse(
                status="failure",
                message=f"API call failed (status {response.status_code}): {response.text}"
            )
            
        return TriggerResponse(
            status="success",
            message="Page change completed successfully",
            data=parse_response(response)
        )
    except HTTPException as e:
        return TriggerResponse(
            status="failure",
            message=str(e.detail)
        )
    except Exception as e:
        return TriggerResponse(
            status="failure",
            message=f"Unexpected error: {str(e)}"
        )


@app.post("/api/trigger-2", response_model=TriggerResponse)
async def trigger_2(request: Trigger2Request):
    try:
        cookies = await get_solume_cookies()
        
        led_blink_list = [
            {
                "labelCode": labelCode,
                "color": request.color,
                "duration": request.duration,
                "patternId": 0,
                "multiLed": False
            }
            for labelCode in request.labelCodes
        ]
        
        url = f"{SOLUME_BASE_URL}{SOLUME_ENDPOINT_2}?company={SOLUME_COMPANY}&store={SOLUME_STORE}"
        
        async with httpx.AsyncClient() as client:
            response = await client.put(
                url,
                json={"ledBlinkList": led_blink_list},
                headers={
                    "Cookie": cookies,
                    "Content-Type": "application/json"
                },
                timeout=60.0
            )
            
        if response.status_code >= 400:
            return TriggerResponse(
                status="failure",
                message=f"API call failed (status {response.status_code}): {response.text}"
            )
            
        return TriggerResponse(
            status="success",
            message="LED blink completed successfully",
            data=parse_response(response)
        )
    except HTTPException as e:
        return TriggerResponse(
            status="failure",
            message=str(e.detail)
        )
    except Exception as e:
        return TriggerResponse(
            status="failure",
            message=f"Unexpected error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
