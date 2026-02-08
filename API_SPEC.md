# 🖥️ Backend API Specification

## Database Schema Updates

### New/Updated Models

```prisma
// Quiz Mode: "LIVE" | "HOMEWORK" | "BOTH"
model Quiz {
  id          String   @id @default(cuid())
  title       String
  mode        String   @default("BOTH")  // LIVE, HOMEWORK, BOTH
  category    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  questions   QuizQuestion[]
  assignments Assignment[]
}

// Tracking quando bir soru gösterildiği
model QuizSession {
  id              String   @id @default(cuid())
  assignmentId    String
  assignment      Assignment @relation(fields: [assignmentId], references: [id])
  currentQuestion Int      @default(0)  // Kaçıncı soru açık
  startedAt       DateTime @default(now())
  createdAt       DateTime @default(now())
}

// QuizQuestion'a timing ekle
model QuizQuestion {
  quizId         String
  questionId     String
  order          Int
  timeLimitSec   Int      @default(30)  // Soru bazlı

  quiz     Quiz     @relation(fields: [quizId], references: [id])
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([quizId, questionId])
  @@index([quizId, order])
}
```

---

## API Endpoints

### 1. Student Authentication

#### `POST /api/student/lookup`

**Description**: Öğrenci doğrulama (Join Code + Okul Numarası)

**Request**:

```json
{
  "joinCode": "ABCD1234",
  "studentNo": "12345"
}
```

**Response (200)**:

```json
{
  "ok": true,
  "student": {
    "id": "cuid-123",
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "profileColor": "#6B2BFF" // Random renk (avatar için)
  }
}
```

**Response (404)**:

```json
{
  "ok": false,
  "error": "NOT_FOUND" // veya "ASSIGNMENT_NOT_FOUND"
}
```

---

### 2. Quiz Session Management

#### `POST /api/attempt/start`

**Description**: Quiz başlat (tek katılım kontrolü)

**Request**:

```json
{
  "joinCode": "ABCD1234",
  "studentId": "cuid-123"
}
```

**Response (200)**:

```json
{
  "ok": true,
  "attemptId": "cuid-attempt-456",
  "alreadyStarted": false,
  "quiz": {
    "id": "quiz-789",
    "title": "Biyoloji Sınavı",
    "mode": "LIVE", // LIVE | HOMEWORK
    "totalQuestions": 10,
    "scoringMode": "instant" // instant | endOfQuiz
  }
}
```

**Response (200 - Already Started)**:

```json
{
  "ok": true,
  "attemptId": "cuid-attempt-456",
  "alreadyStarted": true,
  "status": "STARTED",
  "totalScore": 150,
  "currentQuestion": 3
}
```

---

#### `GET /api/attempt/:attemptId/quiz`

**Description**: Quiz sorularını getir

**Response (200)**:

```json
{
  "ok": true,
  "quiz": {
    "id": "quiz-789",
    "title": "Biyoloji Sınavı",
    "mode": "LIVE",
    "questions": [
      {
        "order": 1,
        "id": "q-1",
        "text": "Bitkilerin fotosentez yapılan organı nedir?",
        "imageUrl": "https://...",
        "options": {
          "a": "Gövde",
          "b": "Yaprak",
          "c": "Kök",
          "d": "Çiçek"
        },
        "timeLimitSec": 30
      }
      //... daha fazla soru
    ]
  }
}
```

---

### 3. Answer Submission

#### `POST /api/attempt/:attemptId/answer`

**Description**: Soru cevapla ve anlık puanlandır

**Request**:

```json
{
  "questionId": "q-1",
  "selectedAnswer": "B", // "A" | "B" | "C" | "D"
  "timeMs": 8500 // Cevap vermek için harcanan zaman (ms)
}
```

**Response (200)**:

```json
{
  "ok": true,
  "answer": {
    "questionId": "q-1",
    "selected": "B",
    "isCorrect": true,
    "scoreAwarded": 100,
    "timeMs": 8500
  },
  "attempt": {
    "id": "cuid-attempt-456",
    "totalScore": 100,
    "questionsAnswered": 1,
    "currentQuestion": 2
  },
  "nextQuestion": {
    "order": 2,
    "id": "q-2",
    "text": "Fotosentezin ana ürünü nedir?",
    "imageUrl": null,
    "options": { ... },
    "timeLimitSec": 30
  }
}
```

