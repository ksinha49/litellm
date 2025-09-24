# S3 403 Logging & Exception Handling Tasks

The following tasks break down the enhancements required to diagnose and remediate recurring 403 responses when uploading logs to Amazon S3.

1. **Surface actionable error context in the logger**
   - [x] Sanitize and emit the bucket, region, object key, and header set used for the failed upload.
   - [x] Parse AWS error payloads (XML/JSON) to expose `Code`, `Message`, `RequestId`, and `HostId` in the logs.
   - [x] Provide tailored guidance when a 403 is returned so operators know to inspect IAM policies, region mismatches, or encryption requirements.

2. **Improve runtime observability**
   - [ ] Capture optional metrics (e.g., count of 403s per bucket/region) once telemetry plumbing is available.
   - [ ] Consider flagging repeated 403s in health checks to prevent silent log loss.

3. **Expand automated coverage**
   - [ ] Add unit tests that stub the S3 response body and ensure the logger surfaces parsed error details.
   - [ ] Create integration tests (using moto or a dedicated test bucket) to verify 403 scenarios such as missing SSE headers or insufficient IAM permissions.

4. **Document troubleshooting steps**
   - [ ] Update the S3 setup guide with guidance on encryption headers, IAM requirements, and how to interpret the new logs.
   - [ ] Provide a runbook entry that maps common AWS error codes (e.g., `AccessDenied`, `MissingSecurityHeader`) to remediation steps.

5. **Optional future enhancements**
   - [ ] Expose configuration knobs for custom headers (SSE, ACL) so operators can satisfy stricter bucket policies without patching the code.
   - [ ] Offer a CLI or admin UI “S3 connectivity check” to proactively validate credentials and bucket policies.

