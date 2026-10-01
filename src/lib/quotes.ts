export interface MotivationQuote {
  quote: string;
  author: string;
  tag: string;
}

export const MOTIVATION_QUOTES: MotivationQuote[] = [
  {
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    tag: "Habits",
  },
  {
    quote: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    tag: "Discipline",
  },
  {
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
    tag: "Atomic Habits",
  },
  {
    quote: "Don't count the days, make the days count.",
    author: "Muhammad Ali",
    tag: "Grit",
  },
  {
    quote: "Small disciplines repeated with consistency every day lead to great achievements.",
    author: "John C. Maxwell",
    tag: "Consistency",
  },
  {
    quote: "The pain of discipline weighs ounces; the pain of regret weighs tons.",
    author: "Jim Rohn",
    tag: "Mindset",
  },
  {
    quote: "He who conquers himself is the mightiest warrior.",
    author: "Confucius",
    tag: "Self-Mastery",
  },
  {
    quote: "We suffer more often in imagination than in reality. Endure and stay hard.",
    author: "Seneca",
    tag: "Stoicism",
  },
  {
    quote: "Motivation gets you going, but discipline keeps you growing.",
    author: "John C. Maxwell",
    tag: "Growth",
  },
  {
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    tag: "Daily Action",
  },
  {
    quote: "Self-discipline begins with the mastery of your thoughts.",
    author: "Napoleon Hill",
    tag: "Focus",
  },
  {
    quote: "Champions do ordinary things with extraordinary consistency.",
    author: "Charles Duhigg",
    tag: "Excellence",
  },
  {
    quote: "It is not what we do once in a while that shapes our lives, but what we do consistently.",
    author: "Tony Robbins",
    tag: "Rituals",
  },
  {
    quote: "Action is not just the effect of motivation; it is also the cause of it.",
    author: "Mark Manson",
    tag: "Momentum",
  },
  {
    quote: "Monk Mode: Eliminate the noise, starve distractions, feed your focus.",
    author: "Deep Work Protocol",
    tag: "Monk Mode",
  },
  {
    quote: "75 days of unbroken discipline builds a lifetime of unshakable self-respect.",
    author: "Iron Discipline",
    tag: "75 Hard",
  },
  {
    quote: "First forget inspiration. Habit is more dependable. Habit will sustain you.",
    author: "Octavia Butler",
    tag: "Perseverance",
  },
  {
    quote: "If you conquer your morning routine, you conquer your entire day.",
    author: "Marcus Aurelius",
    tag: "Morning Ritual",
  },
  {
    quote: "Do something today that your future self will thank you for.",
    author: "Sean Patrick Flanery",
    tag: "Vision",
  },
  {
    quote: "Energy flows where attention goes. Guard your habits fiercely.",
    author: "Stoic Wisdom",
    tag: "Mastery",
  },
  {
    quote: "Discipline equals freedom. There is no shortcut, no hack. Do the work.",
    author: "Jocko Willink",
    tag: "Discipline",
  },
  {
    quote: "Don't stop when you are tired. Stop when you are done.",
    author: "David Goggins",
    tag: "Grit",
  },
  {
    quote: "I fear not the man who has practiced 10,000 kicks once, but the man who has practiced one kick 10,000 times.",
    author: "Bruce Lee",
    tag: "Mastery",
  },
  {
    quote: "How long are you going to wait before you demand the best for yourself?",
    author: "Epictetus",
    tag: "Stoicism",
  },
  {
    quote: "Great things come from hard work and perseverance. No excuses.",
    author: "Kobe Bryant",
    tag: "Mamba Mentality",
  },
  {
    quote: "Small daily seemingly unimportant improvements when done consistently over time yield staggering results.",
    author: "Robin Sharma",
    tag: "Consistency",
  },
  {
    quote: "What we fear doing most is usually what we most need to do.",
    author: "Tim Ferriss",
    tag: "Courage",
  },
  {
    quote: "Clarity about what matters provides clarity about what does not. Go deep.",
    author: "Cal Newport",
    tag: "Deep Work",
  },
  {
    quote: "The resistance that you fight physically and in life can only build a strong character.",
    author: "Arnold Schwarzenegger",
    tag: "Resilience",
  },
  {
    quote: "You have power over your mind, not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    tag: "Inner Power",
  },
  {
    quote: "That which we persist in doing becomes easier — not that the task has changed, but that our ability to do it has increased.",
    author: "Ralph Waldo Emerson",
    tag: "Persistence",
  },
  {
    quote: "If you don't prioritize your life, someone else will.",
    author: "Greg McKeown",
    tag: "Essentialism",
  },
  {
    quote: "The difference between a successful person and others is not a lack of strength, but rather a lack of will.",
    author: "Vince Lombardi",
    tag: "Willpower",
  },
];

export function getDailyQuote(): MotivationQuote {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return MOTIVATION_QUOTES[Math.abs(dayOfYear) % MOTIVATION_QUOTES.length];
}

export function getRandomQuote(currentQuoteText?: string): MotivationQuote {
  if (MOTIVATION_QUOTES.length <= 1) return MOTIVATION_QUOTES[0];
  let next;
  do {
    const idx = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
    next = MOTIVATION_QUOTES[idx];
  } while (next.quote === currentQuoteText);
  return next;
}
