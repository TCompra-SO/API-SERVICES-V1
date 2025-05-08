"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirementType = exports.NotificationAction = exports.NameAPI = exports.TypeSocket = exports.OrderType = exports.TypeEntity = exports.TypeUser = exports.PurchaseOrderState = exports.OfferState = exports.RequirementState = void 0;
var RequirementState;
(function (RequirementState) {
    RequirementState[RequirementState["PUBLISHED"] = 1] = "PUBLISHED";
    RequirementState[RequirementState["SELECTED"] = 2] = "SELECTED";
    RequirementState[RequirementState["FINISHED"] = 3] = "FINISHED";
    // DESERTED = 4,
    RequirementState[RequirementState["EXPIRED"] = 5] = "EXPIRED";
    RequirementState[RequirementState["CANCELED"] = 6] = "CANCELED";
    RequirementState[RequirementState["ELIMINATED"] = 7] = "ELIMINATED";
    RequirementState[RequirementState["DISPUTE"] = 4] = "DISPUTE";
})(RequirementState || (exports.RequirementState = RequirementState = {}));
var OfferState;
(function (OfferState) {
    OfferState[OfferState["ACTIVE"] = 1] = "ACTIVE";
    OfferState[OfferState["WINNER"] = 2] = "WINNER";
    OfferState[OfferState["FINISHED"] = 3] = "FINISHED";
    OfferState[OfferState["DISPUTE"] = 4] = "DISPUTE";
    OfferState[OfferState["CANCELED"] = 5] = "CANCELED";
    OfferState[OfferState["ELIMINATED"] = 7] = "ELIMINATED";
})(OfferState || (exports.OfferState = OfferState = {}));
var PurchaseOrderState;
(function (PurchaseOrderState) {
    PurchaseOrderState[PurchaseOrderState["PENDING"] = 1] = "PENDING";
    PurchaseOrderState[PurchaseOrderState["CANCELED"] = 2] = "CANCELED";
    PurchaseOrderState[PurchaseOrderState["FINISHED"] = 3] = "FINISHED";
    PurchaseOrderState[PurchaseOrderState["DISPUTE"] = 4] = "DISPUTE";
    PurchaseOrderState[PurchaseOrderState["ELIMINATED"] = 7] = "ELIMINATED";
})(PurchaseOrderState || (exports.PurchaseOrderState = PurchaseOrderState = {}));
var TypeUser;
(function (TypeUser) {
    TypeUser[TypeUser["ADMIN"] = 1] = "ADMIN";
})(TypeUser || (exports.TypeUser = TypeUser = {}));
var TypeEntity;
(function (TypeEntity) {
    TypeEntity["COMPANY"] = "Company";
    TypeEntity["USER"] = "User";
    TypeEntity["SUBUSER"] = "SubUser";
    TypeEntity["MASTER"] = "Master";
})(TypeEntity || (exports.TypeEntity = TypeEntity = {}));
var OrderType;
(function (OrderType) {
    OrderType[OrderType["ASC"] = 1] = "ASC";
    OrderType[OrderType["DESC"] = 2] = "DESC";
})(OrderType || (exports.OrderType = OrderType = {}));
var TypeSocket;
(function (TypeSocket) {
    TypeSocket[TypeSocket["CREATE"] = 0] = "CREATE";
    TypeSocket[TypeSocket["UPDATE"] = 1] = "UPDATE";
    TypeSocket[TypeSocket["DELETE"] = 2] = "DELETE";
    TypeSocket[TypeSocket["UPDATE_FIELD"] = 4] = "UPDATE_FIELD";
})(TypeSocket || (exports.TypeSocket = TypeSocket = {}));
var NameAPI;
(function (NameAPI) {
    NameAPI["NAME"] = "Service";
})(NameAPI || (exports.NameAPI = NameAPI = {}));
var NotificationAction;
(function (NotificationAction) {
    NotificationAction[NotificationAction["VIEW_REQUIREMENT"] = 25] = "VIEW_REQUIREMENT";
    NotificationAction[NotificationAction["VIEW_CERTIFICATION"] = 40] = "VIEW_CERTIFICATION";
    NotificationAction[NotificationAction["VIEW_HISTORY"] = 15] = "VIEW_HISTORY";
    NotificationAction[NotificationAction["VIEW_OFFER"] = 26] = "VIEW_OFFER";
    NotificationAction[NotificationAction["DOWNLOAD_PURCHASE_ORDER"] = 12] = "DOWNLOAD_PURCHASE_ORDER";
})(NotificationAction || (exports.NotificationAction = NotificationAction = {}));
var RequirementType;
(function (RequirementType) {
    RequirementType[RequirementType["GOOD"] = 1] = "GOOD";
    RequirementType[RequirementType["SERVICE"] = 2] = "SERVICE";
    RequirementType[RequirementType["SALE"] = 3] = "SALE";
})(RequirementType || (exports.RequirementType = RequirementType = {}));
//# sourceMappingURL=Types.js.map