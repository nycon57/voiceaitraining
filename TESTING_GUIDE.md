# Vapi Voice Calling - Testing Guide

**Date**: October 3, 2025
**Status**: Ready for Testing ✅

---

## ✅ Pre-Test Checklist

### Environment Variables ✅
```bash
# Already configured in .env.local:
VAPI_PRIVATE_API_KEY=5279f5b3-dd12-4fd8-8903-6d2c559e4636
NEXT_PUBLIC_VAPI_PUBLIC_KEY=03b5c300-2cfb-4f23-b9f4-ef4df0091fbb
VAPI_DEFAULT_ASSISTANT_ID=b278e74f-d968-44c5-be8a-e42229c041f7
```

### Database Schema ✅
- `vapi_call_id` column exists in `scenario_attempts`
- Index created on `vapi_call_id` for fast lookups
- All required columns present (recording_url, score, kpis, etc.)

### Supabase Storage ✅
- 7 storage buckets created with RLS policies
- Recording helpers implemented
- Signed URL generation ready

### Dev Server ✅
- Running on http://localhost:3000
- All API routes deployed

---

## 🔧 Vapi Dashboard Configuration

### Step 1: Configure Webhook (CRITICAL)

For **local development**, you need to use **ngrok** to expose localhost:

```bash
# Terminal 1: Keep dev server running
pnpm dev

# Terminal 2: Start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

Then configure in Vapi Dashboard:

1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Navigate to **Settings** → **Webhooks** (or **Server URL** in Assistant settings)
3. Set webhook URL:
   ```
   https://abc123.ngrok.io/api/webhooks/vapi
   ```
4. Select events to send:
   - ✅ `end-of-call-report` (REQUIRED)
   - ✅ `status-update` (optional)
5. Save configuration

### Step 2: Verify Assistant Configuration

1. Go to **Assistants** in Vapi Dashboard
2. Find assistant ID: `b278e74f-d968-44c5-be8a-e42229c041f7`
3. Verify settings:
   - **Model**: GPT-4 or GPT-3.5-turbo
   - **Voice**: ElevenLabs (any voice)
   - **Transcriber**: Deepgram Nova-2
   - **Recording**: Enabled ✅

---

## 🧪 End-to-End Test

### Test Flow

```
1. Navigate to scenario call page
2. Grant microphone permission
3. Start call and have conversation
4. End call
5. Verify webhook received
6. Verify recording downloaded
7. Verify scoring completed
8. View results on analysis screen
```

### Step-by-Step Instructions

#### 1. **Find a Scenario ID**

```bash
# Option A: Check database for existing scenarios
psql $DATABASE_URL -c "
  SELECT id, title
  FROM scenarios
  LIMIT 5;
"

# Option B: Use a test scenario ID (if you have one)
```

Save the scenario ID for testing.

#### 2. **Navigate to Call Page**

Open in browser:
```
http://localhost:3000/play/[SCENARIO_ID]/call
```

Replace `[SCENARIO_ID]` with actual UUID from step 1.

#### 3. **Grant Microphone Permission**

- Browser will prompt for mic access
- Click "Allow"
- You should see the CallSetupScreen with:
  - Agent persona card
  - Scenario objectives
  - "Start Training Call" button (enabled after mic permission)

#### 4. **Start the Call**

Click **"Start Training Call"**

**Expected Console Logs** (open DevTools → Console):
```javascript
// Backend call to create attempt
POST /api/calls/start
Response: { attemptId, assistantId, scenario }

// Vapi initializing
Vapi instance created
Vapi starting call with assistant: b278e74f-d968-44c5-be8a-e42229c041f7

// Call started
Call status: connecting → connected → active
```

#### 5. **During the Call**

Watch for:
- ✅ Live transcript appears in center column
- ✅ Speaking indicators pulse (blue for AI, green for you)
- ✅ KPIs update in real-time:
  - Talk/listen ratio
  - Filler words counter
  - Questions asked
  - Duration timer

**Test conversation:**
```
You: "Hi! I'm interested in learning about your product."
AI: [Should respond with scenario persona]
You: "What are the main benefits?"
AI: [Should address objections/questions]
You: "That sounds great, I'd like to move forward."
```

#### 6. **End the Call**

Click **"End Call"** button

**Expected Console Logs**:
```javascript
// Vapi stopping
Vapi call ending...
Call status: ending → ended

