import type { SgRoot, SgNode, Edit } from "@codemod.com/jssg-types/main";
import type TSX from "codemod:ast-grep/langs/tsx";

async function transform(root: SgRoot<TSX>): Promise<string | null> {
  const rootNode = root.root();
  let source = rootNode.text();
  const edits: Edit[] = [];

  // Find all import declarations
  const imports = rootNode.findAll({
    rule: { pattern: "import $IMPORTS from $SOURCE" }
  });

  // Check if this file has the old useLingui pattern
  const hasOldUseLingui = imports.some(imp => {
    const source = imp.getMatch("SOURCE");
    return source?.text() === '"@lingui/react"';
  });

  const hasMacroImports = imports.some(imp => {
    const imports = imp.getMatch("IMPORTS");
    return imports?.text().includes("t") || imports?.text().includes("msg");
  });

  if (!hasOldUseLingui || !hasMacroImports) {
    return null; // Skip files that don't need transformation
  }

  // Transform imports
  for (const imp of imports) {
    const source = imp.getMatch("SOURCE");
    const importsText = imp.getMatch("IMPORTS");
    
    if (source?.text() === '"@lingui/react"') {
      // Change import source to macro
      edits.push(imp.replace(imp.text().replace('"@lingui/react"', '"@lingui/react/macro"')));
    } else if (source?.text() === '"@lingui/macro"') {
      // Remove t and msg imports from @lingui/macro
      const importText = importsText?.text() || "";
      if (importText.includes("t") || importText.includes("msg")) {
        // Parse the imports by extracting content between { }
        const match = importText.match(/\{([^}]+)\}/);
        if (match) {
          const imports = match[1].split(",").map(s => s.trim()).filter(s => s !== "t" && s !== "msg");
          
          if (imports.length === 0) {
            // Remove entire import line - we'll handle newlines with post-processing
            edits.push(imp.replace(""));
          } else {
            // Update import to remove t and msg
            edits.push(imp.replace(`import { ${imports.join(", ")} } from "@lingui/macro";`));
          }
        } else {
          // If no match, remove the entire import
          edits.push(imp.replace(""));
        }
      }
    }
  }

  // Find useLingui destructuring patterns
  const useLinguiDestructuring = rootNode.findAll({
    rule: { 
      pattern: "const $DESTRUCTURE = useLingui()" 
    }
  });

  for (const pattern of useLinguiDestructuring) {
    const destructureText = pattern.getMatch("DESTRUCTURE")?.text() || "";
    
    // Check if it's an object destructuring with i18n or _
    if (destructureText.startsWith("{") && (destructureText.includes("i18n") || destructureText.includes("_"))) {
      // Replace with { t } destructuring
      edits.push(pattern.replace("const { t } = useLingui();"));
    }
  }

  // Find t(i18n) calls and transform them to t calls
  const tCalls = rootNode.findAll({
    rule: { pattern: "t($I18N)`$TEXT`" }
  });

  for (const call of tCalls) {
    const i18n = call.getMatch("I18N");
    const text = call.getMatch("TEXT");
    if (i18n?.text() === "i18n") {
      edits.push(call.replace(`t\`${text?.text() || ""}\``));
    }
  }

  // Find _(msg calls and transform them to t calls
  const msgCalls = rootNode.findAll({
    rule: { pattern: "_($MSG)" }
  });

  for (const call of msgCalls) {
    const msg = call.getMatch("MSG");
    if (msg?.text().startsWith("msg`")) {
      // Extract the text from msg`Text`
      const textMatch = msg.text().match(/msg`([^`]+)`/);
      if (textMatch) {
        edits.push(call.replace(`t\`${textMatch[1]}\``));
      }
    }
  }

  // Find _(msg`Text`) patterns and transform them to t`Text`
  // This pattern matches the entire call expression
  const msgTemplateCalls = rootNode.findAll({
    rule: { pattern: "_($CALL)" }
  });

  for (const call of msgTemplateCalls) {
    const callArg = call.getMatch("CALL");
    if (callArg?.text().startsWith("msg`")) {
      // Extract the text from msg`Text`
      const textMatch = callArg.text().match(/msg`([^`]+)`/);
      if (textMatch) {
        edits.push(call.replace(`t\`${textMatch[1]}\``));
      }
    }
  }

  if (edits.length === 0) {
    return null;
  }

  // Apply all edits
  let result = rootNode.commitEdits(edits);
  
  // Post-process to clean up empty lines from removed imports
  // Remove any lines that are just semicolons or whitespace (leftover from removed imports)
  result = result
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed !== ';' && trimmed !== '';
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n'); // Replace multiple consecutive newlines with just two

  return result;
}

export default transform;