// Tokenizer with character set support
const SIMPLE = {
  '*': 'Any',
  '|': 'Alt',
  '(': 'GroupStart',
  ')': 'GroupEnd'
}

const tokenize = (text) => {
  const result = []
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]

    // Handle character sets [xyz]
    if (c === '[') {
      let j = i + 1
      const chars = []

      // Find the closing bracket
      while (j < text.length && text[j] !== ']') {
        chars.push(text[j])
        j++
      }

      if (j < text.length && text[j] === ']') {
        result.push({
          kind: 'CharSet',
          loc: i,
          chars: chars
        })
        i = j // Skip to the closing bracket
      } else {
        // If no closing bracket found, treat [ as literal
        result.push({ kind: 'Lit', loc: i, value: c })
      }
    } else if (c in SIMPLE) {
      result.push({ kind: SIMPLE[c], loc: i })
    } else if ((c === '^') && (i === 0)) {
      result.push({ kind: 'Start', loc: i })
    } else if ((c === '$') && (i === (text.length - 1))) {
      result.push({ kind: 'End', loc: i })
    } else {
      result.push({ kind: 'Lit', loc: i, value: c })
    }
  }
  return result
}

// Parser with character set support
const parse = (text) => {
  const result = []
  const allTokens = tokenize(text)
  for (let i = 0; i < allTokens.length; i += 1) {
    const token = allTokens[i]
    const last = i === allTokens.length - 1
    handle(result, token, last)
  }
  return compress(result)
}

const handle = (result, token, last) => {
  if (token.kind === 'Lit') {
    result.push(token)
  } else if (token.kind === 'CharSet') {
    result.push(token)
  } else if (token.kind === 'Start') {
    assert(result.length === 0, 'Should not have start token after other tokens')
    result.push(token)
  } else if (token.kind === 'End') {
    assert(last, 'Should not have end token before other tokens')
    result.push(token)
  } else if (token.kind === 'GroupStart') {
    result.push(token)
  } else if (token.kind === 'GroupEnd') {
    assert(result.length > 0, 'Cannot close empty group')
    const start = findGroupStart(result)
    const group = result.slice(start + 1)
    result.splice(start, result.length - start, { kind: 'Group', group })
  } else if (token.kind === 'Any') {
    assert(result.length > 0, 'No operand for any')
    const operand = result.pop()
    result.push({ kind: 'Any', operand })
  } else if (token.kind === 'Alt') {
    assert(result.length > 0, 'No operand for alt')
    const update = (soFar, right) => {
      if (!soFar) {
        return { kind: 'Alt', left: null, right }
      }
      if (soFar.kind === 'Alt' && soFar.right === null) {
        return { kind: 'Alt', left: soFar.left, right }
      }
      return { kind: 'Alt', left: soFar, right }
    }
    result.push(update(result.pop(), null))
  } else {
    assert(false, `Unknown token kind ${token.kind}`)
  }
}

const findGroupStart = (result) => {
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i].kind === 'GroupStart') {
      return i
    }
  }
  assert(false, 'No group start found')
}

const compress = (raw) => {
  assert(raw.length > 0, 'Cannot compress empty list')

  let result = raw[0]
  for (let i = 1; i < raw.length; i++) {
    const token = raw[i]
    if (token.kind === 'Alt' && token.right === null) {
      token.left = result
      result = token
    } else {
      result = { kind: 'Seq', left: result, right: token }
    }
  }

  return result
}

// Matcher with character set support
class Match {
  constructor(pattern) {
    this.pattern = parse(pattern)
  }

  match(text) {
    const matches = []
    this._match(this.pattern, text, 0, [], matches)
    return matches.map(m => m.join(''))
  }

  _match(node, text, start, accum, matches) {
    if (node === null) {
      return this._matchNull(text, start, accum, matches)
    }

    if (node.kind === 'Alt') {
      return this._matchAlt(node, text, start, accum, matches)
    }

    if (node.kind === 'Any') {
      return this._matchAny(node, text, start, accum, matches)
    }

    if (node.kind === 'End') {
      return this._matchEnd(text, start, accum, matches)
    }

    if (node.kind === 'Group') {
      return this._matchGroup(node, text, start, accum, matches)
    }

    if (node.kind === 'Lit') {
      return this._matchLit(node, text, start, accum, matches)
    }

    if (node.kind === 'CharSet') {
      return this._matchCharSet(node, text, start, accum, matches)
    }

    if (node.kind === 'Seq') {
      return this._matchSeq(node, text, start, accum, matches)
    }

    if (node.kind === 'Start') {
      return this._matchStart(text, start, accum, matches)
    }

    assert(false, `Unknown node kind ${node.kind}`)
  }

  _matchNull(text, start, accum, matches) {
    matches.push([...accum])
    return true
  }

  _matchAlt(node, text, start, accum, matches) {
    const accumLeft = [...accum]
    const matchesLeft = []
    this._match(node.left, text, start, accumLeft, matchesLeft)

    const accumRight = [...accum]
    const matchesRight = []
    this._match(node.right, text, start, accumRight, matchesRight)

    if (matchesLeft.length > 0 && matchesRight.length > 0) {
      matches.push(...matchesLeft, ...matchesRight)
      return true
    }

    if (matchesLeft.length > 0) {
      matches.push(...matchesLeft)
      return true
    }

    if (matchesRight.length > 0) {
      matches.push(...matchesRight)
      return true
    }

    return false
  }

  _matchAny(node, text, start, accum, matches) {
    for (let i = 0; i <= text.length - start; i++) {
      const newAccum = [...accum]
      for (let j = 0; j < i; j++) {
        this._match(node.operand, text, start + j, newAccum, matches)
      }
    }
    return matches.length > 0
  }

  _matchEnd(text, start, accum, matches) {
    if (start === text.length) {
      matches.push([...accum])
      return true
    }
    return false
  }

  _matchGroup(node, text, start, accum, matches) {
    return this._match(compress(node.group), text, start, accum, matches)
  }

  _matchLit(node, text, start, accum, matches) {
    if (start < text.length && text[start] === node.value) {
      accum.push(node.value)
      matches.push([...accum])
      return true
    }
    return false
  }

  _matchCharSet(node, text, start, accum, matches) {
    if (start < text.length && node.chars.includes(text[start])) {
      accum.push(text[start])
      matches.push([...accum])
      return true
    }
    return false
  }

  _matchSeq(node, text, start, accum, matches) {
    const leftAccum = [...accum]
    const leftMatches = []
    this._match(node.left, text, start, leftAccum, leftMatches)

    if (leftMatches.length === 0) {
      return false
    }

    for (const leftMatch of leftMatches) {
      const rightAccum = [...leftMatch]
      this._match(node.right, text, start + leftMatch.length - accum.length, rightAccum, matches)
    }

    return matches.length > 0
  }

  _matchStart(text, start, accum, matches) {
    if (start === 0) {
      matches.push([...accum])
      return true
    }
    return false
  }
}

// Utility function
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

// Export functions for testing
export { tokenize, parse, Match }