import { Router } from "express";
import {
  canceledController,
  CreateOfferController,
  culminateController,
  getbasicRateDataController,
  GetDetailOfferController,
  GetOffersByEntityController,
  GetOffersByRequerimentController,
  GetOffersBySubUserController,
  GetOffersController,
  getValidationController,
  searchOffersByUserController,
} from "../controllers/offerController";
import { deleteController } from "../controllers/offerController";
import { saveNotificationMiddleware } from "../middlewares/notification";
import { checkJwt } from "../middlewares/session";
export class OfferRouter {
  private static instance: OfferRouter;
  private router: Router;

  private constructor() {
    this.router = Router();
    this.router.post(
      "/create",
      saveNotificationMiddleware,
      CreateOfferController
    );

    this.router.get("/getDetailOffer/:uid", GetDetailOfferController);
    this.router.get("/getOffers/:page/:pageSize", GetOffersController);
    this.router.get(
      "/getOffersByRequeriment/:requerimentID/:page/:pageSize",
      checkJwt,
      GetOffersByRequerimentController
    );
    this.router.get("/getBasicRateData/:uid", getbasicRateDataController);
    this.router.get(
      "/getOffersByEntity/:uid/:page/:pageSize",
      checkJwt,
      GetOffersByEntityController
    );
    this.router.get(
      "/getOffersBySubUser/:uid/:page/:pageSize",
      checkJwt,
      GetOffersBySubUserController
    );
    this.router.get(
      "/getValidation/:userID/:requerimentID",
      checkJwt,
      getValidationController
    );

    this.router.get("/delete/:uid", checkJwt, deleteController);
    this.router.post(
      "/culminate",
      checkJwt,
      saveNotificationMiddleware,
      culminateController
    );
    this.router.post(
      "/canceled",
      checkJwt,
      saveNotificationMiddleware,
      canceledController
    );
    this.router.post(
      "/searchOffersByUser",
      checkJwt,
      searchOffersByUserController
    );
  }

  static getRouter(): Router {
    if (!OfferRouter.instance) {
      OfferRouter.instance = new OfferRouter();
    }
    return OfferRouter.instance.router;
  }
}
