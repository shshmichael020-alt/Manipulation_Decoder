export interface TextStats {
  characterCount: number;
  wordCount: number;
  sentenceCount: number;
  sentences: string[];
  words: string[];
  averageSentenceLength: number;
  sentenceLengthStdDev: number;
  lexicalDiversityTTR: number; // Type-Token Ratio (unique words / total words)
  transitionPhraseCount: number;
  detectedTransitions: string[];
  formulaicOpenings: string[];
  formulaicClosings: string[];
}

const COMMON_TRANSITIONS = [
  "furthermore",
  "moreover",
  "additionally",
  "in conclusion",
  "consequently",
  "as a result",
  "it is important to note",
  "it is crucial to",
  "on the other hand",
  "in addition to",
  "subsequently",
  "nonetheless",
  "nevertheless",
  "in summary",
  "to summarize",
  "first and foremost",
  "by and large",
  "in light of",
  "it goes without saying",
  "needless to say",
];

const FORMULAIC_OPENINGS = [
  /^(dear valued customer|dear user|dear client|dear colleague|dear team)/i,
  /^(i hope this (email|message) finds you well)/i,
  /^(i am writing to (inform|notify|update) you)/i,
  /^(we are writing to alert you)/i,
  /^(as per our (recent )?discussion)/i,
  /^(attention:\s*account holder)/i,
  /^(urgent notice|immediate action required|final notification)/i,
];

const FORMULAIC_CLOSINGS = [
  /(please do not hesitate to (reach out|contact us))/i,
  /(if you have any questions(,| )?(or concerns)?(,)? please feel free)/i,
  /(thank you for your prompt attention to this matter)/i,
  /(sincerely|best regards|warm regards|yours faithfully|kind regards),?(\s*[\w\s]+)?$/i,
  /(we appreciate your cooperation)/i,
  /(failure to comply will result in)/i,
];

export function computeTextStats(text: string): TextStats {
  const clean = text.trim();
  const characterCount = clean.length;

  // Split into sentences using punctuation (. ! ?) followed by whitespace or end
  const rawSentences = clean
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const sentences = rawSentences.length > 0 ? rawSentences : [clean];
  const sentenceCount = sentences.length;

  // Extract clean words (letters, numbers, apostrophes)
  const words = (clean.toLowerCase().match(/[a-z0-9'-]+/g) || []);
  const wordCount = words.length;

  // Sentence lengths in words
  const sentenceLengths = sentences.map((s) => {
    const w = s.match(/[a-z0-9'-]+/g);
    return w ? w.length : 0;
  });

  const averageSentenceLength =
    sentenceCount > 0
      ? Number((sentenceLengths.reduce((a, b) => a + b, 0) / sentenceCount).toFixed(2))
      : 0;

  // Standard deviation of sentence length
  const variance =
    sentenceCount > 1
      ? sentenceLengths.reduce(
          (acc, val) => acc + Math.pow(val - averageSentenceLength, 2),
          0
        ) / sentenceCount
      : 0;
  const sentenceLengthStdDev = Number(Math.sqrt(variance).toFixed(2));

  // Lexical Diversity: Type-Token Ratio (TTR)
  const uniqueWords = new Set(words);
  const lexicalDiversityTTR =
    wordCount > 0 ? Number((uniqueWords.size / wordCount).toFixed(3)) : 1.0;

  // Transition phrase detection
  const lowerText = clean.toLowerCase();
  const detectedTransitions: string[] = [];
  for (const phrase of COMMON_TRANSITIONS) {
    const regex = new RegExp(`\\b${phrase}\\b`, "i");
    if (regex.test(lowerText)) {
      detectedTransitions.push(phrase);
    }
  }

  // Formulaic openings
  const formulaicOpenings: string[] = [];
  for (const pattern of FORMULAIC_OPENINGS) {
    const match = clean.match(pattern);
    if (match) {
      formulaicOpenings.push(match[0]);
    }
  }

  // Formulaic closings
  const formulaicClosings: string[] = [];
  for (const pattern of FORMULAIC_CLOSINGS) {
    const match = clean.match(pattern);
    if (match) {
      formulaicClosings.push(match[0]);
    }
  }

  return {
    characterCount,
    wordCount,
    sentenceCount,
    sentences,
    words,
    averageSentenceLength,
    sentenceLengthStdDev,
    lexicalDiversityTTR,
    transitionPhraseCount: detectedTransitions.length,
    detectedTransitions,
    formulaicOpenings,
    formulaicClosings,
  };
}
