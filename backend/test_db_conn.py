import asyncio
import asyncpg

async def test_connection():
    try:
        conn = await asyncpg.connect(
            user='postgres',
            password='root',
            host='localhost',
            port=5432,
            database='foodstore_db'
        )
        version = await conn.fetchval('SELECT version()')
        print("Connection successful!")
        print(f"PostgreSQL version: {version}")
        await conn.close()
    except Exception as e:
        print(f"Connection failed: {type(e).__name__}: {e}")

asyncio.run(test_connection())