**Notes**:

- Backend anlık puanlandır (doğruysa puan ver)
- Puanlama: `score = 100 * (30 - min(timeMs/1000, 30)) / 30`
  - Hızlı cevap → daha çok puan
  - Yavaş cevap → daha az puan
  - Hatalı cevap → 0 puan

---

### 4. Quiz Completion

#### `POST /api/attempt/:attemptId/finish`

**Description**: Sınavı bitir ve final sonuçlar

**Response (200)**:

```json
{
  "ok": true,
  "attempt": {
    "id": "cuid-attempt-456",
    "status": "FINISHED",
    "totalScore": 850,
    "questionsAnswered": 10,
    "correctAnswers": 8,
    "accuracy": 80
  },
  "currentRank": {
    "position": 3,
    "totalParticipants": 25,
    "ranking": [
      {
        "position": 1,
        "studentName": "Ali Demir",
        "score": 950,
        "icon": "🥇"
      },
      {
        "position": 2,
        "studentName": "Zeynep Kaya",
        "score": 920,
        "icon": "🥈"
      },
      {
        "position": 3,
        "studentName": "Ahmet Yılmaz", // ← Current student
        "score": 850,
        "icon": "🥉"
      }
      // ... daha fazla (top 10)
    ]
  }
}
```

---

### 5. Real-time Leaderboard (WebSocket)

#### `WS /ws/quiz/:assignmentId`

**Description**: Live leaderboard updates

**Server → Client (Broadcast)**:

```json
{
  "type": "LEADERBOARD_UPDATE",
  "data": {
    "assignmentId": "assign-123",
    "leaderboard": [
      {
        "position": 1,
        "studentId": "student-1",
        "name": "Ali Demir",
        "score": 950,
        "answeredQuestions": 10,
        "lastUpdate": "2026-02-07T14:35:20Z"
      }
      // ...
    ],
    "totalParticipants": 25
  }
}
```

**Server → Client (Question Change)**:

```json
{
  "type": "QUESTION_CHANGED",
  "data": {
    "questionNumber": 2,
    "totalQuestions": 10
  }
}
```

**Server → Client (Quiz Ended)**:

```json
{
  "type": "QUIZ_ENDED",
  "data": {
    "assignmentId": "assign-123",
    "endedAt": "2026-02-07T14:40:00Z"
  }
}
```

---

### 6. Leaderboard (HTTP Fallback)

#### `GET /api/assignment/:assignmentId/leaderboard`

**Description**: WebSocket olmayan cihazlar için (fallback)

**Response (200)**:

```json
{
  "ok": true,
  "leaderboard": [
    {
      "position": 1,
      "studentId": "student-1",
      "name": "Ali Demir",
      "score": 950,
      "profileColor": "#6B2BFF",
      "answeredQuestions": 10
    }
    // ...
  ],
  "totalParticipants": 25,
  "lastUpdated": "2026-02-07T14:35:20Z"
}
```

---

### 7. Attempt History

#### `GET /api/student/:studentId/attempts`

**Description**: Öğrencinin önceki denemeleri

**Response (200)**:

```json
{
  "ok": true,
  "attempts": [
    {
      "attemptId": "cuid-attempt-1",
      "quizTitle": "Biyoloji Sınavı",
      "score": 850,
      "accuracy": 85,
      "rank": 3,
      "totalParticipants": 25,
      "completedAt": "2026-02-05T14:00:00Z"
    }
    // ...
  ]
}
```

---

## Teacher API Endpoints (MVP)

### 1. Quiz Management

#### `POST /api/teacher/quiz`

**Description**: Quiz oluştur

**Request**:

```json
{
  "title": "Biyoloji Sınavı",
  "mode": "LIVE", // LIVE | HOMEWORK | BOTH
  "questions": [
    {
      "text": "Bitkilerin fotosentez yapılan organı nedir?",
      "imageUrl": "https://...",
      "options": {
        "a": "Gövde",
        "b": "Yaprak",
        "c": "Kök",
        "d": "Çiçek"
      },
      "correctAnswer": "B",
      "timeLimitSec": 30
    }
    // ...
  ]
}
```

---

#### `POST /api/teacher/assignment`

**Description**: Sınıfa quiz atama ve join code oluştur

**Request**:

```json
{
  "quizId": "quiz-789",
  "classId": "class-456",
  "startTime": "2026-02-07T14:00:00Z", // Optional
  "endTime": "2026-02-07T14:30:00Z" // Optional
}
```

**Response (200)**:

```json
{
  "ok": true,
  "assignment": {
    "id": "assign-123",
    "quizId": "quiz-789",
    "classId": "class-456",
    "joinCode": "BIO42", // 6-8 karakter alphanumeric
    "createdAt": "2026-02-07T13:00:00Z"
  }
}
```

---

## Error Codes

```
404 - ASSIGNMENT_NOT_FOUND
404 - STUDENT_NOT_FOUND
404 - ATTEMPT_NOT_FOUND
400 - INVALID_INPUT
400 - ATTEMPT_ALREADY_STARTED
401 - UNAUTHORIZED
500 - INTERNAL_SERVER_ERROR
```

---

## Performance Considerations

1. **Database Indexing**:
   - `Assignment.joinCode` (unique)
   - `Attempt.assignmentId, studentId` (unique)
   - `Answer.attemptId` (for quick lookup)

2. **Query Optimization**:
   - Leaderboard: Cache 10 saniye (Redis ideal, ama SQLite cache de olur)
   - Student lookup: Direct WHERE by unique constraint

3. **WebSocket Strategy**:
   - Use `socket.io` or `ws` library
   - Broadcast only leaderboard changes (not all answers)
   - Auto-disconnect on quiz end

4. **Scalability (300 öğrenci)**:
   - PostgreSQL easily handles 300 concurrent sessions
   - WebSocket: ~2KB per broadcast
   - 25 öğrenci × 10 broadcasts = 500KB data transfer (acceptable)

---

## Rate Limiting (Future)

```
/api/student/lookup: 5 req/min per IP
/api/attempt/*/answer: 1 req per second (per student)
/api/attempt/*/finish: 1 req (once per attempt)
```

---

## Sound Trigger Specification

API responses include `soundTrigger` field to sync frontend audio with server state.

### Answer Submission Response with Sound Trigger

#### `POST /api/attempt/:attemptId/answer` (200 - Correct)
```json
{
  "ok": true,
  "answer": {
    "questionId": "q-1",
    "selected": "B",
    "isCorrect": true,
    "scoreAwarded": 100,
    "timeMs": 8500
  },
  "soundTrigger": {
    "type": "ANSWER_CORRECT",
    "file": "answer-correct.mp3",
    "timing": "immediate",
    "syncWith": ["confetti", "leaderboard-update"]
  },
  "attempt": { ... },
  "nextQuestion": { ... }
}
```

#### `POST /api/attempt/:attemptId/answer` (200 - Wrong)
```json
{
  "ok": true,
  "answer": {
    "questionId": "q-1",
    "selected": "A",
    "isCorrect": false,
    "scoreAwarded": 0,
    "timeMs": 8500
  },
  "soundTrigger": {
    "type": "ANSWER_WRONG",
    "file": "answer-wrong.mp3",
    "timing": "immediate",
    "syncWith": ["shake-animation"]
  },
  "attempt": { ... },
  "nextQuestion": { ... }
}
```

### Sound Trigger Types

