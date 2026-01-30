# Test Cases

## Test Case 1: Payment Infrastructure (PRIMARY DEMO)

### Input
ALERT: Payment API response times spiked to 12s (normal: 200ms).
Error rate jumped to 23% in EU-West region.
Multiple customer complaints incoming. Stripe webhook failures detected.
Started: 14:32 UTC. No recent deployments.

### Expected Output
- Severity: P1
- Category: Payment Infrastructure
- Owner: @maria.chen (Platform Engineering)
- Ticket: INC-2024-XXXX

---

## Test Case 2: Authentication/Redis (BACKUP)

### Input
ALERT: User authentication failing intermittently.
OAuth token refresh returning 503 errors.
Affecting ~40% of login attempts in US-East.
CloudWatch showing Redis connection pool exhaustion.
Started: 09:15 UTC.

### Expected Output
- Severity: P1
- Category: Authentication
- Owner: @maria.chen (Platform Engineering)

---

## Test Case 3: Database Latency (P2)

### Input
Database queries taking 5s+ in production.
Normally <100ms. No recent deployments.
Affecting reporting dashboard.

### Expected Output
- Severity: P2
- Category: Database
- Owner: Platform Engineering

---

## Test Case 4: Memory Alert (P3)

### Input
Memory usage at 95% on web-server-prod-03.
No immediate user impact detected.

### Expected Output
- Severity: P3
- Category: Infrastructure

---

## Test Case 5: Security Alert (P1)

### Input
SECURITY: Unusual login pattern detected.
500+ failed attempts from single IP targeting admin accounts.
GeoIP: Unknown location. Started 5 min ago.

### Expected Output
- Severity: P1
- Category: Security
- Owner: Security Team

---

## Edge Cases

- Empty input → Error message
- Vague input ("something broken") → Low confidence, P4
