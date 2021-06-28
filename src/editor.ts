import { Monaco } from "@monaco-editor/react";

export default class editorX {

	monaco: Monaco;

	constructor(monaco:Monaco) {
		this.monaco = monaco;
	}

	createMathOptions() {
		return [
			{
				label: 'min',
				kind: this.monaco.languages.CompletionItemKind.Function,
				detail: "some detail here...",
				documentation: "go small",
				insertText: 'min(',
			},
			{
				label: 'max',
				kind: this.monaco.languages.CompletionItemKind.Function,
				documentation: "go big",
				insertText: 'max(',
			},
		];
	}

	createStringOptions() {
		return [
			{
				label: 'format',
				kind: this.monaco.languages.CompletionItemKind.Function,
				detail: "some detail here...",
				documentation: "go small",
				insertText: 'format(',
			},
			{
				label: 'length',
				kind: this.monaco.languages.CompletionItemKind.Function,
				documentation: "go big",
				insertText: 'length(',
			},
		];
	}

	globalProposals() {
		return [
			{
				label: 'math',
				kind: this.monaco.languages.CompletionItemKind.Module,
				documentation: "Some math crap",
				insertText: 'math',
			},
			{
				label: 'string',
				kind: this.monaco.languages.CompletionItemKind.Module,
				documentation: "Some string crap",
				insertText: 'string',
			},
			{
				label: 'function',
				kind: this.monaco.languages.CompletionItemKind.Keyword,
				documentation: "write a function",
				insertText: 'function',
			},
			{
				label: 'end',
				kind: this.monaco.languages.CompletionItemKind.Keyword,
				documentation: "STOP IT!",
				insertText: 'end ',
			},
			{
				label: 'return',
				kind: this.monaco.languages.CompletionItemKind.Keyword,
				documentation: "go",
				insertText: 'return',
			},
		];
	}

	provideCompletionItems(model : any, position : any, context : any, token: any) {
		var word = model.getWordUntilPosition(position);
		position.column = position.column - 1;
		//var prevAt = model.getWordAtPosition(position);
		//var prevUntil = model.getWordUntilPosition(position);

		if (context.triggerKind === this.monaco.languages.CompletionTriggerKind.TriggerCharacter &&
			context.triggerCharacter === ".") {
			// get previous word
			position.column = position.column - 1;
			var prevWord = model.getWordAtPosition(position);
			if (prevWord.word === "math") return { suggestions: this.createMathOptions() };
			else if (prevWord.word === "string") return { suggestions: this.createStringOptions() };
			return { suggestions: [] };
		}
		if (context.triggerKind === this.monaco.languages.CompletionTriggerKind.Invoke && word.word === "") {
			return { suggestions: this.globalProposals() };
		}
		return { suggestions: this.globalProposals() };
	}

	resolveCompletionItem(item: any, token: any) {
		console.log("resolveCompletionItem")
	}

	getLuaCompletionProvider(monaco: Monaco) {
		return {
			triggerCharacters: ['.'],
			provideCompletionItems: (model : any, position : any, context : any, token: any) => { return this.provideCompletionItems(model, position, context, token); },
			resolveCompletionItem: (item: any, token: any) => { return this.resolveCompletionItem(item, token) },
		}
	}
}
