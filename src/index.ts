/*
 * @Author: Lvhz
 * @Date: 2022-01-04 15:57:07
 * @Description: Description
 */

import { tokenize, parse } from './compiler/index'

const code = ` const answer = 42;`

const tokens = tokenize(code);

console.dir(tokens, { depth: 10 });

const ast = parse(tokens);
console.dir(ast, { depth: 10 });