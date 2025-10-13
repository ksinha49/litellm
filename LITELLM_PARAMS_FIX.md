# LiteLLM Params Parsing Error - Fix Documentation

## Problem Description

You encountered this warning in your Docker logs:

```
03:19:42 - LiteLLM Proxy:WARNING: proxy_server.py:2592 - Invalid litellm_params skipped: <unable to parse litellm_params>
```

This indicates that one or more models in your database have invalid `litellm_params` that cannot be parsed by the LiteLLM Proxy. These models are being skipped and won't be available for routing.

## Root Cause

The `litellm_params` field in the database contains data that cannot be parsed due to:

1. **Malformed JSON** - Invalid JSON syntax
2. **Missing required fields** - The `model` field is required but missing
3. **Wrong data type** - Data stored as Python string representation instead of JSON
4. **Decryption failure** - Encrypted values that cannot be decrypted
5. **Schema validation errors** - Data structure doesn't match LiteLLM_Params requirements

## What Was Fixed

### 1. Enhanced Error Logging (proxy_server.py:2590-2594)

**Before:**
```python
except ValueError:
    masked_params = _mask_litellm_params_for_logging(m.litellm_params)
    verbose_proxy_logger.warning(
        f"Invalid litellm_params skipped: {masked_params}"
    )
```

**After:**
```python
except ValueError as e:
    masked_params = _mask_litellm_params_for_logging(m.litellm_params)
    verbose_proxy_logger.warning(
        f"Invalid litellm_params skipped for model_id={m.model_id}, model_name={m.model_name}: {str(e)} | params={masked_params}"
    )
```

**Benefits:**
- Shows which specific model is failing (model_id and model_name)
- Displays the actual error message explaining why parsing failed
- Makes debugging much easier

### 2. Database Diagnostic Script (diagnose_litellm_params.py)

Created a comprehensive diagnostic tool that:
- Connects to your LiteLLM database
- Tests parsing of all models' litellm_params
- Provides detailed error messages for each invalid model
- Suggests specific fixes for common issues
- Generates SQL commands to clean up invalid entries

## How to Use

### Option 1: Using the Admin UI (Recommended)

The easiest way to diagnose and fix models is through the Admin UI.

#### Step 1: Access Model Diagnostics

1. Log in to the LiteLLM Admin UI as an Admin or Admin Viewer
2. Navigate to **Settings** in the main navigation
3. Click on the **Model Diagnostics** tab

#### Step 2: Review Diagnostic Report

The diagnostics page will automatically scan all models and display:

- **Summary cards** showing:
  - Total number of models
  - Number of valid models (green)
  - Number of invalid models (red)

- **Detailed table** with all models showing:
  - Status (Valid/Invalid badge)
  - Model name and ID
  - Parameter information
  - Error details (expandable for invalid models)
  - Suggested fixes
  - Action buttons

#### Step 3: Fix Invalid Models

For each invalid model, you have two options:

**Option A: Fix the Model**
1. Click the **Fix** button next to the invalid model
2. A modal will open showing:
   - Current error message
   - JSON editor with the model's current params
   - Suggestions for fixing the issue
3. Edit the JSON to fix the issues (ensure 'model' field is present)
4. Click **Fix Model** to save the changes
5. The model will be updated and the router will reload automatically

**Option B: Delete the Model**
1. Click the **Delete** button next to the invalid model
2. Confirm the deletion
3. The model will be removed from the database

#### Step 4: Verify the Fix

- Click **Refresh** to re-run diagnostics
- Verify that invalid model count has decreased
- Check that the fixed model now shows as "Valid"

### Option 2: Using the Command Line

### Step 1: Check Enhanced Logs

After restarting your Docker container, the new error messages will show more detail:

```
Invalid litellm_params skipped for model_id=abc123, model_name=gpt-4: Invalid litellm_params: model field required | params={"api_key": "***"}
```

This tells you:
- Which model is failing: `model_id=abc123, model_name=gpt-4`
- Why it's failing: `model field required`
- What the params look like (with sensitive data masked)

### Step 2: Run the Diagnostic Script

The diagnostic script provides a comprehensive analysis of all models in your database.

**Requirements:**
- Access to the LiteLLM database
- `DATABASE_URL` environment variable set

