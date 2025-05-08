"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequerimentRouter = void 0;
const express_1 = require("express");
const requerimentController_1 = require("../controllers/requerimentController");
const session_1 = require("../middlewares/session");
const notification_1 = require("../middlewares/notification");
class RequerimentRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.router.post("/create", session_1.checkJwt, requerimentController_1.createRequerimentController);
        this.router.post("/selectOffer", session_1.checkJwt, notification_1.saveNotificationMiddleware, requerimentController_1.selectOfferController);
        this.router.get("/getRequeriments/:page/:pageSize", requerimentController_1.getRequerimentsController);
        this.router.get("/getRequeriment/:uid", requerimentController_1.getRequerimentIDController);
        this.router.get("/getBasicRateData/:uid", requerimentController_1.getbasicRateDataController);
        this.router.get("/expired", requerimentController_1.expiredController);
        this.router.get("/getRequerimentsByEntity/:uid/:page/:pageSize/:fieldName/:orderType", requerimentController_1.getRequerimentsByEntityController);
        this.router.get("/getRequerimentsBySubUser/:uid/:page/:pageSize/:fieldName/:orderType", requerimentController_1.getRequerimentsBySubUserController);
        this.router.get("/delete/:uid", session_1.checkJwt, requerimentController_1.deleteController);
        this.router.post("/canceled", session_1.checkJwt, notification_1.saveNotificationMiddleware, requerimentController_1.canceledController);
        this.router.post("/republish", session_1.checkJwt, requerimentController_1.republishController);
        this.router.post("/culminate", session_1.checkJwt, notification_1.saveNotificationMiddleware, requerimentController_1.culminateController);
        this.router.post("/searchMainFilters", requerimentController_1.searchMainFiltersController);
        this.router.post("/searchProductsByUser", requerimentController_1.searchProductsByUserController);
    }
    static getRouter() {
        if (!RequerimentRouter.instance) {
            RequerimentRouter.instance = new RequerimentRouter();
        }
        return RequerimentRouter.instance.router;
    }
}
exports.RequerimentRouter = RequerimentRouter;
//# sourceMappingURL=requerimentRouter.js.map