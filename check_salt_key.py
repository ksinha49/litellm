import hashlib

# Your current keys from Docker command
LITELLM_SALT_KEY = "K$57Rdf2Ry15L5XQlyvc"
LITELLM_MASTER_KEY = "K$57Gcf2Cy14L5Xulywb"

# The system uses SALT_KEY first, then falls back to MASTER_KEY
current_key = LITELLM_SALT_KEY

# Calculate the hash
full_hash = hashlib.sha256(current_key.encode()).hexdigest()
prefix = full_hash[:8]

print("=== CURRENT ENVIRONMENT KEYS ===")
print(f"LITELLM_SALT_KEY: {LITELLM_SALT_KEY}")
print(f"Full SHA256 Hash: {full_hash}")
print(f"8-char Prefix:    {prefix}")
print()

print("=== DATABASE STORED HASH ===")
db_hash = "2a2c33b83998337dab9823df8be874f96f1c3da44ad9fff1b835bcdf263e5ef4"
db_prefix = db_hash[:8]
print(f"Database Hash:    {db_hash}")
print(f"8-char Prefix:    {db_prefix}")
print()

print("=== COMPARISON ===")
if full_hash == db_hash:
    print("✅ PERFECT MATCH! Salt keys are identical.")
else:
    print("❌ MISMATCH! The database was encrypted with a DIFFERENT salt key.")
    print(f"   Your key produces:  {prefix}")
    print(f"   Database expects:   {db_prefix}")
