import asyncio
import json
import logging
from datetime import datetime
from typing import Any

import httpx
import redis.asyncio as redis

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("checker")

REDIS_URL = "redis://localhost:6379"
API_URL = "http://localhost:3000"
CHECK_TIMEOUT = 30


class CheckerWorker:
    def __init__(self) -> None:
        self.redis: redis.Redis | None = None
        self.http_client: httpx.AsyncClient | None = None
        self.running = False

    async def connect(self) -> None:
        self.redis = redis.from_url(REDIS_URL)
        self.http_client = httpx.AsyncClient(base_url=API_URL, timeout=CHECK_TIMEOUT)
        logger.info("Connected to Redis and API")

    async def disconnect(self) -> None:
        if self.redis:
            await self.redis.close()
        if self.http_client:
            await self.http_client.aclose()
        logger.info("Disconnected")

    async def process_check_job(self, job_data: dict[str, Any]) -> dict[str, Any]:
        service_id = job_data["service_id"]
        team_id = job_data["team_id"]
        challenge_id = job_data["challenge_id"]
        tick = job_data["tick"]
        round_num = job_data["round"]

        logger.info(f"Checking service {service_id} for team {team_id}")

        result = {
            "service_id": service_id,
            "team_id": team_id,
            "challenge_id": challenge_id,
            "tick": tick,
            "round": round_num,
            "status": "up",
            "message": "Service is healthy",
            "checked_at": datetime.utcnow().isoformat(),
        }

        try:
            response = await self.http_client.get(f"/services/{service_id}")
            if response.status_code == 200:
                service = response.json().get("service", {})
                detail = service.get("detail", {})

                if detail.get("check_url"):
                    check_response = await self.http_client.get(detail["check_url"], timeout=10)
                    if check_response.status_code != 200:
                        result["status"] = "down"
                        result["message"] = f"Health check failed: {check_response.status_code}"
            else:
                result["status"] = "error"
                result["message"] = "Failed to fetch service info"
        except Exception as e:
            result["status"] = "down"
            result["message"] = str(e)

        return result

    async def report_result(self, result: dict[str, Any]) -> None:
        if not self.http_client:
            return

        try:
            response = await self.http_client.post(
                "/checker/results",
                json=result,
            )
            if response.status_code == 200:
                logger.info(f"Reported result for service {result['service_id']}")
            else:
                logger.error(f"Failed to report result: {response.status_code}")
        except Exception as e:
            logger.error(f"Error reporting result: {e}")

    async def run(self) -> None:
        await self.connect()
        self.running = True

        logger.info("Checker worker started")

        while self.running:
            try:
                result = await self.redis.brpop("checker:jobs", timeout=5)
                if result:
                    _, job_json = result
                    job_data = json.loads(job_json)

                    check_result = await self.process_check_job(job_data)
                    await self.report_result(check_result)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error processing job: {e}")
                await asyncio.sleep(1)

    async def stop(self) -> None:
        self.running = False
        await self.disconnect()


async def main() -> None:
    worker = CheckerWorker()
    try:
        await worker.run()
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        await worker.stop()


if __name__ == "__main__":
    asyncio.run(main())
