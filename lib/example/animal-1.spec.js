"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const __1 = require("..");
const Animals = {
    findMany: () => __awaiter(this, void 0, void 0, function* () {
        return ({
            page: { limit: 100, offset: 0 },
            nodes: [],
        });
    }),
    findOne: () => __awaiter(this, void 0, void 0, function* () { return null; }),
    create: () => __awaiter(this, void 0, void 0, function* () { return null; }),
    remove: () => __awaiter(this, void 0, void 0, function* () { return null; }),
    update: () => __awaiter(this, void 0, void 0, function* () { return null; }),
};
describe('testing the example 1', () => {
    it('should build the example code', () => {
        const builder = __1.createSchemaBuilder();
        const animal = builder.model('Animal', Animals);
        // animal type like 'dog', 'cat'
        // field is required
        animal.attr('type', graphql_1.GraphQLString).isNotNullable();
        // animal name like 'Fluffy', 'Rex'
        // field is not required
        animal.attr('name', graphql_1.GraphQLString);
        // is it a tame animal
        animal.attr('tame', graphql_1.GraphQLBoolean);
        // age of the animal
        animal.attr('age', graphql_1.GraphQLInt);
        expect(graphql_1.printSchema(builder.build())).toMatchSnapshot();
    });
});
//# sourceMappingURL=animal-1.spec.js.map