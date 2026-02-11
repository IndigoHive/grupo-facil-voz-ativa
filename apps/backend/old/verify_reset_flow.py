import httpx
import asyncio
import re

# Use a test email that exists or we can create a user.
# For simplicity, let's assume 'teste@teste.com' exists or we can use the admin user if we know creds.
# Better: Create a user first, then reset their password.

BASE_URL = "http://localhost:8012"
ADMIN_EMAIL = "admin@example.com" # We need a superadmin to create a company/user or just use an existing one.
# Let's try to use an existing user or create one if we can auth.

# Actually, let's just assume we can use a fresh db or just pick a user.
# We'll use 'verification_user@example.com' if we can create it.
# If not, we'll try to use a known user or just fail if we can't context setup.

# Alternative: We can mock the DB session but that's complex.
# Let's rely on the fact we can create a user if we have a superadmin token.
# If we don't have a token, we can't create a user.

# Let's just try to reset password for 'usuario@empresa.com' which likely exists in dev or we create it.
TARGET_EMAIL = "teste_reset@vozativa.com"

async def verify():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        print("1. Starting server check...")
        try:
            r = await client.get("/docs")
            if r.status_code != 200:
                print("Server not ready")
                return
        except:
            print("Server not reachable")
            return

        print(f"2. Requesting password reset for {TARGET_EMAIL}...")
        # Note: If this user doesn't exist, it returns 404 (as per our helpful implementation).
        
        # We need to CREATE the user first to be sure.
        # To create a user we need admin auth.
        # Let's try to login as admin first (setup in migrations usually).
        # Assuming admin@vozativa.com / admin exists? Or we check seed?
        # If we can't create, we can't verify fully automatically.

        # Plan B: Just check if the endpoint validates input correctly.
        r = await client.post("/auth/forgot-password", json={"email": TARGET_EMAIL})
        
        if r.status_code == 404:
             print(f"User {TARGET_EMAIL} not found. Cannot verified full flow without seeding.")
             # Attempt to proceed? No.
             return

        if r.status_code != 200:
            print(f"Failed to request reset: {r.status_code} {r.text}")
            return
            
        print("Reset request successful.")
        
        # 3. Retrieve Token.
        # Since we modified the code to print the link in stdout, validation script can't easily see stdout of server *unless* we capture it.
        # But we are running the server separately.
        
        # Workaround: For verification purposes, we can read Redis directly!
        import redis
        r_client = redis.Redis(host="redisgaragem.zrhdsarhreh.shop", port=6379, db=0, decode_responses=True)
        
        # Scan for keys "reset_password:*"
        keys = r_client.keys("reset_password:*")
        target_key = None
        for k in keys:
            val = r_client.get(k)
            if val == TARGET_EMAIL:
                target_key = k
                break
        
        if not target_key:
            print("Token not found in Redis!")
            return
            
        token = target_key.split(":")[1]
        print(f"Found token in Redis: {token}")
        
        # 4. Reset Password
        new_pass = "NovaSenha123!"
        print("3. Resetting password...")
        r = await client.post("/auth/reset-password", json={"token": token, "new_password": new_pass})
        
        if r.status_code != 200:
             print(f"Failed to reset: {r.status_code} {r.text}")
             return
             
        print("Password reset successful.")
        
        # 5. Login with new password
        print("4. Logging in with new password...")
        r = await client.post("/token", json={"email": TARGET_EMAIL, "password": new_pass})
        if r.status_code == 200:
            print("Login Successful! Verification Complete.")
        else:
            print(f"Login Failed: {r.status_code} {r.text}")

if __name__ == "__main__":
    # We need to ensure we run this while a server is running on 8012
    asyncio.run(verify())
