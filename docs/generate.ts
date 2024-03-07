import YAML from "js-yaml";

/// Declared struct
type StructDecl = {
    /// Expected size
    size?: number;
    /// Custom initialization section
    "custom-init"?: string[];
    /// Hex digits for the offset
    digits?: number;
    /// Fields
    fields: Array<Record<string, unknown>>;
    /// Parameters
    params?: string[];
} | string[] /* union */;

const Data: Record<string, StructDecl> = YAML.load(await Bun.file("structs.yaml").text()) as any;
const SizeTable = {
    "Int8": 1,
    "Int16": 2,
    "Int32": 4,
    "Int64": 8,
    "Ptr": 8, // aka void*
    "ByteString": 8, // null-terminated char*
};
if ("_external" in Data) {
    for (const name in Data._external) {
        SizeTable[name] = Data._external[name];
    }
}
const CALCULATING = -1;
// calculate sizes, typeObj should already have parameters instantiated
function calcSize(typeObj: unknown): number {
    if (typeof typeObj === "string") {
        if (typeObj in SizeTable) {
            const size = SizeTable[typeObj];
            if (size === CALCULATING) {
                throw new Error("Circular reference detected");
            }
            return size;
        }
        if (!(typeObj in Data)) {
            throw new Error(`Type ${typeObj} not found`);
        }
        SizeTable[typeObj] = CALCULATING;
        // no parameters here since it's just a string type
        const size = calcStructOrUnionSize(typeObj, Data[typeObj], {});
        SizeTable[typeObj] = size;
        return size;
        
    }
    if (!Array.isArray(typeObj)) {
        throw new Error("Invalid type object, must be string or array");
    }
    const [typeName, ...params] = typeObj;
    // special types
    if (typeName === TYPE_Ptr) {
        return 8;
    }
    if (typeName === TYPE_StructArray) {
        const length: number = params[0];
        const elementType: unknown = params[1];
        const elementSize = calcSize(elementType);
        const size = length * elementSize;
        return size;
    }
    if (typeName === TYPE_ByteArray) {
        const length: number = params[0];
        return length;
    }
    // parameterized type
    const paramValues = bindParamValues(typeName, params);
    const size = calcStructOrUnionSize(typeName, Data[typeName], paramValues);
    return size;
}
function calcStructOrUnionSize(name: string, decl: StructDecl, paramValues: Record<string, unknown>) {
    if (Array.isArray(decl)) {
        // union
        // for now we force the size to be the same
        const firstSize = calcSize(decl[0]);
        for (let i = 1; i < decl.length; i++) {
            if (calcSize(decl[i]) !== firstSize) {
                throw new Error("Structs in union must have same size");
            }
        }
        return firstSize;
    }
    let size = 0;
    for (const field of decl.fields) {
        const [_, typeObj] = parseField(field);
        const fieldSize = calcSize(instantiateParameterizedType(typeObj, paramValues));
        size += fieldSize;
    }
    if (decl.size !== undefined) {
        if (size !== decl.size) {
            throw new Error(`${name} size mismatch. Expected ${decl.size}, got ${size}`);
        }
    }
    return size;
}
function parseField(obj: Record<string, unknown>) {
    const entries = Object.entries(obj);
    if (entries.length !== 1) {
        throw new Error("Invalid field declaration. Must be name: type");
    }
    return entries[0];
}
function instantiateParameterizedType(typeObj: unknown, paramValues: Record<string, unknown>) {
    if (!Array.isArray(typeObj)) {
        return typeObj;
    }
    return typeObj.map((x: unknown) => {
        if (typeof x === "string") {
            if (!x.startsWith("this.")) {
                return x;
            }
            const paramName = x.slice(5);
            if (!(paramName in paramValues)) {
                throw new Error(`Parameter ${paramName} not found`);
            }
            return paramValues[paramName];
        }
        if (Array.isArray(x)) {
            return instantiateParameterizedType(x, paramValues);
        }
        return x;
    });
}
function bindParamValues(typeName: string, params: string[]): Record<string, unknown> {
    if (!(typeName in Data)) {
        throw new Error(`Type ${typeName} not found`);
    }
    const decl = Data[typeName];
    if (Array.isArray(decl)) {
        throw new Error(`Type ${typeName} is not a struct`);
    }
    if (!decl.params || decl.params.length !== params.length) {
        throw new Error(`Invalid number of parameters instantiating type ${typeName}`);
    }
    const paramValues: Record<string, unknown> = { };
    for (let i = 0; i < decl.params.length; i++) {
        paramValues[decl.params[i]] = params[i];
    }
    return paramValues;
}

