"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const short_unique_id_1 = __importDefault(require("short-unique-id"));
const uid = new short_unique_id_1.default({ length: 20 });
const OfferSchema = new mongoose_1.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
        default: () => uid.rnd(),
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    subUserEmail: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    cityID: {
        type: Number,
        required: true,
    },
    deliveryTimeID: {
        type: Number,
        required: true,
    },
    currencyID: {
        type: Number,
        required: true,
    },
    warranty: {
        type: Number,
        required: false,
    },
    timeMeasurementID: {
        type: Number,
        required: false,
    },
    support: {
        type: Number,
        required: false,
    },
    budget: {
        type: Number,
        required: true,
    },
    includesIGV: {
        type: Boolean,
        required: true,
    },
    includesDelivery: {
        type: Boolean,
        required: true,
    },
    requerimentID: {
        type: String,
        required: true,
    },
    stateID: {
        type: Number,
        required: true,
    },
    publishDate: {
        type: Date,
        required: true,
    },
    deliveryDate: {
        type: Date,
        required: false,
    },
    userID: {
        type: String,
        required: true,
    },
    entityID: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        required: false,
    },
    files: {
        type: [String],
        required: false,
    },
    canceledByCreator: {
        type: Boolean,
        required: false,
    },
    selectionDate: {
        type: Date,
        required: false,
    },
    delivered: {
        type: Boolean,
        required: false,
    },
    cancelRated: {
        type: Boolean,
        required: false,
    },
});
// Exportamos el modelo
exports.OfferModel = mongoose_1.default.model("OffersServices", OfferSchema);
//# sourceMappingURL=offerModel.js.map