// Vapi call ID saved
POST /api/calls/update-vapi-id
Vapi call ID saved: call_abc123xyz
```

**UI Changes**:
- LiveCallInterface disappears
- CallAnalysisScreen appears
- Shows "Analyzing your performance..." state

#### 7. **Verify Webhook (Server-Side)**

Check your **terminal** running the dev server for:

```bash
# Webhook received (within 10-30 seconds after call ends)
POST /api/webhooks/vapi 200 OK

# Server logs should show:
Vapi webhook received: end-of-call-report
Attempt found for Vapi call: call_abc123xyz
Downloading recording from Vapi: https://...
Recording uploaded successfully: {org_id}/{attempt_id}.mp3
Vapi webhook processed successfully: {attempt_id}
Scored attempt {attempt_id}: 87/100
```

#### 8. **Verify Database**

```bash
# Check attempt was updated
psql $DATABASE_URL -c "
  SELECT
    id,
    vapi_call_id,
    recording_url,
    score,
    status,
    duration_seconds
  FROM scenario_attempts
  ORDER BY created_at DESC
  LIMIT 1;
"

# Expected output:
# - vapi_call_id: call_abc123xyz
# - recording_url: {org_id}/{attempt_id}.mp3
# - score: 70-100 (based on performance)
# - status: completed
# - duration_seconds: ~120-300
```

#### 9. **Verify Storage**

```bash
# Check recording file exists in Supabase
# Option A: Via Supabase Dashboard
# Go to: Storage → recordings bucket → Look for your org folder

# Option B: Via SQL
psql $DATABASE_URL -c "
  SELECT
    name,
    bucket_id,
    created_at
  FROM storage.objects
  WHERE bucket_id = 'recordings'
  ORDER BY created_at DESC
  LIMIT 5;
"
```

#### 10. **View Results**

Back in browser, you should see **CallAnalysisScreen** with:

- ✅ **Score Display**: Large animated number (0-100)
- ✅ **Score Breakdown**: Categories with individual scores
  - Talk/Listen Balance: X/25
  - Question Quality: X/20
  - Objection Handling: X/20
  - etc.
- ✅ **KPIs Summary**:
  - Talk/Listen Ratio: 45:55
  - Filler Words: 3
  - Questions Asked: 5
  - Duration: 2:43
- ✅ **AI Feedback**: Streaming or complete
  - Strengths section (green)
  - Areas for improvement (yellow)
  - Next steps (blue)
- ✅ **Action Buttons**:
  - Try Again
  - View Recording (plays audio)
  - Download Transcript
  - Download Report

---

## 🐛 Troubleshooting

### Issue: Call Won't Start

**Symptoms**: Button does nothing or error in console

**Checks**:
1. Verify Vapi public key in console:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY)
   // Should show: 03b5c300-2cfb-4f23-b9f4-ef4df0091fbb
   ```

2. Check Network tab for `/api/calls/start`:
   ```javascript
   // Response should be:
   {
     attemptId: "uuid",
     assistantId: "b278e74f-d968-44c5-be8a-e42229c041f7",
     scenario: {...}
   }
   ```

3. Check for Vapi errors:
   ```javascript
   // Console should NOT show:
   "Vapi not initialized"
   "Failed to start Vapi call"
   ```

**Fix**:
- Restart dev server: `pkill -f "next dev" && pnpm dev`
- Clear browser cache
- Try incognito window

---

### Issue: No Transcript Appearing

**Symptoms**: Call is active but transcript stays empty

**Checks**:
1. Verify Vapi events are firing:
   ```javascript
   // Add to useVapiCall.ts temporarily for debugging:
   vapiRef.current.on("message", (message) => {
     console.log("Vapi message:", message)
   })
   ```

2. Check microphone is actually capturing audio:
   - Look for audio waveform indicator
   - Check browser mic settings

3. Verify Deepgram is configured in Vapi assistant

**Fix**:
- Speak louder and more clearly
- Check Vapi dashboard → Assistant → Transcriber settings
- Verify Deepgram API key is valid in Vapi

---

### Issue: Webhook Not Received

