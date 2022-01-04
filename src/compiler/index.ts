/*
 * @Author: Lvhz
 * @Date: 2022-01-04 15:58:46
 * @Description: Description
 */

import { Tokenizer } from "./Tokenizer";
import { Parser } from './Parser';

// 词法分析
export function tokenize(code: string) {
  const tokenizer = new Tokenizer(code);
  const tokens: any = [];

  while(true) {
    // 迭代器
    let token = tokenizer.getNextToken();
    if(!token) {
      break;
    }
    tokens.push(token);
  }

  return tokens;
}

// 语法解析
export function parse(tokens) {
  const parser = new Parser(tokens);

  return parser.parse();
}


// 1.50