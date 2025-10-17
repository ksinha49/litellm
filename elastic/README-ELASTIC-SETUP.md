# LiteLLM Bedrock Guardrails - Elasticsearch Setup Guide

This guide provides complete instructions for setting up Elasticsearch/Logstash to monitor Bedrock guardrail activity from LiteLLM.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Example Queries](#example-queries)
- [Dashboard Visualizations](#dashboard-visualizations)
- [Alerting Rules](#alerting-rules)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Components
1. **PostgreSQL** - LiteLLM database with `LiteLLM_SpendLogs` table
2. **Logstash 8.x+** - Data ingestion pipeline
3. **Elasticsearch 8.x+** - Data storage and search
4. **Kibana 8.x+** - Visualization and dashboards

### Required Logstash Plugins
```bash
# Install JDBC input plugin (if not already installed)
bin/logstash-plugin install logstash-input-jdbc

# Download PostgreSQL JDBC driver
mkdir -p /usr/share/logstash/postgresql-driver
cd /usr/share/logstash/postgresql-driver
wget https://jdbc.postgresql.org/download/postgresql-42.6.0.jar
```

---

## Setup Instructions

### Step 1: Configure Environment Variables

Create a `.env` file or export these variables:

```bash
# PostgreSQL Connection
export POSTGRES_CONNECTION_STRING="jdbc:postgresql://your-db-host:5432/litellm"
export POSTGRES_USER="your_postgres_user"
export POSTGRES_PASSWORD="your_postgres_password"

# Elasticsearch Connection
export ELASTICSEARCH_HOSTS="http://your-es-host:9200"
export ELASTICSEARCH_USER="elastic"
export ELASTICSEARCH_PASSWORD="your_elastic_password"
```

### Step 2: Install Elasticsearch Index Template

```bash
# Upload the index template
curl -X PUT "http://your-es-host:9200/_index_template/litellm-guardrails" \
  -H 'Content-Type: application/json' \
  -u elastic:your_password \
  -d @litellm-guardrails-template.json
```

Verify template installation:
```bash
curl -X GET "http://your-es-host:9200/_index_template/litellm-guardrails" -u elastic:your_password
```

### Step 3: Start Logstash Pipeline

```bash
# Test configuration
/usr/share/logstash/bin/logstash -f logstash-litellm-guardrails.conf --config.test_and_exit

# Run pipeline
/usr/share/logstash/bin/logstash -f logstash-litellm-guardrails.conf

# Or as a service
systemctl start logstash
systemctl enable logstash
```

### Step 4: Verify Data Ingestion

Wait 5-10 minutes for initial data ingestion, then verify:

```bash
# Check index exists
curl -X GET "http://your-es-host:9200/_cat/indices/litellm-guardrails-*?v" -u elastic:your_password

# Check document count
curl -X GET "http://your-es-host:9200/litellm-guardrails-*/_count" -u elastic:your_password

# View sample document
curl -X GET "http://your-es-host:9200/litellm-guardrails-*/_search?size=1&pretty" -u elastic:your_password
```

---

## Example Queries

### 1. High-Level Statistics

**Total guardrail evaluations by status:**
```json
GET /litellm-guardrails-*/_search
{
  "size": 0,
  "aggs": {
    "by_status": {
      "terms": {
        "field": "guardrail_status"
      }
    }
  }
}
```

**Detection rate over time:**
```json
GET /litellm-guardrails-*/_search
{
  "size": 0,
  "aggs": {
    "detections_over_time": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "1h"
      },
      "aggs": {
        "detection_rate": {
          "avg": {
            "field": "detected"
          }
        }
      }
    }
  }
}
```

### 2. Policy Violation Analysis

**Top violated content policies:**
```json
GET /litellm-guardrails-*/_search
{
  "size": 0,
  "query": {
    "term": {
      "detected": true
    }
  },
  "aggs": {
    "hate_violations": { "sum": { "field": "policy_content_hate_count" } },
    "sexual_violations": { "sum": { "field": "policy_content_sexual_count" } },
    "violence_violations": { "sum": { "field": "policy_content_violence_count" } },
    "insults_violations": { "sum": { "field": "policy_content_insults_count" } }
  }
}
```

**PII types detected:**
```json
GET /litellm-guardrails-*/_search
{
  "size": 0,
  "query": {
    "range": {
      "policy_violations_pii_count": { "gt": 0 }
    }
  },
  "aggs": {
    "pii_types": {
      "terms": {
        "field": "pii_types_detected",
        "size": 20
      }
    }
  }
}
```

### 3. Performance Monitoring

**Average guardrail latency by mode:**
```json
GET /litellm-guardrails-*/_search
{
  "size": 0,
  "aggs": {
    "by_mode": {
      "terms": {
        "field": "guardrail_mode"
      },
      "aggs": {
        "avg_duration": {
          "avg": { "field": "guardrail_duration_seconds" }
        },
        "p95_duration": {
          "percentiles": {
            "field": "guardrail_duration_seconds",
            "percents": [95, 99]
          }
        }
      }
    }
  }
}
```

**Slowest guardrail evaluations (p99+):**
```json
GET /litellm-guardrails-*/_search
{
  "size": 10,
  "sort": [
    { "guardrail_duration_seconds": "desc" }
  ],
  "_source": [
    "request_id",
    "model",
    "guardrail_mode",
    "guardrail_duration_seconds",
    "coverage_text_total",
    "@timestamp"
  ]
}
```

### 4. Cost Analysis

**Total policy units consumed:**
```json
GET /litellm-guardrails-*/_search
{
  "size": 0,
  "aggs": {
    "total_units": {
      "sum": { "field": "usage_total_policy_units" }
    },
    "by_policy_type": {
      "multi_terms": {
        "terms": [
          { "field": "guardrail_name" }
        ]
      },
      "aggs": {
        "content_units": { "sum": { "field": "usage_content_policy_units" } },
        "pii_units": { "sum": { "field": "usage_sensitive_info_policy_units" } },
        "word_units": { "sum": { "field": "usage_word_policy_units" } },
        "topic_units": { "sum": { "field": "usage_topic_policy_units" } }
      }
    }
  }
}
```

**Daily cost trend:**
```json
GET /litellm-guardrails-*/_search
{
  "size": 0,
  "aggs": {
    "daily_usage": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "1d"
      },
      "aggs": {
        "total_units": {
          "sum": { "field": "usage_total_policy_units" }
        }
      }
    }
  }
}
```

### 5. User/Model Analysis

**Most detected models:**
```json
GET /litellm-guardrails-*/_search
{
  "size": 0,
  "query": {
    "term": { "detected": true }
  },
  "aggs": {
    "by_model": {
      "terms": {
        "field": "model",
        "size": 10
      },
      "aggs": {
        "detection_count": {
          "value_count": { "field": "detected" }
        }
      }
    }
  }
}
```

**Users with highest detection rate:**
```json
GET /litellm-guardrails-*/_search
{
  "size": 0,
  "aggs": {
    "by_user": {
      "terms": {
        "field": "request_user",
        "size": 20
      },
      "aggs": {
        "total_requests": {
          "value_count": { "field": "request_id" }
        },
        "detected_requests": {
          "filter": {
            "term": { "detected": true }
          }
        },
        "detection_rate": {
          "bucket_script": {
            "buckets_path": {
              "detected": "detected_requests>_count",
              "total": "total_requests"
            },
            "script": "params.detected / params.total"
          }
        }
      }
    }
  }
}
```

### 6. Detailed Policy Investigation

**Get full assessment details for detected content:**
```json
GET /litellm-guardrails-*/_search
{
  "size": 10,
  "query": {
    "bool": {
      "must": [
        { "term": { "detected": true } },
        { "range": { "@timestamp": { "gte": "now-24h" } } }
      ]
    }
  },
  "_source": [
    "request_id",
    "@timestamp",
    "model",
    "request_user",
    "action_reason",
    "assessment_details",
    "pii_types_detected",
    "policy_violations_*"
  ],
  "sort": [
    { "@timestamp": "desc" }
  ]
}
```

---

## Dashboard Visualizations

### Dashboard 1: Guardrail Overview

Create a Kibana dashboard with these visualizations:

1. **Detection Rate Timeline** (Line Chart)
   - X-axis: `@timestamp` (Date Histogram, 1h interval)
   - Y-axis: Average of `detected` field
   - Split: `guardrail_mode`

2. **Policy Violations Breakdown** (Pie Chart)
   - Slice by: Aggregated sums of:
     - `policy_violations_content_count`
     - `policy_violations_pii_count`
     - `policy_violations_word_count`
     - `policy_violations_topic_count`

3. **Top Models by Detection Count** (Bar Chart)
   - X-axis: Count of documents where `detected = true`
   - Y-axis: `model` (Top 10)

4. **Guardrail Performance** (Metric)
   - Avg Duration: Average `guardrail_duration_seconds`
   - P95 Duration: 95th percentile `guardrail_duration_seconds`
   - Total Evaluations: Document count

5. **Recent Detections Table**
   - Columns: `@timestamp`, `model`, `request_user`, `action_reason`, `pii_types_detected`
   - Filter: `detected = true`
   - Sort: `@timestamp desc`
   - Size: 50

### Dashboard 2: Cost & Usage Monitoring

1. **Daily Policy Units Consumed** (Area Chart)
   - X-axis: `@timestamp` (Date Histogram, 1d)
   - Y-axis: Sum of `usage_total_policy_units`
   - Stacked by policy type:
     - `usage_content_policy_units`
     - `usage_sensitive_info_policy_units`
     - `usage_word_policy_units`

2. **Cost Breakdown by Model** (Table)
   - Rows: `model`
   - Metrics:
     - Count of requests
     - Sum of `usage_total_policy_units`
     - Avg of `guardrail_duration_seconds`

3. **Coverage Metrics** (Gauge/Metric)
   - Avg `coverage_text_guarded`
   - Avg `coverage_text_total`
   - Calculation: Coverage percentage

### Dashboard 3: Security & Compliance

1. **PII Detection Heatmap** (Heat Map)
   - X-axis: `@timestamp` (Date Histogram)
   - Y-axis: `pii_types_detected`
   - Color intensity: Count of detections

2. **Content Policy Violations Timeline** (Stacked Bar)
   - X-axis: `@timestamp` (Date Histogram, 1h)
   - Y-axis: Count
   - Stacked by:
     - `policy_content_hate_count > 0`
     - `policy_content_sexual_count > 0`
     - `policy_content_violence_count > 0`
     - `policy_content_insults_count > 0`

3. **Masked Entities by Type** (Tag Cloud)
   - Size by: Values in `masked_entity_count` object

---

## Alerting Rules

### Alert 1: High Detection Rate

**Trigger:** Detection rate exceeds 10% in any 15-minute window

```json
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["litellm-guardrails-*"],
        "body": {
          "query": {
            "range": {
              "@timestamp": {
                "gte": "now-15m"
              }
            }
          },
          "aggs": {
            "detection_rate": {
              "avg": {
                "field": "detected"
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "script": {
      "source": "return ctx.payload.aggregations.detection_rate.value > 0.10"
    }
  },
  "actions": {
    "notify_team": {
      "webhook": {
        "method": "POST",
        "url": "https://your-webhook-url",
        "body": "Detection rate is {{ctx.payload.aggregations.detection_rate.value}} (threshold: 0.10)"
      }
    }
  }
}
```

### Alert 2: PII Detection Spike

**Trigger:** More than 50 PII detections in last hour

```json
{
  "trigger": {
    "schedule": {
      "interval": "10m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["litellm-guardrails-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                {
                  "range": {
                    "@timestamp": {
                      "gte": "now-1h"
                    }
                  }
                },
                {
                  "range": {
                    "policy_violations_pii_count": {
                      "gt": 0
                    }
                  }
                }
              ]
            }
          },
          "aggs": {
            "total_pii_violations": {
              "sum": {
                "field": "policy_violations_pii_count"
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "script": {
      "source": "return ctx.payload.aggregations.total_pii_violations.value > 50"
    }
  }
}
```

### Alert 3: Guardrail Performance Degradation

**Trigger:** P95 latency exceeds 2 seconds

```json
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["litellm-guardrails-*"],
        "body": {
          "query": {
            "range": {
              "@timestamp": {
                "gte": "now-10m"
              }
            }
          },
          "aggs": {
            "latency_p95": {
              "percentiles": {
                "field": "guardrail_duration_seconds",
                "percents": [95]
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "script": {
      "source": "return ctx.payload.aggregations.latency_p95.values['95.0'] > 2.0"
    }
  }
}
```

### Alert 4: Unusual Policy Unit Consumption

**Trigger:** Policy units consumed in last hour exceeds 110% of daily average

```json
{
  "trigger": {
    "schedule": {
      "interval": "1h"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["litellm-guardrails-*"],
        "body": {
          "query": {
            "range": {
              "@timestamp": {
                "gte": "now-1h"
              }
            }
          },
          "aggs": {
            "current_hour_units": {
              "sum": {
                "field": "usage_total_policy_units"
              }
            }
          }
        }
      }
    },
    "chain": {
      "inputs": [
        {
          "daily_avg": {
            "search": {
              "request": {
                "indices": ["litellm-guardrails-*"],
                "body": {
                  "query": {
                    "range": {
                      "@timestamp": {
                        "gte": "now-7d"
                      }
                    }
                  },
                  "aggs": {
                    "daily_avg": {
                      "avg": {
                        "field": "usage_total_policy_units"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  },
  "condition": {
    "script": {
      "source": "return ctx.payload.current_hour_units > (ctx.payload.chain.daily_avg * 1.10)"
    }
  }
}
```

---

## Troubleshooting

### Issue: No data in Elasticsearch

**Check 1:** Verify PostgreSQL connection
```bash
# Test JDBC connection
psql -h your-db-host -U your_user -d litellm -c "SELECT COUNT(*) FROM \"LiteLLM_SpendLogs\" WHERE metadata::jsonb ? 'guardrail_information';"
```

**Check 2:** Verify Logstash logs
```bash
tail -f /var/log/logstash/logstash-plain.log
```

**Check 3:** Test Logstash config
```bash
/usr/share/logstash/bin/logstash -f logstash-litellm-guardrails.conf --config.test_and_exit
```

### Issue: Ruby parsing exceptions

**Check tags for errors:**
```json
GET /litellm-guardrails-*/_search
{
  "query": {
    "exists": {
      "field": "tags"
    }
  }
}
```

If you see `_rubyexception_*` tags, check the specific JSON fields causing issues.

### Issue: Duplicate documents

**Check document IDs:**
```bash
# Count unique request_ids
curl -X GET "http://your-es-host:9200/litellm-guardrails-*/_search?size=0" \
  -H 'Content-Type: application/json' \
  -d '{"aggs": {"unique_ids": {"cardinality": {"field": "request_id"}}}}' \
  -u elastic:your_password
```

Ensure `document_id => "%{request_id}"` is set in Logstash output.

### Issue: Index template not applied

**Manually apply template:**
```bash
curl -X PUT "http://your-es-host:9200/_index_template/litellm-guardrails" \
  -H 'Content-Type: application/json' \
  -u elastic:your_password \
  -d @litellm-guardrails-template.json
```

**Force rollover:**
```bash
# Delete today's index (data will be recreated on next sync)
curl -X DELETE "http://your-es-host:9200/litellm-guardrails-$(date +%Y.%m.%d)" -u elastic:your_password
```

---

## Performance Tuning

### For High-Volume Environments

1. **Increase Logstash workers:**
   ```yaml
   pipeline.workers: 4
   pipeline.batch.size: 500
   ```

2. **Adjust Elasticsearch bulk settings:**
   ```ruby
   output {
     elasticsearch {
       # ... other settings ...
       bulk_size => 1000
       flush_size => 500
     }
   }
   ```

3. **Disable heavy parsing for debugging:**
   - Comment out `guardrail_request` and `guardrail_response` parsing
   - These fields can be very large

4. **Use ILM (Index Lifecycle Management):**
   - Hot phase: 1 day
   - Warm phase: 7 days
   - Cold phase: 30 days
   - Delete: 90 days

---

## Next Steps

1. **Set up index lifecycle policies** for automatic data retention
2. **Create alerting rules** based on your compliance requirements
3. **Build custom dashboards** for your specific use cases
4. **Integrate with SIEM** if required for security operations
5. **Export visualizations** for executive reporting

For questions or issues, refer to:
- LiteLLM docs: https://docs.litellm.ai
- Elasticsearch docs: https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
- Logstash docs: https://www.elastic.co/guide/en/logstash/current/index.html
