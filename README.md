<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# AI Courtroom 🎯


## Basic Details
### Team Name: Alone by Choice 


### Team Members
- Team Lead: Alen Benoy - Govt. Model Engineering College, Thrikkakara
-

### Project Description
[2-3 lines aThe joke: Feed it a trivial dispute ("is a hot dog a sandwich," "pineapple on pizza"). Two Gemini instances role-play as wildly over-the-top opposing lawyers, and a third delivers a solemn, absurdly formal verdict — rendered as a live courtroom transcript.bout what your project does]

### The Problem (that doesn't exist)
Why do we never know the answers to pointless questions and arguments ? How come we never discuss them and address these ideas ?

### The Solution (that nobody asked for)
Letting AI debate on the crazy stuff so that we don't end up wasting our time

## Technical Details
### Technologies/Components Used
For Software:
- HTML,Javascript
 -n8n workflow automation
- Gemini API Key


### Implementation
For Software:
front-end: a two-page website made with HTML and JavaScript takes a text input (case on court) which triggers the n8n automation.

back-end: The n8n automation feeds the input to gemini instances, makes them argue with each other and generates final output sequence. 


# Run
* https://uselessprojecttemp3.vercel.app


### Project Documentation
# AI Courtroom — Supreme Court of Nonsense

## 1. Project Overview

**AI Courtroom** is an interactive AI debate application presented as a fictional courtroom.

A user enters a topic, and the application sends it to an n8n-powered AI workflow. Three Gemini-powered roles participate:

* **Judge** — speaks once at the beginning and frames the case.
* **Old Lawyer** — argues one side.
* **Young Lawyer** — argues the opposing side.

After the Judge's opening statement, the two lawyers continue arguing in an alternating loop:

```text
User Topic
    ↓
Judge
    ↓
Old Lawyer
    ↓
Young Lawyer
    ↓
Old Lawyer
    ↓
Young Lawyer
    ↓
Old Lawyer
    ↓
Young Lawyer
    ↓
...
```

The frontend presents these AI responses as courtroom speech bubbles.

The project is designed so that the n8n workflow controls the AI conversation while an Express backend acts as the communication layer between n8n and the browser.

---

# 2. System Architecture

The production architecture is:

```text
                     ┌─────────────────────┐
                     │       User          │
                     │  enters a topic     │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │      Frontend       │
                     │     index.html      │
                     │       Vercel        │
                     └──────────┬──────────┘
                                │
                         HTTP POST /start
                                │
                                ▼
                     ┌─────────────────────┐
                     │   Express Backend   │
                     │       Vercel        │
                     └──────────┬──────────┘
                                │
                       POST n8n workflow
                                │
                                ▼
                     ┌─────────────────────┐
                     │      n8n Cloud       │
                     │  AI Courtroom Flow   │
                     └──────────┬──────────┘
                                │
                   ┌────────────┼────────────┐
                   │            │            │
                   ▼            ▼            ▼
                Judge       Old Lawyer   Young Lawyer
                   │            │            │
                   └────────────┴────────────┘
                                │
                         alternating loop
                                │
                                ▼
                         HTTP callback
                                │
                                ▼
                     ┌─────────────────────┐
                     │   Express Backend   │
                     │       SSE           │
                     └──────────┬──────────┘
                                │
                         Server-Sent Events
                                │
                                ▼
                     ┌─────────────────────┐
                     │      Frontend       │
                     │ Live courtroom UI    │
                     └─────────────────────┘
```

The frontend is therefore **not responsible for orchestrating the Gemini agents**. n8n is responsible for the debate logic, while Express transports the results to the browser.

---

# 3. Technology Stack

## Frontend

* HTML
* CSS
* JavaScript
* React loaded through CDN
* Vercel static deployment

The current frontend already contains the courtroom UI, animations, responsive styling, topic input, and React state management.

## Backend

