import { tokenize, parse, Match } from './regex-parser.js'

// Test tokenizer with character sets
console.log('=== Tokenizer Tests ===')

const testTokenize = (pattern) => {
  console.log(`Pattern: "${pattern}"`)
  const tokens = tokenize(pattern)
  console.log('Tokens:', JSON.stringify(tokens, null, 2))
  console.log()
}

testTokenize('[abc]')
testTokenize('x[abc]y')
testTokenize('[xyz]*')
testTokenize('(a|[bcd])')

// Test parser with character sets
console.log('=== Parser Tests ===')

const testParse = (pattern) => {
  console.log(`Pattern: "${pattern}"`)
  const ast = parse(pattern)
  console.log('AST:', JSON.stringify(ast, null, 2))
  console.log()
}

testParse('[abc]')
testParse('x[abc]y')
testParse('[xyz]*')

// Test matcher with character sets
console.log('=== Matcher Tests ===')

const testMatch = (pattern, text) => {
  console.log(`Pattern: "${pattern}", Text: "${text}"`)
  const matcher = new Match(pattern)
  const matches = matcher.match(text)
  console.log('Matches:', matches)
  console.log()
}

// Basic character set matching
testMatch('[abc]', 'a')
testMatch('[abc]', 'b')
testMatch('[abc]', 'c')
testMatch('[abc]', 'd')
testMatch('[abc]', 'abc')

// Character set in sequence
testMatch('x[abc]y', 'xay')
testMatch('x[abc]y', 'xby')
testMatch('x[abc]y', 'xcy')
testMatch('x[abc]y', 'xdy')

// Character set with any (*)
testMatch('[xyz]*', '')
testMatch('[xyz]*', 'x')
testMatch('[xyz]*', 'xx')
testMatch('[xyz]*', 'xyz')
testMatch('[xyz]*', 'xyxyz')

// Character set with alternation
testMatch('(a|[bcd])', 'a')
testMatch('(a|[bcd])', 'b')
testMatch('(a|[bcd])', 'c')
testMatch('(a|[bcd])', 'd')
testMatch('(a|[bcd])', 'e')

// More complex patterns
testMatch('[0-9]', '5')  // Note: This will match literal 0, -, 9 (not a range)
testMatch('[aeiou]', 'a')
testMatch('[aeiou]', 'e')
testMatch('[aeiou]', 'b')
testMatch('h[aeiou]llo', 'hello')
testMatch('h[aeiou]llo', 'hallo')
testMatch('h[aeiou]llo', 'hxllo')