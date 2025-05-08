"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRouter = void 0;
const express_1 = require("express");
const fileController_1 = require("../controllers/fileController");
class FileRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.router.post("/uploadDocumentsRequeriment", fileController_1.upload, fileController_1.uploadDocumentsRequeriment);
        this.router.post("/uploadDocumentsOffer", fileController_1.upload, fileController_1.uploadDocumentsOffer);
    }
    static getRouter() {
        if (!FileRouter.instance) {
            FileRouter.instance = new FileRouter();
        }
        return FileRouter.instance.router;
    }
}
exports.FileRouter = FileRouter;
//# sourceMappingURL=fileRouter.js.map