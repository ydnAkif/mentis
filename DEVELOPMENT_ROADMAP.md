# 📅 Development Timeline & Technology Stack

## Technology Stack (Confirmed)

### Frontend (web-student)

- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 + custom CSS
- **Animations**: Framer Motion 12.33.0
- **Icons**: Lucide React 0.563.0
- **Components**: shadcn/ui (customizable)
- **Utilities**: CLSX, Tailwind Merge
- **State Management**: React Hooks (Context API if needed)
- **HTTP Client**: Native Fetch (built-in)
- **WebSocket**: Native WebSocket or socket.io-client

### Backend (api)

- **Framework**: Fastify 5.7.4 (lightweight, fast)
- **Database**: PostgreSQL 16 (Docker)
- **ORM**: Prisma 7.3.0 + adapter-pg
- **Validation**: Zod 4.3.6
- **Real-time**: socket.io or native ws
- **CORS**: @fastify/cors
- **Dev**: tsx (TypeScript runner)
- **Runtime**: Node.js 18+

### Shared

- **Type definitions** (Student, Quiz, Attempt, etc.)
- **API response interfaces**
- **Constants** (colors, timings)
- **Utilities** (scoring logic)

### DevOps

- **Container**: Docker + Docker Compose
- **Package Manager**: pnpm 9.0.0
- **Version Control**: Git + GitHub

---

## Development Phases

### Phase 1: Backend Core (Week 1)

**Duration**: 3-4 days
**Goal**: Complete API endpoints + Database

**Tasks**:

- [ ] Update Prisma schema (QuizSession, QuizMode, timing)
- [ ] Create `/api/attempt/:attemptId/answer` endpoint
- [ ] Create `/api/attempt/:attemptId/finish` endpoint
- [ ] Create `/api/assignment/:assignmentId/leaderboard` endpoint
- [ ] Add proper error handling + validation
- [ ] Add database migrations
- [ ] Seed sample data (Quiz, Questions, Classes, Students)
- [ ] Test all endpoints (curl/Postman)

**Deliverables**:

- ✅ All student-facing APIs working
- ✅ Leaderboard calculations correct
- ✅ Sample data in DB for testing

---

### Phase 2: Frontend - Quiz Player (Week 1-2)

**Duration**: 4-5 days
**Goal**: Fully functional quiz interface with animations

**Tasks**:

- [ ] Build responsive layout (mobile-first)
- [ ] Implement Login page (Join Code + Student No)
- [ ] Implement Confirmation page (Show name, start button)
- [ ] Build Quiz player page:
  - [ ] Question display card
  - [ ] 4 answer buttons with colors
  - [ ] Circular timer with countdown
  - [ ] Score/progress tracker
- [ ] Add Framer Motion animations:
  - [ ] Page transitions
  - [ ] Button hover effects (shine, scale)
  - [ ] Answer confirmation (confetti, feedback)
  - [ ] Next question slide
- [ ] Connect to Backend:
  - [ ] Call `/lookup` endpoint
  - [ ] Call `/attempt/start`
  - [ ] Call `/quiz` endpoint
  - [ ] POST answers to `/answer`
- [ ] Error handling + loading states

**Deliverables**:

- ✅ Full quiz flow working end-to-end
- ✅ All animations smooth (60fps)
- ✅ Mobile responsive tested

---

### Phase 3: Real-time Leaderboard + Results (Week 2)

**Duration**: 2-3 days
**Goal**: WebSocket leaderboard + completion screen

**Tasks**:

- [ ] Setup WebSocket server (socket.io or ws)
- [ ] Build Leaderboard component:
  - [ ] Real-time ranking updates
  - [ ] Rank animation (zoom, color change)
  - [ ] Top 3 celebration
- [ ] Results/Completion page:
  - [ ] Show final score (animated counter)
  - [ ] Show rank + position
  - [ ] Share button (score + screenshot)
  - [ ] Confetti animation
- [ ] Connect WebSocket to frontend
- [ ] Auto-show leaderboard after answer

**Deliverables**:

- ✅ WebSocket working, no lag
- ✅ Leaderboard updates < 1s
- ✅ Results page beautiful + shareable

---

### Phase 4: Teacher Panel MVP (Week 2-3)

**Duration**: 3-4 days
**Goal**: Minimal teacher interface for quiz management

**Tasks**:

- [ ] Create Teacher login (simple auth)
- [ ] Quiz management page:
  - [ ] Create quiz form (title, add questions)
  - [ ] Edit existing quizzes
  - [ ] Delete quizzes
- [ ] Assignment page:
  - [ ] Select class + quiz
  - [ ] Auto-generate join code
  - [ ] Set time window (optional)
- [ ] Class management (simple list)
- [ ] Create sample teacher account
- [ ] Build APIs:
  - [ ] POST `/api/teacher/quiz`
  - [ ] POST `/api/teacher/assignment`
  - [ ] GET `/api/teacher/classes`

**Deliverables**:

- ✅ Can create quiz from UI
- ✅ Can assign to class + get join code
- ✅ Basic teacher authentication

