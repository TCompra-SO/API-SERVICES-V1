"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderRouter = void 0;
const express_1 = require("express");
const purchaseOrderController_1 = require("../controllers/purchaseOrderController");
class PurchaseOrderRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        // ORDEN DE COMPRA
        this.router.post("/createPurchaseOrder", purchaseOrderController_1.CreatePurchaseOrderController);
        this.router.post("/searchPurchaseOrdersByProvider", purchaseOrderController_1.searchPurchaseOrdersByProviderController);
        this.router.post("/searchPurchaseOrdersByClient", purchaseOrderController_1.searchPurchaseOrdersByClientController);
        this.router.get("/getPurchaseOrders/:page/:pageSize", purchaseOrderController_1.getPurchaseOrdersController);
        this.router.get("/getPurchaseOrdersClient/:userClientID/:page/:pageSize", purchaseOrderController_1.getPurchaseOrdersClientController);
        this.router.get("/getPurchaseOrdersProvider/:userProviderID/:page/:pageSize", purchaseOrderController_1.getPurchaseOrdersProviderController);
        this.router.get("/getpurchaseOrderID/:uid", purchaseOrderController_1.getPurchaseOrderIDController);
        this.router.get("/getpurchaseOrderPDF/:uid", purchaseOrderController_1.getPurchaseOrderPDFController);
        this.router.get("/getpurchaseOrdersByProvider/:uid/:typeUser/:page/:pageSize", purchaseOrderController_1.getPurchaseOrdersByProvider);
        this.router.get("/getpurchaseOrdersByClient/:uid/:typeUser/:page/:pageSize", purchaseOrderController_1.getPurchaseOrdersByClient);
        this.router.get("/canceled/:purchaseOrderID", purchaseOrderController_1.canceledController);
    }
    static getRouter() {
        if (!PurchaseOrderRouter.instance) {
            PurchaseOrderRouter.instance = new PurchaseOrderRouter();
        }
        return PurchaseOrderRouter.instance.router;
    }
}
exports.PurchaseOrderRouter = PurchaseOrderRouter;
//# sourceMappingURL=purchaseOrderRouter.js.map