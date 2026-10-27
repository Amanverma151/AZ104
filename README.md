# AZ-104 Motion Coach

Learn the Microsoft Azure Administrator (AZ-104) exam through short animated lessons, then prove it with exam-style questions.

**Live demo:** https://<your-username>.github.io/az104-motion-coach/

## What's inside

- **58 animated lessons** across all five exam domains, with captions you can pause, step through and replay
- **~280 original exam-style questions**: single answer, select two, hotspot, drag-to-order, Yes/No series and case studies, each with explanations of why every wrong option is wrong
- **Quick checks** after every lesson and a 10–15 question **session quiz**
- **Spaced repetition**: missed questions come back after 10 minutes, then 1, 3, 7, 16 and 35 days
- **~145 exam-trap flashcards**
- **Timed mock exams**: one per domain (25 questions, 40 min) and a full mock (50 questions, 100 min)
- **Readiness score** weighted like the real exam

| Domain | Weight | Lessons |
|---|---|---|
| Manage Azure identities and governance | 20–25% | 11 |
| Implement and manage storage | 15–20% | 13 |
| Deploy and manage Azure compute resources | 20–25% | 13 |
| Implement and manage virtual networking | 15–20% | 11 |
| Monitor and maintain Azure resources | 10–15% | 10 |

## Run it

It's a single static page with no build step or dependencies.

- Open `index.html` in a browser, or
- Publish with GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**.

Progress is saved in your browser (localStorage).

## Project structure

```
index.html        # the app (generated)
build.py          # rebuilds index.html from src/
src/
  head.html       # styles and fonts
  body.html       # header and layout
  content*.js     # lessons, questions and flashcards per domain
  questions.js    # networking questions and flashcards
  engine.js       # SVG animation engine and scene player
  app.js          # views, quizzes, spaced repetition, mocks
```

Edit files in `src/`, then run `python build.py` to regenerate `index.html`.

## Notes

- Questions are original and written to match the exam's formats. They are not taken from the real exam.
- Azure changes often. Check details against the [official AZ-104 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104).
- The "Create a lesson with Claude" and "Ask Claude" features only work when the page runs inside Claude; on GitHub Pages they're hidden.

Not affiliated with or endorsed by Microsoft. Azure and AZ-104 are trademarks of Microsoft Corporation.