```typescript
type SoundTrigger = {
  type: 
    | "ANSWER_CORRECT"       // Ding + coin cascade
    | "ANSWER_WRONG"         // Buzzer + sad trombone
    | "QUIZ_STARTED"         // Game start chime
    | "QUIZ_COMPLETED"       // Victory fanfare
    | "LEADERBOARD_UPDATE"   // Rank change sound
    | "RANK_FIRST"           // You're #1 fanfare
    | "NEXT_QUESTION"        // Transition whoosh
    | "LOGIN_SUCCESS"        // Welcome chime
    | "ERROR_INVALID"        // Error buzz
    | "TIMER_CRITICAL"       // Warning beeps (server can notify)
    | null;                  // No sound

  file: string;              // MP3 filename
  timing: "immediate" | "delayed";
  delay?: number;            // ms (if delayed)
  syncWith: string[];        // Animation names to sync
  volume?: number;           // 0-100 (default 70)
};
```

### Sound Trigger Examples

#### After Correct Answer + Leaderboard Update
```json
{
  "soundTrigger": {
    "type": "ANSWER_CORRECT",
    "file": "answer-correct.mp3",
    "timing": "immediate",
    "syncWith": ["confetti-burst", "score-pop"],
    "volume": 75
  }
}
```

#### Leaderboard Rank Change
```json
{
  "type": "LEADERBOARD_UPDATE",
  "leaderboard": [
    { "position": 1, "studentName": "Ali", "score": 950 },
    { "position": 2, "studentName": "Zeynep", "score": 920 },
    { "position": 3, "studentName": "Ahmet", "score": 850 }  // Moved from 5th
  ],
  "soundTrigger": {
    "type": "RANK_FIRST",
    "file": "rank-first.mp3",
    "timing": "immediate",
    "syncWith": ["rank-animation-slide", "sparkle-effect"],
    "volume": 80
  }
}
```

#### Quiz Completion
```json
{
  "soundTrigger": {
    "type": "QUIZ_COMPLETED",
    "file": "quiz-completed.mp3",
    "timing": "immediate",
    "syncWith": ["confetti-burst", "score-reveal-counter"],
    "volume": 85
  }
}
```

### Frontend Sound Implementation

```typescript
// hooks/useApiSound.ts
import { useEffect } from 'react';
import { useSound } from './useSound';

export const useApiSound = (soundTrigger: SoundTrigger | null) => {
  const { play: playCorrect } = useSound('answer-correct.mp3');
  const { play: playWrong } = useSound('answer-wrong.mp3');
  // ... other sounds

  useEffect(() => {
    if (!soundTrigger) return;

    const delay = soundTrigger.delay || 0;

    const timeout = setTimeout(() => {
      switch (soundTrigger.type) {
        case 'ANSWER_CORRECT':
          playCorrect();
          break;
        case 'ANSWER_WRONG':
          playWrong();
          break;
        // ... etc
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [soundTrigger]);
};

// Usage in Quiz Component:
const handleAnswer = async () => {
  const response = await fetch(`/api/attempt/${attemptId}/answer`, {...});
  const data = await response.json();
  
  // Play sound from API trigger
  useApiSound(data.soundTrigger);
  
  // Sync animations
  triggerAnimation(data.soundTrigger.syncWith);
};
```

### WebSocket Sound Triggers

During live leaderboard updates:

```json
{
  "type": "LEADERBOARD_UPDATE",
  "data": {
    "leaderboard": [...],
    "soundTriggers": {
      "student-1": {
        "type": "LEADERBOARD_UPDATE",
        "file": "leaderboard-update.mp3"
      },
      "student-2": {
        "type": "RANK_FIRST",
        "file": "rank-first.mp3"
      }
    }
  }
}
```

---

## Testing Endpoints

```bash
# Students lookup
curl -X POST http://localhost:4000/api/student/lookup \
  -H "Content-Type: application/json" \
  -d '{"joinCode":"TEST01","studentNo":"12345"}'

# Start attempt
curl -X POST http://localhost:4000/api/attempt/start \
  -H "Content-Type: application/json" \
  -d '{"joinCode":"TEST01","studentId":"student-123"}'

# Get quiz
curl http://localhost:4000/api/attempt/attempt-123/quiz

# Submit answer
curl -X POST http://localhost:4000/api/attempt/attempt-123/answer \
  -H "Content-Type: application/json" \
  -d '{"questionId":"q-1","selectedAnswer":"B","timeMs":8500}'

# Finish
curl -X POST http://localhost:4000/api/attempt/attempt-123/finish
```
