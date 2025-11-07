from database import engine

print("✅ Testing connection...")
connection = engine.connect()
print("Connected to:", connection.engine.url)
connection.close()
