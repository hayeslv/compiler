import { Literal, VariableDeclaration, VariableDeclarator, Identifier } from './node';
import { Token } from "./token";

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

    this.nextToken();

    if(this.currentToken) {
      let i = 0;
      // @ts-ignore
      while(this.currentToken.type !== Token.EOF && i++ < 10) {
        // @ts-ignore
        this.ast.body.push(this.parseStatementListItem())
      }
    }

    return this.ast;
  }

  createRootNode() {
    return {
      type: 'Program',
      body: []
    }
  }

  /**
   * 从数组中把当前token取出来
   * @returns 
   */
  nextToken() {
    this.currentTokenIndex++;
    this.currentToken = this.tokens[this.currentTokenIndex];

    return this.currentToken;
  }


  /**
   * 解析语句
   */
  parseStatementListItem() {
    let statement;
    // @ts-ignore
    if(this.currentToken.type === Token.Keyword) {
      // @ts-ignore
      switch(this.currentToken.value) {
        case 'const':
          statement = this.parseLexicalDeclaration();
          break;
        default:
          // statement = this.parseStatement()
          break;
      }
    }

    return statement;
  }

  /**
   * 解析声明语句
   */
  parseLexicalDeclaration() {
    // @ts-ignore
    const kind = this.currentToken.value;

    this.nextToken();
    const declarations = this.parseBindingList(kind);

    // @ts-ignore
    return new VariableDeclaration(declarations, kind);
  }

  /**
   * 解析声明赋值
   */
  parseBindingList(kind) {
    // 声明列表，const a,b; 当前只考虑一个
    return [this.parseLexicalBinding(kind)];
  } 

  /**
   * 解析声明赋值
   * @param kind
   */
  parseLexicalBinding(kind) {
    // params 解构 const [a,b];
    const params = [];
    // @ts-ignore
    const id = this.parsePattern(params, kind);

    let init;
    // parseParsePattern 中调用了 nextToken()，这里应该是 = 情况了
    // @ts-ignore
    if (this.currentToken.type === Token.Punctuator && this.currentToken.value === '=') {
      // 解析赋值表达式
      init = this.parseAssignmentExpression();
    }

    return new VariableDeclarator(id, init);
  }

  parsePattern(params, kind) {
    // { type: 'Identifier', value: 'a' }
    let pattern;

    // 解构 const [a,b] 的情况
    params.push(this.currentToken);

    pattern = this.parseVariableIdentifier(kind);

    return pattern;
  }

  /**
   * 解析变量
   */
  parseVariableIdentifier(kind) {
    const token = this.currentToken;

    this.nextToken();

    // @ts-ignore
    return new Identifier(token.value);
  }

  /**
   * 解析赋值表达式
   */
  parseAssignmentExpression() {
    // @ts-ignore operator 会有多种情况 = += -= ...
    // const operator = this.currentToken.value;

    this.nextToken();

    return this.parseBinaryExpression();
  }

  /**
   * 解析二元表达式
   */
  parseBinaryExpression() {
    // @ts-ignore
    let value = this.currentToken.type === Token.NumericLiteral ? Number(this.currentToken.value) : this.currentToken.value;
    return new Literal(
        value,
        // @ts-ignore
        this.currentToken.value
    );
  }
}