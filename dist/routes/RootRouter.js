"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootRouter = void 0;
const express_1 = require("express");
const requerimentRouter_1 = require("./requerimentRouter");
const offerRouter_1 = require("./offerRouter");
const imageRouter_1 = require("./imageRouter");
const fileRouter_1 = require("./fileRouter");
const purchaseOrderRouter_1 = require("./purchaseOrderRouter");
class RootRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.router.use("/v1/requeriments/", requerimentRouter_1.RequerimentRouter.getRouter());
        this.router.use("/v1/offers/", offerRouter_1.OfferRouter.getRouter());
        this.router.use("/v1/images/", imageRouter_1.ImageRouter.getRouter());
        this.router.use("/v1/documents/", fileRouter_1.FileRouter.getRouter());
        this.router.use("/v1/purchaseOrder/", purchaseOrderRouter_1.PurchaseOrderRouter.getRouter());
    }
    static getRouter() {
        if (!RootRouter.instance) {
            RootRouter.instance = new RootRouter();
        }
        return RootRouter.instance.router;
    }
}
exports.RootRouter = RootRouter;
//# sourceMappingURL=RootRouter.js.map