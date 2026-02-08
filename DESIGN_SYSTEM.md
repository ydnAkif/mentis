# 🎨 Mentis Design System & UI/UX Guide

## Color Palette (Kahoot Inspired)

```
Primary Colors:
  - Bright Purple    #6B2BFF  (Main CTA buttons)
  - Vibrant Blue     #1E90FF  (Secondary, Answer A)
  - Electric Green   #00D084  (Success, Answer B)
  - Sunny Yellow     #FFD000  (Warning, Answer C)
  - Hot Pink / Red   #FF1744  (Error, Answer D)

Backgrounds:
  - Dark Base        #0F0F23  (Dark mode ready)
  - Gradient BG      Purple → Blue → Cyan (animated slowly)

Text:
  - Primary White    #FFFFFF
  - Secondary Gray   #E0E0E0
  - Dark Text        #1A1A2E
```

---

## Typography

```
Display (Puan, Skor):
  Font: "Space Mono" / "JetBrains Mono"
  Size: 72px / 48px
  Weight: Bold
  Color: Electric Green or Hot Pink

Heading (Soru başlığı):
  Font: "Poppins" / "Inter"
  Size: 24px
  Weight: 700
  Color: White
  Text Shadow: 0 4px 10px rgba(107, 43, 255, 0.3)

Body (Şımış metni):
  Font: "Inter"
  Size: 16px / 14px
  Weight: 500
  Letter Spacing: 0.5px
  Color: White / E0E0E0
```

---

## Component Styles

### Button (Answers - A, B, C, D)

```
Base State:
  - Size: Full width, 80px height (mobile), 100px (desktop)
  - Border Radius: 16px
  - Background: Color (Purple/Blue/Green/Yellow/Red)
  - Text: Bold, 20px white
  - Box Shadow: 0 8px 20px rgba(color, 0.3)

Hover State:
  - Scale: 1.03
  - Box Shadow: 0 12px 30px rgba(color, 0.5)
  - Shine effect: Left-to-right 800ms infinite

Active/Pressed:
  - Scale: 0.98
  - Box Shadow: 0 4px 10px rgba(color, 0.2)
  - Ripple animation (Material Design style)

Disabled:
  - Opacity: 0.6
  - Cursor: not-allowed
  - No shadow

Animation:
  - Entrance: slideUp 300ms @cubic-bezier(0.34, 1.56, 0.64, 1)
  - Hover shine: infinite shimmer from left 800ms
```

### Timer (Top Right)

```
- Circular progress ring (SVG)
- Center: Time in seconds (24px bold)
- Ring: Gradient color based on time left:
  - 100%-50%: Green
  - 50%-20%: Yellow
  - 20%-0%: Red
- Alert: Pulsing scale 1 → 1.1 when < 5 seconds
- Animation: Smooth rotation + color transition
```

### Question Card

```
- Background: rgba(255,255,255, 0.05) / Glass morphism
- Border: 2px solid rgba(255,255,255, 0.1)
- Border Radius: 24px
- Padding: 32px (desktop) / 20px (mobile)
- Backdrop Filter: blur(10px)
- Box Shadow: 0 8px 32px rgba(0,0,0, 0.3)

Image (if exists):
  - Width: 100%
  - Max Height: 300px
  - Border Radius: 16px
  - Margin Bottom: 20px
  - Object Fit: cover

Text:
  - Line Height: 1.6
  - Color: White
  - Text Shadow: 0 2px 4px rgba(0,0,0, 0.2)
```

### Leaderboard

```
Animation on update:
- New rank: Slide in from right 400ms
- Rank jump: Scale 0 → 1.2 → 1 (springy 500ms)
- Top 3 celebration:
  - 🥇1st: Pulse glow effect
  - 🥈2nd: Subtle shine
  - 🥉3rd: Slight bounce

Each row:
  - Rank circle + Avatar placeholder (initials)
  - Name + Score
  - Hover: Slight background color change + glow
```

---

## Animations (Framer Motion)

### Page Transitions

```
Enter Animation (all pages):
  - Opacity: 0 → 1 (400ms)
  - Y: 20px → 0 (400ms cubic-bezier)
  - Stagger children: 100ms

Exit Animation:
  - Opacity: 1 → 0 (300ms)
  - Y: 0 → -20px (300ms)
```

### Key Moment Animations

**1. Answer Confirmation (Confetti + Sound)**

