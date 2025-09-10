import {
  RegexLit,
  RegexAny,
  RegexStart,
  RegexEnd,
  RegexSeq,
  RegexAlt,
  RegexStar,
  RegexPlus,
  RegexOpt
} from './regex-matcher.js';

console.log('=== Regular Expression Matcher - Find All Matches ===\n');

// Test 1: Literal matcher
console.log('Test 1: Literal matcher for "cat"');
const litMatcher = new RegexLit('cat');
const text1 = 'The cat in the catapult catches catfish';
const matches1 = litMatcher.findAll(text1);
console.log(`Text: "${text1}"`);
console.log('Matches:', matches1);
console.log();

// Test 2: Any character matcher
console.log('Test 2: Any character matcher (.)');
const anyMatcher = new RegexAny();
const text2 = 'abc';
const matches2 = anyMatcher.findAll(text2);
console.log(`Text: "${text2}"`);
console.log('Matches:', matches2);
console.log();

// Test 3: Sequence matcher - "c.t"
console.log('Test 3: Sequence matcher for "c.t" (c followed by any char, then t)');
const seqMatcher = new RegexSeq([
  new RegexLit('c'),
  new RegexAny(),
  new RegexLit('t')
]);
const text3 = 'cat cot cut c@t bat cat';
const matches3 = seqMatcher.findAll(text3);
console.log(`Text: "${text3}"`);
console.log('Matches:', matches3);
console.log();

// Test 4: Alternative matcher - "cat|dog"
console.log('Test 4: Alternative matcher for "cat|dog"');
const altMatcher = new RegexAlt(
  new RegexLit('cat'),
  new RegexLit('dog')
);
const text4 = 'cat and dog, then cat again, doggy and catty';
const matches4 = altMatcher.findAll(text4);
console.log(`Text: "${text4}"`);
console.log('Matches:', matches4);
console.log();

// Test 5: Star matcher - "a*"
console.log('Test 5: Star matcher for "a*" (zero or more a\'s)');
const starMatcher = new RegexStar(new RegexLit('a'));
const text5 = 'baaab aaa b aa';
const matches5 = starMatcher.findAll(text5);
console.log(`Text: "${text5}"`);
console.log('Matches:', matches5);
console.log('Note: Empty matches at positions where no "a" is found');
console.log();

// Test 6: Plus matcher - "a+"
console.log('Test 6: Plus matcher for "a+" (one or more a\'s)');
const plusMatcher = new RegexPlus(new RegexLit('a'));
const text6 = 'baaab aaa b aa';
const matches6 = plusMatcher.findAll(text6);
console.log(`Text: "${text6}"`);
console.log('Matches:', matches6);
console.log();

// Test 7: Complex pattern - "ca+t"
console.log('Test 7: Complex pattern "ca+t" (c, one or more a\'s, then t)');
const complexMatcher = new RegexSeq([
  new RegexLit('c'),
  new RegexPlus(new RegexLit('a')),
  new RegexLit('t')
]);
const text7 = 'ct cat caat caaat dog caaaaat';
const matches7 = complexMatcher.findAll(text7);
console.log(`Text: "${text7}"`);
console.log('Matches:', matches7);
console.log();

// Test 8: Optional matcher - "colou?r"
console.log('Test 8: Optional matcher for "colou?r" (u is optional)');
const optMatcher = new RegexSeq([
  new RegexLit('colo'),
  new RegexOpt(new RegexLit('u')),
  new RegexLit('r')
]);
const text8 = 'color colour colors colours';
const matches8 = optMatcher.findAll(text8);
console.log(`Text: "${text8}"`);
console.log('Matches:', matches8);
console.log();

// Test 9: Start anchor
console.log('Test 9: Start anchor "^cat"');
const startMatcher = new RegexStart(new RegexLit('cat'));
const text9 = 'cat in the hat, not this cat';
const matches9 = startMatcher.findAll(text9);
console.log(`Text: "${text9}"`);
console.log('Matches:', matches9);
console.log();

// Test 10: Multiple overlapping patterns
console.log('Test 10: Find all "ana" in "banana"');
const overlapMatcher = new RegexLit('ana');
const text10 = 'banana';
const matches10 = overlapMatcher.findAll(text10);
console.log(`Text: "${text10}"`);
console.log('Matches:', matches10);
console.log('Note: Non-overlapping matches only');

console.log('\n=== All tests completed ===');