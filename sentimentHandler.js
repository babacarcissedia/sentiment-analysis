const natural = require('natural')
const SpellCorrector = require('spelling-corrector')
const aposToLexForm = require('apos-to-lex-form')
const StopWord = require('stopword')
const spellCorrector = new SpellCorrector()
spellCorrector.loadDictionary()
const {SentimentAnalyzer, PorterStemmer, WordTokenizer } = natural

module.exports = function (request, response, next) {
  // get review from user form
  let {text} = request.body
  if (!text) {
    return response.status(422)
      .json({
        type: 'error',
        message: 'Parameter text is required.',
        data: {
          text: 'Text is required.'
        }
      })
  }
  
  // get lexicon
  const lexForm = aposToLexForm(text).toLowerCase()
  
  // remove non-alpha letters
  const alphaOnly = lexForm.replace(/[^a-zA-Z\s]+/g, '')

  // splitting a text into its individual meaningful units.
  const tokenizer = new WordTokenizer()
  const tokenizedReview = tokenizer.tokenize(alphaOnly)

  // Correcting misspelled words
  const spellCorrectReview = tokenizedReview.map(token => spellCorrector.correct(token))

  // Removing stop words: not meaningful words that won't affect user sentiment
  const filteredReview = StopWord.removeStopwords(spellCorrectReview)

  // Stemming: word normalization
  const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
  const polarity = analyzer.getSentiment(filteredReview);


  // each word has its own polarity. text sentiment = Sum of the polarity
  // good = polarity > 0
  // neutral = polarity = 0
  // bad = polarity < 0
  let emoji
  if (polarity == 0) {
    emoji = 'https://img.icons8.com/officel/80/000000/neutral-emoticon.png'
  } else if (polarity > 0) {
    emoji = 'https://img.icons8.com/color/96/000000/happy.png'
  } else {
    emoji = 'https://img.icons8.com/emoji/96/000000/angry-face.png'
  }
  response.json({polarity, emoji})
}