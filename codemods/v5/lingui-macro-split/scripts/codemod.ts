import type { SgRoot } from "codemod:ast-grep";
import type TS from "codemod:ast-grep/langs/typescript";

// React macro components that should be imported from @lingui/react/macro
const REACT_MACROS = new Set([
	"Trans",
	"Plural",
	"Select",
	"SelectOrdinal",
	"I18n",
	"Date",
	"Number",
	"Time",
	"RelativeTime",
]);

// Core macro functions that should be imported from @lingui/core/macro
const CORE_MACROS = new Set([
	"t",
	"msg",
	"plural",
	"select",
	"selectOrdinal",
	"i18n",
	"date",
	"number",
	"time",
	"relativeTime",
]);

async function transform(root: SgRoot<TS>): Promise<string> {
	const rootNode = root.root();
	const edits: any[] = [];

	// Find all import declarations from @lingui/macro
	const importNodes = rootNode.findAll({
		rule: {
			pattern: 'import $IMPORTS from "@lingui/macro"',
		},
	});

	// Process each import statement
	for (const importNode of importNodes) {
		const importsText = importNode.getMatch("IMPORTS")?.text();
		if (!importsText) continue;

		// Parse the import specifiers
		const specifiers = parseImportSpecifiers(importsText);
		
		// Separate React and core macros
		const reactSpecifiers: string[] = [];
		const coreSpecifiers: string[] = [];
		const otherSpecifiers: string[] = [];

		for (const spec of specifiers) {
			const name = spec.name;
			if (REACT_MACROS.has(name)) {
				reactSpecifiers.push(spec.full);
			} else if (CORE_MACROS.has(name)) {
				coreSpecifiers.push(spec.full);
			} else {
				otherSpecifiers.push(spec.full);
			}
		}

		// Create replacement imports
		const newImports: string[] = [];
		
		if (coreSpecifiers.length > 0) {
			newImports.push(`import { ${coreSpecifiers.join(", ")} } from "@lingui/core/macro"`);
		}
		
		if (reactSpecifiers.length > 0) {
			newImports.push(`import { ${reactSpecifiers.join(", ")} } from "@lingui/react/macro"`);
		}

		// If there are other specifiers, keep them with @lingui/macro for now
		if (otherSpecifiers.length > 0) {
			newImports.push(`import { ${otherSpecifiers.join(", ")} } from "@lingui/macro"`);
		}

		// Replace the original import with new imports
		if (newImports.length > 0) {
			edits.push(importNode.replace(newImports.join("\n")));
		} else {
			// If no recognized macros, remove the import
			edits.push(importNode.replace(""));
		}
	}

	const newSource = rootNode.commitEdits(edits);
	return newSource;
}

// Helper function to parse import specifiers
function parseImportSpecifiers(importsText: string): Array<{ name: string; full: string }> {
	const specifiers: Array<{ name: string; full: string }> = [];
	
	// Remove curly braces and whitespace, then split by comma
	const cleanText = importsText.replace(/[{}]/g, '').trim();
	const parts = cleanText.split(",").map(part => part.trim());
	
	for (const part of parts) {
		if (part.includes(" as ")) {
			// Handle "name as alias" syntax
			const [name, alias] = part.split(" as ").map(s => s.trim());
			specifiers.push({ name, full: part });
		} else {
			// Handle simple name
			specifiers.push({ name: part, full: part });
		}
	}
	
	return specifiers;
}

export default transform;
