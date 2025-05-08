"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferRouter = void 0;
const express_1 = require("express");
const offerController_1 = require("../controllers/offerController");
const offerController_2 = require("../controllers/offerController");
const notification_1 = require("../middlewares/notification");
const session_1 = require("../middlewares/session");
class OfferRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.router.post("/create", session_1.checkJwt, notification_1.saveNotificationMiddleware, offerController_1.CreateOfferController);
        this.router.get("/getDetailOffer/:uid", offerController_1.GetDetailOfferController);
        this.router.get("/getOffers/:page/:pageSize", session_1.checkJwt, offerController_1.GetOffersController);
        this.router.get("/getOffersByRequeriment/:requerimentID/:page/:pageSize", session_1.checkJwt, offerController_1.GetOffersByRequerimentController);
        this.router.get("/getBasicRateData/:uid", offerController_1.getbasicRateDataController);
        this.router.get("/getOffersByEntity/:uid/:page/:pageSize", session_1.checkJwt, offerController_1.GetOffersByEntityController);
        this.router.get("/getOffersBySubUser/:uid/:page/:pageSize", session_1.checkJwt, offerController_1.GetOffersBySubUserController);
        this.router.get("/getValidation/:userID/:requerimentID", session_1.checkJwt, offerController_1.getValidationController);
        this.router.get("/delete/:uid", session_1.checkJwt, offerController_2.deleteController);
        this.router.post("/culminate", session_1.checkJwt, notification_1.saveNotificationMiddleware, offerController_1.culminateController);
        this.router.post("/canceled", session_1.checkJwt, notification_1.saveNotificationMiddleware, offerController_1.canceledController);
        this.router.post("/searchOffersByUser", session_1.checkJwt, offerController_1.searchOffersByUserController);
    }
    static getRouter() {
        if (!OfferRouter.instance) {
            OfferRouter.instance = new OfferRouter();
        }
        return OfferRouter.instance.router;
    }
}
exports.OfferRouter = OfferRouter;
//# sourceMappingURL=offerRouter.js.map