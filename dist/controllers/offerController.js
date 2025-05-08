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
exports.searchOffersByUserController = exports.canceledController = exports.getValidationController = exports.culminateController = exports.deleteController = exports.GetOffersBySubUserController = exports.GetOffersByEntityController = exports.getbasicRateDataController = exports.GetOffersByRequerimentController = exports.GetOffersController = exports.GetDetailOfferController = exports.CreateOfferController = void 0;
const offerService_1 = require("../services/offerService");
const offer_front_interface_1 = require("../middlewares/offer.front.interface");
const server_1 = require("../server");
const Types_1 = require("../utils/Types");
const requerimentService_1 = require("../services/requerimentService");
const requeriment_front_Interface_1 = require("../middlewares/requeriment.front.Interface");
const purchaseOrderService_1 = require("../services/purchaseOrderService");
const CreateOfferController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
        const responseUser = yield offerService_1.OfferService.CreateOffer(body);
        if (responseUser.success) {
            const uid = (_a = responseUser.data) === null || _a === void 0 ? void 0 : _a.uid;
            if (uid) {
                const offerData = yield offerService_1.OfferService.GetDetailOffer(uid);
                const typeSocket = Types_1.TypeSocket.CREATE;
                const roomNameHome = `roomOffer${Types_1.NameAPI.NAME + ((_b = offerData.data) === null || _b === void 0 ? void 0 : _b[0].entityID)}`;
                server_1.io.to(roomNameHome).emit("updateRoom", {
                    dataPack: (0, offer_front_interface_1.transformOffersData)(offerData),
                    typeSocket: typeSocket,
                    key: (_c = offerData.data) === null || _c === void 0 ? void 0 : _c[0].uid,
                    userId: (_d = offerData.data) === null || _d === void 0 ? void 0 : _d[0].userID,
                });
                // enviamos a la sala de usuarios
                const requerimentUid = (_e = responseUser.res) === null || _e === void 0 ? void 0 : _e.requerimentID;
                if (requerimentUid) {
                    const requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentUid);
                    const roomName = `roomRequeriment${Types_1.NameAPI.NAME + ((_f = requerimentData.data) === null || _f === void 0 ? void 0 : _f[0].entityID)}`;
                    server_1.io.to(roomName).emit("updateRoom", {
                        dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData),
                        typeSocket: Types_1.TypeSocket.UPDATE,
                        key: (_g = requerimentData.data) === null || _g === void 0 ? void 0 : _g[0].uid,
                        userId: (_h = requerimentData.data) === null || _h === void 0 ? void 0 : _h[0].userID,
                    });
                    //enviamos al home
                    const roomNameHome = `homeRequeriment${Types_1.NameAPI.NAME}`;
                    server_1.io.to(roomNameHome).emit("updateRoom", {
                        dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData),
                        typeSocket: Types_1.TypeSocket.UPDATE,
                        key: (_j = requerimentData.data) === null || _j === void 0 ? void 0 : _j[0].uid,
                        userId: (_k = requerimentData.data) === null || _k === void 0 ? void 0 : _k[0].userID,
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
        console.error("Error en CreateOfferController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.CreateOfferController = CreateOfferController;
const GetDetailOfferController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const responseUser = yield offerService_1.OfferService.GetDetailOffer(uid);
        if (responseUser.success) {
            res.status(responseUser.code).send((0, offer_front_interface_1.transformOffersData)(responseUser));
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en GetDatailOfferController");
        res.status(500).send({
            success: false,
            msg: "Error interno en el servidor",
        });
    }
});
exports.GetDetailOfferController = GetDetailOfferController;
const GetOffersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, pageSize } = req.params;
        const responseUser = yield offerService_1.OfferService.GetOffers(Number(page), Number(pageSize));
        if (responseUser && responseUser.success) {
            if (responseUser.data) {
                res.status(responseUser.code).send((0, offer_front_interface_1.transformOffersData)(responseUser));
            }
            else {
                // Si 'data' es undefined, puedes devolver un mensaje de error o manejarlo como prefieras
                res.status(404).send({
                    success: false,
                    msg: "No se encontraron requerimientos",
                });
            }
        }
    }
    catch (error) {
        console.error("Error en GetOffersController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno en el servidor",
        });
    }
});
exports.GetOffersController = GetOffersController;
const GetOffersByEntityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, page, pageSize } = req.params;
    try {
        const responseUser = yield offerService_1.OfferService.getOffersByEntity(uid, Number(page), Number(pageSize));
        if (responseUser && responseUser.success) {
            if (responseUser.data) {
                res.status(responseUser.code).send((0, offer_front_interface_1.transformOffersData)(responseUser));
            }
            else {
                // Si 'data' es undefined, puedes devolver un mensaje de error o manejarlo como prefieras
                res.status(404).send({
                    success: false,
                    msg: "No se encontraron requerimientos",
                });
            }
        }
    }
    catch (error) {
        console.error("Error en GetOffersByEntityController");
        res.status(500).send({
            success: false,
            msg: "Error interno en el servidor",
        });
    }
});
exports.GetOffersByEntityController = GetOffersByEntityController;
const GetOffersBySubUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, page, pageSize } = req.params;
    try {
        const responseUser = yield offerService_1.OfferService.getOffersBySubUser(uid, Number(page), Number(pageSize));
        if (responseUser && responseUser.success) {
            if (responseUser.data) {
                res.status(responseUser.code).send((0, offer_front_interface_1.transformOffersData)(responseUser));
            }
            else {
                // Si 'data' es undefined, puedes devolver un mensaje de error o manejarlo como prefieras
                res.status(404).send({
                    success: false,
                    msg: "No se encontraron requerimientos",
                });
            }
        }
    }
    catch (error) {
        console.error("Error en GetOffersBySubUserController");
        res.status(500).send({
            success: false,
            msg: "Error interno en el servidor",
        });
    }
});
exports.GetOffersBySubUserController = GetOffersBySubUserController;
const GetOffersByRequerimentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requerimentID, page, pageSize } = req.params;
        const responseUser = yield offerService_1.OfferService.getOffersByRequeriment(requerimentID, Number(page), Number(pageSize));
        if (responseUser && responseUser.success) {
            if (responseUser.data) {
                res.status(responseUser.code).send((0, offer_front_interface_1.transformOffersData)(responseUser));
            }
            else {
                // Si 'data' es undefined, puedes devolver un mensaje de error o manejarlo como prefieras
                res.status(404).send({
                    success: false,
                    msg: "No se encontraron requerimientos",
                });
            }
        }
    }
    catch (error) {
        console.error("Error en GetOffersByRequerimentController");
        res.status(500).send({
            success: false,
            msg: "Error interno en el servidor",
        });
    }
});
exports.GetOffersByRequerimentController = GetOffersByRequerimentController;
const getbasicRateDataController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        console.log(uid);
        const responseUser = yield offerService_1.OfferService.BasicRateData(uid);
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
const deleteController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    try {
        const { uid: offerID } = req.params;
        let offerData = yield offerService_1.OfferService.GetDetailOffer(offerID);
        const { user } = req; // Extraemos `user` y `body` de la request
        const { uid: userUID } = user; // Obtenemos `uid` del usuario autenticado
        if (userUID !== ((_a = offerData.data) === null || _a === void 0 ? void 0 : _a[0].userID) &&
            userUID !== ((_b = offerData.data) === null || _b === void 0 ? void 0 : _b[0].entityID)) {
            return res.status(403).json({
                success: false,
                code: 403,
                error: {
                    msg: "El usuario no tiene acceso",
                },
            });
        }
        //LOGICA DE LOS SOCKETS
        const responseUser = yield offerService_1.OfferService.deleteOffer(offerID);
        if (responseUser && responseUser.success) {
            const offerUid = (_c = responseUser.res) === null || _c === void 0 ? void 0 : _c.offerID;
            if (offerUid) {
                offerData = yield offerService_1.OfferService.GetDetailOffer(offerUid);
                const typeSocket = Types_1.TypeSocket.UPDATE;
                const roomNameHome = `roomOffer${Types_1.NameAPI.NAME + ((_d = offerData.data) === null || _d === void 0 ? void 0 : _d[0].entityID)}`;
                server_1.io.to(roomNameHome).emit("updateRoom", {
                    dataPack: (0, offer_front_interface_1.transformOffersData)(offerData),
                    typeSocket: typeSocket,
                    key: (_e = offerData.data) === null || _e === void 0 ? void 0 : _e[0].uid,
                    userId: (_f = offerData.data) === null || _f === void 0 ? void 0 : _f[0].userID,
                });
                const requerimentUid = (_g = responseUser.res) === null || _g === void 0 ? void 0 : _g.requerimentID;
                if (requerimentUid) {
                    // enviamos a la sala de usuarios
                    const requerimenData = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentUid);
                    const roomName = `roomRequeriment${Types_1.NameAPI.NAME + ((_h = requerimenData.data) === null || _h === void 0 ? void 0 : _h[0].entityID)}`;
                    server_1.io.to(roomName).emit("updateRoom", {
                        dataPack: (0, requeriment_front_Interface_1.transformData)(requerimenData),
                        typeSocket: typeSocket,
                        key: (_j = requerimenData.data) === null || _j === void 0 ? void 0 : _j[0].uid,
                        userId: (_k = requerimenData.data) === null || _k === void 0 ? void 0 : _k[0].userID,
                    });
                    //home
                    const roomNameHome = `homeRequeriment${Types_1.NameAPI.NAME}`;
                    server_1.io.to(roomNameHome).emit("updateRoom", {
                        dataPack: (0, requeriment_front_Interface_1.transformData)(requerimenData),
                        typeSocket: typeSocket,
                        key: (_l = requerimenData.data) === null || _l === void 0 ? void 0 : _l[0].uid,
                        userId: (_m = requerimenData.data) === null || _m === void 0 ? void 0 : _m[0].userID,
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
        console.error("Error en deleteController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.deleteController = deleteController;
const culminateController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    try {
        const { offerID, delivered, score, comments } = req.body;
        let offerData = yield offerService_1.OfferService.GetDetailOffer(offerID);
        const { user } = req; // Extraemos `user` y `body` de la request
        const { uid: userUID } = user; // Obtenemos `uid` del usuario autenticado
        if (userUID !== ((_a = offerData.data) === null || _a === void 0 ? void 0 : _a[0].userID) &&
            userUID !== ((_b = offerData.data) === null || _b === void 0 ? void 0 : _b[0].entityID)) {
            return res.status(403).json({
                success: false,
                code: 403,
                error: {
                    msg: "El usuario no tiene acceso",
                },
            });
        }
        const responseUser = yield offerService_1.OfferService.culminate(offerID, delivered, score, comments);
        if (responseUser && responseUser.success) {
            const typeSocket = Types_1.TypeSocket.UPDATE;
            const offerUid = (_c = responseUser.res) === null || _c === void 0 ? void 0 : _c.offerUid;
            // socket ofertas
            if (offerUid) {
                const offerData = yield offerService_1.OfferService.GetDetailOffer(offerUid);
                const roomNameHome = `roomOffer${Types_1.NameAPI.NAME + ((_d = offerData.data) === null || _d === void 0 ? void 0 : _d[0].entityID)}`;
                server_1.io.to(roomNameHome).emit("updateRoom", {
                    dataPack: (0, offer_front_interface_1.transformOffersData)(offerData),
                    typeSocket: typeSocket,
                    key: (_e = offerData.data) === null || _e === void 0 ? void 0 : _e[0].uid,
                    userId: (_f = offerData.data) === null || _f === void 0 ? void 0 : _f[0].userID,
                });
            }
            //socket requerimientos
            const requerimentUid = (_g = responseUser.res) === null || _g === void 0 ? void 0 : _g.requerimentUid;
            if (requerimentUid) {
                const requerimenData = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentUid);
                const roomName = `roomRequeriment${Types_1.NameAPI.NAME + ((_h = requerimenData.data) === null || _h === void 0 ? void 0 : _h[0].entityID)}`;
                server_1.io.to(roomName).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimenData),
                    typeSocket: typeSocket,
                    key: (_j = requerimenData.data) === null || _j === void 0 ? void 0 : _j[0].uid,
                    userId: (_k = requerimenData.data) === null || _k === void 0 ? void 0 : _k[0].userID,
                });
            }
            //socket Ordenes de Compra
            const purchaseOderUid = (_l = responseUser.res) === null || _l === void 0 ? void 0 : _l.purchaseOrderUid;
            if (purchaseOderUid) {
                const purchaseOrderData = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrderID(purchaseOderUid);
                //Proveedor
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
const getValidationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID, requerimentID } = req.params;
        const responseUser = yield offerService_1.OfferService.getValidation(userID, requerimentID);
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en getValidationController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.getValidationController = getValidationController;
const canceledController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    try {
        const { offerID, reason, canceledByCreator } = req.body;
        let offerData = yield offerService_1.OfferService.GetDetailOffer(offerID);
        const { user } = req; // Extraemos `user` y `body` de la request
        const { uid: userUID } = user; // Obtenemos `uid` del usuario autenticado
        let requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById((_a = offerData.data) === null || _a === void 0 ? void 0 : _a[0].requerimentID);
        if (userUID !== ((_b = offerData.data) === null || _b === void 0 ? void 0 : _b[0].userID) &&
            userUID !== ((_c = offerData.data) === null || _c === void 0 ? void 0 : _c[0].entityID) &&
            userUID !== ((_d = requerimentData.data) === null || _d === void 0 ? void 0 : _d[0].userID) &&
            userUID !== ((_e = requerimentData.data) === null || _e === void 0 ? void 0 : _e[0].entityID)) {
            return res.status(403).json({
                success: false,
                code: 403,
                error: {
                    msg: "El usuario no tiene acceso",
                },
            });
        }
        const responseUser = yield offerService_1.OfferService.canceled(offerID, reason, canceledByCreator);
        const typeSocket = Types_1.TypeSocket.UPDATE;
        if (responseUser && responseUser.success) {
            const offerUid = (_f = responseUser.res) === null || _f === void 0 ? void 0 : _f.offerUid;
            //Socket Offer
            if (offerUid) {
                const offerData = yield offerService_1.OfferService.GetDetailOffer(offerUid);
                const roomNameHome = `roomOffer${Types_1.NameAPI.NAME + ((_g = offerData.data) === null || _g === void 0 ? void 0 : _g[0].entityID)}`;
                server_1.io.to(roomNameHome).emit("updateRoom", {
                    dataPack: (0, offer_front_interface_1.transformOffersData)(offerData),
                    typeSocket: typeSocket,
                    key: (_h = offerData.data) === null || _h === void 0 ? void 0 : _h[0].uid,
                    userId: (_j = offerData.data) === null || _j === void 0 ? void 0 : _j[0].userID,
                });
            }
            //socket requerimientos
            const requerimentUid = (_k = responseUser.res) === null || _k === void 0 ? void 0 : _k.requerimentUid;
            if (requerimentUid) {
                requerimentData = yield requerimentService_1.RequerimentService.getRequerimentById(requerimentUid);
                const roomName = `roomRequeriment${Types_1.NameAPI.NAME + ((_l = requerimentData.data) === null || _l === void 0 ? void 0 : _l[0].entityID)}`;
                server_1.io.to(roomName).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData),
                    typeSocket: typeSocket,
                    key: (_m = requerimentData.data) === null || _m === void 0 ? void 0 : _m[0].uid,
                    userId: (_o = requerimentData.data) === null || _o === void 0 ? void 0 : _o[0].userID,
                });
                //home
                const roomNameHome = `homeRequeriment${Types_1.NameAPI.NAME}`;
                server_1.io.to(roomNameHome).emit("updateRoom", {
                    dataPack: (0, requeriment_front_Interface_1.transformData)(requerimentData),
                    typeSocket: typeSocket,
                    key: (_p = requerimentData.data) === null || _p === void 0 ? void 0 : _p[0].uid,
                    userId: (_q = requerimentData.data) === null || _q === void 0 ? void 0 : _q[0].userID,
                });
            }
            //socket Ordenes de Compra
            const purchaseOderUid = (_r = responseUser.res) === null || _r === void 0 ? void 0 : _r.purchaseOrderUid;
            if (purchaseOderUid) {
                const purchaseOrderData = yield purchaseOrderService_1.PurchaseOrderService.getPurchaseOrderID(purchaseOderUid);
                //Proveedor
                const roomNameProvider = `roomPurchaseOrderProvider${Types_1.NameAPI.NAME + ((_s = purchaseOrderData.data) === null || _s === void 0 ? void 0 : _s[0].userProviderID)}`;
                server_1.io.to(roomNameProvider).emit("updateRoom", {
                    dataPack: purchaseOrderData, // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_t = purchaseOrderData.data) === null || _t === void 0 ? void 0 : _t[0].uid,
                    userId: (_u = purchaseOrderData.data) === null || _u === void 0 ? void 0 : _u[0].subUserProviderID,
                });
                //CLIENT
                const roomNameClient = `roomPurchaseOrderClient${Types_1.NameAPI.NAME + ((_v = purchaseOrderData.data) === null || _v === void 0 ? void 0 : _v[0].userClientID)}`;
                server_1.io.to(roomNameClient).emit("updateRoom", {
                    dataPack: purchaseOrderData, // Información relevante
                    typeSocket: Types_1.TypeSocket.UPDATE,
                    key: (_w = purchaseOrderData.data) === null || _w === void 0 ? void 0 : _w[0].uid,
                    userId: (_x = purchaseOrderData.data) === null || _x === void 0 ? void 0 : _x[0].subUserClientID,
                });
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
const searchOffersByUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { keyWords, userId, typeUser, page, pageSize, fieldName, orderType, filterColumn, filterData, } = req.body;
        const responseUser = yield offerService_1.OfferService.searchOffersByUser(keyWords, userId, typeUser, Number(page), Number(pageSize), fieldName, Number(orderType), filterColumn, filterData);
        if (responseUser && responseUser.success) {
            res.status(responseUser.code).send((0, offer_front_interface_1.transformOffersData)(responseUser));
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.error("Error en searchOffersByUserController", error);
        res.status(500).send({
            success: false,
            msg: "Error interno del Servidor",
        });
    }
});
exports.searchOffersByUserController = searchOffersByUserController;
//# sourceMappingURL=offerController.js.map