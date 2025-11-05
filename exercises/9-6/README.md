# Exercise 9-6: z-include Directive

This exercise implements a `z-include` directive that allows including other HTML files in templates.

## Usage

```html
<div z-include="filename.html"></div>
```

## Key Design Decision: Processing Order

The exercise asks an important question:

> Should included files be processed and the result copied into the including file, or should the text be copied in and then processed? What difference does it make to the way variables are evaluated?

### Two Approaches

#### 1. Include-then-process (Our Implementation)

```javascript
// In z-include.js:
// 1. Read the file content
const content = fs.readFileSync(filePath, 'utf-8')

// 2. Parse it into DOM nodes
const handler = new DomHandler()
const parser = new htmlparser2.Parser(handler)
parser.write(content)
parser.end()

// 3. Walk through the nodes with the current environment
includedNodes.forEach(child => {
  expander.walk(child)  // Uses parent's environment!
})
```

**Result**: Variables from the parent file are accessible in included files.

**Advantages**:
- Allows passing data to reusable components
- Enables template composition with shared context
- More flexible and practical for real-world use

**Example**:
```html
<!-- parent.html -->
<div z-include="header.html"></div>

<!-- header.html -->
<h1 z-var="title"></h1>  <!-- Can access parent's 'title' variable -->
```

#### 2. Process-then-include (Alternative)

```javascript
// Alternative implementation:
// 1. Read the file content
const content = fs.readFileSync(filePath, 'utf-8')

// 2. Parse it
const handler = new DomHandler()
const parser = new htmlparser2.Parser(handler)
parser.write(content)
parser.end()

// 3. Create a NEW expander with a NEW environment
const includedExpander = new Expander(handler.root, {})
includedExpander.walk()

// 4. Insert the processed result as text
expander.output(includedExpander.getResult())
```

**Result**: Included files have isolated scopes. Variables from parent are NOT accessible.

**Advantages**:
- Better encapsulation and isolation
- Prevents accidental variable conflicts
- Easier to reason about scope

**Disadvantages**:
- Cannot pass data to included templates
- Less flexible

## Running the Tests

```bash
npm install
npm test
```

The tests demonstrate:
1. Basic file inclusion with variable sharing
2. Variable scope between parent and included files
3. Behavior when variables are undefined
4. Usage with other directives (z-var, z-loop, z-if, z-num)

## Files

- `z-include.js` - The include directive handler
- `expander.js` - Main expander that coordinates all handlers
- `visitor.js`, `env.js` - Base classes for tree traversal and scope management
- `z-var.js`, `z-num.js`, `z-if.js`, `z-loop.js` - Other directive handlers
- `test.js` - Tests demonstrating the functionality
- `header.html`, `footer.html`, `page.html` - Example template files