```
- Confetti burst from button click point
- Boom sound effect (optional)
- Correct answer: Green sparkle fall 800ms
- Wrong answer: Red shake × 3, fade out
- Button scales to 1.1 then back
```

**2. Leaderboard Update**

```
- All names slide in from sides on first load
- On rank update:
  - Old rank fades out slightly
  - New rank animates in with scale bounce
  - Green highlight pulse (500ms)
```

**3. Next Question Transition**

```
- Current question fade out Y+10px (200ms)
- Wait 300ms
- New question slide in Y-20 → 0 (400ms)
- Buttons stagger appear 100ms each
```

**4. Score Reveal**

```
- Number counter 0 → Final (2 seconds)
- Use "odometer" effect or numeral.js
- Green glow behind number
- Confetti burst at end
```

### Micro-interactions

```
Loading spinner: Custom animated SVG (pulsing rings)
Toast notifications: Slide in from top, auto-dismiss 4s
Button ripple: Click center → expanding circle
Hover glow: Background color + outer shadow pulse
Timer pulsing: Subtle scale 1 →1.05 → 1 (1.5s infinite)
```

---

## Responsive Design

### Mobile (< 640px)

- Full viewport height
- No leaderboard sidebar (show below on mobile)
- Larger touch targets (80px buttons min)
- Font sizes: -2px from desktop
- Padding: 16px instead of 32px
- Stack layout vertically

### Tablet (640px - 1024px)

- Medium layout
- Can show leaderboard on side (50% width)
- Balanced spacing

### Desktop (> 1024px)

- Leaderboard sidebar (25%)
- Quiz content (75%)
- Full animations
- Hover states fully utilized

---

## Dark Mode

- Mentis is **dark mode by default** (fits gaming aesthetic)
- Background: #0F0F23
- Consider adding optional light mode toggle later

---

## Accessibility

- WCAG AA compliant
- Button contrast: 7:1 minimum
- Font readable at 14px
- Focus states: Clear 3px outline
- No animation that flashes > 3 times/second
- Keyboard navigation: Tab through answers
- Screen reader: aria-labels for all interactive elements

---

## Loading States

- Skeleton screens during quiz load
- Pulsing animations for data fetching
- "Connecting..." message during WebSocket init
- Graceful degradation if WebSocket fails

---

## Emoji & Personality

Strategic emoji use:

- Question mark (❓) before soru sayacı
- Trophy (🏆) leaderboard başlık
- Sparkles (✨) success states
- Fire (🔥) top performers
- Thinking face (🤔) timer warning
- Party popper (🎉) completion

Keep it used but not excessive - max 1-2 per screen section.

---

## 🎵 Sound Effects & Audio Design

**Philosophy**: Ses = Critical feedback + celebration + gaming energy. Kahoot's ses stratejisinden ilham alınmıştır.

### Core Sounds

#### 1. **Correct Answer** ✅

- **Sound**: Bright orchestral "ding" + coin cascade
- **Effect**: 3-4 chime tones ascending (C → E → G → C)
- **Duration**: 600ms
- **Frequency**: Sparkly, celebratory (880Hz → 1320Hz)
- **Volume**: 70% (noticeable but not jarring)
- **When**: Immediately on correct answer selection
- **Kahoot reference**: Their iconic "correct" sound
- **Format**: MP3/WebM, ~50KB

Example waveform: Bright, melodic, joyful

#### 2. **Wrong Answer** ❌

- **Sound**: Deep buzzer + sad trombone (spielbergian)
- **Effect**: Low buzz sound (200Hz) sliding down + trombone fall
- **Duration**: 400ms
- **Volume**: 60% (less celebratory)
- **When**: On wrong answer selection
- **Psychological**: Makes student laugh, not embarrassed
- **Kahoot reference**: Their buzzer sound
- **Format**: MP3/WebM, ~40KB

#### 3. **Timer Critical** ⏰ (< 5 seconds)

- **Sound**: Rapid beeping + digital alarm (1 kHz)
- **Effect**: "Beep beep beep" every 500ms
- **Duration**: 300ms per beep
- **Volume**: 65% (urgent but not screaming)
- **When**: Timer drops below 5 seconds
- **Rhythm**: Accelerating beeps (slower → faster)
- **Stops**: On answer selection
- **Kahoot reference**: Their high-pitch timer alert

#### 4. **Question Transition** ➡️

- **Sound**: Whoosh + soft orchestral swell
- **Effect**: Air sound (wind) + ascending notes fade-in
- **Duration**: 400ms
- **Volume**: 50% (background, not intrusive)
- **When**: Moving to next question (leaderboard → new question)
- **Smooth**: Signals smooth transition, builds anticipation

