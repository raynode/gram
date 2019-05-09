import { ATTRIBUTEBUILDER, MODELBUILDER, SCHEMABUILDER } from 'types/constants';
export const isBuilder = (val) => val && typeof val.type === 'string';
export const isAttributeBuilder = (val) => isBuilder(val) && val.type === ATTRIBUTEBUILDER;
export const isModelBuilder = (val) => isBuilder(val) && val.type === MODELBUILDER;
export const isSchemaBuilder = (val) => isBuilder(val) && val.type === SCHEMABUILDER;
//# sourceMappingURL=guards.js.map