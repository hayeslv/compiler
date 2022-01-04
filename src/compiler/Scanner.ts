import { Character } from './character';
import { Token, TokenName } from './token';

export interface RawToken {
  type: Token;
  value: string | number;
}

export class Scanner {
  
  readonly source: string; // 源码
  index: number; // 当前扫描到的位置
  private readonly length: number; // 源码的长度

  constructor(code: string) {
    this.source = code;
    this.length = code.length;
    this.index = 0;
  }

  /**
   * 是否结尾
   */
  public eof(): boolean {
    return this.index >= this.length;
  }

  scanComments() {
    // 逐字扫描，判断是否已经到了文件尾部
    while(!this.eof()) {
      // 获取当前index对应的字符
      let ch = this.source.charCodeAt(this.index);
      // 判断是否为空格
      if(Character.isWhiteSpace(ch)) {
        this.index++;
      } else {
        break;
      }
    }
  }

  lex() {
    // 当前字符
    const cp = this.source.charCodeAt(this.index);

    // isIdentifierPart：是否是合法的标识符开始
    if(Character.isIdentifierPart(cp)) {
      return this.scanIdentifier();
    }

    /**
     * 扫描符号
     *  0x28 : (
     *  0x29 : )
     *  0x3B : ;
     */
    if (cp === 0x28 || cp === 0x29 || cp === 0x3B) {
      return this.scanPunctuator();
    }

    /**
     * 扫描引号
     * 0x27 : '
     * 0x22 : "
     */
    if (cp === 0x27 || cp === 0x22) {
      return this.scanStringLiteral();
    }

    /**
     * 扫描小数点
     *  0x2E : .
     */
    if (cp === 0x2E) {
      if (Character.isDecimalDigit(this.source.charCodeAt(this.index + 1))) {
        return this.scanNumericLiteral();
      }
      return this.scanPunctuator();
    }
    if (Character.isDecimalDigit(cp)) {
      return this.scanNumericLiteral();
    }

    // 符号结尾 ;
    return this.scanPunctuator();
  }

  /**
   * 扫描标识符
   */
  scanIdentifier() {
    let type;
    let id = this.getIdentifier();

    if (id.length == 1) {
        // 普通变量名称
        type = 3 /* Identifier */;
    } else if (this.isKeyword(id)) {
        // 关键字
        type = 4 /* Keyword */;
    } else if (id === 'null') {
        // null 常量
        type = 5 /* NullLiteral */;
    } else if (id === 'true' || id === 'false') {
        // boolean 常量
        type = 1 /* BooleanLiteral */;
    } else {
        // 普通变量名称
        type = 3 /* Identifier */;
    }

    return {
      type: type,
      value: id
    };
  }

  /**
   * 获取标识符
   */
  getIdentifier() {
    let start = this.index++;

    while (!this.eof()) {
      let ch = this.source.charCodeAt(this.index);
      // 是否是合法标识符部分
      if (Character.isIdentifierPart(ch)) {
        ++this.index;
      }
      else {
        break;
      }
    }
    return this.source.slice(start, this.index);
  }

