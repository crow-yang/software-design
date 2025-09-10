// Base class for all regex matchers
class RegexBase {
  constructor(chars) {
    this.chars = chars;
  }

  // Find all matches in the text
  findAll(text) {
    const matches = [];
    let currentPosition = 0;
    
    while (currentPosition < text.length) {
      const matchEnd = this._match(text, currentPosition);
      
      if (matchEnd !== undefined) {
        matches.push({
          start: currentPosition,
          end: matchEnd,
          text: text.slice(currentPosition, matchEnd)
        });
        // Move past this match to find the next one
        currentPosition = matchEnd > currentPosition ? matchEnd : currentPosition + 1;
      } else {
        currentPosition++;
      }
    }
    
    return matches;
  }

  // Abstract method to be implemented by subclasses
  _match(text, start) {
    throw new Error('Derived class must implement _match');
  }
}

// Literal string matcher
class RegexLit extends RegexBase {
  _match(text, start) {
    const nextIndex = start + this.chars.length;
    if (nextIndex > text.length) {
      return undefined;
    }
    if (text.slice(start, nextIndex) !== this.chars) {
      return undefined;
    }
    return nextIndex;
  }
}

// Any single character matcher (.)
class RegexAny extends RegexBase {
  constructor() {
    super('.');
  }

  _match(text, start) {
    if (start >= text.length) {
      return undefined;
    }
    return start + 1;
  }
}

// Start of string anchor (^)
class RegexStart extends RegexBase {
  constructor(rest) {
    super('^');
    this.rest = rest;
  }

  findAll(text) {
    const matches = [];
    const matchEnd = this._match(text, 0);
    
    if (matchEnd !== undefined) {
      matches.push({
        start: 0,
        end: matchEnd,
        text: text.slice(0, matchEnd)
      });
    }
    
    return matches;
  }

  _match(text, start) {
    if (start !== 0) {
      return undefined;
    }
    return this.rest ? this.rest._match(text, start) : start;
  }
}

// End of string anchor ($)
class RegexEnd extends RegexBase {
  constructor() {
    super('$');
  }

  _match(text, start) {
    if (start !== text.length) {
      return undefined;
    }
    return start;
  }
}

// Sequence of matchers
class RegexSeq extends RegexBase {
  constructor(matchers) {
    super('');
    this.matchers = matchers;
  }

  _match(text, start) {
    let currentPos = start;
    
    for (const matcher of this.matchers) {
      const matchEnd = matcher._match(text, currentPos);
      if (matchEnd === undefined) {
        return undefined;
      }
      currentPos = matchEnd;
    }
    
    return currentPos;
  }
}

// Alternative matcher (|)
class RegexAlt extends RegexBase {
  constructor(left, right) {
    super('|');
    this.left = left;
    this.right = right;
  }

  _match(text, start) {
    const leftMatch = this.left._match(text, start);
    if (leftMatch !== undefined) {
      return leftMatch;
    }
    return this.right._match(text, start);
  }
}

// Zero or more repetitions (*)
class RegexStar extends RegexBase {
  constructor(matcher) {
    super('*');
    this.matcher = matcher;
  }

  _match(text, start) {
    let currentPos = start;
    
    while (currentPos < text.length) {
      const matchEnd = this.matcher._match(text, currentPos);
      if (matchEnd === undefined) {
        break;
      }
      currentPos = matchEnd;
    }
    
    return currentPos;
  }
}

// One or more repetitions (+)
class RegexPlus extends RegexBase {
  constructor(matcher) {
    super('+');
    this.matcher = matcher;
  }

  _match(text, start) {
    const firstMatch = this.matcher._match(text, start);
    if (firstMatch === undefined) {
      return undefined;
    }
    
    let currentPos = firstMatch;
    while (currentPos < text.length) {
      const matchEnd = this.matcher._match(text, currentPos);
      if (matchEnd === undefined) {
        break;
      }
      currentPos = matchEnd;
    }
    
    return currentPos;
  }
}

// Optional matcher (?)
class RegexOpt extends RegexBase {
  constructor(matcher) {
    super('?');
    this.matcher = matcher;
  }

  _match(text, start) {
    const matchEnd = this.matcher._match(text, start);
    return matchEnd !== undefined ? matchEnd : start;
  }
}

export {
  RegexBase,
  RegexLit,
  RegexAny,
  RegexStart,
  RegexEnd,
  RegexSeq,
  RegexAlt,
  RegexStar,
  RegexPlus,
  RegexOpt
};