#### 5. **Leaderboard Update** 🏆

- **Sound**: Ascending chime + flourish
- **Effect**: 3-note ascending melody (C → E → G) + sparkle
- **Duration**: 500ms
- **Volume**: 55% (celebratory, not disruptive)
- **When**: Rank changes, new position achieved
- **Animation sync**: Sound + visual rank change synchronized
- **Kahoot reference**: Their rank-up sound

#### 6. **You're #1!** 🥇

- **Sound**: Fanfare + victory horn (orchestral)
- **Effect**: 5-note ascending fanfare (dramatic)
- **Duration**: 800ms
- **Volume**: 75% (celebratory moment!)
- **When**: Student reaches 1st place
- **Extra**: Maybe vibration on mobile (haptic feedback)
- **Kahoot reference**: Their rank 1 sound (Epic!)

#### 7. **Quiz Started** 🎮

- **Sound**: Game start chime + drum hit
- **Effect**: Kick drum + synth note
- **Duration**: 600ms
- **Volume**: 70%
- **When**: Click "Başla" button confirmed
- **Builds hype**: Student is ready to play

#### 8. **Quiz Completed** 🎉

- **Sound**: Victory music + confetti pop
- **Effect**: Orchestral flourish + popping sounds (3x)
- **Duration**: 1200ms
- **Volume**: 80% (celebration!)
- **When**: Last question answered, moving to results
- **Paired with**: Confetti animation + score reveal
- **Psychological**: Makes completion feel EPIC

#### 9. **Login Success** ✨

- **Sound**: Soft chime + sparkle
- **Effect**: 2-note ascending tone + shimmer sound
- **Duration**: 400ms
- **Volume**: 50%
- **When**: Student name verified (lookup success)
- **Kahoot reference**: Their login success

#### 10. **Error/Invalid** ⚠️

- **Sound**: Sad beep + air horn buzz
- **Effect**: Descending tone (alarm-like)
- **Duration**: 300ms
- **Volume**: 60%
- **When**: Wrong join code, network error, etc.
- **Not shaming**: Playful, not harsh

#### 11. **Leaderboard Announcement** 📢

- **Sound**: Ding + reveal swell
- **Effect**: Clean ding + orchestral swell
- **Duration**: 500ms
- **Volume**: 65%
- **When**: Leaderboard appears after answer
- **Frequency**: Moderate pitch (not irritating)

#### 12. **Button Hover** (Optional micro-sound)

- **Sound**: Tiny beep / click (subtle)
- **Effect**: Light ping sound (1200Hz)
- **Duration**: 100ms
- **Volume**: 30% (very subtle!)
- **When**: Hover over answer button (desktop only)
- **Can disable**: In settings if annoying

---

### Audio Production Details

#### Sound Sources:

- **Tool**: Freesound.org, Epidemic Sound, or Kahoot-style generated
- **Format**: WAV (production) → MP3/WebM (web)
- **Bitrate**: 192kbps MP3 (quality + file size balance)
- **Sample rate**: 44.1kHz (standard)

#### Sound Files to Create:

```
sounds/
├── answer-correct.mp3        (50KB)
├── answer-wrong.mp3          (40KB)
├── timer-critical.mp3        (30KB)
├── transition-next.mp3       (40KB)
├── leaderboard-update.mp3    (45KB)
├── rank-first.mp3            (60KB)
├── quiz-started.mp3          (50KB)
├── quiz-completed.mp3        (80KB)
├── login-success.mp3         (35KB)
├── error-invalid.mp3         (30KB)
├── leaderboard-announce.mp3  (45KB)
└── button-hover.mp3          (15KB)
Total: ~540KB
```

#### React Audio Implementation:

```typescript
// hooks/useSound.ts
import { useEffect, useState } from "react";

export const useSound = (soundFile: string) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioElement = new Audio(`/sounds/${soundFile}`);
    audioElement.preload = "auto";
    setAudio(audioElement);
  }, [soundFile]);

  const play = () => {
    if (audio) {
      audio.currentTime = 0; // Reset
      audio.play().catch(() => {}); // Fail silently
    }
  };

  return { play };
};

// Usage:
const { play: playCorrect } = useSound("answer-correct.mp3");

// On correct answer:
playCorrect();
```

---

### Settings & Accessibility

#### Mute Controls:

