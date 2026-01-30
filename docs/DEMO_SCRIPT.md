# Demo Script: Ops Incident First Response Agent

> **Total Duration: 2 minutes 30 seconds**

---

## Incident Input Text

### PRIMARY INPUT (USE THIS)
ALERT: Payment API response times spiked to 12s (normal: 200ms).
Error rate jumped to 23% in EU-West region.
Multiple customer complaints incoming. Stripe webhook failures detected.
Started: 14:32 UTC. No recent deployments.

### BACKUP INPUT
ALERT: User authentication failing intermittently.
OAuth token refresh returning 503 errors.
Affecting ~40% of login attempts in US-East.
CloudWatch showing Redis connection pool exhaustion.
Started: 09:15 UTC.

---

## Timestamped Script

### 0:00–0:20 — The Hook

**Screen:** Title slide transitions to empty dashboard

**PRESENTER:**
> "It's 2 PM. Your payment system just broke. Customers are angry, Slack is exploding, and your on-call engineer is scrambling to figure out: What's happening? Who owns this? What do we do first?
>
> We built an agent that handles those first critical minutes—automatically."

---

### 0:20–0:50 — Input the Incident

**Screen:** Clean dashboard with input field prominently displayed

**PRESENTER:**
> "Here's a real alert."

*[Paste the primary incident text into the input field]*

**PRESENTER:**
> "I click 'Analyze'—and now watch the agent work."

**Screen shows:** Loading state with "Agent Processing..." indicator

---

### 0:50–1:40 — Agent Trace (The Magic)

**Screen:** Split view—left side shows Agent Reasoning Trace, right side builds the Output Card

| Step | Trace Text Shown | Right Panel Update |
|------|------------------|-------------------|
| 1 | Analyzing incident text... | — |
| 2 | Classification: Payment Infrastructure \| Severity: P1-Critical \| Impact: Revenue + Customer Trust | Classification card appears |
| 3 | Querying on-call schedule... Assigning to: Platform Team → @maria.chen | Owner badge appears |
| 4 | Creating ticket INC-2024-0892 in system... | Ticket ID + link appears |
| 5 | Generating response checklist based on payment incident playbook... | Checklist appears (5 items) |
| 6 | Drafting stakeholder notification... | Notification preview appears |

**PRESENTER:**
> "See each step? The agent reasons through the incident—it's not just pattern matching. It identifies this as a P1 payment issue, finds the right owner from today's on-call rotation, creates a real ticket, and builds a checklist from our playbook."

---

### 1:40–2:10 — The Output

**Screen:** Full output card expanded

#### INCIDENT CLASSIFICATION
- **Category:** Payment Infrastructure
- **Severity:** P1 - Critical
- **Impact:** Revenue-affecting, Customer-facing

#### ASSIGNED OWNER
- **Team:** Platform Engineering
- **Primary:** @maria.chen (on-call)
- **Escalation:** @james.wong (backup)

#### TICKET CREATED
- **INC-2024-0892** [View Ticket]
- Status: Open | Priority: Urgent

#### NEXT STEPS CHECKLIST
- [ ] Check Stripe dashboard for webhook status
- [ ] Verify EU-West load balancer health
- [ ] Review payment-api pod logs (last 30 min)
- [ ] Confirm no database connection pool issues
- [ ] Prepare customer status page update draft

#### DRAFT NOTIFICATION
P1 Incident: Payment API degradation in EU-West
Assigned: @maria.chen | Ticket: INC-2024-0892
Impact: 23% error rate, customer-facing
Status: Investigating - ETA update in 15 min
**[Copy to Slack] [Send]**

**PRESENTER:**
> "In 25 seconds, we have: classification, owner, ticket, checklist, and a notification ready to send. The engineer can now fix the problem instead of spending ten minutes figuring out who should."

---

### 2:10–2:30 — Close + Theme Tie-In

**Screen:** Returns to show watsonx Orchestrate logo/badge prominently + architecture thumbnail

**PRESENTER:**
> "This is watsonx Orchestrate coordinating multiple AI skills into one workflow—no complex integrations, just intelligent automation.
>
> From idea to deployment: we went from a napkin sketch to a working agent in 48 hours. That's AI demystified."

*[End on dashboard with output visible]*

---

## Fallback Plans

### If watsonx API fails:
Switch to pre-recorded 30-second video clip. Say: "Let me show you a recording of this same flow we captured earlier."

### If frontend fails:
Open Postman/terminal with pre-configured API call. Show raw JSON response.

### If everything fails:
Open architecture diagram + screenshots. Walk through conceptually.

---

## Pre-Demo Checklist

- [ ] Incident text ready in clipboard
- [ ] Browser zoom set (125% recommended)
- [ ] No browser extensions visible
- [ ] Incognito mode (clean UI)
- [ ] Internet connection stable
- [ ] Backup video ready
- [ ] Full run-through completed 3+ times