---

### Phase 5: Analytics + Sound Design + Polishing (Week 3)

**Duration**: 3-4 days
**Goal**: Teacher analytics + Sound design implementation + Final polish

**Tasks**:

- [ ] **Sound Design & Implementation**:
  - [ ] Obtain/create 12 sound effects (correct, wrong, timer, transitions, etc.)
  - [ ] Create `hooks/useSound.ts` hook
  - [ ] Integrate sounds into quiz flow:
    - [ ] Correct/wrong answer sounds
    - [ ] Timer warning beeps
    - [ ] Leaderboard update sounds
    - [ ] Quiz start/completion fanfares
  - [ ] Sound mute/volume controls (Settings panel)
  - [ ] Mobile audio compatibility (iOS gesture requirement)
  - [ ] Test sound timing sync with animations
  
- [ ] Build teacher dashboard:
  - [ ] View live results (during quiz)
  - [ ] Historical analytics (charts)
  - [ ] Student performance breakdown
  
- [ ] Final UI/UX polish:
  - [ ] All micro-interactions refined
  - [ ] Check all button hover states
  - [ ] Verify color contrast (WCAG AA)
  - [ ] Test dark mode consistency
  
- [ ] Performance optimization:
  - [ ] Lazy load sound files
  - [ ] Cache optimization
  - [ ] Bundle size analysis
  
- [ ] Testing:
  - [ ] Mobile testing (iOS/Android browsers - audio)
  - [ ] Sound works across all browsers
  - [ ] Load testing (with 300+ students)
  - [ ] Network latency tests (WebSocket)

**Deliverables**:

- ✅ Full audio experience (12+ sound effects)
- ✅ Teachers can see real results with charts
- ✅ All animations & sounds synchronized
- ✅ Settings panel with mute/volume control
- ✅ Ready for classroom use (and FUN!)

---

### Phase 6: Post-Launch (Ongoing)

- [ ] Gather student + teacher feedback
- [ ] Bug fixes
- [ ] Mobile app (React Native) - stretch goal
- [ ] Question bank / topics
- [ ] Student progress tracking
- [ ] Anti-cheat measures (IP, token validation)
- [ ] Offline support (PWA)

---

## Development Schedule

```
Week 1 (7-13 Feb):
  Mon-Wed  : Backend Phase 1 (endpoints, DB)
  Thu-Fri  : Frontend Phase 2 start (login, quiz player)

Week 2 (14-20 Feb):
  Mon-Wed  : Frontend Phase 2 finish (animations, connectivity)
  Thu-Fri  : Phase 3 (WebSocket, leaderboard)

Week 3 (21-27 Feb):
  Mon-Wed  : Phase 4 (Teacher panel)
  Thu-Fri  : Phase 5 (Analytics, polish)

Ready for classroom by: End of February 2026
```

---

## Key Metrics (Goals)

- **Performance**:
  - Page load: < 2s
  - Quiz response: < 500ms
  - Leaderboard update: < 1s
  - Animation FPS: 60fps stable

- **Scalability** (300 students):
  - Concurrent users: Support 50+ simultaneously
  - Requests/minute: 300+ handle easily
  - Database: Single PostgreSQL sufficient

- **User Experience**:
  - Mobile device compatibility: 95%+
  - Quiz completion rate: Track
  - Load times satisfaction: 4.5+/5

---

## Testing Strategy

### Backend Testing

```bash
# Unit tests (Jest)
npm test -- apps/api

# API integration tests
POST /api/student/lookup
POST /api/attempt/start
POST /api/attempt/:attemptId/answer (multiple)
POST /api/attempt/:attemptId/finish

# Load testing
autocannon http://localhost:4000 --c 100 --d 60
```

### Frontend Testing

```bash
# Responsive testing
Chrome DevTools (iPhone 12, iPad, Desktop)

# Animation testing
Ensure 60fps on:
  - Answer submission
  - Leaderboard update
  - Page transitions

# Cross-browser
Chrome, Safari, Firefox, Edge
```

---

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://mentis:mentis_dev_pw@localhost:5432/mentis
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_WS_BASE=ws://localhost:4000
```

---

## Repository Setup

```
git init
git add remote origin https://github.com/user/mentis.git

Structure:
mentis/
├── apps/
│   ├── api/               (Fastify backend)
│   ├── web-student/       (Next.js student app)
│   └── web-teacher/       (Next.js teacher app - Phase 4)
├── packages/
│   └── shared/            (Types, utilities)
├── docker/
│   └── docker-compose.yml
├── DESIGN_SYSTEM.md       (UI/UX guide)
├── API_SPEC.md           (Endpoint docs)
├── README.md             (Project overview)
└── package.json          (Root workspace)
```

---

## Next Steps (Right Now)

1. ✅ **Design Complete** ← You are here
2. **Start Phase 1**:
   - Update Prisma schema
   - Implement answer + finish endpoints
   - Seed test data
   - Test with curl

**Should we start Phase 1 now?**
