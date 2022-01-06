export class VariableDeclaration {
    readonly type;
    readonly declarations = [];
    readonly kind;
    constructor(declarations = [], kind: string) {
        this.type = 'VariableDeclaration';
        this.declarations = declarations;
        this.kind = kind;
    }
}

export class VariableDeclarator {
    readonly type;
    readonly id;
    readonly init;

    constructor(id, init) {
        this.type = 'VariableDeclarator';
        this.id = id;
        this.init = init;
    }
}


export class Identifier {
    readonly type;
    readonly name;
    constructor(name) {
        this.type = 'Identifier';
        this.name = name;
    }
}


export class Literal {
    readonly type;
    readonly value;
    readonly raw;
    constructor(value, raw) {
        this.type = 'Literal';
        this.value = value;
        this.raw = raw;
    }
}
