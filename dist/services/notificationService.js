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
exports.getNotificationForLastCreatedRequirements = void 0;
const axios_1 = __importDefault(require("axios"));
const globals_1 = require("../globals");
const Types_1 = require("../utils/Types");
const serviceModel_1 = __importDefault(require("../models/serviceModel"));
const getNotificationForLastCreatedRequirements = () => __awaiter(void 0, void 0, void 0, function* () {
    const xMinutesAgo = new Date(Date.now() - globals_1.timeNotificationNewRequirements * 60 * 1000);
    const groupedRecords = yield serviceModel_1.default.aggregate([
        {
            $match: {
                publish_date: { $gte: xMinutesAgo },
                stateID: Types_1.RequirementState.PUBLISHED,
            },
        },
        { $group: { _id: "$categoryID", count: { $sum: 1 } } },
    ]);
    if (groupedRecords.length === 0) {
        console.log(`No hubo nuevos registros en los últimos ${globals_1.timeNotificationNewRequirements} minutos.`);
        return;
    }
    yield axios_1.default.post(`${process.env.API_USER}notification/sendLastRequirementsNotification/${Types_1.RequirementType.SERVICE}`, groupedRecords);
});
exports.getNotificationForLastCreatedRequirements = getNotificationForLastCreatedRequirements;
//# sourceMappingURL=notificationService.js.map