```
Settings Icon (top-right):
  □ Sound Effects (toggle)
  □ Music (background - future)
  □ Haptic Feedback (mobile)
  □ Volume Slider (0-100%)
```

#### Accessibility:

- **Visual feedback replaces sound**: If sound off, show toast notifications
- **Never critical**: Quiz works perfectly without sound
- **Captions for deaf users**: Add visual cues (like shaking the question card)
- **Battery**: Sound playback doesn't drain significantly

---

### Browser Compatibility

- **Chrome**: Full support
- **Safari**: Full support (ios 11+)
- **Firefox**: Full support
- **Edge**: Full support
- **Mobile browsers**: Work on iOS/Android (may require user interaction for first play)

**Note**: iOS requires user gesture (tap) before playing audio (Apple's policy). First sound will auto-play, subsequent ones will work freely.

---

### Sound Timeline Example

```
00:00 - Student enters join code
       └─> [Login success sound] ✨ (if correct)

00:10 - Click "Başla" button
       └─> [Quiz started sound] 🎮

00:15 - Question appears
       └─> (No sound, visual animation instead)

01:20 - 30s timer, student hasn't answered
       └─> [Timer warning beep] ⏰ (starts at 5s mark)

01:25 - Student selects answer B
       └─> [Answer correct ding] ✅ Confetti burst
           [Leaderboard announce sound] 📢
           [New rank sound] 🏆 (if rank changed)

01:30 - Transition to next question
       └─> [Transition whoosh] ➡️

02:00 - Last question answered
       └─> [Quiz completed fanfare] 🎉
           Confetti + Score reveal

02:05 - Results/Leaderboard shown
       └─> [Leaderboard update] per rank change
```

---

### Optional Future Enhancements

- **Background music** during quiz (subtle, looping)
- **Crowd cheering** on rank changes (funny callback sounds)
- **Sound mixing**: Dynamic volume based on number of concurrent sounds
- **Haptic feedback**: Mobile vibration on correct/wrong answers
- **Voice announcements**: "Three seconds remaining!" (optional)
- **Kahoot-style narrator**: "Get ready..." "3... 2... 1... GO!" (fun but optional)

---

### Sound Design Philosophy Summary

✅ **Engaging**: Every sound should make player smile or feel achievement  
✅ **Non-intrusive**: Doesn't distract, doesn't annoy  
✅ **Instant feedback**: Under 200ms from action to sound  
✅ **Celebratory**: Positively reinforce correct answers  
✅ **Playful**: Laughable wrong answer sound, not harsh  
✅ **Accessible**: Works without sound, optional toggles  
✅ **Kahoot vibes**: Familiar to students who've played Kahoot

---

## Teacher Panel Design

Similar aesthetic but more professional:

- Quiz creation form with preview
- Student list with inline editing
- Analytics with charts (recharts / visx)
- Bulk upload CSV for students
- Color scheme same (purple/blue) but less playful

---

## Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-primary: #6b2bff;
  --color-blue: #1e90ff;
  --color-green: #00d084;
  --color-yellow: #ffd000;
  --color-red: #ff1744;
  --color-bg: #0f0f23;
  --color-text: #ffffff;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Typography */
  --font-mono: "JetBrains Mono", monospace;
  --font-sans: "Inter", sans-serif;

  /* Shadows */
  --shadow-sm: 0 4px 10px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 8px 20px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 12px 30px rgba(0, 0, 0, 0.4);

  /* Animations */
  --transition-fast: 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-base: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-slow: 800ms ease-in-out;
}
```

---

## File Structure (UI Components)

```
src/components/
├── ui/
│   ├── Button.tsx (Answer buttons)
│   ├── Card.tsx (Question card)
│   ├── Timer.tsx (Circular progress)
│   ├── Leaderboard.tsx (Rankings)
│   ├── Toast.tsx (Notifications)
│   └── LoadingSpinner.tsx
├── Quiz/
│   ├── QuestionDisplay.tsx
│   ├── AnswerGrid.tsx
│   ├── ScoreMeter.tsx
│   └── QuizContainer.tsx
├── Layout/
│   └── ResponsiveLayout.tsx
└── animations/
    └── frameMotionConfigs.ts (Reusable animation presets)
```

---

## Implementation Priority

1. **Phase 1**: Colors, buttons, typography (base components)
2. **Phase 2**: Page transitions, answer animations
3. **Phase 3**: Leaderboard animations, confetti
4. **Phase 4**: Micro-interactions, polishing
5. **Phase 5**: Sound effects, advanced effects
