import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /guardrails/apply_guardrail

Use this endpoint to directly call a guardrail configured on your LiteLLM instance. This is useful when you have services that need to directly call a guardrail. 

:::note Bedrock guardrails
When the guardrail is backed by Amazon Bedrock, ensure the IAM role or user has permission to call `bedrock:ApplyGuardrail`, `bedrock:GetGuardrail`, and `bedrock:ListGuardrails`, and that `aws_region_name` matches the region in which the guardrail exists. See the [Bedrock guardrail permissions guide](proxy/guardrails/bedrock#permissions-and-troubleshooting) for more details.
:::

## Usage
---

In this example `mask_pii` is the guardrail name configured on LiteLLM.

```bash showLineNumbers title="Example calling the endpoint"
curl -X POST 'http://localhost:4000/guardrails/apply_guardrail' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer your-api-key' \
-d '{
    "guardrail_name": "mask_pii",
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en",
    "entities": ["NAME", "EMAIL"]
}'
```


## Request Format
---

The request body should follow the ApplyGuardrailRequest format.

#### Example Request Body

```json
{
    "guardrail_name": "mask_pii",
    "text": "My name is John Doe and my email is john@example.com",
    "language": "en",
    "entities": ["NAME", "EMAIL"]
}
```

#### Required Fields
- **guardrail_name** (string):  
  The identifier for the guardrail to apply (e.g., "mask_pii").
- **text** (string):  
  The input text to process through the guardrail.

#### Optional Fields
- **language** (string):  
  The language of the input text (e.g., "en" for English).
- **entities** (array of strings):  
  Specific entities to process or filter (e.g., ["NAME", "EMAIL"]).

## Response Format
---

The response will contain the processed text after applying the guardrail.

#### Example Response

```json
{
    "response_text": "My name is [REDACTED] and my email is [REDACTED]"
}
```

#### Response Fields
- **response_text** (string):  
  The text after applying the guardrail.
