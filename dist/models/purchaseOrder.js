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
const PurchaseOrderSchema = new mongoose_1.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
        default: () => uid.rnd(),
    },
    type: {
        type: Number,
        required: true,
    },
    userClientID: {
        type: String,
        required: true,
    },
    userNameClient: {
        type: String,
        required: true,
    },
    addressClient: {
        type: String,
        required: true,
    },
    documentClient: {
        type: String,
        required: true,
    },
    emailClient: {
        type: String,
        required: true,
    },
    subUserClientID: {
        type: String,
        required: false,
    },
    nameSubUserClient: {
        type: String,
        required: false,
    },
    subUserClientEmail: {
        type: String,
        required: false,
    },
    createDate: {
        type: Date,
        default: Date.now,
    },
    deliveryDate: {
        type: Date,
        required: false,
    },
    requerimentID: {
        type: String,
        required: true,
    },
    requerimentTitle: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    totaligv: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    igv: {
        type: Number,
        required: true,
    },
    userProviderID: {
        type: String,
        required: true,
    },
    nameUserProvider: {
        type: String,
        required: true,
    },
    subUserProviderID: {
        type: String,
        required: false,
    },
    nameSubUserProvider: {
        type: String,
        required: false,
    },
    addressProvider: {
        type: String,
        required: true,
    },
    documentProvider: {
        type: String,
        required: true,
    },
    emailProvider: {
        type: String,
        required: true,
    },
    subUserEmailProvider: {
        type: String,
        required: false,
    },
    stateID: {
        type: Number,
        required: true,
    },
    offerID: {
        type: String,
        required: true,
    },
    offerTitle: {
        type: String,
        required: true,
    },
    price_Filter: {
        type: Number,
        required: false,
    },
    deliveryTime_Filter: {
        type: Number,
        required: false,
    },
    location_Filter: {
        type: Number,
        required: false,
    },
    warranty_Filter: {
        type: Number,
        required: false,
    },
    scoreState: {
        type: Object,
        required: false,
    },
    canceledByCreator: {
        type: Boolean,
        required: false,
    },
    reasonCancellation: {
        type: String,
        required: false,
    },
    cancellationDate: {
        type: Date,
        required: false,
    },
});
const PurchaseOrderModel = mongoose_1.default.model("PurchaseOrderServices", PurchaseOrderSchema);
exports.default = PurchaseOrderModel;
//# sourceMappingURL=purchaseOrder.js.map