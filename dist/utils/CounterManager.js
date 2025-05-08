"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueUpdate = queueUpdate;
exports.sendBatchUpdate = sendBatchUpdate;
let updateBuffer = {};
function queueUpdate(entityId, subUserId, field, newValue) {
    var _a;
    if (!updateBuffer[entityId])
        updateBuffer[entityId] = {};
    if (!updateBuffer[entityId][subUserId])
        updateBuffer[entityId][subUserId] = {};
    updateBuffer[entityId][subUserId][field] =
        ((_a = updateBuffer[entityId][subUserId][field]) !== null && _a !== void 0 ? _a : 0) + newValue;
}
function hasUpdates() {
    return Object.values(updateBuffer).some((users) => Object.values(users).some((rows) => Object.keys(rows).length > 0));
}
function sendBatchUpdate() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!hasUpdates()) {
            return;
        }
        try {
            const response = yield fetch(`${(_a = process.env.API_USER) !== null && _a !== void 0 ? _a : ""}subUser/sendCounterUpdate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateBuffer),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            console.log("Actualización de contadores de subusuarios enviada");
            updateBuffer = {};
        }
        catch (error) {
            console.error("Error al enviar actualización de contadores de subusuarios:", error);
        }
    });
}
//# sourceMappingURL=CounterManager.js.map