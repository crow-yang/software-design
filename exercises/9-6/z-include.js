import fs from 'fs'
import path from 'path'
import * as htmlparser2 from 'htmlparser2'
import { DomHandler } from 'domhandler'

export default {
  open: (expander, node) => {
    // Get the filename from the z-include attribute
    const filename = node.attribs['z-include']

    // Read the file content
    const filePath = path.resolve(filename)
    const content = fs.readFileSync(filePath, 'utf-8')

    // Parse the HTML content into a DOM tree
    const handler = new DomHandler()
    const parser = new htmlparser2.Parser(handler)
    parser.write(content)
    parser.end()

    // Get the parsed DOM nodes
    const includedNodes = handler.root.children

    // Process each node from the included file
    // This is the "include-then-process" approach:
    // - The content is inserted first
    // - Then processed with the current environment/scope
    // - This allows variables from the parent to be accessible in the included file
    includedNodes.forEach(child => {
      expander.walk(child)
    })

    // Return false to prevent processing children (we already processed the included content)
    return false
  },

  close: (expander, node) => {
    // Nothing to do on close for z-include
  }
}
