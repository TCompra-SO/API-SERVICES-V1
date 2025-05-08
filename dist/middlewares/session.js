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
exports.checkJwt = void 0;
const jwt_handle_1 = require("../utils/jwt.handle");
const checkJwt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jwtByUser = req.headers.authorization || null;
        if (!jwtByUser) {
            return res.status(401).send({
                success: false,
                code: 401,
                error: {
                    msg: "NO_TIENES_UN_JWT_VALIDO",
                },
            }); // Sin token en los headers
        }
        const jwt = jwtByUser.split(" ")[1]; // Usar el índice 1 para obtener el token después de "Bearer"
        if (!jwt) {
            return res.status(401).send({
                success: false,
                code: 401,
                error: {
                    msg: "NO_TIENES_UN_JWT_VALIDO",
                },
            }); // Token no presente después de "Bearer"
        }
        const isUser = (yield (0, jwt_handle_1.verifyToken)(jwt)); // Asegúrate de esperar la promesa
        if (!isUser) {
            return res.status(401).send({
                success: false,
                code: 401,
                error: {
                    msg: "NO_TIENES_UN_JWT_VALIDO",
                },
            });
        }
        else {
            req.user = isUser;
            next();
        }
    }
    catch (e) {
        res.status(400).send({
            success: false,
            code: 400,
            error: {
                msg: "NO_TIENES_UN_JWT_VALIDO",
            },
        });
    }
});
exports.checkJwt = checkJwt;
//# sourceMappingURL=session.js.map