/// Constants
const TYPE_Ptr = "Ptr";
const TYPE_StructArray = "StructArray";
const TYPE_ByteArray = "ByteArray";
const SYM_new = "new";
const SYM_off = "off";
const SYM_sizeof = "sizeof";

type TypeObj = {
    /// Expression to call to create the type
    constructorCallExpr: string;
    /// Expression to calculate the size,
    sizeExpr: string | number;
    /// Expression of a function for ptr types to create the object
    ptrArgsFn: string;
    /// Representation expression of the type
    reprExpr: string | string[];
}

function reprConcat(a: string | string[], b: string | string[]): string | string[] {
    if (typeof a === "string") {
        if (typeof b === "string") {
            return "\"" + a.substring(1, a.length-1) + b.substring(1, b.length-1) + "\"";
        }
        return [a, ...b];
    } else if (typeof b === "string") {
        return [...a, b];
    }
    return [...a, ...b];
}

function reprToStringExpr(repr: string | string[]): string {
    if (typeof repr === "string") {
        return repr;
    }
    return repr.join(" + ");
}

/// Convert a type object in the struct file to
/// a constructor call in the parent constructor
function parseTypeObj(obj: unknown, offset: unknown, needSizeExpr: boolean): TypeObj {
    if (typeof obj === "string") {
        // normal construction with offset
        // note we are calling factory function instead of the class
        return {
            constructorCallExpr: `${SYM_new}${obj}(${SYM_off}+${offset})`,
            sizeExpr: needSizeExpr ? calcSize(obj) : 0,
            reprExpr: obj.startsWith("this.") ? [obj + ".name"] : JSON.stringify(obj),
            ptrArgsFn: "(off)=>[off]",
        };
    }
    if (!Array.isArray(obj)) {
        throw new Error("Invalid type object, must be string or array");
    }
    const type: unknown = obj[0];
    if (typeof type !== "string") {
        throw new Error("Invalid type object, first element must be string");
    }
    // special types
    if (type === TYPE_Ptr) {
        // pointer construction
        const ptrType: unknown = obj[1];
        // offset is 0 because when dereferencing,
        // the object is referenced at 0 relative to (pointer value - start)
        const {reprExpr, ptrArgsFn} = parseTypeObj(ptrType, 0, false);
        return {
            constructorCallExpr: `${SYM_new}${TYPE_Ptr}(${SYM_off}+${offset}, ${reprToStringExpr(reprExpr)}, ${ptrArgsFn})`,
            sizeExpr: 8,
            reprExpr: reprConcat(reprExpr, "\"*\""),
            ptrArgsFn: `(off)=>[off, ]`,
        };
    }

    if (type === TYPE_StructArray) {
        const length: string | number = obj[1];
        const elementType: unknown = obj[2];
        const {constructorCallExpr, sizeExpr, reprExpr} = parseTypeObj(elementType, 0, true);
        const newFn = `((${SYM_off})=>${constructorCallExpr})`;

        let newSizeExpr: string | number;
        if (typeof sizeExpr === "string" || typeof length === "string") {
            newSizeExpr = `${length}*${sizeExpr}`;
        } else {
            newSizeExpr = length*sizeExpr;
        }

        let lengthReprExpr: string | string[];
        if (typeof length === "string") {
            lengthReprExpr = ["\"[\"", length, "\"]\""];
        } else {
            lengthReprExpr = `"[${length}]"`;
        }

        return {
            constructorCallExpr: `${SYM_new}${TYPE_StructArray}(${SYM_off}+${offset}, ${length}, ${sizeExpr}, ${reprToStringExpr(reprExpr)}, ${newFn})`,
            reprExpr: reprConcat(reprExpr, lengthReprExpr),
            ptrArgsFn: `(off)=>[off, ${length}, ${sizeExpr}, ${reprToStringExpr(reprExpr)}, ${newFn}]`,
            sizeExpr: newSizeExpr,
        };
    }

    if (type === TYPE_ByteArray) {
        const length: string | number = obj[1];
        let lengthReprExpr: string | string[];
        if (typeof length === "string") {
            lengthReprExpr = ["\"[\"", length, "\"]\""];
        } else {
            lengthReprExpr = `"[${length}]"`;
        }
        return {
            constructorCallExpr: `${SYM_new}${TYPE_ByteArray}(${SYM_off}+${offset}, ${length})`,
            reprExpr: reprConcat("\"byte\"", lengthReprExpr),
            ptrArgsFn: `(off)=>[off, ${length}]`,
            sizeExpr: length,
        };
    }

    // parameterized type
    const params = obj.slice(1);
    let constructorCallExpr = `${SYM_new}${type}(${SYM_off}+${offset}`;
    for (const param of params) {
        constructorCallExpr += `, ${param}`;
    }
    constructorCallExpr += ")";
    return {
        constructorCallExpr,
        reprExpr: `"${type}<${params.join(", ")}>"`,
        ptrArgsFn: `(off)=>[off, ${params.join(", ")}]`,
        sizeExpr: `${SYM_sizeof}${type}(${params.join(", ")})`, 
    };
}