* Node.js
* Express
* ES Modules
* CORS
* Server-Sent Events (SSE)
* Vercel deployment

Vercel currently supports Express deployments directly, including response streaming.

## AI / Workflow Layer

* n8n Cloud
* Gemini models
* Judge agent
* Old Lawyer agent
* Young Lawyer agent
* Debate loop
* Assemble Transcript step

---

# 4. Repository Structure

The recommended GitHub repository structure is:

```text
supreme-court-of-nonsense/
│
├── frontend/
│   └── index.html
│
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   │
│   │   ├── routes/
│   │   │   ├── api.js
│   │   │   └── n8n.js
│   │   │
│   │   └── controllers/
│   │       └── debateController.js
│   │
│   ├── package.json
│   └── .env
│
└── README.md
```

The frontend is intentionally kept simple: `frontend/index.html` contains the application UI.

---

# 5. Frontend Responsibilities

The frontend is responsible for:

1. Accepting the user's topic.
2. Starting a new debate session.
3. Opening an SSE connection.
4. Receiving AI messages as they arrive.
5. Rendering each message in chronological order.
6. Displaying the speaker identity.
7. Navigating between the home page and courtroom.
8. Handling connection errors.
9. Closing the SSE connection when the debate finishes.

The original frontend was built around three fixed response properties:

```js
{
  judge: "...",
  lawyerLeft: "...",
  lawyerRight: "..."
}
```

and renders exactly one bubble for each role.

That model must be replaced by an ordered `messages`/`transcript` model to support the repeated lawyer debate.

---

# 6. n8n Responsibilities

n8n controls the actual AI conversation.

The intended workflow is:

```text
Webhook
   ↓
Generate / assign sessionId
   ↓
Judge Gemini
   ↓
Send Judge result to Express
   ↓
Old Lawyer Gemini
   ↓
Send Old Lawyer result to Express
   ↓
Young Lawyer Gemini
   ↓
Send Young Lawyer result to Express
   ↓
Loop
   │
   ├── Old Lawyer
   └── Young Lawyer
       ↓
      ...
   ↓
Assemble Transcript
   ↓
Complete session
```

The Judge runs only once.

The two lawyers run repeatedly.

---

# 7. Assemble Transcript

The existing **Assemble Transcript** step is important because it preserves the conversation history.

The current structure demonstrated by the workflow output is conceptually:

```json
[
  {
    "round": 3,
    "oldLawyer": "Fascinating...",
    "youngLawyer": "How adorable..."
  }
]
```

This is preferable to having a single `oldLawyer` and `youngLawyer` property because every round can be preserved.

For example:

```json
[
  {
    "round": 1,
    "oldLawyer": "...",
    "youngLawyer": "..."
  },
  {
    "round": 2,
    "oldLawyer": "...",
    "youngLawyer": "..."
  },
  {
    "round": 3,
    "oldLawyer": "...",
    "youngLawyer": "..."
  }
]
```

The frontend should convert this into an ordered stream:

```text
Old Lawyer — Round 1
Young Lawyer — Round 1
Old Lawyer — Round 2
Young Lawyer — Round 2
Old Lawyer — Round 3
Young Lawyer — Round 3
```

---

# 8. Express Backend

The Express backend acts as a bridge.

It provides two separate communication paths.

## Browser → Express

The browser starts the debate:

```http
POST /api/debate/start
```

Example:

```json
{
  "topic": "Does pineapple belong on pizza?"
}
```

Response:

```json
{
  "sessionId": "abc123"
}
```

The browser then opens:

```http
GET /api/debate/stream/abc123
```

This connection remains open as an SSE stream.

## n8n → Express

After each Gemini response, n8n sends:

```http
POST /n8n/debate/abc123/message
```

Example:

```json
{
  "speaker": "oldLawyer",
  "text": "Your argument is completely absurd.",
  "round": 3
}
```

Express immediately broadcasts this to all connected SSE clients.

At the end of the workflow n8n calls:

