"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
exports.UploadType = new graphql_1.GraphQLScalarType({
    name: 'Upload',
    description: 'A special custom Scalar type for Uploads',
    serialize(upload) {
        console.log('serialize', upload);
        return upload;
    },
    parseValue(value) {
        console.log('parseValue', value);
        return value;
    },
    parseLiteral(ast) {
        console.log('parseLiteral', ast);
        return ast;
    },
});
//# sourceMappingURL=upload-type.js.map