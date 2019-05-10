"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const language_1 = require("graphql/language");
const lodash_1 = require("lodash");
const astToJson = {
    [language_1.Kind.INT]: (ast) => graphql_1.GraphQLInt.parseLiteral(ast, null),
    [language_1.Kind.FLOAT]: (ast) => graphql_1.GraphQLFloat.parseLiteral(ast, null),
    [language_1.Kind.BOOLEAN]: (ast) => graphql_1.GraphQLBoolean.parseLiteral(ast, null),
    [language_1.Kind.STRING]: (ast) => graphql_1.GraphQLString.parseLiteral(ast, null),
    [language_1.Kind.ENUM]: (ast) => String(ast.value),
    [language_1.Kind.LIST]: (ast) => ast.values.map(astItem => exports.JSONType.parseLiteral(astItem, null)),
    [language_1.Kind.OBJECT]: (ast) => ast.fields.reduce((obj, field) => {
        obj[field.name.value] = exports.JSONType.parseLiteral(field.value, null);
        return obj;
    }, {}),
    [language_1.Kind.VARIABLE]: (ast) => {
        /*
        this way converted query variables would be easily
        converted to actual values in the resolver.js by just
        passing the query variables object in to function below.
        We can`t convert them just in here because query variables
        are not accessible from GraphQLScalarType's parseLiteral method
        */
        return lodash_1.property(ast.name.value);
    },
};
exports.JSONType = new graphql_1.GraphQLScalarType({
    name: 'SequelizeJSON',
    description: 'The `JSON` scalar type represents raw JSON as values.',
    serialize: value => value,
    parseValue: value => (typeof value === 'string' ? JSON.parse(value) : value),
    parseLiteral: ast => {
        const parser = astToJson[ast.kind];
        return parser ? parser(ast) : null;
    },
});
//# sourceMappingURL=json-type.js.map