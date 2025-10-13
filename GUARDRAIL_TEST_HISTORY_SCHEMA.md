# Guardrail Test History Database Schema

## Overview
This document describes the database schema for storing guardrail test history. This allows users to:
- Track all guardrail tests over time
- View historical test results
- Analyze guardrail performance trends
- Audit guardrail testing activity

## Schema Design

### Table: LiteLLM_GuardrailTestHistoryTable

Stores individual guardrail test results for historical tracking and analysis.

```prisma
model LiteLLM_GuardrailTestHistoryTable {
  test_history_id       String   @id @default(uuid())
  test_id               String   // UUID from the test execution
  guardrail_id          String?  // Null if testing from config (not saved guardrail)
  guardrail_name        String
  guardrail_type        String   // bedrock, presidio, lakera, etc.
  test_scenario_name    String?
  content_source        String   // INPUT or OUTPUT
  test_content_hash     String   // SHA-256 hash of test content for privacy
  test_content_preview  String   // First 200 characters
  detected              Boolean
  action                String   // NONE, BLOCKED, ANONYMIZED, GUARDRAIL_INTERVENED
  action_reason         String?
  assessment_details    Json?    // Detailed guardrail response
  guardrail_coverage    Json?    // Coverage statistics
  guardrail_outputs     Json?    // Filtered/masked outputs
  guardrail_usage       Json?    // API usage statistics
  duration_ms           Float
  passed_validation     Boolean
  validation_errors     Json?    // Array of validation error strings
  created_at            DateTime @default(now())
  created_by            String?  // User who ran the test

  // Foreign key relationship
  guardrail             LiteLLM_GuardrailsTable? @relation(fields: [guardrail_id], references: [guardrail_id], onDelete: SetNull)

  // Indexes for common queries
  @@index([guardrail_id, created_at])
  @@index([guardrail_type, created_at])
  @@index([created_at])
  @@index([created_by, created_at])
}
```

### Table Modifications

Add a relationship to the existing `LiteLLM_GuardrailsTable`:

```prisma
model LiteLLM_GuardrailsTable {
  guardrail_id String @id @default(uuid())
  guardrail_name String @unique
  litellm_params Json
  guardrail_info Json?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  // Add this line
  test_history LiteLLM_GuardrailTestHistoryTable[]
}
```

## Field Descriptions

### Primary Fields
- **test_history_id**: Unique identifier for the historical record
- **test_id**: The test execution ID from when the test was run
- **guardrail_id**: Reference to the guardrail that was tested (null for ad-hoc config tests)
- **guardrail_name**: Name of the guardrail at the time of testing
- **guardrail_type**: Type of guardrail (bedrock, presidio, lakera, etc.)

### Test Metadata
- **test_scenario_name**: Optional name for the test scenario
- **content_source**: Whether testing INPUT (user prompts) or OUTPUT (LLM responses)
- **test_content_hash**: SHA-256 hash of the test content (for privacy/deduplication)
- **test_content_preview**: First 200 characters for quick reference

### Test Results
- **detected**: Whether the guardrail detected policy violations
- **action**: Action taken by the guardrail
- **action_reason**: Explanation of why the action was taken
- **assessment_details**: Detailed policy assessment from the guardrail (JSON)
- **guardrail_coverage**: Statistics about what was checked (JSON)
- **guardrail_outputs**: Filtered or masked outputs (JSON)
- **guardrail_usage**: API usage metrics (JSON)

### Performance Metrics
- **duration_ms**: Test execution duration in milliseconds
- **passed_validation**: Whether the test passed pre-execution validation
- **validation_errors**: List of validation errors if any (JSON array)

### Audit Fields
- **created_at**: When the test was run
- **created_by**: User ID who ran the test (for audit trail)

## Indexes

Strategic indexes for common query patterns:

1. **guardrail_id + created_at**: Find all tests for a specific guardrail over time
2. **guardrail_type + created_at**: Analyze performance by guardrail type
3. **created_at**: General time-based queries and cleanup
4. **created_by + created_at**: Track testing activity by user

## Privacy Considerations

- **test_content_hash**: Instead of storing full test content, we store a hash for deduplication and privacy
- **test_content_preview**: Only first 200 characters stored for reference
- **PII Protection**: Sensitive test content is not stored in full, only preview and hash

## Retention Policy

Recommended data retention policies:

1. **Default**: Keep 90 days of test history
2. **Compliance**: Retain test history per organizational requirements
3. **Cleanup**: Implement automated cleanup jobs to remove old records

## Migration Path

### Step 1: Add Schema
Add the new table to `schema.prisma`

### Step 2: Generate Migration
```bash
prisma migrate dev --name add_guardrail_test_history
```

### Step 3: Apply Migration
```bash
prisma migrate deploy
```

## API Integration

### Save Test Result
When a test is executed, automatically save to history:
```python
async def save_test_to_history(test_result: GuardrailTestResponse, user_id: str):
    await prisma_client.litellm_guardrailTestHistoryTable.create(
        data={
            "test_id": test_result.test_id,
            "guardrail_id": guardrail_id,
            "guardrail_name": test_result.guardrail_name,
            # ... other fields
        }
    )
```

### Query History
```python
# Get recent tests for a guardrail
history = await prisma_client.litellm_guardrailTestHistoryTable.find_many(
    where={"guardrail_id": guardrail_id},
    order_by={"created_at": "desc"},
    take=20
)
```

## UI Features

### Test History Panel
- List of recent tests
- Filter by date range, guardrail, action type
- View detailed test results
- Export historical data
- Performance metrics dashboard

### Analytics Dashboard
- Pass/fail rates over time
- Average detection rates
- Performance trends (duration)
- Most common violations

## Benefits

1. **Audit Trail**: Complete record of all guardrail testing
2. **Performance Tracking**: Monitor guardrail effectiveness over time
3. **Debugging**: Review past tests to understand behavior
4. **Compliance**: Demonstrate testing rigor for security/compliance
5. **Optimization**: Identify patterns in false positives/negatives