  /**
   * id 是否是关键字
   * @param id
   */
  isKeyword(id) {
    switch (id.length) {
      case 2:
        return (id === 'if') || (id === 'in') || (id === 'do');
      case 3:
        return (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try') || (id === 'let');
      case 4:
        return (id === 'this') || (id === 'else') || (id === 'case') || (id === 'void') || (id === 'with') || (id === 'enum');
      case 5:
        return (id === 'while') || (id === 'break') || (id === 'catch') ||
               (id === 'throw') || (id === 'const') || (id === 'yield') ||
               (id === 'class') || (id === 'super');
      case 6:
        return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
               (id === 'switch') || (id === 'export') || (id === 'import');
      case 7:
        return (id === 'default') || (id === 'finally') || (id === 'extends');
      case 8:
        return (id === 'function') || (id === 'continue') || (id === 'debugger');
      case 10:
        return (id === 'instanceof');
      default:
        return false;
    }
  }

  /**
   * @todo 符号扫描
   */
  scanPunctuator(): RawToken {
    const start = this.index;

    let str = this.source[this.index];

    switch (str) {
      case '(':
      case '{':
        if (str === '{') {
            // this.curlyStack.push('{');
        }
        ++this.index;
        break;
      case '.':
        ++this.index;
        if (this.source[this.index] === '.' && this.source[this.index + 1] === '.') {
          // Spread operator: ...
          this.index += 2;
          str = '...';
        }
        break;
      case '}':
        ++this.index;
        // this.curlyStack.pop();
        break;
      case '?':
        ++this.index;
        if (this.source[this.index] === '?') {
          ++this.index;
          str = '??';
        } if (this.source[this.index] === '.' && !/^\d$/.test(this.source[this.index + 1])) {
          // "?." in "foo?.3:0" should not be treated as optional chaining.
          // See https://github.com/tc39/proposal-optional-chaining#notes
          ++this.index;
          str = '?.';
        }
        break;
      case ')':
      case ';':
      case ',':
      case '[':
      case ']':
      case ':':
      case '~':
        ++this.index;
        break;

      default:
        // 4-character punctuator.
        str = this.source.substr(this.index, 4);
        if (str === '>>>=') {
          this.index += 4;
        } else {
          // 3-character punctuators.
          str = str.substr(0, 3);
          if (str === '===' || str === '!==' || str === '>>>' ||
              str === '<<=' || str === '>>=' || str === '**=') {
              this.index += 3;
          } else {
            // 2-character punctuators.
            str = str.substr(0, 2);
            if (str === '&&' || str === '||' || str === '??' ||
                str === '==' || str === '!=' ||
                str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
                str === '++' || str === '--' ||
                str === '<<' || str === '>>' ||
                str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
                str === '<=' || str === '>=' || str === '=>' ||
                str === '**') {
              this.index += 2;
            } else {
              // 1-character punctuators.
              str = this.source[this.index];
              if ('<>=!+-*%&|^/'.indexOf(str) >= 0) {
                ++this.index;
              }
            }
          }
        }
    }

    return {
      type: Token.Punctuator,
      value: str
    };
  }

  /**
     * @todo 引号扫描，字符串常量
     */
   scanStringLiteral(): RawToken {
    const start = this.index;
    let quote = this.source[start];

    ++this.index;
    let octal = false;
    let str = '';

    while (!this.eof()) {
        let ch = this.source[this.index++];

        if (ch === quote) {
            quote = '';
            break;
        } else if (ch === '\\') {
            // 转义字符
            ch = this.source[this.index++];
            // if (!ch || !Character.isLineTerminator(ch.charCodeAt(0))) {
            // 	switch (ch) {
            // 		case 'u':
            // 			if (this.source[this.index] === '{') {
            // 				++this.index;
            // 				str += this.scanUnicodeCodePointEscape();
            // 			} else {
            // 				const unescapedChar = this.scanHexEscape(ch);
            // 				if (unescapedChar === null) {
            // 					this.throwUnexpectedToken();
            // 				}
            // 				str += unescapedChar;
            // 			}
            // 			break;
            // 		case 'x':
            // 			const unescaped = this.scanHexEscape(ch);
            // 			if (unescaped === null) {
            // 				this.throwUnexpectedToken(Messages.InvalidHexEscapeSequence);
            // 			}
            // 			str += unescaped;
            // 			break;
            // 		case 'n':
            // 			str += '\n';
            // 			break;
            // 		case 'r':
            // 			str += '\r';
            // 			break;
            // 		case 't':
            // 			str += '\t';
            // 			break;
            // 		case 'b':
            // 			str += '\b';
            // 			break;
            // 		case 'f':
            // 			str += '\f';
            // 			break;
            // 		case 'v':
            // 			str += '\x0B';
            // 			break;
            // 		case '8':
            // 		case '9':
            // 			str += ch;
            // 			// this.tolerateUnexpectedToken();
            // 			break;
            //
            // 		default:
            // 			if (ch && Character.isOctalDigit(ch.charCodeAt(0))) {
            // 				const octToDec = this.octalToDecimal(ch);
            //
            // 				octal = octToDec.octal || octal;
            // 				str += String.fromCharCode(octToDec.code);
            // 			} else {
            // 				str += ch;
            // 			}
            // 			break;
            // 	}
            // } else {
            // 	++this.lineNumber;
            // 	if (ch === '\r' && this.source[this.index] === '\n') {
            // 		++this.index;
            // 	}
            // 	this.lineStart = this.index;
            // }
        } else if (Character.isLineTerminator(ch.charCodeAt(0))) {
            break;
        } else {
            str += ch;
        }
    }

    if (quote !== '') {
        this.index = start;
        // this.throwUnexpectedToken();
    }

    return {
        type: Token.StringLiteral,
        value: str
    };
}

/**
 * @todo 小数点扫描，数字常量
 */
scanNumericLiteral(): RawToken {
    const start = this.index;
    let ch = this.source[start];
    let num = '';

    if (ch !== '.') {
        num = this.source[this.index++];
        ch = this.source[this.index];

        // Hex number starts with '0x'.
        // Octal number starts with '0'.
        // Octal number in ES6 starts with '0o'.
        // Binary number in ES6 starts with '0b'.
        // 各种进制数字
        // if (num === '0') {
        // 	if (ch === 'x' || ch === 'X') {
        // 		++this.index;
        // 		return this.scanHexLiteral(start);
        // 	}
        // 	if (ch === 'b' || ch === 'B') {
        // 		++this.index;
        // 		return this.scanBinaryLiteral(start);
        // 	}
        // 	if (ch === 'o' || ch === 'O') {
        // 		return this.scanOctalLiteral(ch, start);
        // 	}
        //
        // 	if (ch && Character.isOctalDigit(ch.charCodeAt(0))) {
        // 		if (this.isImplicitOctalLiteral()) {
        // 			return this.scanOctalLiteral(ch, start);
        // 		}
        // 	}
        // }

        while (Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
            num += this.source[this.index++];
        }
        ch = this.source[this.index];
    }

    if (ch === '.') {
        num += this.source[this.index++];
        while (Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
            num += this.source[this.index++];
        }
        ch = this.source[this.index];
    }
    if (ch === 'e' || ch === 'E') {
      num += this.source[this.index++];

      ch = this.source[this.index];
      if (ch === '+' || ch === '-') {
          num += this.source[this.index++];
      }
      if (Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
          while (Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
              num += this.source[this.index++];
          }
      } else {
          // this.throwUnexpectedToken();
      }
    }

    if (Character.isIdentifierStart(this.source.charCodeAt(this.index))) {
        // this.throwUnexpectedToken();
    }

    return {
      type: Token.NumericLiteral,
      value: parseFloat(num)
    };
  }
}