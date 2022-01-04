export class Parser {
  tokens: any;
  ast: any;
  currentTokenIndex = -1;
  currentToken = null;

  constructor(tokens) {
    this.tokens = tokens;
  }

  /**
   * tokens => ast
   */
  parse() {
    this.ast = this.createRootNode();

    return this.ast;
  }

  createRootNode() {
    return {
      type: 'Program',
      body: []
    }
  }

}