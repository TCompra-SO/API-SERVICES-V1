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
const mongoose_1 = __importStar(require("mongoose"));
const short_unique_id_1 = __importDefault(require("short-unique-id"));
const uid = new short_unique_id_1.default({ length: 20 });
const ServiceSchema = new mongoose_1.Schema({
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
    description: {
        type: String,
        required: true,
    },
    categoryID: {
        type: Number,
        required: true,
    },
    cityID: {
        type: Number,
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    currencyID: {
        type: Number,
        required: true,
    },
    payment_methodID: {
        type: Number,
        required: true,
    },
    completion_date: {
        type: Date,
        required: true,
    },
    submission_dateID: {
        type: Number,
        required: true,
    },
    warranty: {
        type: Number,
        required: false,
    },
    durationID: {
        type: Number,
        required: false,
    },
    allowed_bidersID: {
        type: [Number],
        required: true,
    },
    entityID: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
    subUserEmail: {
        type: String,
        required: false,
    },
    publish_date: {
        type: Date,
        required: true,
        index: true,
    },
    stateID: {
        type: Number,
        required: true,
    },
    number_offers: {
        type: Number,
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
    winOffer: {
        type: Object,
        required: false,
    },
}, {
    versionKey: false,
    timestamps: true,
});
const ServiceModel = mongoose_1.default.model("services", ServiceSchema);
exports.default = ServiceModel;
//# sourceMappingURL=serviceModel.js.map