**Usage:**

```bash
# Set your database URL
export DATABASE_URL="postgresql://user:password@host:port/dbname"

# Run the diagnostic script
cd /path/to/litellm
python diagnose_litellm_params.py
```

**If running in Docker:**

```bash
# Copy script into container
docker cp diagnose_litellm_params.py <container_name>:/app/

# Run inside container
docker exec -it <container_name> python /app/diagnose_litellm_params.py
```

**Example Output:**

```
================================================================================
LiteLLM Proxy - Database Diagnostic Tool
================================================================================
✓ Successfully connected to database

Fetching models from database...
Found 5 models in database

================================================================================
DIAGNOSING MODELS
================================================================================

[1/5] Model ID: model-abc-123
    Model Name: gpt-4
    Created By: admin
    Created At: 2024-01-15 10:30:00
    Params Info: dict with keys: ['api_key', 'api_base'] | has 'model' field: False
    Status: ✗ INVALID
    Error: Invalid litellm_params: model field required

[2/5] Model ID: model-def-456
    Model Name: gpt-3.5-turbo
    Created By: admin
    Created At: 2024-01-15 10:31:00
    Params Info: dict with keys: ['model', 'api_key', 'timeout'] | has 'model' field: True
    Status: ✓ VALID

================================================================================
SUMMARY
================================================================================
Total models: 5
Valid models: 4 ✓
Invalid models: 1 ✗

================================================================================
INVALID MODELS DETAILS
================================================================================

Model ID: model-abc-123
Model Name: gpt-4
Error: Invalid litellm_params: model field required
Params: {"api_key": "sk-xxx", "api_base": "https://..."}

Suggested fixes:
  - Add 'model' field to litellm_params (this is required)

To delete this model:
  SQL: DELETE FROM "LiteLLM_ProxyModelTable" WHERE model_id = 'model-abc-123';
```

### Step 3: Fix Invalid Models

Based on the diagnostic output, you have several options:

#### Option A: Fix the litellm_params in Database

If you want to keep the model, update it with valid params:

```sql
-- Add missing 'model' field
UPDATE "LiteLLM_ProxyModelTable"
SET litellm_params = jsonb_set(
    litellm_params::jsonb,
    '{model}',
    '"gpt-4"'
)
WHERE model_id = 'model-abc-123';
```

#### Option B: Delete Invalid Models

If the models are not needed:

```sql
-- Delete a specific invalid model
DELETE FROM "LiteLLM_ProxyModelTable" WHERE model_id = 'model-abc-123';

-- Or delete all models with missing 'model' field
DELETE FROM "LiteLLM_ProxyModelTable"
WHERE NOT (litellm_params::jsonb ? 'model');
```

#### Option C: Recreate Models via Config

The safest approach is to define models in your `config.yaml`:

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: gpt-4                          # Required field
      api_key: os.environ/OPENAI_API_KEY   # Use env vars for secrets
      api_base: https://api.openai.com/v1
      timeout: 300
```

Then reload or restart the proxy.

### Step 4: Verify the Fix

After fixing:

1. **Restart the LiteLLM Proxy** to reload models from database
2. **Check logs** for any remaining warnings
3. **Run diagnostic script again** to verify all models are valid
4. **Test model access** via API to ensure models are available

## Common Issues and Solutions

### Issue 1: Missing 'model' Field

**Error:** `Invalid litellm_params: model field required`

**Fix:** Add the `model` field to litellm_params:

```sql
UPDATE "LiteLLM_ProxyModelTable"
SET litellm_params = jsonb_set(
    litellm_params::jsonb,
    '{model}',
    '"azure/gpt-4"'  -- Use appropriate model identifier
)
WHERE model_id = 'your-model-id';
```

### Issue 2: Malformed JSON

**Error:** `Failed to parse LiteLLM_Params string representation`

**Fix:** Ensure litellm_params is stored as valid JSON, not a string representation:

```python
# Correct format in database:
{"model": "gpt-4", "api_key": "sk-xxx"}

