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
exports.searchProductsByUserController = exports.searchMainFiltersController = exports.canceledController = exports.culminateController = exports.republishController = exports.deleteController = exports.getRequerimentsBySubUserController = exports.getRequerimentsByEntityController = exports.getbasicRateDataController = exports.expiredController = exports.selectOfferController = exports.getRequerimentIDController = exports.getRequerimentsController = exports.createRequerimentController = void 0;
const requerimentService_1 = require("../services/requerimentService");
const server_1 = require("../server"); // Importamos el objeto `io` de Socket.IO
const requeriment_front_Interface_1 = require("../middlewares/requeriment.front.Interface");
const Types_1 = require("../utils/Types");
const offerService_1 = require("../services/offerService");
const offer_front_interface_1 = require("../middlewares/offer.front.interface");
const purchaseOrderService_1 = require("../services/purchaseOrderService");
const createRequerimentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { body, user } = req; // Extraemos `body` y `user` de `req`
        const { uid } = user; // Obtenemos `uid` del usuario autenticado
        if (uid !== body.userID) {
            return res.status(403).json({
                success: false,
                code: 403,
                error: {
                    msg: "El usuario no tiene acceso",
                },
            });
        }
        const responseUser = yield requerimentService_1.RequerimentService.CreateRequeriment(body);
        if (responseUser.success) {
            const uid = (_a = responseUser.data) === null || _a === void 0 ? void 0 : _a.uid;
            if (uid) {
                const dataPack = (0, requeriment_front_Interface_1.transformData)(yield requerimentService_1.RequerimentService.getRequerimentById(uid));
                const typeSocket = Types_1.TypeSocket.CREATE;
                const roomNameHome = `homeRequeriment${Types_1.NameAPI.NAME}`;
                server_1.io.to(roomNameHome).emit("updateRoom", {
                    dataPack,
                    typeSocket: typeSocket,
                    key: dataPack.data[0].key,
                    userId: dataPack.data[0].subUser,
                });
                // enviamos a la sala de usuarios
                const roomName = `roomRequeriment${Types_1.NameAPI.NAME + ((_b = responseUser.data) === null || _b === void 0 ? void 0 : _b.entityID)}`;
                server_1.io.to(roomName).emit("updateRoom", {
                    dataPack: dataPack,
                    typeSocket: typeSocket,
                    key: dataPack.data[0].key,
                    userId: dataPack.data[0].subUser,
                });
            }
            res.status(responseUser.code).send((0, requeriment_front_Interface_1.transformData)(responseUser));
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en CreateRequerimentController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.createRequerimentController = createRequerimentController;
const getRequerimentsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, pageSize } = req.params;
        const responseUser = yield requerimentService_1.RequerimentService.getRequeriments(Number(page), Number(pageSize));
        // Verifica si la respuesta es válida y contiene datos
        if (responseUser && responseUser.success) {
            if (responseUser.data) {
                res.status(responseUser.code).send((0, requeriment_front_Interface_1.transformData)(responseUser));
            }
            else {
                // Si 'data' es undefined, puedes devolver un mensaje de error o manejarlo como prefieras
                res.status(404).send({
                    success: false,
                    msg: "No se encontraron requerimientos",
                });
            }
        }
        else {
            // Manejar el error según la respuesta
            res
                .status(responseUser.code)
                .send(responseUser.error || { msg: "Error desconocido" });
        }
    }
    catch (error) {
        console.error("Error en getRequerimentsController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getRequerimentsController = getRequerimentsController;
const getRequerimentIDController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const responseUser = yield requerimentService_1.RequerimentService.getRequerimentById(uid);
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en getRequerimentIDController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getRequerimentIDController = getRequerimentIDController;
const getRequerimentsByEntityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid, page, pageSize, fieldName, orderType } = req.params;
        const responseUser = yield requerimentService_1.RequerimentService.getRequerimentsByEntity(uid, Number(page), Number(pageSize), fieldName, Number(orderType));
        // Verifica si la respuesta es válida y contiene datos
        if (responseUser && responseUser.success) {
            if (responseUser.data) {
                res.status(responseUser.code).send((0, requeriment_front_Interface_1.transformData)(responseUser));
            }
            else {
                // Si 'data' es undefined, puedes devolver un mensaje de error o manejarlo como prefieras
                res.status(404).send({
                    success: false,
                    msg: "No se encontraron requerimientos",
                });
            }
        }
        else {
            // Manejar el error según la respuesta
            res
                .status(responseUser.code)
                .send(responseUser.error || { msg: "Error desconocido" });
        }
    }
    catch (error) {
        console.error("Error en getRequerimentByEntityController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getRequerimentsByEntityController = getRequerimentsByEntityController;
const getRequerimentsBySubUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid, page, pageSize, fieldName, orderType } = req.params;
        const responseUser = yield requerimentService_1.RequerimentService.getRequerimentsbySubUser(uid, Number(page), Number(pageSize), fieldName, Number(orderType));
        // Verifica si la respuesta es válida y contiene datos
        if (responseUser && responseUser.success) {
            if (responseUser.data) {
                res.status(responseUser.code).send((0, requeriment_front_Interface_1.transformData)(responseUser));
            }
            else {
                // Si 'data' es undefined, puedes devolver un mensaje de error o manejarlo como prefieras
                res.status(404).send({
                    success: false,
                    msg: "No se encontraron requerimientos",
                });
            }
        }
        else {
            // Manejar el error según la respuesta
            res
                .status(responseUser.code)
                .send(responseUser.error || { msg: "Error desconocido" });
        }
    }
    catch (error) {
        console.error("Error en getRequerimentBySubUserController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getRequerimentsBySubUserController = getRequerimentsBySubUserController;
const selectOfferController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    try {
        const { requerimentID, offerID, observation, price_Filter, deliveryTime_Filter, location_Filter, warranty_Filter, } = req.body;
        let requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentID);
        //ESTA PENDIENTE
        const { user } = req; // Extraemos `user` y `body` de la request
        const { uid } = user; // Obtenemos `uid` del usuario autenticado
        if (uid !== ((_a = requerimentData.data) === null || _a === void 0 ? void 0 : _a[0].userID) &&
            uid !== ((_b = requerimentData.data) === null || _b === void 0 ? void 0 : _b[0].entityID)) {
            return res.status(403).json({
                success: false,
                code: 403,
                error: {
                    msg: "El usuario no tiene acceso",
                },
            });
        }
        const responseUser = yield requerimentService_1.RequerimentService.selectOffer(requerimentID, offerID, observation, price_Filter, deliveryTime_Filter, location_Filter, warranty_Filter);
        if (responseUser && responseUser.success) {
            const roomNameHome = `homeRequeriment${Types_1.NameAPI.NAME}`;
            const requerimentUID = (_c = responseUser.data) === null || _c === void 0 ? void 0 : _c.uid;
            if (requerimentUID) {
                //socket sala principal
                requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentUID);
                server_1.io.to(roomNameHome).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData),
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_d = responseUser.data) === null || _d === void 0 ? void 0 : _d.uid,
                    userId: (_e = responseUser.data) === null || _e === void 0 ? void 0 : _e.userID,
                });
                // socket sala de requerimientos
                const roomName = `roomRequeriment${Types_1.NameAPI.NAME + ((_f = responseUser.data) === null || _f === void 0 ? void 0 : _f.entityID)}`;
                server_1.io.to(roomName).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData),
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_g = responseUser.data) === null || _g === void 0 ? void 0 : _g.uid,
                    userId: (_h = responseUser.data) === null || _h === void 0 ? void 0 : _h.userID,
                });
            }
            //socket sala de ofertas
            const uidOffer = (_j = responseUser.res) === null || _j === void 0 ? void 0 : _j.offerUID;
            let offerData;
            if (uidOffer) {
                offerData = yield offerService_1.OfferService.GetDetailOffer(uidOffer);
            }
            const offerTransform = (0, offer_front_interface_1.transformOffersData)(offerData);
            const roomNameOffer = `roomOffer${Types_1.NameAPI.NAME + offerTransform.data[0].user}`;
            server_1.io.to(roomNameOffer).emit("updateRoom", {
                dataPack: offerTransform,
                typeSocket: Types_1.TypeSocket.UPDATE,
                key: offerTransform.data[0].key,
                userId: offerTransform.data[0].subUser,
            });
            const purchaseOrderUID = (_k = responseUser.res) === null || _k === void 0 ? void 0 : _k.purchaseOrderUID;
            if (purchaseOrderUID) {
                let purchaseOrderData = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrderID(purchaseOrderUID);
                // socket PurchaseOrderProvider
                const roomNamePurchaseOrderProvider = `roomPurchaseOrderProvider${Types_1.NameAPI.NAME + ((_l = purchaseOrderData.data) === null || _l === void 0 ? void 0 : _l[0].userProviderID)}`;
                server_1.io.to(roomNamePurchaseOrderProvider).emit("updateRoom", {
                    dataPack: purchaseOrderData,
                    typeSocket: Types_1.TypeSocket.CREATE,
                    key: (_m = purchaseOrderData.data) === null || _m === void 0 ? void 0 : _m[0].uid,
                    userId: (_o = purchaseOrderData.data) === null || _o === void 0 ? void 0 : _o[0].subUserProviderID,
                });
                //SOCKET PURCHASEORDERCLIENT
                const roomNamePurchaseOrderClient = `roomPurchaseOrderClient${Types_1.NameAPI.NAME + ((_p = purchaseOrderData.data) === null || _p === void 0 ? void 0 : _p[0].userClientID)}`;
                server_1.io.to(roomNamePurchaseOrderClient).emit("updateRoom", {
                    dataPack: purchaseOrderData,
                    typeSocket: Types_1.TypeSocket.CREATE,
                    key: (_q = purchaseOrderData.data) === null || _q === void 0 ? void 0 : _q[0].uid,
                    userId: (_r = purchaseOrderData.data) === null || _r === void 0 ? void 0 : _r[0].subUserClientID,
                });
            }
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en selectOfferController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.selectOfferController = selectOfferController;
const getbasicRateDataController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        console.log(uid);
        const responseUser = yield requerimentService_1.RequerimentService.BasicRateData(uid);
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en BasicRateDataController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getbasicRateDataController = getbasicRateDataController;
const expiredController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const responseUser = yield requerimentService_1.RequerimentService.expired();
        if (responseUser && responseUser.success) {
            const requerimentData = (_a = responseUser.res) === null || _a === void 0 ? void 0 : _a.socketData.data;
            if (requerimentData) {
                for (let i = 0; i < requerimentData.length; i++) {
                    const roonNameHome = `homeRequeriment${Types_1.NameAPI.NAME}`;
                    const dataPack = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentData[i].uid);
                    server_1.io.to(roonNameHome).emit("updateRoom", {
                        dataPack: (0, requeriment_front_Interface_1.transformData)(dataPack),
                        typeSocket: Types_1.TypeSocket.UPDATE,
                        key: requerimentData[i].uid,
                        userId: requerimentData[i].userID,
                    });
                    const roomName = `roomRequeriment${Types_1.NameAPI.NAME + ((_c = (_b = responseUser.res) === null || _b === void 0 ? void 0 : _b.socketData.data) === null || _c === void 0 ? void 0 : _c[i].entityID)}`;
                    server_1.io.to(roomName).emit("updateRoom", {
                        dataPack: (0, requeriment_front_Interface_1.transformData)(dataPack),
                        typeSocket: Types_1.TypeSocket.UPDATE,
                        key: requerimentData[i].uid,
                        userId: requerimentData[i].userID,
                    });
                }
            }
            res.status(responseUser.code).send((_d = responseUser.res) === null || _d === void 0 ? void 0 : _d.msg);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en expiredController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.expiredController = expiredController;
