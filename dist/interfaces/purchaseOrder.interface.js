"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeRequeriment = exports.CommonFilter = exports.PurchaseOrderState = void 0;
var PurchaseOrderState;
(function (PurchaseOrderState) {
    PurchaseOrderState[PurchaseOrderState["PENDING"] = 1] = "PENDING";
    PurchaseOrderState[PurchaseOrderState["CANCELED"] = 2] = "CANCELED";
    PurchaseOrderState[PurchaseOrderState["FINISHED"] = 3] = "FINISHED";
    PurchaseOrderState[PurchaseOrderState["DISPUTE"] = 4] = "DISPUTE";
    PurchaseOrderState[PurchaseOrderState["ELIMINATED"] = 7] = "ELIMINATED";
})(PurchaseOrderState || (exports.PurchaseOrderState = PurchaseOrderState = {}));
var CommonFilter;
(function (CommonFilter) {
    CommonFilter[CommonFilter["ALL"] = 999] = "ALL";
    CommonFilter[CommonFilter["ASC"] = 1] = "ASC";
    CommonFilter[CommonFilter["DESC"] = 2] = "DESC";
})(CommonFilter || (exports.CommonFilter = CommonFilter = {}));
var TypeRequeriment;
(function (TypeRequeriment) {
    TypeRequeriment[TypeRequeriment["PRODUCTS"] = 1] = "PRODUCTS";
    TypeRequeriment[TypeRequeriment["SERVICES"] = 2] = "SERVICES";
    TypeRequeriment[TypeRequeriment["LIQUIDATIONS"] = 3] = "LIQUIDATIONS";
    TypeRequeriment[TypeRequeriment["RRHH"] = 4] = "RRHH";
})(TypeRequeriment || (exports.TypeRequeriment = TypeRequeriment = {}));
//# sourceMappingURL=purchaseOrder.interface.js.map