```http
POST /n8n/debate/abc123/complete
```

Express then sends a `complete` SSE event and closes the session.

---

# 9. Server-Sent Events

SSE is used because the application needs one-way real-time communication:

```text
n8n → Express → Browser
```

A browser creates an SSE connection with:

```js
const eventSource = new EventSource(
  `${API_URL}/api/debate/stream/${sessionId}`
);
```

The backend sends events in the format:

```text
event: message
data: {"speaker":"judge","text":"Order!","round":0}

```

The browser receives them with:

```js
eventSource.addEventListener("message", event => {
  const message = JSON.parse(event.data);

  // Add message to React state
});
```

When the workflow finishes:

```text
event: complete
data: {}
```

the frontend closes the connection.

---

# 10. Message Model

Each generated response should be normalized to:

```json
{
  "id": "unique-message-id",
  "speaker": "judge",
  "text": "AI generated text",
  "round": 0,
  "timestamp": "2026-09-04T00:00:00.000Z"
}
```

Valid speaker values are:

```text
judge
oldLawyer
youngLawyer
```

This gives the frontend everything needed to render a complete transcript.

---

# 11. Frontend Rendering Model

Instead of:

```js
debate.judge
debate.lawyerLeft
debate.lawyerRight
```

the frontend should maintain:

```js
messages = [
  {
    speaker: "judge",
    text: "..."
  },
  {
    speaker: "oldLawyer",
    text: "..."
  },
  {
    speaker: "youngLawyer",
    text: "..."
  },
  {
    speaker: "oldLawyer",
    text: "..."
  },
  {
    speaker: "youngLawyer",
    text: "..."
  }
];
```

The UI then maps over the array:

```jsx
messages.map(message => (
  <Bubble
    key={message.id}
    speaker={message.speaker}
    text={message.text}
  />
))
```

This is the key change that allows the courtroom to display an unlimited number of lawyer exchanges.

---

# 12. Why the Original Lawyer Bubbles Failed

The original frontend expected the n8n webhook response to contain:

```json
{
  "judge": "...",
  "lawyerLeft": "...",
  "lawyerRight": "..."
}
```

and explicitly falls back to mock content whenever those fields are missing.

The real n8n transcript instead uses fields such as:

```json
{
  "oldLawyer": "...",
  "youngLawyer": "..."
}
```

Therefore:

```text
oldLawyer
     ↓
frontend searches for lawyerLeft
     ↓
not found
     ↓
mock fallback
```

and:

```text
youngLawyer
     ↓
frontend searches for lawyerRight
     ↓
not found
     ↓
mock fallback
```

The Judge happened to work because the frontend and workflow response used a compatible Judge field.

The underlying visual bubble CSS was not the problem. The three bubbles share the same base styling.

---

# 13. API Endpoints

## Start Debate

```http
POST /api/debate/start
```

Request:

```json
{
  "topic": "Does pineapple belong on pizza?"
}
```

Response:

```json
{
  "sessionId": "uuid"
}
```

---

## Debate Stream

```http
GET /api/debate/stream/:sessionId
```

Response:

```text
Content-Type: text/event-stream
```

Example events:

```text
event: message
data: {"speaker":"judge","text":"Order!","round":0}

event: message
data: {"speaker":"oldLawyer","text":"Absolutely not.","round":1}

event: message
data: {"speaker":"youngLawyer","text":"Absolutely yes.","round":1}

event: message
data: {"speaker":"oldLawyer","text":"Your argument fails.","round":2}

event: message
data: {"speaker":"youngLawyer","text":"Your argument fails harder.","round":2}

event: complete
data: {}
```

---

## n8n Message Callback

```http
POST /n8n/debate/:sessionId/message
```

Request:

```json
{
  "speaker": "oldLawyer",
  "text": "Generated AI response",
  "round": 2
}
```

---

## n8n Completion Callback

```http
POST /n8n/debate/:sessionId/complete
```

