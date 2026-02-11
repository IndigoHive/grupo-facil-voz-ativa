import httpx
import json
import asyncio

async def verify():
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get("http://localhost:8011/openapi.json")
            if r.status_code == 200:
                data = r.json()
                print("Security Schemes:")
                print(json.dumps(data.get("components", {}).get("securitySchemes"), indent=2))
                
                print("\nSecurity on /users/me:")
                paths = data.get("paths", {})
                user_me = paths.get("/users/me", {}).get("get", {})
                print(json.dumps(user_me.get("security"), indent=2))
            else:
                print(f"Error: {r.status_code} {r.text}")
        except Exception as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(verify())
