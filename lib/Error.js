"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordNotFoundError = void 0;
class RecordNotFoundError extends Error {
    constructor(Entity) {
        super(`${Entity.name} was not found.`);
        this.Entity = Entity;
        this.name = 'RecordNotFoundError';
        Object.setPrototypeOf(this, RecordNotFoundError.prototype);
    }
    toString() {
        return this.name + ': ' + this.message;
    }
}
exports.RecordNotFoundError = RecordNotFoundError;
//# sourceMappingURL=Error.js.map