Request:

```json
{}
```

Response:

```json
{
  "ok": true
}
```

---

# 14. Environment Variables

Backend `.env`:

```env
PORT=3000

N8N_START_WEBHOOK_URL=https://nikilauda.app.n8n.cloud/webhook/supreme-court-nonsense

PUBLIC_API_URL=https://your-backend.vercel.app
```

`PUBLIC_API_URL` must be publicly reachable by n8n.

Do not expose private credentials or secrets in `frontend/index.html`.

---

# 15. Local Development

## Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at:

```text
http://localhost:3000
```

Test:

```text
http://localhost:3000/
```

Expected response:

```json
{
  "status": "ok",
  "service": "supreme-court-backend"
}
```

## Frontend

Open:

```text
frontend/index.html
```

or serve it through a local static server.

The frontend API URL should point to:

```text
http://localhost:3000
```

during local development.

---

# 16. GitHub Repository

Initialize the repository:

```bash
git init
git add .
git commit -m "Initial AI Courtroom project"
```

Create the GitHub repository and then:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/supreme-court-of-nonsense.git
git push -u origin main
```

Recommended repository:

```text
GitHub
└── supreme-court-of-nonsense
    ├── frontend
    │   └── index.html
    └── backend
        ├── src
        └── package.json
```

---

# 17. Vercel Deployment

The recommended deployment uses two Vercel projects from the same GitHub repository.

## Frontend Vercel Project

Root Directory:

```text
frontend
```

The frontend is a static HTML application.

Deployment:

```text
GitHub
   ↓
Vercel
   ↓
frontend/
   ↓
index.html
```

---

## Backend Vercel Project

Root Directory:

```text
backend
```

This project contains Express.

Deployment:

```text
GitHub
   ↓
Vercel
   ↓
backend/
   ↓
Express API
```

Vercel supports deploying Express applications and currently documents zero-configuration Express deployment and response streaming.

---

# 18. Vercel Environment Variables

Inside the backend Vercel project configure:

```text
N8N_START_WEBHOOK_URL
```

and:

```text
PUBLIC_API_URL
```

Example:

```env
N8N_START_WEBHOOK_URL=https://nikilauda.app.n8n.cloud/webhook/supreme-court-nonsense

PUBLIC_API_URL=https://supreme-court-backend.vercel.app
```

The frontend should use the deployed backend URL:

```js
const API_URL =
  "https://supreme-court-backend.vercel.app";
```

---

# 19. Production Request Flow

A complete production request looks like this:

```text
1. User enters topic
        ↓
2. Frontend POST /api/debate/start
        ↓
3. Express creates sessionId
        ↓
4. Express starts n8n
        ↓
5. Frontend opens SSE connection
        ↓
6. n8n generates Judge response
        ↓
7. n8n POSTs Judge response to Express
        ↓
8. Express sends SSE message
        ↓
9. Browser renders Judge bubble
        ↓
10. n8n generates Old Lawyer response
        ↓
11. n8n POSTs response to Express
        ↓
12. Browser renders Old Lawyer bubble
        ↓
13. n8n generates Young Lawyer response
        ↓
14. n8n POSTs response to Express
        ↓
15. Browser renders Young Lawyer bubble
        ↓
16. n8n repeats lawyer loop
        ↓
17. Browser continues receiving bubbles
        ↓
18. n8n finishes Assemble Transcript
        ↓
19. n8n calls /complete
        ↓
20. Express sends SSE complete event
        ↓