const deleteController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const { uid } = req.params;
        const { user } = req;
        const { uid: userID } = user;
        let requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(uid);
        if (userID !== ((_a = requerimentData.data) === null || _a === void 0 ? void 0 : _a[0].userID) &&
            userID !== ((_b = requerimentData.data) === null || _b === void 0 ? void 0 : _b[0].entityID)) {
            return res.status(403).json({
                success: false,
                code: 403,
                error: {
                    msg: "El usuario no tiene acceso",
                },
            });
        }
        const responseUser = yield requerimentService_1.RequerimentService.delete(uid);
        if (responseUser && responseUser.success) {
            //logica del Socket
            const requerimentID = responseUser.data;
            if (requerimentID) {
                requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(responseUser.data);
                const roonNameHome = `homeRequeriment${Types_1.NameAPI.NAME}`;
                server_1.io.to(roonNameHome).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData),
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: requerimentID,
                    userId: (_c = requerimentData.data) === null || _c === void 0 ? void 0 : _c[0].userID,
                });
                const roomName = `roomRequeriment${Types_1.NameAPI.NAME + ((_d = requerimentData.data) === null || _d === void 0 ? void 0 : _d[0].entityID)}`;
                server_1.io.to(roomName).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData), // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: requerimentID,
                    userId: (_e = requerimentData.data) === null || _e === void 0 ? void 0 : _e[0].userID,
                });
            }
            const offerUIDs = (_f = responseUser.res) === null || _f === void 0 ? void 0 : _f.socketData.offerUIDs;
            if (offerUIDs) {
                for (let i = 0; i < offerUIDs.length; i++) {
                    const offerData = yield offerService_1.OfferService.GetDetailOffer(offerUIDs[i]);
                    const roomName = `roomOffer${Types_1.NameAPI.NAME + ((_g = offerData.data) === null || _g === void 0 ? void 0 : _g[i].entityID)}`;
                    server_1.io.to(roomName).emit("updateRoom", {
                        dataPack: (0, offer_front_interface_1.transformOffersData)(offerData),
                        typeSocket: Types_1.TypeSocket.UPDATE,
                        key: offerUIDs[i],
                        userId: (_h = offerData.data) === null || _h === void 0 ? void 0 : _h[i].userID,
                    });
                    console.log((0, offer_front_interface_1.transformOffersData)(offerData));
                }
            }
            //fin logica del socket
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en deleteController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.deleteController = deleteController;
const republishController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const { completion_date, uid } = req.body;
        const { user } = req;
        const { uid: userID } = user;
        let requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(uid);
        if (userID !== ((_a = requerimentData.data) === null || _a === void 0 ? void 0 : _a[0].userID) &&
            userID !== ((_b = requerimentData.data) === null || _b === void 0 ? void 0 : _b[0].entityID)) {
            return res.status(403).json({
                success: false,
                code: 403,
                error: {
                    msg: "El usuario no tiene acceso",
                },
            });
        }
        const responseUser = yield requerimentService_1.RequerimentService.republish(uid, completion_date);
        if (responseUser && responseUser.success) {
            const roomNameHome = `homeRequeriment${Types_1.NameAPI.NAME}`;
            const requerimentUID = (_c = responseUser.data) === null || _c === void 0 ? void 0 : _c.uid;
            if (requerimentUID) {
                const requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentUID);
                server_1.io.to(roomNameHome).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData), // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_d = responseUser.data) === null || _d === void 0 ? void 0 : _d.uid,
                    userId: (_e = responseUser.data) === null || _e === void 0 ? void 0 : _e.userID,
                });
                const roomName = `roomRequeriment${Types_1.NameAPI.NAME + ((_f = responseUser.data) === null || _f === void 0 ? void 0 : _f.entityID)}`;
                server_1.io.to(roomName).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData), // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_g = responseUser.data) === null || _g === void 0 ? void 0 : _g.uid,
                    userId: (_h = responseUser.data) === null || _h === void 0 ? void 0 : _h.userID,
                });
            }
            const offerUIDs = (_j = responseUser.res) === null || _j === void 0 ? void 0 : _j.offerUids;
            if (offerUIDs) {
                for (let i = 0; i < offerUIDs.length; i++) {
                    const offerData = yield offerService_1.OfferService.GetDetailOffer(offerUIDs[i]);
                    const roomName = `roomOffer${Types_1.NameAPI.NAME + ((_k = offerData.data) === null || _k === void 0 ? void 0 : _k[i].entityID)}`;
                    server_1.io.to(roomName).emit("updateRoom", {
                        dataPack: (0, offer_front_interface_1.transformOffersData)(offerData),
                        typeSocket: Types_1.TypeSocket.UPDATE,
                        key: offerUIDs[i],
                        userId: (_l = offerData.data) === null || _l === void 0 ? void 0 : _l[i].userID,
                    });
                }
            }
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en republishController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.republishController = republishController;
const culminateController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    try {
        const { requerimentID, delivered, score, comments } = req.body;
        const { user } = req;
        const { uid: userID } = user;
        let requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentID);
        if (userID !== ((_a = requerimentData.data) === null || _a === void 0 ? void 0 : _a[0].userID) &&
            userID !== ((_b = requerimentData.data) === null || _b === void 0 ? void 0 : _b[0].entityID)) {
            return res.status(403).json({
                success: false,
                code: 403,
                error: {
                    msg: "El usuario no tiene acceso",
                },
            });
        }
        const responseUser = yield requerimentService_1.RequerimentService.culminate(requerimentID, delivered, score, comments);
        if (responseUser && responseUser.success) {
            // Requeriment
            const requerimentUID = (_c = responseUser.res) === null || _c === void 0 ? void 0 : _c.requerimentUID;
            if (requerimentUID) {
                requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentUID);
                const roomNameRequeriment = `roomRequeriment${Types_1.NameAPI.NAME + ((_d = requerimentData.data) === null || _d === void 0 ? void 0 : _d[0].entityID)}`;
                server_1.io.to(roomNameRequeriment).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData), // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_e = requerimentData.data) === null || _e === void 0 ? void 0 : _e[0].uid,
                    userId: (_f = requerimentData.data) === null || _f === void 0 ? void 0 : _f[0].userID,
                });
            }
            //Offer
            const offerUID = (_g = responseUser.res) === null || _g === void 0 ? void 0 : _g.offerUID;
            if (offerUID) {
                const offerData = yield offerService_1.OfferService.GetDetailOffer(offerUID);
                const roomNameOffer = `roomOffer${Types_1.NameAPI.NAME + ((_h = offerData.data) === null || _h === void 0 ? void 0 : _h[0].entityID)}`;
                server_1.io.to(roomNameOffer).emit("updateRoom", {
                    dataPack: (0, offer_front_interface_1.transformOffersData)(offerData), // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_j = offerData.data) === null || _j === void 0 ? void 0 : _j[0].uid,
                    userId: (_k = offerData.data) === null || _k === void 0 ? void 0 : _k[0].userID,
                });
            }
            const purchaseOrderUID = (_l = responseUser.res) === null || _l === void 0 ? void 0 : _l.purchaseOrderUID;
            if (purchaseOrderUID) {
                // PROVEEDOR
                const purchaseOrderData = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrderID(purchaseOrderUID);
                const roomNameProvider = `roomPurchaseOrderProvider${Types_1.NameAPI.NAME + ((_m = purchaseOrderData.data) === null || _m === void 0 ? void 0 : _m[0].userProviderID)}`;
                server_1.io.to(roomNameProvider).emit("updateRoom", {
                    dataPack: purchaseOrderData, // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_o = purchaseOrderData.data) === null || _o === void 0 ? void 0 : _o[0].uid,
                    userId: (_p = purchaseOrderData.data) === null || _p === void 0 ? void 0 : _p[0].subUserProviderID,
                });
                //CLIENT
                const roomNameClient = `roomPurchaseOrderClient${Types_1.NameAPI.NAME + ((_q = purchaseOrderData.data) === null || _q === void 0 ? void 0 : _q[0].userClientID)}`;
                server_1.io.to(roomNameClient).emit("updateRoom", {
                    dataPack: purchaseOrderData, // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_r = purchaseOrderData.data) === null || _r === void 0 ? void 0 : _r[0].uid,
                    userId: (_s = purchaseOrderData.data) === null || _s === void 0 ? void 0 : _s[0].subUserClientID,
                });
            }
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en culminateController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.culminateController = culminateController;
const canceledController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    try {
        const { requerimentID, reason } = req.body;
        const { user } = req;
        const { uid: userID } = user;
        let requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentID);
        if (userID !== ((_a = requerimentData.data) === null || _a === void 0 ? void 0 : _a[0].userID) &&
            userID !== ((_b = requerimentData.data) === null || _b === void 0 ? void 0 : _b[0].entityID)) {
            return res.status(403).json({
                success: false,
                code: 403,
                error: {
                    msg: "El usuario no tiene acceso",
                },
            });
        }
        const responseUser = yield requerimentService_1.RequerimentService.canceled(requerimentID, reason);
        if (responseUser && responseUser.success) {
            const requerimentUid = (_c = responseUser.res) === null || _c === void 0 ? void 0 : _c.requerimentUid;
            if (requerimentUid) {
                requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentUid);
                //HOME
                const roomNameHomeRequeriment = `homeRequeriment${Types_1.NameAPI.NAME}`;
                server_1.io.to(roomNameHomeRequeriment).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData), // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_d = requerimentData.data) === null || _d === void 0 ? void 0 : _d[0].uid,
                    userId: (_e = requerimentData.data) === null || _e === void 0 ? void 0 : _e[0].userID,
                });
                //SALA
                const roomNameRequeriment = `roomRequeriment${Types_1.NameAPI.NAME + ((_f = requerimentData.data) === null || _f === void 0 ? void 0 : _f[0].entityID)}`;
                server_1.io.to(roomNameRequeriment).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData), // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_g = requerimentData.data) === null || _g === void 0 ? void 0 : _g[0].uid,
                    userId: (_h = requerimentData.data) === null || _h === void 0 ? void 0 : _h[0].userID,
                });
            }
            const selecOfferUid = (_j = responseUser.res) === null || _j === void 0 ? void 0 : _j.selectOfferUid;
            if (selecOfferUid) {
                const offerData = yield offerService_1.OfferService.GetDetailOffer(selecOfferUid);
                const roomNameOffer = `roomOffer${Types_1.NameAPI.NAME + ((_k = offerData.data) === null || _k === void 0 ? void 0 : _k[0].entityID)}`;
                server_1.io.to(roomNameOffer).emit("updateRoom", {
                    dataPack: (0, offer_front_interface_1.transformOffersData)(offerData), // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_l = offerData.data) === null || _l === void 0 ? void 0 : _l[0].uid,
                    userId: (_m = offerData.data) === null || _m === void 0 ? void 0 : _m[0].userID,
                });
            }
            const purchaseOrderUID = (_o = responseUser.res) === null || _o === void 0 ? void 0 : _o.purchaseOrderUid;
            if (purchaseOrderUID) {
                // PROVEEDOR
                const purchaseOrderData = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrderID(purchaseOrderUID);
                const roomNameProvider = `roomPurchaseOrderProvider${Types_1.NameAPI.NAME + ((_p = purchaseOrderData.data) === null || _p === void 0 ? void 0 : _p[0].userProviderID)}`;
                server_1.io.to(roomNameProvider).emit("updateRoom", {
                    dataPack: purchaseOrderData, // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_q = purchaseOrderData.data) === null || _q === void 0 ? void 0 : _q[0].uid,
                    userId: (_r = purchaseOrderData.data) === null || _r === void 0 ? void 0 : _r[0].subUserProviderID,
                });
                //CLIENT
                const roomNameClient = `roomPurchaseOrderClient${Types_1.NameAPI.NAME + ((_s = purchaseOrderData.data) === null || _s === void 0 ? void 0 : _s[0].userClientID)}`;
                server_1.io.to(roomNameClient).emit("updateRoom", {
                    dataPack: purchaseOrderData, // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_t = purchaseOrderData.data) === null || _t === void 0 ? void 0 : _t[0].uid,
                    userId: (_u = purchaseOrderData.data) === null || _u === void 0 ? void 0 : _u[0].subUserClientID,
                });
            }
            const offerUids = (_v = responseUser.res) === null || _v === void 0 ? void 0 : _v.offerUids;
            if (offerUids) {
                for (let i = 0; i < offerUids.length; i++) {
                    const offerData = yield offerService_1.OfferService.GetDetailOffer(offerUids[i]);
                    const roomName = `roomOffer${Types_1.NameAPI.NAME + ((_w = offerData.data) === null || _w === void 0 ? void 0 : _w[i].entityID)}`;
                    server_1.io.to(roomName).emit("updateRoom", {
                        dataPack: (0, offer_front_interface_1.transformOffersData)(offerData),
                        typeSocket: Types_1.TypeSocket.UPDATE,
                        key: offerUids[i],
                        userId: (_x = offerData.data) === null || _x === void 0 ? void 0 : _x[i].userID,
                    });
                }
            }
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en canceledController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.canceledController = canceledController;
const searchMainFiltersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { keyWords, location, category, startDate, endDate, companyId, page, pageSize, } = req.body;
        const responseUser = yield requerimentService_1.RequerimentService.searchMainFilters(keyWords, Number(location), Number(category), startDate, endDate, companyId, Number(page), Number(pageSize));
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send((0, requeriment_front_Interface_1.transformData)(responseUser));
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en searchMainFiltersController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.searchMainFiltersController = searchMainFiltersController;
const searchProductsByUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { keyWords, userId, typeUser, page, pageSize, fieldName, orderType, filterColumn, filterData, } = req.body;
        const responseUser = yield requerimentService_1.RequerimentService.searchProductsByUser(keyWords, userId, typeUser, Number(page), Number(pageSize), fieldName, orderType, filterColumn, filterData);
        if (responseUser && responseUser.success) {
            // Si el tipo de usuario es "Company", crear una sala de Socket.IO
            if (typeUser === Types_1.TypeEntity.COMPANY || typeUser === Types_1.TypeEntity.USER) {
                const roomName = `roomRequeriment${userId}`;
                // Unir al socket a la sala (si es aplicable en este contexto)
                // Puedes enviar un evento o mensaje a todos los sockets en la sala
                // Emitir un mensaje a la sala
                server_1.io.to(roomName).emit(roomName, {
                    message: `Sala ${roomName} actualizada`,
                    dataPack: responseUser.data, // Información relevante
                });
                console.log(`Evento emitido a la sala ${roomName}`);
            }
            res.status(responseUser.code).send((0, requeriment_front_Interface_1.transformData)(responseUser));
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en searchProductsByUserController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.searchProductsByUserController = searchProductsByUserController;
//# sourceMappingURL=requerimentController.js.map