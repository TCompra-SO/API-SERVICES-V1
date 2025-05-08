"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const RootRouter_1 = require("./routes/RootRouter");
require("./initConfig");
class App {
    static getInstance() {
        if (!App.instance) {
            App.instance = (0, express_1.default)();
            App.instance.use(body_parser_1.default.urlencoded({ extended: false }));
            App.instance.use(body_parser_1.default.json());
            App.instance.use((0, cors_1.default)());
            App.instance.use(RootRouter_1.RootRouter.getRouter());
        }
        return App.instance;
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map