21. Browser closes EventSource
```

---

# 20. Error Handling

## n8n does not start

Check:

```text
N8N_START_WEBHOOK_URL
```

and inspect the Express logs.

---

## Browser connects but receives nothing

Check:

```text
GET /api/debate/stream/:sessionId
```

and confirm the response uses:

```text
Content-Type: text/event-stream
```

Also ensure the connection is not being buffered by a proxy.

---

## Judge appears but lawyers show mock content

Check the n8n callback payload.

The frontend should receive:

```json
{
  "speaker": "oldLawyer",
  "text": "..."
}
```

and:

```json
{
  "speaker": "youngLawyer",
  "text": "..."
}
```

Do not send them as:

```json
{
  "lawyerLeft": "...",
  "lawyerRight": "..."
}
```

unless the frontend is explicitly written for that format.

---

## Only one lawyer response appears

Check that n8n calls:

```text
/n8n/debate/:sessionId/message
```

after **every loop iteration**, not only after the final Assemble Transcript node.

---

## SSE closes too early

Do not mark:

```text
complete = true
```

after the Judge or first lawyer response.

Completion should occur only after the entire debate loop has finished.

---

# 21. Important Design Rule

The responsibilities should remain separated:

```text
Frontend
= presentation + SSE client

Express
= session + SSE transport + n8n callback API

n8n
= workflow orchestration

Gemini
= AI reasoning / generated dialogue

Assemble Transcript
= final conversation record
```

The frontend should **not** independently call Judge, Old Lawyer, and Young Lawyer.

n8n should control the sequence.

This prevents the browser from accidentally running:

```text
Judge
Old Lawyer
Young Lawyer
```

in parallel instead of respecting:

```text
Judge
   ↓
Old Lawyer
   ↓
Young Lawyer
   ↓
Old Lawyer
   ↓
Young Lawyer
```

---

# 22. Future Improvements

The architecture can later be extended with:

* persistent database storage for completed cases
* authentication
* case history
* replaying previous debates
* pause/resume controls
* configurable debate rounds
* live typing indicators
* per-speaker animations
* voting on the winning lawyer
* final Judge verdict
* transcript download
* moderation and rate limiting
* Redis/pub-sub for multi-instance deployment

---

# 23. Current Project Goal

The finished application should provide the following experience:

```text
┌─────────────────────────────────────────────┐
│             SUPREME COURT OF                │
│                 NONSENSE                    │
│                                             │
│  "Does pineapple belong on pizza?"          │
│                                             │
│                  👨‍⚖️ Judge                  │
│             ┌───────────────┐               │
│             │ Order!        │               │
│             │ The court...  │               │
│             └───────────────┘               │
│                                             │
│  🧓 Old Lawyer             🧑 Young Lawyer  │
│  ┌─────────────┐           ┌─────────────┐  │
│  │ Absolutely  │           │ Your Honor, │  │
│  │ not...      │           │ obviously...│  │
│  └─────────────┘           └─────────────┘  │
│                                             │
│  🧓 Old Lawyer                              │
│  ┌─────────────────────┐                    │
│  │ Let me remind the   │                    │
│  │ court...             │                    │
│  └─────────────────────┘                    │
│                                             │
│                         🧑 Young Lawyer     │
│                         ┌─────────────────┐ │
│                         │ Fascinating...  │ │
│                         └─────────────────┘ │
│                                             │
│                    ...                      │
└─────────────────────────────────────────────┘
```

The essential technical objective is to make this courtroom **live**, with every Gemini response appearing in the browser as soon as n8n finishes that turn.


# Screenshots (Add at least 3)
![Screenshot1](Add screenshot 1 here with proper name)
*Add caption explaining what this shows*

![Screenshot2](Add screenshot 2 here with proper name)
*Add caption explaining what this shows*

![Screenshot3](Add screenshot 3 here with proper name)
*Add caption explaining what this shows*

# Diagrams
![Workflow](Add your workflow/architecture diagram here)
*Add caption explaining your workflow*



# Build Photos
![Components](Add photo of your components here)
*List out all components shown*

![Build](Add photos of build process here)
*Explain the build steps*

![Final](Add photo of final product here)
*Explain the final build*

### Project Demo
# Video
[Add your demo video link here]
*Explain what the video demonstrates*

# Additional Demos
[Add any extra demo materials/links]


---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