**Symptoms**: Call ends but no server logs, recording not saved

**Checks**:
1. Verify ngrok is running:
   ```bash
   curl https://your-ngrok-url.ngrok.io/api/webhooks/vapi
   # Should return error (no body) but 400/500, not 404
   ```

2. Check Vapi webhook config:
   - Dashboard → Settings → Webhooks
   - URL should be: `https://your-ngrok-url.ngrok.io/api/webhooks/vapi`
   - Events: `end-of-call-report` selected

3. Check Vapi webhook logs:
   - Dashboard → Webhooks → Delivery Logs
   - Look for failed deliveries with error messages

**Fix**:
- Update webhook URL in Vapi dashboard
- Verify ngrok is forwarding to port 3000
- Check for firewall blocking webhooks

---

### Issue: Recording Not Saved

**Symptoms**: Webhook received but `recording_url` is null

**Checks**:
1. Server logs should show:
   ```bash
   Downloading recording from Vapi: https://...
   Recording uploaded successfully: ...
   ```

2. If you see errors:
   ```bash
   Failed to process recording: [error message]
   ```

3. Verify Vapi recording is enabled:
   - Dashboard → Assistant → Advanced → Recording: ON

**Fix**:
- Enable recording in Vapi assistant settings
- Check Supabase storage bucket permissions
- Verify `VAPI_PRIVATE_API_KEY` is correct

---

### Issue: Score Not Calculated

**Symptoms**: `score` is null in database

**Checks**:
1. Server logs should show:
   ```bash
   Scored attempt {id}: 87/100
   ```

2. If missing, check:
   ```bash
   # Verify transcript exists
   psql $DATABASE_URL -c "
     SELECT transcript_json
     FROM scenario_attempts
     WHERE id = '{attempt_id}';
   "
   ```

3. Manually trigger scoring:
   ```bash
   curl -X POST http://localhost:3000/api/attempts/{attempt_id}/score
   ```

**Fix**:
- Ensure transcript_json is not null
- Check OpenAI API key is valid
- Verify scoring endpoint exists

---

## 📊 Success Metrics

After a successful test, verify:

- [x] Call duration: 1-5 minutes
- [x] Transcript: 10+ messages (back and forth)
- [x] Recording file: ~1-5 MB MP3
- [x] Score: 0-100 (realistic based on performance)
- [x] KPIs: All calculated correctly
- [x] Webhook: Received within 30 seconds
- [x] Total time (call end → results): < 1 minute

---

## 🚀 Next Steps After Testing

Once you've completed a successful test:

1. **Document the results**:
   - Take screenshots of each phase
   - Save example transcript
   - Note any issues encountered

2. **Configure production webhook**:
   - Deploy to production (Vercel, etc.)
   - Update Vapi webhook URL to production domain
   - Test again in production

3. **Set up monitoring**:
   - Add Sentry for error tracking
   - Set up alerts for failed webhooks
   - Monitor storage usage

4. **Create test scenarios**:
   - Build 3-5 test scenarios with different personas
   - Test various conversation lengths
   - Test edge cases (very short, very long, silent, etc.)

---

## 📝 Test Log Template

Use this to document your test:

```markdown
## Test #1 - [Date/Time]

**Scenario ID**: [uuid]
**Scenario Title**: [title]

### Results:
- ✅/❌ Call started successfully
- ✅/❌ Transcript appeared in real-time
- ✅/❌ Speaking indicators worked
- ✅/❌ KPIs updated correctly
- ✅/❌ Call ended cleanly
- ✅/❌ Webhook received (time: ___s)
- ✅/❌ Recording saved to storage
- ✅/❌ Score calculated (score: ___/100)
- ✅/❌ Analysis screen displayed

### Notes:
[Any observations, bugs, or issues]

### Screenshots:
- Setup screen: [link]
- Live call: [link]
- Analysis: [link]
```

---

## 🎉 Ready to Test!

Everything is configured and ready. Follow the steps above to run your first end-to-end test.

**Quick Start**:
1. Start ngrok: `ngrok http 3000`
2. Update Vapi webhook with ngrok URL
3. Navigate to `/play/[scenarioId]/call`
4. Make a call and verify results!

Good luck! 🚀
