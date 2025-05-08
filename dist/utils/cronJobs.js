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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const requerimentService_1 = require("../services/requerimentService");
const globals_1 = require("../globals");
const notificationService_1 = require("../services/notificationService");
const CounterManager_1 = require("./CounterManager");
// Configura el cron job para ejecutar la función 'expired' cada hora (en el minuto 0 de cada hora)
node_cron_1.default.schedule("0 */12 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Verificando y actualizando estados vencidos...");
        yield requerimentService_1.RequerimentService.expired(); // Llama a la función para actualizar los estados
        console.log("Estados vencidos actualizados correctamente.");
    }
    catch (error) {
        console.error("Error al actualizar los estados vencidos:", error);
    }
}));
node_cron_1.default.schedule(`*/${globals_1.timeNotificationNewRequirements} * * * *`, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Obteniendo cantidad de últimos requerimientos publicados...");
        yield (0, notificationService_1.getNotificationForLastCreatedRequirements)();
        console.log("Cantidad de últimos requerimientos enviados correctamente.");
    }
    catch (error) {
        console.error("Error al obtener cantidad de últimos requerimientos publicados:", error);
    }
}));
// Enviar actualización de contadores de subsusuarios
node_cron_1.default.schedule("*/5 * * * *", CounterManager_1.sendBatchUpdate);
//# sourceMappingURL=cronJobs.js.map