function generate(name: string) {
    console.log(`Generating: ${name}`);
    const output: string[] = [];
    const decl = Data[name];

    const functionDecl = `function ${SYM_new}${name}(${SYM_off}, ...args) { return new ${name}(${SYM_off}, ...args); }`;
    output.push(functionDecl);
    output.push(`class ${name} {`);

    if (Array.isArray(decl)) {
        // union
        output.push(`    constructor(${SYM_off}) {`);
        for (const type of decl) {
            const { constructorCallExpr } = parseTypeObj(type, 0, false);
            output.push(`        this.${type} = ${constructorCallExpr};`);
        }
        output.push(`    }`);
        output.push(`}`);
    } else {
        // struct
        if (decl.params && decl.params.length > 0) {
            const paramStr = decl.params.join(", ");
            output.push(`    constructor(${SYM_off}, ${paramStr}) {`);
            output.push(`        this.${SYM_off} = ${SYM_off};`);
            for (const param of decl.params) {
                output.push(`        this.${param} = ${param};`);
            }
        } else {
            output.push(`    constructor(${SYM_off}) {`);
            output.push(`        this.${SYM_off} = ${SYM_off};`);
        }
        output.push(`        let offset = 0;`);
        const digit = decl.digits || sizeToDigits(decl.size);
        const sizeExprs: string[] = [];
        let sizeFixed = 0;
        for (const field of decl.fields) {
            const [fieldName, typeObj] = parseField(field);
            const name = makeMemberNameExpr(fieldName, digit);
            const { constructorCallExpr, sizeExpr } = parseTypeObj(typeObj, "offset", true);
            output.push(`        this[${name}] = ${constructorCallExpr};`);
            output.push(`        offset += ${sizeExpr};`);
            if (typeof sizeExpr === "number") {
                sizeFixed += sizeExpr;
            } else {
                sizeExprs.push(sizeExpr);
            }
        }
        if (decl["custom-init"]) {
            for (const line of decl["custom-init"]) {
                output.push(`        ${line}`);
            }
        }
        output.push(`    }`);
        if (decl.params && decl.params.length > 0) {
            output.push(`    ${SYM_sizeof}() {`);
            if (sizeExprs.length === 0) {
                output.push(`        return ${sizeFixed};`);
            } else {
                output.push(`        return ${sizeFixed} + ${sizeExprs.join(" + ")};`);
            }
            output.push(`    }`);
        }
        output.push(`}`);
        if (decl.params && decl.params.length > 0) {
            const params = decl.params.join(", ");
            output.push(`function ${SYM_sizeof}${name}(${params}) {`);
            output.push(`    return ${SYM_new}${name}(0, ${params}).${SYM_sizeof}();`);
            output.push(`}`);
        }
    }
    return output;
}

function makeMemberNameExpr(name: string, digits: number) {
    return `\`\${toHex(offset, ${digits}, "x")}_${name}\``;
}

function sizeToDigits(size: number | undefined) {
    if (!size) {
        return 2;
    }
    if (size > 0xffff) {
        return 5;
    } else if (size > 0xfff) {
        return 4;
    } else if (size > 0xff) {
        return 3;
    }
    return 2;
}

const output: string[] = [];
for (const name in Data) {
    if (!name.startsWith("_")) {
        output.push(...generate(name));
    }
}

for (const name in Data) {
    const decl = Data[name];
    if (typeof decl === "object" && "size" in decl) {
        const expectedSize = decl.size;
        const actualSize = calcSize(name);
        if (expectedSize !== actualSize) {
            throw new Error(`Size mismatch for ${name}. Expected ${expectedSize}, got ${actualSize}`);
        }
    }
}

Bun.write("structs.js", output.join("\n"));
