import fs from 'fs'
import * as htmlparser2 from 'htmlparser2'
import { DomHandler } from 'domhandler'
import Expander from './expander.js'

// Helper function to load and expand a template
function expandTemplate(filename, vars) {
  const content = fs.readFileSync(filename, 'utf-8')
  const handler = new DomHandler()
  const parser = new htmlparser2.Parser(handler)
  parser.write(content)
  parser.end()

  const expander = new Expander(handler.root, vars)
  expander.walk()
  return expander.getResult()
}

console.log('='.repeat(60))
console.log('Test 1: Basic file inclusion with variable sharing')
console.log('='.repeat(60))
console.log('\nThis demonstrates the "include-then-process" approach where')
console.log('variables from the parent scope are accessible in included files.\n')

const result1 = expandTemplate('page.html', {
  title: 'My Website',
  username: 'Alice',
  items: ['Item 1', 'Item 2', 'Item 3'],
  showContact: true,
  email: 'contact@example.com'
})

console.log('Result:')
console.log(result1)

console.log('\n' + '='.repeat(60))
console.log('Test 2: Variable scope demonstration')
console.log('='.repeat(60))
console.log('\nShowing how variables defined in parent are available in included files.\n')

const result2 = expandTemplate('page.html', {
  title: 'Another Page',
  username: 'Bob',
  items: ['Apple', 'Banana'],
  showContact: false,
  email: 'bob@example.com'
})

console.log('Result:')
console.log(result2)

console.log('\n' + '='.repeat(60))
console.log('Test 3: Testing with undefined variable')
console.log('='.repeat(60))
console.log('\nIf a variable is not defined in parent scope, it shows as UNDEF.\n')

const result3 = expandTemplate('page.html', {
  username: 'Charlie',
  items: ['One']
  // Note: title, email, and showContact are not defined
})

console.log('Result:')
console.log(result3)

console.log('\n' + '='.repeat(60))
console.log('EXPLANATION: Include-then-process vs Process-then-include')
console.log('='.repeat(60))
console.log(`
Our implementation uses the "include-then-process" approach:

1. INCLUDE-THEN-PROCESS (our implementation):
   - Read the file content
   - Insert the raw content into the parent document
   - Process everything together with the current environment

   RESULT: Variables from the parent file are accessible in included files.
   This creates a shared scope between parent and included files.

2. PROCESS-THEN-INCLUDE (alternative approach):
   - Read the file content
   - Process the included file independently
   - Insert the processed result into the parent

   RESULT: Included files would have isolated scopes.
   Variables from parent would NOT be accessible in included files.

The include-then-process approach is more useful in practice because:
- Allows passing data to reusable components (like header, footer)
- Enables template composition with shared context
- Makes it easier to build complex pages from smaller pieces

Try modifying z-include.js to implement process-then-include by:
- Creating a new Expander for the included content
- Processing it before inserting
- This would demonstrate the isolated scope behavior
`)
