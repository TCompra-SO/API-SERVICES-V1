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
exports.OfferService = void 0;
const axios_1 = __importDefault(require("axios"));
const offerModel_1 = require("../models/offerModel");
const requerimentService_1 = require("./requerimentService");
const serviceModel_1 = __importDefault(require("../models/serviceModel"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const Types_1 = require("../utils/Types");
const purchaseOrder_1 = __importDefault(require("../models/purchaseOrder"));
const purchaseOrder_interface_1 = require("../interfaces/purchaseOrder.interface");
let API_USER = process.env.API_USER;
class OfferService {
}
exports.OfferService = OfferService;
_a = OfferService;
OfferService.CreateOffer = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g, _h;
    const { name, email, description, cityID, deliveryTimeID, currencyID, warranty, timeMeasurementID, support, budget, includesIGV, includesDelivery, requerimentID, userID, } = data;
    try {
        const result = requerimentService_1.RequerimentService.getRequerimentById(requerimentID);
        const API_USER = process.env.API_USER;
        let entityID;
        let subUserEmail = "";
        let emailEntity;
        const resultData = yield axios_1.default.get(`${API_USER}auth/getBaseDataUser/${userID}`);
        if (!resultData.data.success) {
            return {
                success: false,
                code: 403,
                error: {
                    msg: "No se ha podido encontrar la Entidad",
                },
            };
        }
        else {
            entityID = (_b = resultData.data.data[0]) === null || _b === void 0 ? void 0 : _b.uid;
            // subUserEmail = resultData.data.data[0]?.auth_users?.email;
            subUserEmail = email;
            emailEntity = (_c = resultData.data.data[0]) === null || _c === void 0 ? void 0 : _c.email;
        }
        if (entityID === ((_d = (yield result).data) === null || _d === void 0 ? void 0 : _d[0].entityID)) {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "No puedes ofertar a un requerimiento de tu Empresa",
                },
            };
        }
        const newOffer = new offerModel_1.OfferModel({
            name,
            email: emailEntity,
            subUserEmail,
            description,
            cityID,
            deliveryTimeID,
            currencyID,
            warranty,
            timeMeasurementID,
            support,
            budget,
            includesIGV,
            includesDelivery,
            requerimentID,
            userID: userID,
            entityID: entityID,
            stateID: 1,
            publishDate: new Date(),
        });
        //SEGUIR ANALIZANDO LA CREACION
        const resultOffer = yield _a.GetOfferByUser(requerimentID, userID);
        const offerUserEntity = (_e = resultData.data.data) === null || _e === void 0 ? void 0 : _e[0].uid;
        const resultOfferEntity = yield _a.GetOfferByUser(requerimentID, offerUserEntity);
        const codeResponse = (_f = (yield _a.getValidation(userID, requerimentID))
            .data) === null || _f === void 0 ? void 0 : _f.codeResponse;
        const validStates = [
            Types_1.OfferState.ACTIVE,
            Types_1.OfferState.WINNER,
            Types_1.OfferState.DISPUTE,
            Types_1.OfferState.FINISHED,
        ];
        if (codeResponse === 1) {
            return {
                success: false,
                code: 409,
                error: {
                    msg: "Ya has realizado una oferta a este requerimiento",
                },
            };
        }
        if (codeResponse === 3 || codeResponse === 7) {
            return {
                success: false,
                code: 409,
                error: {
                    msg: "Otro usuario ya ha realizado una oferta a este requerimiento",
                },
            };
        }
        else if (codeResponse === 4) {
            const savedOffer = yield newOffer.save();
            if (savedOffer) {
                const dataRequeriment = requerimentService_1.RequerimentService.getRequerimentById(requerimentID);
                if ((yield dataRequeriment).success === true) {
                    const currentOffers = (_h = (_g = (yield dataRequeriment).data) === null || _g === void 0 ? void 0 : _g[0].number_offers) !== null && _h !== void 0 ? _h : 0; // Si 'number_offers' es undefined, usa 0
                    const updateData = {
                        number_offers: currentOffers + 1,
                    };
                    requerimentService_1.RequerimentService.updateRequeriment(requerimentID, updateData);
                    requerimentService_1.RequerimentService.manageCount(entityID, userID, "numOffers" + Types_1.NameAPI.NAME + "s", true);
                }
                else {
                    return {
                        success: false,
                        code: 401,
                        error: {
                            msg: "No se ha podido encontrar el Requerimiento",
                        },
                    };
                }
            }
            else {
                return {
                    success: false,
                    code: 400,
                    error: {
                        msg: "Se ha producido un error al crear la Oferta",
                    },
                };
            }
        }
        else {
            return {
                success: false,
                code: 403,
                error: {
                    msg: "No se ha podido realizar la oferta",
                },
            };
        }
        return {
            success: true,
            code: 200,
            data: newOffer,
            res: {
                msg: "Se ha creado correctamente la Oferta",
                requerimentID: requerimentID,
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
OfferService.GetOfferByUser = (requerimentID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offer = yield offerModel_1.OfferModel.findOne({ requerimentID, userID });
        if (offer) {
            return {
                success: true,
                code: 200,
                data: offer,
            };
        }
        else {
            return {
                success: false,
                code: 404,
                message: "No se encontró ninguna oferta con los datos proporcionados.",
            };
        }
    }
    catch (error) {
        return {
            success: false,
            code: 500,
            error: {
                msg: "Ocurrió un error al intentar obtener la oferta.",
            },
        };
    }
});
OfferService.GetDetailOffer = (uid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const detailOffer = yield offerModel_1.OfferModel.aggregate([
            // Fase de coincidencia para encontrar la oferta por UID
            { $match: { uid: uid } },
            // Fase de lookup para unir la colección Requeriment
            {
                $lookup: {
                    from: "services", // Nombre de la colección de requerimientos, asegúrate de que sea correcto
                    localField: "requerimentID", // Campo de la oferta
                    foreignField: "uid", // Campo del requerimiento
                    as: "requerimentDetails", // Nombre del campo que contendrá los detalles del requerimiento
                },
            },
            // Relacionar con la colección 'profiles' usando el campo 'userID'
            {
                $lookup: {
                    from: "profiles", // Nombre de la colección de perfiles
                    localField: "userID", // Campo en la colección 'Products'
                    foreignField: "uid", // Campo en la colección 'Profiles'
                    as: "profile", // Alias del resultado
                },
            },
            // Descomponer el array de perfiles (si existe)
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            // Relacionar con la colección 'companys' usando el campo 'userID'
            {
                $lookup: {
                    from: "companys", // Nombre de la colección de compañías
                    localField: "entityID", // Campo en la colección 'Products'
                    foreignField: "uid", // Campo en la colección 'Companys'
                    as: "company", // Alias del resultado
                },
            },
            // Descomponer el array de compañías (si existe)
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
            // Relacionar con la colección 'companys' usando el campo 'userID'
            {
                $lookup: {
                    from: "users", // Nombre de la colección de compañías
                    localField: "entityID", // Campo en la colección 'Products'
                    foreignField: "uid", // Campo en la colección 'Companys'
                    as: "user", // Alias del resultado
                },
            },
            // Descomponer el array de usuarios (si existe)
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            // Fase de proyección para obtener solo los campos deseados
            {
                $project: {
                    _id: 0, // Excluir el _id de la oferta
                    uid: 1,
                    name: 1,
                    email: 1,
                    subUserEmail: 1,
                    description: 1,
                    cityID: 1,
                    deliveryTimeID: 1,
                    currencyID: 1,
                    warranty: 1,
                    timeMeasurementID: 1,
                    support: 1,
                    budget: 1,
                    includesIGV: 1,
                    includesDelivery: 1,
                    requerimentID: 1,
                    stateID: 1,
                    publishDate: 1,
                    userID: 1,
                    entityID: 1,
                    files: 1,
                    images: 1,
                    canceledByCreator: 1,
                    selectionDate: 1,
                    delivered: 1,
                    cancelRated: 1,
                    requerimentTitle: {
                        $arrayElemAt: ["$requerimentDetails.name", 0],
                    }, // Extrae el campo 'name' del primer requerimiento encontrado
                    subUserName: {
                        $ifNull: ["$profile.name", "$company.name", "$user.name"],
                    },
                    userName: {
                        $ifNull: ["$company.name", "$user.name", "$profile.name"],
                    },
                },
            },
        ]);
        // Validar si se encontró la oferta
        if (detailOffer && detailOffer.length > 0) {
            return {
                success: true,
                code: 200,
                data: detailOffer,
            };
        }
        else {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "No se encontró ninguna oferta con los datos proporcionados.",
                },
            };
        }
    }
    catch (error) {
        return {
            success: false,
            code: 500,
            error: {
                msg: "Ocurrió un error al intentar obtener la oferta.",
            },
        };
    }
});
OfferService.GetOffers = (page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!page || page < 1)
            page = 1; // Valor por defecto para la página
        if (!pageSize || pageSize < 1)
            pageSize = 10; // Valor por defecto para el tamaño de página
        const pipeline = [
            // Fase de lookup para unir la colección de productos
            {
                $lookup: {
                    from: "services", // Nombre de la colección de productos (ProductModel)
                    localField: "requerimentID", // Campo en OfferModel
                    foreignField: "uid", // Campo en ProductModel que coincide
                    as: "requerimentDetails", // Nombre del campo que contendrá los detalles del producto relacionado
                },
            },
            // Fase de proyección para obtener solo los campos deseados
            {
                $project: {
                    _id: 0, // Excluir el _id de OfferModel
                    uid: 1,
                    name: 1,
                    email: 1,
                    subUserEmail: 1,
                    description: 1,
                    cityID: 1,
                    deliveryTimeID: 1,
                    currencyID: 1,
                    warranty: 1,
                    timeMeasurementID: 1,
                    support: 1,
                    budget: 1,
                    includesIGV: 1,
                    includesDelivery: 1,
                    requerimentID: 1,
                    stateID: 1,
                    publishDate: 1,
                    userID: 1,
                    entityID: 1,
                    files: 1,
                    images: 1,
                    canceledByCreator: 1,
                    selectionDate: 1,
                    delivered: 1,
                    cancelRated: 1,
                    // Extrae el campo 'name' de `ProductModel` (en `requerimentDetails`) como `requerimentTitle`
                    requerimentTitle: {
                        $arrayElemAt: ["$requerimentDetails.name", 0],
                    },
                },
            },
        ];
        const result = yield offerModel_1.OfferModel.aggregate([
            ...pipeline,
            {
                $sort: {
                    publishDate: -1, // Orden descendente (más reciente primero)
                },
            },
            {
                $skip: (page - 1) * pageSize, // Saltar documentos según la página
            },
            {
                $limit: pageSize, // Limitar a la cantidad de documentos por página
            },
        ]);
        // Obtener el número total de documentos (sin paginación)
        const totalData = yield offerModel_1.OfferModel.aggregate(pipeline);
        const totalDocuments = totalData.length;
        if (result) {
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
        else {
            return {
                success: false,
                code: 403,
                error: {
                    msg: "No se encontraron ofertas",
                },
            };
        }
    }
    catch (error) {
        console.error("Error al obtener las ofertas:", error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Hubo un error al obtener las ofertas.",
            },
        };
    }
});
OfferService.getOffersByRequeriment = (requerimentID, page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    if (!page || page < 1)
        page = 1;
    if (!pageSize || pageSize < 1)
        pageSize = 10;
    try {
        // const result = await OfferModel.find({ requerimentID });
        const pipeline = [
            // Fase de lookup para unir la colección de productos
            {
                $match: {
                    requerimentID, // Filtra por el `requerimentID` proporcionado
                    stateID: { $ne: 7 }, // Excluye los documentos con `stateID = 7`
                },
            },
            {
                $lookup: {
                    from: "services", // Nombre de la colección de productos (ProductModel)
                    localField: "requerimentID", // Campo en OfferModel
                    foreignField: "uid", // Campo en ProductModel que coincide
                    as: "requerimentDetails", // Nombre del campo que contendrá los detalles del producto relacionado
                },
            },
            // Fase de proyección para obtener solo los campos deseados
            {
                $project: {
                    _id: 0, // Excluir el _id de OfferModel
                    uid: 1,
                    name: 1,
                    email: 1,
                    subUserEmail: 1,
                    description: 1,
                    cityID: 1,
                    deliveryTimeID: 1,
                    currencyID: 1,
                    warranty: 1,
                    timeMeasurementID: 1,
                    support: 1,
                    budget: 1,
                    includesIGV: 1,
                    includesDelivery: 1,
                    requerimentID: 1,
                    stateID: 1,
                    publishDate: 1,
                    userID: 1,
                    entityID: 1,
                    files: 1,
                    images: 1,
                    canceledByCreator: 1,
                    selectionDate: 1,
                    delivered: 1,
                    cancelRated: 1,
                    // Extrae el campo 'name' de `ProductModel` (en `requerimentDetails`) como `requerimentTitle`
                    requerimentTitle: {
                        $arrayElemAt: ["$requerimentDetails.name", 0],
                    },
                },
            },
        ];
        const result = yield offerModel_1.OfferModel.aggregate([
            ...pipeline,
            {
                $sort: {
                    publishDate: -1, // Orden descendente (más reciente primero)
                },
            },
            {
                $skip: (page - 1) * pageSize, // Saltar documentos según la página
            },
            {
                $limit: pageSize, // Limitar a la cantidad de documentos por página
            },
        ]);
        // Obtener el número total de documentos (sin paginación)
        const totalData = yield offerModel_1.OfferModel.aggregate(pipeline);
        const totalDocuments = totalData.length;
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
        console.error("Error al obtener las ofertas:", error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Hubo un error al obtener las ofertas.",
            },
        };
    }
});
OfferService.getOffersByEntity = (uid, page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!page || page < 1)
            page = 1;
        if (!pageSize || pageSize < 1)
            pageSize = 10;
        const pipeline = [
            {
                $match: {
                    entityID: uid,
                    stateID: { $ne: 7 }, // Excluye los documentos con `stateID = 7`
                },
            },
            {
                $lookup: {
                    from: "services", // Nombre de la colección de productos (ProductModel)
                    localField: "requerimentID", // Campo en OfferModel
                    foreignField: "uid", // Campo en ProductModel que coincide
                    as: "requerimentDetails", // Nombre del campo que contendrá los detalles del producto relacionado
                },
            },
            // Fase de proyección para obtener solo los campos deseados
            {
                $project: {
                    _id: 0, // Excluir el _id de OfferModel
                    uid: 1,
                    name: 1,
                    email: 1,
                    subUserEmail: 1,
                    description: 1,
                    cityID: 1,
                    deliveryTimeID: 1,
                    currencyID: 1,
                    warranty: 1,
                    timeMeasurementID: 1,
                    support: 1,
                    budget: 1,
                    includesIGV: 1,
                    includesDelivery: 1,
                    requerimentID: 1,
                    stateID: 1,
                    publishDate: 1,
                    userID: 1,
                    entityID: 1,
                    files: 1,
                    images: 1,
                    canceledByCreator: 1,
                    selectionDate: 1,
                    delivered: 1,
                    cancelRated: 1,
                    // Extrae el campo 'name' de `ProductModel` (en `requerimentDetails`) como `requerimentTitle`
                    requerimentTitle: {
                        $arrayElemAt: ["$requerimentDetails.name", 0],
                    },
                },
            },
        ];
        const result = yield offerModel_1.OfferModel.aggregate([
            ...pipeline,
            {
                $sort: {
                    publishDate: -1, // Orden descendente (más reciente primero)
                },
            },
            {
                $skip: (page - 1) * pageSize, // Saltar documentos según la página
            },
            {
                $limit: pageSize, // Limitar a la cantidad de documentos por página
            },
        ]);
        // Obtener el número total de documentos (sin paginación)
        const totalData = yield offerModel_1.OfferModel.aggregate(pipeline);
        const totalDocuments = totalData.length;
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
        console.error("Error al obtener las ofertas:", error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno en el Servidor.",
            },
        };
    }
});
OfferService.getOffersBySubUser = (uid, page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    if (!page || page < 1)
        page = 1;
    if (!pageSize || pageSize < 1)
        pageSize = 10;
    const pipeline = [
        {
            $match: {
                userID: uid,
                stateID: { $ne: 7 }, // Excluye los documentos con `stateID = 7`
            },
        },
        {
            $lookup: {
                from: "services", // Nombre de la colección de productos (ProductModel)
                localField: "requerimentID", // Campo en OfferModel
                foreignField: "uid", // Campo en ProductModel que coincide
                as: "requerimentDetails", // Nombre del campo que contendrá los detalles del producto relacionado
            },
        },
        // Fase de proyección para obtener solo los campos deseados
        {
            $project: {
                _id: 0, // Excluir el _id de OfferModel
                uid: 1,
                name: 1,
                email: 1,
                subUserEmail: 1,
                description: 1,
                cityID: 1,
                deliveryTimeID: 1,
                currencyID: 1,
                warranty: 1,
                timeMeasurementID: 1,
                support: 1,
                budget: 1,
                includesIGV: 1,
                includesDelivery: 1,
                requerimentID: 1,
                stateID: 1,
                publishDate: 1,
                userID: 1,
                entityID: 1,
                files: 1,
                images: 1,
                canceledByCreator: 1,
                selectionDate: 1,
                delivered: 1,
                cancelRated: 1,
                // Extrae el campo 'name' de `ProductModel` (en `requerimentDetails`) como `requerimentTitle`
                requerimentTitle: {
                    $arrayElemAt: ["$requerimentDetails.name", 0],
                },
            },
        },
    ];
    try {
        const result = yield offerModel_1.OfferModel.aggregate([
            ...pipeline,
            {
                $sort: {
                    publishDate: -1, // Orden descendente (más reciente primero)
                },
            },
            {
                $skip: (page - 1) * pageSize, // Saltar documentos según la página
            },
            {
                $limit: pageSize, // Limitar a la cantidad de documentos por página
            },
        ]);
        // Obtener el número total de documentos (sin paginación)
        const totalData = yield offerModel_1.OfferModel.aggregate(pipeline);
        const totalDocuments = totalData.length;
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
        console.error("Error al obtener las ofertas:", error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno en el Servidor.",
            },
        };
    }
});
OfferService.BasicRateData = (offerID) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f;
    try {
        const result = yield offerModel_1.OfferModel.aggregate([
            {
                // Match para encontrar el producto con el requerimentID
                $match: { uid: offerID },
            },
            {
                // Proyección de los campos requeridos
                $project: {
                    _id: 0,
                    uid: 1,
                    title: "$name", // Título del producto
                    userId: "$entityID", // ID del usuario en la oferta
                    userName: "", // Nombre del usuario en la oferta
                    userImage: "", // URL de imagen (asigna el campo correspondiente si existe)
                    subUserId: "$userID", // ID de la entidad
                    subUserName: "", // Nombre de la subentidad (agrega el campo si existe)
                    canceledByCreator: 1,
                },
            },
        ]);
        // Verificamos si se encontró un resultado y lo devolvemos
        if (!result || result.length === 0) {
            return {
                success: false,
                code: 403,
                error: {
                    msg: "No se ha encontrado la oferta",
                },
            };
        }
        const userBase = yield axios_1.default.get(`${API_USER}auth/getBaseDataUser/${result[0].subUserId}`);
        result[0].userImage = (_b = userBase.data.data) === null || _b === void 0 ? void 0 : _b[0].image;
        if (result[0].userId === result[0].subUserId) {
            result[0].userName = (_c = userBase.data.data) === null || _c === void 0 ? void 0 : _c[0].name;
            result[0].subUserName = (_d = userBase.data.data) === null || _d === void 0 ? void 0 : _d[0].name;
        }
        else {
            result[0].userName = (_e = userBase.data.data) === null || _e === void 0 ? void 0 : _e[0].name;
            result[0].subUserName = (_f = userBase.data.data) === null || _f === void 0 ? void 0 : _f[0].auth_users.name;
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
                msg: "Error interno con el servidor",
            },
        };
    }
});
OfferService.updateStateOffer = (offerId, state, cond) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedOffer = yield offerModel_1.OfferModel.findOneAndUpdate(Object.assign(Object.assign({}, cond), { uid: offerId }), {
            $set: {
                stateID: state,
            },
        }, { new: true });
        return updatedOffer;
    }
    catch (error) {
        throw error;
    }
});
OfferService.deleteOffer = (offerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedOffer = yield _a.updateStateOffer(offerId, Types_1.OfferState.ELIMINATED, { stateID: Types_1.OfferState.ACTIVE });
        if (!updatedOffer)
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Oferta no encontrada o estado no permite eliminar",
                },
            };
        yield requerimentService_1.RequerimentService.updateNumberOffersRequeriment(updatedOffer.requerimentID, false);
        //actualizamos contador
        yield requerimentService_1.RequerimentService.manageCount(updatedOffer.entityID, updatedOffer.userID, "numDeleteOffers" + Types_1.NameAPI.NAME + "s", true);
        //restamos
        yield requerimentService_1.RequerimentService.manageCount(updatedOffer.entityID, updatedOffer.userID, "numOffers" + Types_1.NameAPI.NAME + "s", false);
        return {
            success: true,
            code: 200,
            res: {
                msg: "Se eliminó la oferta exitosamente",
                offerID: offerId,
                requerimentID: updatedOffer.requerimentID,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            code: 500,
            error: {
                msg: "Ocurrió un error al intentar eliminar la oferta.",
            },
        };
    }
});
OfferService.culminate = (offerID, delivered, score, comments) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f;
    try {
        let offerUid;
        let requerimentUid;
        let purchaseOrderUid;
        const offerData = yield offerModel_1.OfferModel.findOne({
            uid: offerID,
        });
        if (!offerData) {
            return {
                success: false,
                code: 403,
                error: {
                    msg: "Oferta no encontrado",
                },
            };
        }
        if (offerData.stateID !== Types_1.OfferState.WINNER) {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "El estado de la Oferta no permite realizar esta acción",
                },
            };
        }
        const purchaseOrderData = yield purchaseOrder_1.default.aggregate([
            {
                $match: {
                    offerID: offerID, // Sustituye por el valor real
                },
            },
        ]);
        console.log(purchaseOrderData);
        // Corregir bien esto solo cambie CLIENT
        const requestBody = {
            typeScore: "Client", // Tipo de puntaje
            uidEntity: purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].userClientID, // ID de la empresa a ser evaluada
            uidUser: purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].userProviderID, // ID del usuario que evalua
            offerId: purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].offerID,
            score: score, // Puntaje
            comments: comments, // Comentarios
            type: purchaseOrder_interface_1.TypeRequeriment.SERVICES,
        };
        console.log(requestBody);
        try {
            const resultData = yield axios_1.default.post(`${API_USER}score/registerScore/`, requestBody);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                return {
                    success: false,
                    code: 401,
                    error: {
                        msg: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data.msg,
                    },
                };
            }
            else {
                console.error("Error desconocido:", error);
            }
        }
        const requerimentID = purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].requerimentID;
        // AQUI USAR LA FUNCION EN DISPUTA //
        if (((_c = purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].scoreState) === null || _c === void 0 ? void 0 : _c.scoreClient) &&
            ((_d = purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].scoreState) === null || _d === void 0 ? void 0 : _d.deliveredClient) !== delivered) {
            purchaseOrderUid = (yield _a.inDispute(purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].uid, purchaseOrder_1.default)).uid;
            requerimentUid = (yield _a.inDispute(requerimentID, serviceModel_1.default))
                .uid;
            offerUid = (yield _a.inDispute(offerID, offerModel_1.OfferModel)).uid;
            yield offerModel_1.OfferModel.updateOne({
                uid: offerID,
            }, {
                $set: {
                    delivered: delivered,
                },
            });
            return {
                success: true,
                code: 200,
                res: {
                    msg: "El cliente ha reportado una discrepancia, por lo tanto el estado del proceso se ha marcado como EN DISPUTA.",
                    offerUid,
                    requerimentUid,
                    purchaseOrderUid,
                },
            };
        }
        else {
            if (((_e = purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].scoreState) === null || _e === void 0 ? void 0 : _e.scoreClient) &&
                ((_f = purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].scoreState) === null || _f === void 0 ? void 0 : _f.deliveredClient) === delivered) {
                purchaseOrderUid = yield purchaseOrder_1.default.findOneAndUpdate({
                    requerimentID: requerimentID,
                    offerID: offerID,
                }, {
                    $set: {
                        "scoreState.scoreProvider": true,
                        "scoreState.deliveredProvider": delivered,
                        stateID: Types_1.PurchaseOrderState.FINISHED,
                    },
                }, { new: true } // Devuelve el documento actualizado
                );
                purchaseOrderUid = purchaseOrderUid === null || purchaseOrderUid === void 0 ? void 0 : purchaseOrderUid.uid;
            }
            else {
                purchaseOrderUid = yield purchaseOrder_1.default.findOneAndUpdate({
                    requerimentID: requerimentID,
                    offerID: offerID,
                }, {
                    $set: {
                        "scoreState.scoreProvider": true,
                        "scoreState.deliveredProvider": delivered,
                        stateID: Types_1.PurchaseOrderState.PENDING,
                    },
                }, { new: true } // Devuelve el documento actualizado
                );
                purchaseOrderUid = purchaseOrderUid === null || purchaseOrderUid === void 0 ? void 0 : purchaseOrderUid.uid;
            }
            offerUid = yield offerModel_1.OfferModel.findOneAndUpdate({
                uid: offerID,
            }, {
                $set: {
                    stateID: Types_1.OfferState.FINISHED,
                    delivered: delivered,
                },
            }, { new: true } // Retorna el documento después de la actualización
            );
            offerUid = offerUid === null || offerUid === void 0 ? void 0 : offerUid.uid;
            return {
                success: true,
                code: 200,
                res: {
                    msg: "Se ha culminado correctamente la Oferta",
                    offerUid,
                    requerimentUid,
                    purchaseOrderUid,
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
                msg: "Error interno del servidor",
            },
        };
    }
});
OfferService.inDispute = (uid, Model) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateResult = yield Model.updateOne({ uid }, { $set: { stateID: Types_1.PurchaseOrderState.DISPUTE } });
        // Verificar si se actualizó algún documento
        if (updateResult.matchedCount === 0) {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "No se encontró ninguna coincidencia para el UID proporcionado.",
                },
            };
        }
        return {
            success: true,
            code: 200,
            uid,
            res: {
                msg: "El estado se actualizó correctamente.",
            },
        };
    }
    catch (error) {
        console.error("Error en inDispute:", error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno del servidor.",
            },
        };
    }
});
OfferService.getValidation = (userID, requerimentID) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        let typeUser;
        let entityID;
        let codeResponse;
        const userData = yield axios_1.default.get(`${API_USER}auth/getBaseDataUser/${userID}`);
        if (userData.data.data[0].auth_users) {
            typeUser = userData.data.data[0].auth_users.typeEntity;
            entityID = userData.data.data[0].uid;
        }
        else {
            typeUser = userData.data.data[0].typeEntity;
            entityID = userData.data.data[0].uid;
        }
        const requerimentData = yield serviceModel_1.default.aggregate([
            {
                $match: {
                    entityID: entityID,
                    uid: requerimentID, // Reemplaza con el valor que deseas buscar
                    stateID: {
                        $nin: [Types_1.RequirementState.CANCELED, Types_1.RequirementState.ELIMINATED],
                    },
                },
            },
        ]);
        const resultData = yield offerModel_1.OfferModel.aggregate([
            {
                $match: {
                    entityID: entityID,
                    requerimentID: requerimentID, // Reemplaza con el valor que deseas buscar
                    stateID: { $nin: [5, 7] },
                },
            },
        ]);
        // se ha Modificado AQUI /////////////////////// 02/12
        const resultFilterData = yield offerModel_1.OfferModel.find({
            requerimentID: requerimentID, // Buscar por requerimentID
            entityID: entityID,
            stateID: { $nin: [5, 7] }, // Excluir stateID 5 y 7
        });
        const offerUserID = (_b = resultData[0]) === null || _b === void 0 ? void 0 : _b.userID;
        const offerEntityID = (_c = resultData[0]) === null || _c === void 0 ? void 0 : _c.entityID;
        const offerState = (_d = resultData[0]) === null || _d === void 0 ? void 0 : _d.stateID;
        const requerimentUserID = (_e = requerimentData[0]) === null || _e === void 0 ? void 0 : _e.userID;
        const requerimentEntityID = (_f = requerimentData[0]) === null || _f === void 0 ? void 0 : _f.entityID;
        const requerimentState = (_g = requerimentData[0]) === null || _g === void 0 ? void 0 : _g.stateID;
        if (resultFilterData.length > 0 || requerimentData.length > 0) {
            if (resultData.length > 0) {
                if (typeUser === Types_1.TypeEntity.SUBUSER) {
                    //VERIFICAMOS SI EL USUARIO YA HIZO UNA OFERTA AL REQUERIMIENTO
                    if (offerUserID === userID) {
                        codeResponse = 1; // EL USUARIO HACE UNA OFERTA QUE YA HIZO
                    }
                    else if (offerUserID !== userID &&
                        offerUserID === offerEntityID) {
                        codeResponse = 2; // HACE UNA OFERTA A UN REQUERIMIENTO QUE YA HA SIDO OFERTADO POR EL USUARIO PRINCIPAL DE LA EMPRESA
                    }
                    else {
                        codeResponse = 3; // HACE UNA OFERTA A UN REQUERIMIENTO QUE YA HA SIDO OFERTADO POR OTRO SUBUSUARIO DE LA EMPRESA
                    }
                }
                else if (offerUserID === userID) {
                    codeResponse = 1; // HACE UNA OFERTA QUE YA HA REALIZADO
                }
                else if (offerUserID !== userID) {
                    codeResponse = 3; // HACE UNA OFERTA A UN REQUERIMIENTO QUE YA HA SIDO OFERTADO POR OTRO SUBUSUARIO DE LA EMPRESA
                }
            }
            else {
                codeResponse = 4; /// esta entrando al 4 porque no hay offerID esta vacio
            }
            if (requerimentData.length > 0 && codeResponse === 4) {
                if (typeUser === Types_1.TypeEntity.SUBUSER) {
                    //VERIFICAMOS SI EL USUARIO INTENTA HACER UNA OFERTA A SU PROPIO REQUERIMIENTO
                    if (requerimentUserID === userID) {
                        codeResponse = 5; // El usuario intenta hacer una oferta a su propio requerimiento
                    }
                    else if (requerimentUserID !== userID &&
                        requerimentUserID === requerimentEntityID) {
                        codeResponse = 6; //El usuario intenta hacer oferta al requerimiento del Usuario Principal de su empresa
                    }
                    else {
                        codeResponse = 7; // El usuario intenta hacer una oferta al requerimiento de un subUsuario de la empresa
                    }
                }
                else if (requerimentUserID === userID) {
                    codeResponse = 5; // El usuario Principal intenta hacer una oferta a su propio requerimiento
                }
                else if (requerimentUserID !== userID) {
                    codeResponse = 7; //El usuario  intenta hacer oferta a su propio requerimiento de otro subUsuario de la empresa
                }
            }
        }
        else {
            codeResponse = 4;
        }
        return {
            success: true,
            code: 200,
            data: {
                codeResponse: codeResponse,
                offerID: (_h = resultData[0]) === null || _h === void 0 ? void 0 : _h.uid,
                requerimentID: (_j = requerimentData[0]) === null || _j === void 0 ? void 0 : _j.uid,
            },
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno del servidor.",
            },
        };
    }
});
OfferService.canceled = (offerID, reason, canceledByCreator) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const offerData = yield _a.GetDetailOffer(offerID);
        const stateID = (_b = offerData.data) === null || _b === void 0 ? void 0 : _b[0].stateID;
        const purchaseOrderData = yield purchaseOrder_1.default.findOne({
            offerID: offerID,
            stateID: Types_1.PurchaseOrderState.PENDING,
        });
        const requerimentID = purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData.requerimentID;
        if (stateID === Types_1.OfferState.CANCELED) {
            return {
                success: false,
                code: 400,
                error: {
                    msg: "La Oferta ya fue cancelada",
                },
            };
        }
        else if (stateID === Types_1.OfferState.WINNER ||
            (purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData.stateID) === Types_1.PurchaseOrderState.PENDING) {
            yield offerModel_1.OfferModel.updateOne({ uid: offerID }, // Busca el documento por el campo `uid`
            {
                $set: {
                    stateID: Types_1.OfferState.CANCELED, // Actualiza el campo `stateID`
                    canceledByCreator: canceledByCreator, // Actualiza el campo `canceledByCreator`
                },
            });
            yield purchaseOrder_1.default.updateOne({
                uid: purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData.uid,
            }, {
                $set: {
                    stateID: Types_1.PurchaseOrderState.CANCELED,
                    canceledByCreator: false,
                    reasonCancellation: reason,
                },
            });
            const result = yield serviceModel_1.default.findOneAndUpdate({ uid: requerimentID }, { $set: { stateID: Types_1.RequirementState.PUBLISHED } }, // Actualización
            { new: true });
            if (!result) {
                return {
                    success: false,
                    code: 409,
                    error: {
                        msg: "No se encontró el requerimiento para actualizar",
                    },
                };
            }
            return {
                success: true,
                code: 200,
                res: {
                    msg: "La oferta fue cancelada con éxito",
                    offerUid: offerID,
                    requerimentUid: requerimentID,
                    purchaseOrderUid: purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData.uid,
                    requirementUserUid: purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData.userProviderID,
                    requirementSubUserUid: purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData.subUserProviderID,
                },
            };
        }
        else {
            return {
                success: false,
                code: 403,
                error: {
                    msg: "No se puede cancelar la oferta",
                },
            };
        }
    }
    catch (error) {
        console.log(error);
        return {
            succes: false,
            code: 500,
            error: {
                msg: "Error interno del servidor.",
            },
        };
    }
});
OfferService.searchOffersByUser = (keyWords, userId, typeUser, page, pageSize, fieldName, orderType, filterColumn, filterData) => __awaiter(void 0, void 0, void 0, function* () {
    page = !page || page < 1 ? 1 : page;
    pageSize = !pageSize || pageSize < 1 ? 10 : pageSize;
    let total = 0;
    try {
        if (!keyWords) {
            keyWords = "";
        }
        // Parámetro fieldName con valor por defecto 'publishDate'
        fieldName = fieldName !== null && fieldName !== void 0 ? fieldName : "publishDate";
        let userType, subUserName;
        if (typeUser === Types_1.TypeEntity.COMPANY || typeUser === Types_1.TypeEntity.USER) {
            userType = "entityID";
            subUserName = "subUserName";
        }
        else {
            userType = "userID";
            subUserName = "";
        }
        let tableName;
        switch (typeUser) {
            case Types_1.TypeEntity.COMPANY:
                tableName = "companys";
                break;
            case Types_1.TypeEntity.USER:
                tableName = "users";
                break;
            default:
                tableName = "companys";
                break;
        }
        if (fieldName === "cityName") {
            fieldName = "cityID";
        }
        let order = orderType === Types_1.OrderType.ASC ? 1 : -1;
        const pipeline = [
            {
                $lookup: {
                    from: "services", // Nombre de la colección de productos (ProductModel)
                    localField: "requerimentID", // Campo en OfferModel
                    foreignField: "uid", // Campo en ProductModel que coincide
                    as: "requerimentDetails", // Nombre del campo que contendrá los detalles del producto relacionado
                },
            },
            // Relacionar con la colección 'profiles' usando el campo 'userID'
            {
                $lookup: {
                    from: "profiles", // Nombre de la colección de perfiles
                    localField: "userID", // Campo en la colección 'Products'
                    foreignField: "uid", // Campo en la colección 'Profiles'
                    as: "profile", // Alias del resultado
                },
            },
            // Descomponer el array de perfiles (si existe)
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            // Relacionar con la colección 'companys' usando el campo 'userID'
            {
                $lookup: {
                    from: tableName, // Nombre de la colección de compañías
                    localField: "entityID", // Campo en la colección 'Products'
                    foreignField: "uid", // Campo en la colección 'Companys'
                    as: "company", // Alias del resultado
                },
            },
            // Descomponer el array de compañías (si existe)
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    $and: [
                        { [userType]: userId },
                        // { stateID: { $ne: OfferState.ELIMINATED } },
                        {
                            $or: [
                                { name: { $regex: keyWords, $options: "i" } }, // Búsqueda por el nombre
                                {
                                    "requerimentDetails.name": {
                                        $regex: keyWords,
                                        $options: "i",
                                    },
                                }, // Búsqueda por requerimentTitle
                            ],
                        },
                        ...(filterColumn && filterData && filterData.length > 0
                            ? [{ [filterColumn]: { $in: filterData } }] // Campo dinámico con valores de filterData
                            : []), // Si no hay filterColumn o filterData, no añade esta condición
                    ],
                },
            },
            // Fase de proyección para obtener solo los campos deseados
            {
                $project: {
                    _id: 0, // Excluir el _id de OfferModel
                    uid: 1,
                    name: 1,
                    email: 1,
                    subUserEmail: 1,
                    description: 1,
                    cityID: 1,
                    deliveryTimeID: 1,
                    currencyID: 1,
                    warranty: 1,
                    timeMeasurementID: 1,
                    support: 1,
                    budget: 1,
                    includesIGV: 1,
                    includesDelivery: 1,
                    requerimentID: 1,
                    stateID: 1,
                    publishDate: 1,
                    userID: 1,
                    entityID: 1,
                    files: 1,
                    images: 1,
                    canceledByCreator: 1,
                    selectionDate: 1,
                    delivered: 1,
                    cancelRated: 1,
                    // Extrae el campo 'name' de `ProductModel` (en `requerimentDetails`) como `requerimentTitle`
                    requerimentTitle: {
                        $arrayElemAt: ["$requerimentDetails.name", 0],
                    },
                    subUserName: { $ifNull: ["$profile.name", "$company.name"] },
                    userName: { $ifNull: ["$company.name", "$profile.name"] },
                },
            },
        ];
        // Primero intentamos hacer la búsqueda en MongoDB
        const skip = (page - 1) * pageSize;
        let results = yield offerModel_1.OfferModel.aggregate(pipeline)
            .sort({ [fieldName]: order })
            .skip(skip)
            .limit(pageSize)
            .collation({ locale: "en", strength: 2 });
        // Si no hay resultados en MongoDB, usamos Fuse.js para hacer una búsqueda difusa
        if (keyWords && results.length === 0) {
            // Crear un nuevo pipeline sin el filtro de palabras clave ($or)
            const pipelineWithoutKeyWords = pipeline
                .map((stage) => {
                if (stage.$match && stage.$match.$and) {
                    // Filtrar las condiciones del $and eliminando únicamente las que contienen $or
                    const remainingMatchConditions = stage.$match.$and.filter((condition) => !condition.$or);
                    // Si hay condiciones restantes, devolver el nuevo $match, si no, eliminar la etapa
                    return remainingMatchConditions.length > 0
                        ? { $match: { $and: remainingMatchConditions } }
                        : null;
                }
                return stage; // Conservar las demás etapas ($lookup, $unwind, $project)
            })
                .filter((stage) => stage !== null);
            // Obtener todos los registros sin el filtro de palabras clave
            const allResults = yield offerModel_1.OfferModel.aggregate(pipelineWithoutKeyWords);
            // Configurar Fuse.js
            const fuse = new fuse_js_1.default(allResults, {
                keys: ["name", "requerimentTitle", subUserName], // Las claves por las que buscar (name y description)
                threshold: 0.4, // Define qué tan "difusa" puede ser la coincidencia
            });
            // Buscar usando Fuse.js
            results = fuse.search(keyWords).map((result) => result.item);
            // Asegurar que fieldName tenga un valor predeterminado antes de ser usado
            const sortField = fieldName !== null && fieldName !== void 0 ? fieldName : "publishDate"; // Si fieldName es undefined, usar "publish_date"
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
            // Total de resultados encontrados
            total = results.length;
            // Aplicar paginación sobre los resultados ordenados de Fuse.js
            const start = (page - 1) * pageSize;
            results = results.slice(start, start + pageSize);
        }
        else {
            // Si encontramos resultados en MongoDB, el total es la cantidad de documentos encontrados
            const resultData = yield offerModel_1.OfferModel.aggregate(pipeline);
            total = resultData.length;
        }
        return {
            success: true,
            code: 200,
            data: results,
            res: {
                totalDocuments: total,
                totalPages: Math.ceil(total / pageSize),
                currentPage: page,
                pageSize: pageSize,
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
//# sourceMappingURL=offerService.js.map