# Incorrect format:
"LiteLLM_Params(model='gpt-4', api_key='sk-xxx')"
```

### Issue 3: Decryption Failure

**Error:** `Unable to decrypt value=...`

**Fix:** Either:
- Ensure encryption keys are properly configured
- Store values as plain text (use `os.environ/` prefix for env vars)

```json
{
  "model": "gpt-4",
  "api_key": "os.environ/OPENAI_API_KEY"
}
```

### Issue 4: NULL litellm_params

**Error:** `Invalid litellm params type=<class 'NoneType'>`

**Fix:** Delete the model or provide valid litellm_params:

```sql
DELETE FROM "LiteLLM_ProxyModelTable" WHERE litellm_params IS NULL;
```

## Prevention

To prevent future issues:

1. **Use config.yaml for model definitions** instead of directly inserting into database
2. **Validate models before adding** to database via API endpoints
3. **Use the diagnostic script periodically** to catch issues early
4. **Monitor logs** with the enhanced error messages
5. **Follow the example format** from the config.yaml file

### Valid litellm_params Structure

```json
{
  "model": "gpt-4",                        // Required
  "api_key": "sk-xxx",                     // Or use os.environ/VAR_NAME
  "api_base": "https://api.openai.com/v1",
  "api_version": "2023-05-15",
  "timeout": 300,
  "max_retries": 3,
  "rpm": 60,
  "tpm": 10000
}
```

## API Endpoints

For programmatic access, two new API endpoints are available:

### GET /model/diagnostics

Returns diagnostic information for all models.

**Authentication**: Requires Admin or Admin Viewer role

**Response**:
```json
{
  "total_models": 10,
  "valid_models": 8,
  "invalid_models": 2,
  "models": [
    {
      "model_id": "abc-123",
      "model_name": "gpt-4",
      "created_by": "admin",
      "created_at": "2024-01-15T10:30:00",
      "status": "invalid",
      "error": "Invalid litellm_params: model field required",
      "params_info": "dict with 2 keys | has 'model' field: False",
      "litellm_params": {"api_key": "...", "api_base": "..."}
    }
  ]
}
```

**Example**:
```bash
curl -X GET "http://localhost:4000/model/diagnostics" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

### POST /model/fix

Fix a model's litellm_params.

**Authentication**: Requires Proxy Admin role (not Admin Viewer)

**Request Body**:
```json
{
  "model_id": "abc-123",
  "litellm_params": {
    "model": "gpt-4",
    "api_key": "os.environ/OPENAI_API_KEY",
    "api_base": "https://api.openai.com/v1"
  }
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Model abc-123 fixed successfully.",
  "model_id": "abc-123"
}
```

**Example**:
```bash
curl -X POST "http://localhost:4000/model/fix" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "abc-123",
    "litellm_params": {
      "model": "gpt-4",
      "api_key": "os.environ/OPENAI_API_KEY"
    }
  }'
```

## Additional Resources

- [LiteLLM Proxy Documentation](https://docs.litellm.ai/docs/proxy/configs)
- [Model Configuration Examples](https://github.com/BerriAI/litellm/tree/main/litellm/proxy/example_config_yaml)
- [Database Schema](litellm/proxy/schema.prisma)

## Support

If you continue to experience issues:

1. Run the diagnostic script and save the output
2. Check the enhanced error logs for specific error messages
3. Review the database schema and model structure
4. Open an issue on the LiteLLM GitHub repository with:
   - Diagnostic script output
   - Relevant log excerpts
   - Database query results for the affected models

---

**Files Modified:**

**Backend:**
- `litellm/proxy/proxy_server.py` (lines 2590-2594) - Enhanced error logging
- `litellm/proxy/management_endpoints/model_management_endpoints.py` (lines 1184-1433) - Added diagnostic and fix endpoints
- `litellm/diagnose_litellm_params.py` (new file) - Command-line diagnostic tool

**Frontend:**
- `litellm/ui/litellm-dashboard/src/components/networking.tsx` (lines 465-553) - Added API client functions
- `litellm/ui/litellm-dashboard/src/components/model_diagnostics.tsx` (new file) - Diagnostic UI component
- `litellm/ui/litellm-dashboard/src/components/settings.tsx` - Integrated diagnostics tab

**Documentation:**
- `litellm/LITELLM_PARAMS_FIX.md` (this file) - Complete fix documentation

**Date:** 2025-10-08
