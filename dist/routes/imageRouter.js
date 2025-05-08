"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageRouter = void 0;
const express_1 = require("express");
const imageController_1 = require("../controllers/imageController");
class ImageRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.router.post("/uploadImagesRequeriment", imageController_1.upload, imageController_1.uploadImagesRequeriment);
        this.router.post("/uploadImagesOffer", imageController_1.upload, imageController_1.uploadImagesOffer);
    }
    static getRouter() {
        if (!ImageRouter.instance) {
            ImageRouter.instance = new ImageRouter();
        }
        return ImageRouter.instance.router;
    }
}
exports.ImageRouter = ImageRouter;
//# sourceMappingURL=imageRouter.js.map