import { Monaco } from "@monaco-editor/react";
import parserx from "./parser";
import parser2 from "./parser2"

import { optionLib } from "./mods/options"
import { mathLib } from "./mods/math"
import { tcpLib } from "./mods/socket"
import { stringLib } from "./mods/string"
import { controlsLib } from "./mods/controls";
import { baseLua } from "./mods/lua";

export default class editorX {

  monaco: Monaco;
  editor: any;

  libs : Array<optionLib>;
  controlsLib : controlsLib;
  luaLib: baseLua;

  constructor() {
    // keep around so we can set the controls
    this.controlsLib = new controlsLib();
    this.luaLib = new baseLua();
    this.libs = [ new mathLib(), new stringLib(), new tcpLib(), this.controlsLib];
    this.monaco = null;
    this.editor = null;
  }

  init(editor: any, monaco: Monaco) {
    this.monaco = monaco;
    this.editor = editor;

    let code = `function foo() return "hey" end\n\nbob = math.max(3,4)\n`;
    if((window as any).webView_getCode)
    {
      code = (window as any).webView_getCode();
    }
    if((window as any).webView_getControls)
    {
      this.controlsLib.controls = (window as any).webView_getControls();
    }

    this.editor.setValue(code);
    monaco.languages.registerCompletionItemProvider("lua", this.getLuaCompletionProvider(monaco));
    monaco.languages.registerHoverProvider("lua", this.getHoverProvider(monaco));

    editor.getModel().onDidChangeContent((e) => {
      let model = editor.getModel();
      let code = model.getValue();

      if((window as any).webView_setCode)
      {
        (window as any).webView_setCode(code);
      }
      let p2 = new parser2();
      let errors = p2.check_code(code);

      var markerData = [] as any;
      errors.forEach(err => {
        console.log(err);
        markerData.push({
          message: err.msg,
          startLineNumber: err.line,
          endLineNumber: err.line,
          startColumn: err.column,
          endColumn: err.column,
          severity: this.monaco.MarkerSeverity.Error,
        });
      });
      this.monaco.editor.setModelMarkers(model, model.id, markerData);
    });
  }

  globalProposals() {
    let props = [] as any;
    this.libs.forEach(lib => {
      props.push({
        label: lib.name,
        kind: this.monaco.languages.CompletionItemKind.Module,
        detail: lib.description,
        insertText: lib.name,
        commitCharacters : ["."]
      });
    });
    this.luaLib.getProposals(this.monaco, props);
    // get our module snippets
    this.libs.forEach(lib => {
      props = props.concat(lib.getSnippets(this.monaco));
    });
    return props;
  }

  getCompletionOptions(tok: string, position: any) {
    if (tok.length > 0 && tok[tok.length - 1] === ".") {
      let options = [];
      let libName = tok.substr(0,tok.indexOf("."));
      this.libs.forEach(lib => {
          if(lib.name === libName) options = lib.getOptions(this.monaco, position, tok);
      });
      return options;
    }
    return this.globalProposals();
  }

  isLibName(name: string)
  {
    let ret = false;
    this.libs.forEach(lib => {
      let modName = lib.name + ".";
      if(name.startsWith(modName)) ret = true;;
    });
    return ret;
  }

  provideCompletionItems(model: any, position: any, context: any, token: any) {
    let line = model.getValueInRange({ startLineNumber: position.lineNumber, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
    let tokens = line.split(/(\s+)/);

    let tok = tokens[tokens.length - 1];
    // get suggestions
    let sugs = this.getCompletionOptions(tok, position);
    // for right now if the user pressed a '.' don't show the parsed stuff
    if (context.triggerKind !== this.monaco.languages.CompletionTriggerKind.TriggerCharacter) {
      // parse lua to get variables and functions 
      // we want to ignore our current word we are typing
      let endCol = position.column;
      let currentWord = model.getWordUntilPosition(position);
      if(currentWord)
      {
        endCol = currentWord.startColumn;
      }
      
      let content = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: endCol });
      let parser = new parserx();
      let tokens = parser.get_tokens(content);
      tokens.forEach(element => {
        let isLib = this.isLibName(element.label);
        if(!isLib)
        {
          sugs.push({
            label: element.label,
            detail: element.detail,
            kind: element.kind,
            insertText: element.insertText,
            insertTextRules: element.insertRule
          });
        }
      });
    }
    return { suggestions: sugs };
  }

  isWhiteSpace(str:string) {
    let code = str.charCodeAt(0);
    if( code === 46 ) return false;
    if( code >= 48 && code <= 57) return false;
    if( code >= 65 && code <= 90) return false;
    if( code === 95 ) return false;
    if( code >= 97 && code <= 122) return false;
    return true;
  }

  provideHover(model: any, position: any, token: any) {
    let contents = [] as any;

    let line = model.getLineContent(position.lineNumber);
    // go forward and back until we get to whitespace
    let startColumn = position.column-1;
    while(startColumn > 0 && !this.isWhiteSpace(line[startColumn])) {
      startColumn--;
    }
    //startColumn--;
    let endColumn = position.column - 1;
    while(endColumn < line.length && !this.isWhiteSpace(line[endColumn])) {
      endColumn++;
    }
    let hoverToken = line.substr(startColumn,endColumn-startColumn).trim();
    console.log(`hover ${hoverToken}`);

    let toks = hoverToken.split(".");
    if(toks.length === 2) {
      let module = toks[0];
      let func = toks[1];
      this.libs.forEach(lib => {
        if(lib.name === module) contents = lib.getHover(func);
      });
    }
    return { 
      contents: contents, 
      range : {
        startColumn: startColumn+1,
        endColumn: endColumn+1,
        startLineNumber: position.lineNumber,
        endLineNumber:position.lineNumber
      } };
  }


  resolveCompletionItem(item: any, token: any) {
    console.log("resolveCompletionItem")
  }

  getLuaCompletionProvider(monaco: Monaco) {
    return {
      triggerCharacters: ['.'],
      provideCompletionItems: (model: any, position: any, context: any, token: any) => { return this.provideCompletionItems(model, position, context, token); },
      resolveCompletionItem: (item: any, token: any) => { return this.resolveCompletionItem(item, token) },
    }
  }

  getHoverProvider(monaco: Monaco) {
    return {
      provideHover: (model: any, position: any, token: any) => {
        return this.provideHover(model, position, token);
      },
    }
  }

}
