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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderService = void 0;
const axios_1 = __importDefault(require("axios"));
const purchaseOrder_interface_1 = require("../interfaces/purchaseOrder.interface");
const purchaseOrder_1 = __importDefault(require("../models/purchaseOrder"));
const offerService_1 = require("./offerService");
const initConfig_1 = require("../initConfig");
const requerimentService_1 = require("./requerimentService");
const NodeMailer_1 = require("../utils/NodeMailer");
const puppeteer_1 = __importDefault(require("puppeteer"));
const node_buffer_1 = require("node:buffer");
const OrderPurchaseTemplate_1 = require("../utils/OrderPurchaseTemplate");
const Types_1 = require("../utils/Types");
const fuse_js_1 = __importDefault(require("fuse.js"));
let API_USER = process.env.API_USER;
class PurchaseOrderService {
}
exports.PurchaseOrderService = PurchaseOrderService;
_a = PurchaseOrderService;
PurchaseOrderService.CreatePurchaseOrder = (requerimentID, offerID, price_Filter, deliveryTime_Filter, location_Filter, warranty_Filter) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
    try {
        const offerBasicData = yield offerService_1.OfferService.BasicRateData(offerID);
        const offerData = yield offerService_1.OfferService.GetDetailOffer(offerID);
        const userProviderID = (_b = (yield offerBasicData).data) === null || _b === void 0 ? void 0 : _b[0].userId;
        const subUserProviderID = (_c = (yield offerBasicData).data) === null || _c === void 0 ? void 0 : _c[0].subUserId;
        const requerimentBasicData = requerimentService_1.RequerimentService.BasicRateData(requerimentID);
        const requerimentData = requerimentService_1.RequerimentService.getRequerimentById(requerimentID);
        const userClientID = (_d = (yield requerimentBasicData).data) === null || _d === void 0 ? void 0 : _d[0].userId;
        const subUserClientID = (_e = (yield requerimentBasicData).data) === null || _e === void 0 ? void 0 : _e[0].subUserId;
        const emailUser = (_f = (yield offerData).data) === null || _f === void 0 ? void 0 : _f[0].email;
        const emailSubUser = (_g = (yield offerData).data) === null || _g === void 0 ? void 0 : _g[0].subUserEmail;
        if (requerimentID !== ((_h = (yield offerData).data) === null || _h === void 0 ? void 0 : _h[0].requerimentID)) {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "La oferta seleccionada no pertenece a este requerimiento",
                },
            };
        }
        if (((_j = (yield offerData).data) === null || _j === void 0 ? void 0 : _j[0].stateID) !== 1) {
            return {
                success: false,
                code: 401,
                error: {
                    msg: "La Oferta no puede ser seleccionada",
                },
            };
        }
        const userProviderData = yield axios_1.default.get(`${API_USER}auth/getBaseDataUser/${subUserProviderID}`);
        const basicProviderData = yield axios_1.default.get(`${API_USER}auth/getUser/${userProviderID}`);
        const baseClientData = yield axios_1.default.get(`${API_USER}auth/getUser/${userClientID}`);
        const currencyData = yield axios_1.default.get(`${API_USER}util/utilData/currency`);
        const currencyId = (_k = (yield requerimentData).data) === null || _k === void 0 ? void 0 : _k[0].currencyID; // Cambia este valor al ID que deseas buscar
        const currencyValue = (_l = currencyData.data.currencies.find((currency) => currency.id === currencyId)) === null || _l === void 0 ? void 0 : _l.alias;
        const daysDeliveryData = yield axios_1.default.get(`${API_USER}util/utilData/delivery_time`);
        const deliveryTimeID = (_m = (yield offerData).data) === null || _m === void 0 ? void 0 : _m[0].deliveryTimeID;
        let days = 0;
        let deliveryDate;
        if (deliveryTimeID !== 6) {
            deliveryDate = new Date();
            days = (_o = daysDeliveryData.data.times.find((days) => days.id === deliveryTimeID)) === null || _o === void 0 ? void 0 : _o.days;
            deliveryDate.setDate(deliveryDate.getDate() + days);
        }
        else {
            deliveryDate = null;
        }
        if (!(yield offerBasicData).success) {
            return {
                success: false,
                code: 403,
                error: {
                    msg: "No se encontro la Oferta",
                },
            };
        }
        let price = (_p = (yield offerData).data) === null || _p === void 0 ? void 0 : _p[0].budget;
        let subTotal = price;
        let total, totalIgv;
        if (!((_q = (yield offerData).data) === null || _q === void 0 ? void 0 : _q[0].includesIGV)) {
            totalIgv = (((_r = (yield offerData).data) === null || _r === void 0 ? void 0 : _r[0].budget) * initConfig_1.igv) / 100;
            totalIgv = parseFloat(totalIgv.toFixed(2));
            total = subTotal + totalIgv;
        }
        else {
            subTotal = price / (1 + initConfig_1.igv / 100);
            subTotal = parseFloat(subTotal.toFixed(2));
            totalIgv = parseFloat((price - subTotal).toFixed(2));
            total = price;
        }
        const newPurchaseOrder = {
            type: purchaseOrder_interface_1.TypeRequeriment.SERVICES,
            userClientID: userClientID,
            userNameClient: (_s = (yield requerimentBasicData).data) === null || _s === void 0 ? void 0 : _s[0].userName,
            addressClient: (_t = (yield baseClientData).data.data) === null || _t === void 0 ? void 0 : _t.address,
            documentClient: (_u = (yield baseClientData).data.data) === null || _u === void 0 ? void 0 : _u.document,
            emailClient: (_v = (yield requerimentData).data) === null || _v === void 0 ? void 0 : _v[0].email,
            subUserClientID: subUserClientID,
            subUserClientEmail: (_w = (yield requerimentData).data) === null || _w === void 0 ? void 0 : _w[0].subUserEmail,
            nameSubUserClient: (_x = (yield requerimentBasicData).data) === null || _x === void 0 ? void 0 : _x[0].subUserName,
            createDate: new Date(),
            deliveryDate: deliveryDate,
            requerimentID: requerimentID,
            requerimentTitle: (_y = (yield offerData).data) === null || _y === void 0 ? void 0 : _y[0].requerimentTitle,
            currency: currencyValue,
            price: price,
            subtotal: subTotal,
            totaligv: totalIgv,
            total: total,
            igv: initConfig_1.igv,
            userProviderID: userProviderID,
            nameUserProvider: (_z = (yield offerBasicData).data) === null || _z === void 0 ? void 0 : _z[0].userName,
            subUserProviderID: subUserProviderID,
            nameSubUserProvider: (_0 = (yield offerBasicData).data) === null || _0 === void 0 ? void 0 : _0[0].subUserName,
            subUserEmailProvider: (_1 = (yield offerData).data) === null || _1 === void 0 ? void 0 : _1[0].subUserEmail,
            addressProvider: (_2 = (yield basicProviderData).data.data) === null || _2 === void 0 ? void 0 : _2.address,
            documentProvider: (_3 = (yield userProviderData).data.data) === null || _3 === void 0 ? void 0 : _3[0].document,
            emailProvider: (_4 = (yield offerData).data) === null || _4 === void 0 ? void 0 : _4[0].email,
            stateID: purchaseOrder_interface_1.PurchaseOrderState.PENDING,
            offerID: (_5 = (yield offerData).data) === null || _5 === void 0 ? void 0 : _5[0].uid,
            offerTitle: (_6 = (yield offerData).data) === null || _6 === void 0 ? void 0 : _6[0].name,
            price_Filter,
            deliveryTime_Filter,
            location_Filter,
            warranty_Filter,
            scoreState: {
                scoreClient: false,
                scoreProvider: false,
                deliveredClient: false,
                deliveredProvider: false,
            },
        };
        const CreateOrder = new purchaseOrder_1.default(newPurchaseOrder);
        const uidPurchaseOrder = yield CreateOrder.save();
        yield requerimentService_1.RequerimentService.manageCount(userProviderID, subUserProviderID, "numPurchaseOrdersProvider", true);
        yield requerimentService_1.RequerimentService.manageCount(userClientID, subUserClientID, "numPurchaseOrdersClient", true);
        // const sendMail = sendEmailPurchaseOrder(newPurchaseOrder);
        let responseEmail = "";
        /*  if ((await sendMail).success) {
          responseEmail = "Orden de Compra enviada al Email correctamente";
        } else {
          responseEmail = "No se ha podido enviar la Orden al Correo";
        }*/
        // Inicia el envío del correo en segundo plano
        if (emailUser) {
            (0, NodeMailer_1.sendEmailPurchaseOrder)(newPurchaseOrder, emailUser)
                .then((result) => {
                if (result.success) {
                    responseEmail = "Orden de Compra enviada al Email correctamente";
                }
                else {
                    responseEmail = "No se ha podido enviar la Orden al Correo";
                }
            })
                .catch((error) => {
                console.error("Error al enviar el correo:", error);
            });
        }
        if (emailSubUser && emailSubUser !== emailUser) {
            (0, NodeMailer_1.sendEmailPurchaseOrder)(newPurchaseOrder, emailSubUser)
                .then((result) => {
                if (result.success) {
                    responseEmail = "Orden de Compra enviada al Email correctamente";
                }
                else {
                    responseEmail = "No se ha podido enviar la Orden al Correo";
                }
            })
                .catch((error) => {
                console.error("Error al enviar el correo:", error);
            });
        }
        return {
            success: true,
            code: 200,
            res: {
                msg: "Se ha creaqdo correctamente la orden de Compra",
                uidPurchaseOrder: uidPurchaseOrder.uid,
                responseEmail: responseEmail,
            },
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno en el Servidor, no se ha podido Crear la Orden de Compra",
            },
        };
    }
});
PurchaseOrderService.getPurchaseOrders = (page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    if (!page || page < 1)
        page = 1;
    if (!pageSize || pageSize < 1)
        pageSize = 10;
    try {
        const result = yield purchaseOrder_1.default.find()
            .sort({ createDate: -1 })
            .skip((page - 1) * pageSize) // Omitir documentos según la página
            .limit(pageSize); // Limitar el número de documentos por página;
        const totalDocuments = yield purchaseOrder_1.default.countDocuments();
        return {
            success: true,
            code: 200,
            data: result,
            res: {
                totalDocuments,
                totalPages: Math.ceil(totalDocuments / pageSize),
                currentPage: page,
                pageSize,
            },
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno con el Servidor",
            },
        };
    }
});
PurchaseOrderService.getPurchaseOrdersClient = (userClientID, page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    if (!page || page < 1)
        page = 1;
    if (!pageSize || pageSize < 1)
        pageSize = 10;
    try {
        const result = yield purchaseOrder_1.default.find({ userClientID })
            .sort({ createDate: -1 })
            .skip((page - 1) * pageSize) // Omitir documentos según la página
            .limit(pageSize); // Limitar el número de documentos por página;;
        const totalDocuments = (yield purchaseOrder_1.default.find({ userClientID }))
            .length;
        return {
            success: true,
            code: 200,
            data: result,
            res: {
                totalDocuments,
                totalPages: Math.ceil(totalDocuments / pageSize),
                currentPage: page,
                pageSize,
            },
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                res: "Se ha producido un error interno en el Servidor",
            },
        };
    }
});
PurchaseOrderService.getPurchaseOrdersProvider = (userProviderID, page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    if (!page || page < 1)
        page = 1;
    if (!pageSize || pageSize < 1)
        pageSize = 10;
    try {
        const result = yield purchaseOrder_1.default.find({ userProviderID })
            .sort({ createDate: -1 })
            .skip((page - 1) * pageSize) // Omitir documentos según la página
            .limit(pageSize); // Limitar el número de documentos por página;
        const totalDocuments = (yield purchaseOrder_1.default.find({ userProviderID }))
            .length;
        return {
            success: true,
            code: 200,
            data: result,
            res: {
                totalDocuments,
                totalPages: Math.ceil(totalDocuments / pageSize),
                currentPage: page,
                pageSize,
            },
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                res: "Se ha producido un error interno en el Servidor",
            },
        };
    }
});
PurchaseOrderService.getPurchaseOrderID = (uid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield purchaseOrder_1.default.aggregate([
            { $match: { uid } }, // Filtra por UID
            { $limit: 1 }, // Asegura que solo se devuelva un resultado (opcional)
        ]);
        if (result.length === 0) {
            return {
                success: false,
                code: 403,
                error: {
                    msg: "Orden de Compra no encontrada",
                },
            };
        }
        return {
            success: true,
            code: 200,
            data: result,
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno en el Servidor",
            },
        };
    }
});
PurchaseOrderService.getPurchaseOrdersByEntityProvider = (uid, typeUser, page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    if (!page || page < 1)
        page = 1;
    if (!pageSize || pageSize < 1)
        pageSize = 10;
    try {
        let result;
        let totalDocuments;
        if (Types_1.TypeUser.ADMIN === typeUser) {
            result = yield purchaseOrder_1.default.find({ userProviderID: uid })
                .sort({ createDate: -1 })
                .skip((page - 1) * pageSize) // Omitir documentos según la página
                .limit(pageSize); // Limitar el número de documentos por página
            totalDocuments = (yield purchaseOrder_1.default.find({ userProviderID: uid })).length;
        }
        else {
            result = yield purchaseOrder_1.default.find({
                subUserProviderID: uid,
            })
                .sort({ createDate: -1 })
                .skip((page - 1) * pageSize) // Omitir documentos según la página
                .limit(pageSize); // Limitar el número de documentos por página
            totalDocuments = (yield purchaseOrder_1.default.find({ subUserProviderID: uid })).length;
        }
        return {
            success: true,
            code: 200,
            data: result,
            res: {
                totalDocuments,
                totalPages: Math.ceil(totalDocuments / pageSize),
                currentPage: page,
                pageSize,
            },
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno en el Servidor",
            },
        };
    }
});
PurchaseOrderService.getPurchaseOrdersByEntityClient = (uid, typeUser, page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let result;
        let totalDocuments;
        if (Types_1.TypeUser.ADMIN === typeUser) {
            result = yield purchaseOrder_1.default.find({
                userClientID: uid,
            })
                .sort({ createDate: -1 })
                .skip((page - 1) * pageSize) // Omitir documentos según la página
                .limit(pageSize); // Limitar el número de documentos por página;
            totalDocuments = (yield purchaseOrder_1.default.find({ userClientID: uid }))
                .length;
        }
        else {
            result = yield purchaseOrder_1.default.find({
                subUserClientID: uid,
            })
                .sort({ createDate: -1 })
                .skip((page - 1) * pageSize) // Omitir documentos según la página
                .limit(pageSize); // Limitar el número de documentos por página;
            totalDocuments = (yield purchaseOrder_1.default.find({ subUserClientID: uid })).length;
        }
        return {
            success: true,
            code: 200,
            data: result,
            res: {
                totalDocuments,
                totalPages: Math.ceil(totalDocuments / pageSize),
                currentPage: page,
                pageSize,
            },
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno en el Servidor",
            },
        };
    }
});
PurchaseOrderService.searchPurchaseOrderByProvider = (keyWords, typeUser, userId, page, pageSize, fieldName, orderType, filterColumn, filterData) => __awaiter(void 0, void 0, void 0, function* () {
    page = !page || page < 1 ? 1 : page;
    pageSize = !pageSize || pageSize < 1 ? 10 : pageSize;
    let total = 0;
    try {
        if (!keyWords) {
            keyWords = "";
        }
        let fieldUserName, fieldSubUserName;
        if (Types_1.TypeEntity.COMPANY === typeUser || Types_1.TypeEntity.USER === typeUser) {
            fieldUserName = "userProviderID";
            fieldSubUserName = "nameSubUserProvider";
        }
        else {
            fieldUserName = "subUserProviderID";
            fieldSubUserName = "";
        }
        if (!fieldName) {
            fieldName = "createDate";
        }
        let order;
        if (!orderType || orderType === Types_1.OrderType.DESC) {
            order = -1;
        }
        else {
            order = 1;
        }
        const searchConditions = {
            $and: [
                {
                    $or: [
                        { requerimentTitle: { $regex: keyWords, $options: "i" } },
                        { offerTitle: { $regex: keyWords, $options: "i" } },
                        { userNameClient: { $regex: keyWords, $options: "i" } },
                        { [fieldSubUserName]: { $regex: keyWords, $options: "i" } },
                    ],
                },
                { [fieldUserName]: userId },
                //   { stateID: { $ne: PurchaseOrderState.ELIMINATED } }, // Excluye los documentos con stateID igual a 7
                ...(filterColumn && filterData && filterData.length > 0
                    ? [{ [filterColumn]: { $in: filterData } }] // Campo dinámico con valores de filterData
                    : []), // Si no hay filterColumn o filterData, no añade esta condición
            ],
        };
        // Primero intentamos hacer la búsqueda en MongoDB
        const skip = (page - 1) * pageSize;
        let results = yield purchaseOrder_1.default.find(searchConditions)
            .sort({ [fieldName]: order })
            .skip(skip)
            .limit(pageSize)
            .collation({ locale: "en", strength: 2 });
        // COREGIR
        if (keyWords && results.length === 0) {
            // Crear una copia del array $and sin la condición $or
            const searchConditionsWithoutKeyWords = Object.assign(Object.assign({}, searchConditions), { $and: searchConditions.$and.filter((condition) => !condition.$or) });
            // Obtener todos los registros sin aplicar el filtro de palabras clave
            const allResults = yield purchaseOrder_1.default.find(searchConditionsWithoutKeyWords);
            purchaseOrder_interface_1.PurchaseOrderState;
            // Configurar Fuse.js
            const fuse = new fuse_js_1.default(allResults, {
                keys: [
                    "requerimentTitle",
                    "offerTitle",
                    "userNameClient",
                    fieldSubUserName,
                ], // Las claves por las que buscar (name y description)
                threshold: 0.4, // Define qué tan "difusa" puede ser la coincidencia (0 es exacto, 1 es muy permisivo)
            });
            // Buscar usando Fuse.js
            results = fuse.search(keyWords).map((result) => result.item);
            const sortField = fieldName !== null && fieldName !== void 0 ? fieldName : "createDate"; // Si fieldName es undefined, usar "publish_date"
            // Ordenar los resultados por el campo dinámico sortField
            results.sort((a, b) => {
                const valueA = a[sortField];
                const valueB = b[sortField];
                if (typeof valueA === "string" && typeof valueB === "string") {
                    // Usar localeCompare para comparar cadenas ignorando mayúsculas, minúsculas y acentos
                    return (valueA.localeCompare(valueB, undefined, {
                        sensitivity: "base",
                    }) * (orderType === Types_1.OrderType.ASC ? 1 : -1));
                }
                if (valueA > valueB)
                    return orderType === Types_1.OrderType.ASC ? 1 : -1;
                if (valueA < valueB)
                    return orderType === Types_1.OrderType.ASC ? -1 : 1;
                return 0; // Si son iguales, no cambiar el orden
            });
            // Total de resultados (count usando Fuse.js)
            total = results.length;
            // Aplicar paginación sobre los resultados ordenados de Fuse.js
            const start = (page - 1) * pageSize;
            results = results.slice(start, start + pageSize);
        }
        else {
            // Si encontramos resultados en MongoDB, el total es la cantidad de documentos encontrados
            total = yield purchaseOrder_1.default.countDocuments(searchConditions);
        }
        return {
            success: true,
            code: 200,
            data: results,
            res: {
                totalDocuments: total,
                totalPages: Math.ceil(total / pageSize),
                currentPage: page,
                pageSize,
            },
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno en el Servidor",
            },
        };
    }
});
PurchaseOrderService.searchPurchaseOrderByClient = (keyWords, typeUser, userId, page, pageSize, fieldName, orderType, filterColumn, filterData) => __awaiter(void 0, void 0, void 0, function* () {
    page = !page || page < 1 ? 1 : page;
    pageSize = !pageSize || pageSize < 1 ? 10 : pageSize;
    let total = 0;
    try {
        if (!keyWords) {
            keyWords = "";
        }
        let fieldUserName, fieldSubUserName;
        if (Types_1.TypeEntity.COMPANY === typeUser || Types_1.TypeEntity.USER === typeUser) {
            fieldUserName = "userClientID";
            fieldSubUserName = "nameSubUserClient";
        }
        else {
            fieldUserName = "subUserClientID";
            fieldSubUserName = "";
        }
        if (!fieldName) {
            fieldName = "createDate";
        }
        let order;
        if (!orderType || orderType === Types_1.OrderType.DESC) {
            order = -1;
        }
        else {
            order = 1;
        }
        const searchConditions = {
            $and: [
                {
                    $or: [
                        { requerimentTitle: { $regex: keyWords, $options: "i" } }, // Reemplazamos name por requirementTitle
                        { offerTitle: { $regex: keyWords, $options: "i" } },
                        { nameUserProvider: { $regex: keyWords, $options: "i" } },
                        { [fieldSubUserName]: { $regex: keyWords, $options: "i" } },
                    ],
                },
                { [fieldUserName]: userId },
                //   { stateID: { $ne: PurchaseOrderState.ELIMINATED } }, // Excluye los documentos con stateID igual a 7
                // { stateID: { $ne: PurchaseOrderState.ELIMINATED } }, // Excluye los documentos con stateID igual a 7
                ...(filterColumn && filterData && filterData.length > 0
                    ? [{ [filterColumn]: { $in: filterData } }] // Campo dinámico con valores de filterData
                    : []), // Si no hay filterColumn o filterData, no añade esta condición
            ],
        };
        // Primero intentamos hacer la búsqueda en MongoDB
        const skip = (page - 1) * pageSize;
        let results = yield purchaseOrder_1.default.find(searchConditions)
            .sort({ [fieldName]: order })
            .skip(skip)
            .limit(pageSize)
            .collation({ locale: "en", strength: 2 });
        if (keyWords && results.length === 0) {
            // Crear una copia del array $and sin la condición $or
            const searchConditionsWithoutKeyWords = Object.assign(Object.assign({}, searchConditions), { $and: searchConditions.$and.filter((condition) => !condition.$or) });
            // Obtener todos los registros sin aplicar el filtro de palabras clave
            const allResults = yield purchaseOrder_1.default.find(searchConditionsWithoutKeyWords);
            // Configurar Fuse.js
            const fuse = new fuse_js_1.default(allResults, {
                keys: [
                    "requerimentTitle",
                    "offerTitle",
                    "nameUserProvider",
                    fieldSubUserName,
                ], // Las claves por las que buscar (name y description)
                threshold: 0.4, // Define qué tan "difusa" puede ser la coincidencia (0 es exacto, 1 es muy permisivo)
            });
            // Buscar usando Fuse.js
            results = fuse.search(keyWords).map((result) => result.item);
            const sortField = fieldName !== null && fieldName !== void 0 ? fieldName : "createDate"; // Si fieldName es undefined, usar "publish_date"
            // Ordenar los resultados por el campo dinámico sortField
            results.sort((a, b) => {
                const valueA = a[sortField];
                const valueB = b[sortField];
                if (typeof valueA === "string" && typeof valueB === "string") {
                    // Usar localeCompare para comparar cadenas ignorando mayúsculas, minúsculas y acentos
                    return (valueA.localeCompare(valueB, undefined, {
                        sensitivity: "base",
                    }) * (orderType === Types_1.OrderType.ASC ? 1 : -1));
                }
                if (valueA > valueB)
                    return orderType === Types_1.OrderType.ASC ? 1 : -1;
                if (valueA < valueB)
                    return orderType === Types_1.OrderType.ASC ? -1 : 1;
                return 0; // Si son iguales, no cambiar el orden
            });
            // Total de resultados (count usando Fuse.js)
            total = results.length;
            // Aplicar paginación sobre los resultados ordenados de Fuse.js
            const start = (page - 1) * pageSize;
            results = results.slice(start, start + pageSize);
        }
        else {
            // Si encontramos resultados en MongoDB, el total es la cantidad de documentos encontrados
            total = yield purchaseOrder_1.default.countDocuments(searchConditions);
        }
        return {
            success: true,
            code: 200,
            data: results,
            res: {
                totalDocuments: total,
                totalPages: Math.ceil(total / pageSize),
                currentPage: page,
                pageSize,
            },
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno en el Servidor",
            },
        };
    }
});
PurchaseOrderService.createPDF = (htmlContent) => __awaiter(void 0, void 0, void 0, function* () {
    // Iniciar el navegador de Puppeteer
    //const browser = await puppeteer.launch();
    const browser = yield puppeteer_1.default.launch({
        args: ["--no-sandbox"], // Deshabilitar sandbox
    });
    const page = yield browser.newPage();
    let pdfBuffer;
    // Establecer el contenido HTML
    yield page.setContent(htmlContent, { waitUntil: "networkidle0" });
    // Generar el PDF como Buffer (con formato A4)
    /*  pdfBuffer = (await page.pdf({
      format: "A4",
      printBackground: true,
    })) as Buffer;
*/
    pdfBuffer = node_buffer_1.Buffer.from(yield page.pdf({
        format: "A4",
        printBackground: true,
    }));
    // Cerrar el navegador
    yield browser.close();
    // Retornar el buffer del PDF
    return pdfBuffer;
});
PurchaseOrderService.getPurchaseOrderPDF = (uid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield _a.getPurchaseOrderID(uid);
        if (data && data.success && data.data) {
            const html = yield (0, OrderPurchaseTemplate_1.OrderPurchaseTemplate)(data.data[0]);
            // Genera el PDF a partir de la plantilla HTML
            const pdfBuffer = yield _a.createPDF(html);
            // Convierte el PDF a base64
            const pdfBase64 = pdfBuffer.toString("base64");
            return {
                success: true,
                code: 200,
                data: pdfBase64,
            };
        }
        else {
            return {
                success: false,
                code: 403,
                error: {
                    msg: "No se ha encontrado la Orden de Compra",
                },
            };
        }
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error al generar el PDF",
            },
        };
    }
});
PurchaseOrderService.canceled = (purchaseOrderID) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const purchaseOrderData = yield _a.getPurchaseOrderID(purchaseOrderID);
        if (((_b = purchaseOrderData.data) === null || _b === void 0 ? void 0 : _b[0].stateID) === purchaseOrder_interface_1.PurchaseOrderState.PENDING) {
            console.log((_c = purchaseOrderData.data) === null || _c === void 0 ? void 0 : _c[0].stateID);
        }
        return {
            success: true,
            code: 200,
            data: purchaseOrderData,
            res: {
                message: "La Orden de Compra ha sido cancelada con éxito",
            },
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno en el Servidor",
            },
        };
    }
});
//# sourceMappingURL=purchaseOrderService.js.map