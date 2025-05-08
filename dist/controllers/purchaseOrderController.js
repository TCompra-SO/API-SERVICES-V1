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
exports.searchPurchaseOrdersByClientController = exports.searchPurchaseOrdersByProviderController = exports.canceledController = exports.getPurchaseOrdersByClient = exports.getPurchaseOrdersByProvider = exports.getPurchaseOrderPDFController = exports.getPurchaseOrderIDController = exports.getPurchaseOrdersClientController = exports.getPurchaseOrdersProviderController = exports.getPurchaseOrdersController = exports.CreatePurchaseOrderController = void 0;
const purchaseOrderService_1 = require("../services/purchaseOrderService");
const fs = require("fs");
const CreatePurchaseOrderController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requerimentID, offerID, price_Filter, deliveryTime_Filter, location_Filter, warranty_Filter, } = req.body;
        const responseUser = yield purchaseOrderService_1.PurchaseOrderService.CreatePurchaseOrder(requerimentID, offerID, price_Filter, deliveryTime_Filter, location_Filter, warranty_Filter);
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en CreatePurchaseOrderController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.CreatePurchaseOrderController = CreatePurchaseOrderController;
const getPurchaseOrdersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, pageSize } = req.params;
        const responseUser = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrders(Number(page), Number(pageSize));
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en getPurchaseOrdersController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getPurchaseOrdersController = getPurchaseOrdersController;
const getPurchaseOrdersProviderController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userProviderID, page, pageSize } = req.params;
    try {
        const responseUser = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrdersProvider(userProviderID, Number(page), Number(pageSize));
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en getPurchaseOrderByEntityProviderController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getPurchaseOrdersProviderController = getPurchaseOrdersProviderController;
const getPurchaseOrdersClientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userClientID, page, pageSize } = req.params;
    try {
        const responseUser = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrdersClient(userClientID, Number(page), Number(pageSize));
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en getPurchaseOrderByEntityClientController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getPurchaseOrdersClientController = getPurchaseOrdersClientController;
const getPurchaseOrderIDController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const responseUser = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrderID(uid);
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en getPurchaseOrderIDController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getPurchaseOrderIDController = getPurchaseOrderIDController;
const getPurchaseOrdersByProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, typeUser, page, pageSize } = req.params;
    try {
        const responseUser = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrdersByEntityProvider(uid, Number(typeUser), Number(page), Number(pageSize));
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en getPurchaseOrdersByProviderController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getPurchaseOrdersByProvider = getPurchaseOrdersByProvider;
const getPurchaseOrdersByClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, typeUser, page, pageSize } = req.params;
    try {
        const responseUser = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrdersByEntityClient(uid, Number(typeUser), Number(page), Number(pageSize));
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en getPurchaseOrdersByClientController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getPurchaseOrdersByClient = getPurchaseOrdersByClient;
const getPurchaseOrderPDFController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const responseUser = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrderPDF(uid);
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en getPurchaseOrderPDFController", error);
        return res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getPurchaseOrderPDFController = getPurchaseOrderPDFController;
const canceledController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { purchaseOrderID } = req.params;
    try {
        const responseUser = yield purchaseOrderService_1.PurchaseOrderService.canceled(purchaseOrderID);
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en canceledController", error);
        return res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.canceledController = canceledController;
const searchPurchaseOrdersByProviderController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyWords, typeUser, userId, page, pageSize, fieldName, orderType, filterColumn, filterData, } = req.body;
    try {
        const responseUser = yield purchaseOrderService_1.PurchaseOrderService.searchPurchaseOrderByProvider(keyWords, typeUser, userId, Number(page), Number(pageSize), fieldName, Number(orderType), filterColumn, filterData);
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en searchPurchaseOrdersByProviderController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.searchPurchaseOrdersByProviderController = searchPurchaseOrdersByProviderController;
const searchPurchaseOrdersByClientController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyWords, typeUser, userId, page, pageSize, fieldName, orderType, filterColumn, filterData, } = req.body;
    try {
        const responseUser = yield purchaseOrderService_1.PurchaseOrderService.searchPurchaseOrderByClient(keyWords, typeUser, userId, Number(page), Number(pageSize), fieldName, Number(orderType), filterColumn, filterData);
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en searchPurchaseOrdersByClientController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.searchPurchaseOrdersByClientController = searchPurchaseOrdersByClientController;
//# sourceMappingURL=purchaseOrderController.js.map