
/*
 * @Author: Lvhz
 * @Date: 2022-01-04 16:10:52
 * @Description: Description
 */
import { Scanner } from './Scanner';

/**
 * Token 结构
 */
interface Token {
  type: string;
  value: string;
  // loc?: SourceLocation; // 当前token在源代码中的位置（暂不需要）
}

/**
 * 分词
 */
export class Tokenizer {

  scanner: Scanner;

  constructor(code: string) {
    this.scanner = new Scanner(code);
  }

  getNextToken(): Token {
    // 扫描注释、空格
    this.scanner.scanComments();

    let token;
    if(!this.scanner.eof()) {
      token = this.scanner.lex();
    }

    return token
  }

}