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
exports.RequerimentService = void 0;
const serviceModel_1 = __importDefault(require("../models/serviceModel"));
const axios_1 = __importDefault(require("axios"));
const offerService_1 = require("./offerService");
const offerModel_1 = require("../models/offerModel");
const purchaseOrderService_1 = require("./purchaseOrderService");
const fuse_js_1 = __importDefault(require("fuse.js"));
const Types_1 = require("../utils/Types");
const purchaseOrder_1 = __importDefault(require("../models/purchaseOrder"));
const mongoose_1 = __importDefault(require("mongoose"));
const Types_2 = require("../utils/Types");
const Countries_1 = require("../utils/Countries");
const purchaseOrder_interface_1 = require("../interfaces/purchaseOrder.interface");
const CounterManager_1 = require("../utils/CounterManager");
let API_USER = process.env.API_USER;
class RequerimentService {
}
exports.RequerimentService = RequerimentService;
_a = RequerimentService;
RequerimentService.CreateRequeriment = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    const { name, description, categoryID, cityID, budget, currencyID, payment_methodID, completion_date, submission_dateID, warranty, durationID, allowed_bidersID, userID, } = data;
    try {
        let entityID = "";
        let email = "";
        const API_USER = process.env.API_USER;
        const resultData = yield axios_1.default.get(`${API_USER}auth/getBaseDataUser/${userID}`);
        let subUserEmail = "";
        let subUserName = "";
        if (resultData.data.success === false) {
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
            email = (_c = resultData.data.data[0]) === null || _c === void 0 ? void 0 : _c.email;
            subUserEmail = (_e = (_d = resultData.data.data[0]) === null || _d === void 0 ? void 0 : _d.auth_users) === null || _e === void 0 ? void 0 : _e.email;
        }
        const newRequeriment = new serviceModel_1.default({
            name,
            description,
            categoryID,
            cityID,
            budget,
            currencyID,
            payment_methodID,
            completion_date,
            submission_dateID,
            warranty,
            durationID,
            allowed_bidersID,
            userID,
            subUserEmail,
            entityID,
            email,
            publish_date: new Date(),
            number_offers: 0,
            stateID: 1,
        });
        const savedRequeriment = yield newRequeriment.save();
        if (!savedRequeriment) {
            return {
                success: false,
                code: 403,
                error: {
                    msg: "Se ha producido un error al crear el Requerimiento",
                },
            };
        }
        yield _a.manageCount(entityID, userID, "num" + Types_1.NameAPI.NAME + "s", true);
        return {
            success: true,
            code: 200,
            data: newRequeriment,
            res: {
                msg: "Se ha creado correctamente el requerimiento",
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
////////////////////////FALTA PROBAR AQUI
RequerimentService.manageCount = (entityID, userID, field, increase) => __awaiter(void 0, void 0, void 0, function* () {
    const ResourceCountersCollection = mongoose_1.default.connection.collection("resourcecounters");
    const UserMasterCollection = mongoose_1.default.connection.collection("usermasters");
    const CompanyModel = mongoose_1.default.connection.collection("companys");
    try {
        const CompanyData = yield CompanyModel.findOne({ uid: userID });
        const userMasterData = yield UserMasterCollection.findOne({
            role: Types_2.TypeEntity.MASTER,
        });
        // Define si incrementa (+1) o decrementa (-1)
        const value = increase ? 1 : -1;
        // Función para actualizar el contador
        const updateCounter = (uid, typeEntity) => __awaiter(void 0, void 0, void 0, function* () {
            yield ResourceCountersCollection.updateOne({ uid, typeEntity }, { $inc: { [field]: value }, $set: { updateDate: new Date() } }, { upsert: true });
        });
        if (entityID !== userID) {
            yield updateCounter(userID, Types_2.TypeEntity.SUBUSER); // Subusuario
            yield updateCounter(entityID, Types_2.TypeEntity.COMPANY); // Compañía
            (0, CounterManager_1.queueUpdate)(entityID, userID, field, value);
        }
        else if (CompanyData) {
            yield updateCounter(entityID, Types_2.TypeEntity.COMPANY); // Compañía
        }
        else {
            yield updateCounter(entityID, Types_2.TypeEntity.USER); // Usuario
        }
        // Actualiza el contador del usuario MASTER si existe
        if (userMasterData === null || userMasterData === void 0 ? void 0 : userMasterData.uid) {
            yield updateCounter(userMasterData.uid, Types_2.TypeEntity.MASTER);
        }
    }
    catch (error) {
        console.error("Error en manageCount:", error.message);
        return {
            success: false,
            error: error.message,
        };
    }
});
RequerimentService.getRequeriments = (page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requeriments = yield serviceModel_1.default.aggregate([
            {
                $lookup: {
                    from: "offersservices", // Nombre de la colección de las ofertas, ajusta según tu modelo
                    localField: "winOffer.uid", // Campo de la colección de requerimientos
                    foreignField: "uid", // Campo de la colección de ofertas
                    as: "winOffer", // Alias para los resultados relacionados
                },
            },
            {
                $unwind: {
                    // Si hay más de un resultado, los aplanamos
                    path: "$winOffer",
                    preserveNullAndEmptyArrays: true, // Para mantener los requerimientos sin una oferta ganadora
                },
            },
            {
                $match: {
                    // Filtrar documentos donde stateID = 1
                    stateID: 1,
                },
            },
            {
                $project: {
                    // Proyectamos los campos que queremos mostrar
                    uid: 1,
                    name: 1,
                    description: 1,
                    categoryID: 1,
                    cityID: 1,
                    budget: 1,
                    currencyID: 1,
                    payment_methodID: 1,
                    completion_date: 1,
                    submission_dateID: 1,
                    warranty: 1,
                    durationID: 1,
                    allowed_bidersID: 1,
                    entityID: 1,
                    userID: 1,
                    email: 1,
                    subUserEmail: 1,
                    publish_date: 1,
                    stateID: 1,
                    number_offers: 1,
                    images: 1,
                    files: 1,
                    winOffer: {
                        uid: 1,
                        userID: 1,
                        entityID: 1,
                    },
                },
            },
            {
                $sort: {
                    publish_date: -1, // Orden descendente (más reciente primero)
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
        const totalDocuments = yield serviceModel_1.default.countDocuments({ stateID: 1 });
        if (!requeriments) {
            return {
                success: false,
                code: 403,
                res: {
                    msg: "Ha ocurrido un error al listar los Requerimientos",
                },
            };
        }
        return {
            success: true,
            code: 200,
            data: requeriments,
            res: {
                totalDocuments,
                totalPages: Math.ceil(totalDocuments / pageSize),
                currentPage: page,
                pageSize,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno en el Servidor",
            },
        };
    }
});
RequerimentService.getRequerimentById = (uid) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requeriment = yield serviceModel_1.default.aggregate([
            // Buscar el requerimiento por su uid
            {
                $match: {
                    uid: uid,
                },
            },
            // Relacionar la colección 'OffersProducts' (ofertas) con la colección de requerimientos (Products)
            {
                $lookup: {
                    from: "offersservices", // Nombre de la colección de ofertas
                    localField: "winOffer.uid", // El campo en los requerimientos (Products) que relacionamos (winOffer.uid)
                    foreignField: "uid", // El campo en las ofertas (Offers) con el que se relaciona (uid de la oferta)
                    as: "winOffer", // El alias para la relación, esto almacenará la oferta ganadora relacionada
                },
            },
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
            // Opcionalmente, puedes agregar un paso $unwind si solo quieres una única oferta ganadora
            {
                $unwind: {
                    path: "$winOffer", // Esto descompone el array de ofertas ganadoras
                    preserveNullAndEmptyArrays: true, // Mantiene el documento aún si no hay oferta ganadora
                },
            },
            // Proyección de los campos que deseas devolver (todos los campos del requerimiento)
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    categoryID: 1,
                    cityID: 1,
                    budget: 1,
                    currencyID: 1,
                    payment_methodID: 1,
                    completion_date: 1,
                    submission_dateID: 1,
                    warranty: 1,
                    durationID: 1,
                    allowed_bidersID: 1,
                    entityID: 1,
                    subUserEmail: 1,
                    userID: 1,
                    email: 1,
                    publish_date: 1,
                    stateID: 1,
                    uid: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    number_offers: 1,
                    images: 1,
                    files: 1,
                    winOffer: {
                        uid: 1,
                        userID: 1,
                        entityID: 1,
                    }, // Aquí incluimos todos los campos de la oferta ganadora
                    subUserName: {
                        $ifNull: ["$profile.name", "$company.name", "$user.name"],
                    },
                    userName: {
                        $ifNull: ["$company.name", "$user.name", "$profile.name"],
                    },
                },
            },
        ]);
        if (requeriment.length === 0) {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "No se ha encontrado el requerimiento con el ID proporcionado",
                },
            };
        }
        return {
            success: true,
            code: 200,
            data: requeriment,
        };
    }
    catch (error) {
        console.error(error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno en el Servidor",
            },
        };
    }
});
RequerimentService.getRequerimentsByEntity = (uid, page, pageSize, fieldName, orderType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!page || page < 1)
            page = 1; // Valor por defecto para la página
        if (!pageSize || pageSize < 1)
            pageSize = 10; // Valor por defecto para el tamaño de página
        if (!fieldName) {
            fieldName = "publish_date"; // Valor por defecto para el campo de ordenación
        }
        let order;
        if (!orderType || orderType === Types_1.OrderType.DESC) {
            order = -1;
        }
        else {
            order = 1;
        }
        const pipeline = [
            // Buscar el requerimiento por su userID
            {
                $match: {
                    entityID: uid,
                    stateID: { $ne: 7 }, // Excluir documentos donde stateID = 7
                },
            },
            // Relacionar la colección 'OffersProducts' (ofertas) con la colección de requerimientos (Products)
            {
                $lookup: {
                    from: "offersservices", // Nombre de la colección de ofertas
                    localField: "winOffer.uid", // El campo en los requerimientos (Products) que relacionamos (winOffer.uid)
                    foreignField: "uid", // El campo en las ofertas (Offers) con el que se relaciona (uid de la oferta)
                    as: "winOffer", // El alias para la relación, esto almacenará la oferta ganadora relacionada
                },
            },
            // Opcionalmente, puedes agregar un paso $unwind si solo quieres una única oferta ganadora
            {
                $unwind: {
                    path: "$winOffer", // Esto descompone el array de ofertas ganadoras
                    preserveNullAndEmptyArrays: true, // Mantiene el documento aún si no hay oferta ganadora
                },
            },
            // Relacionar la colección 'OffersProducts' (ofertas) con la colección de requerimientos (Products)
            {
                $lookup: {
                    from: "profiles", // Nombre de la colección de ofertas
                    localField: "userID", // El campo en los requerimientos (Products) que relacionamos (winOffer.uid)
                    foreignField: "uid", // El campo en las ofertas (Offers) con el que se relaciona (uid de la oferta)
                    as: "profile", // El alias para la relación, esto almacenará la oferta ganadora relacionada
                },
            },
            // Opcionalmente, puedes agregar un paso $unwind si solo quieres una única oferta ganadora
            {
                $unwind: {
                    path: "$profile", // Esto descompone el array de ofertas ganadoras
                    preserveNullAndEmptyArrays: true, // Mantiene el documento aún si no hay oferta ganadora
                },
            },
            // Relacionar la colección 'OffersProducts' (ofertas) con la colección de requerimientos (Products)
            {
                $lookup: {
                    from: "companys", // Nombre de la colección de ofertas
                    localField: "userID", // El campo en los requerimientos (Products) que relacionamos (winOffer.uid)
                    foreignField: "uid", // El campo en las ofertas (Offers) con el que se relaciona (uid de la oferta)
                    as: "company", // El alias para la relación, esto almacenará la oferta ganadora relacionada
                },
            },
            // Opcionalmente, puedes agregar un paso $unwind si solo quieres una única oferta ganadora
            {
                $unwind: {
                    path: "$company", // Esto descompone el array de ofertas ganadoras
                    preserveNullAndEmptyArrays: true, // Mantiene el documento aún si no hay oferta ganadora
                },
            },
            // Proyección de los campos que deseas devolver (todos los campos del requerimiento)
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    categoryID: 1,
                    cityID: 1,
                    budget: 1,
                    currencyID: 1,
                    payment_methodID: 1,
                    completion_date: 1,
                    submission_dateID: 1,
                    warranty: 1,
                    duration: 1,
                    allowed_bidersID: 1,
                    entityID: 1,
                    subUserEmail: 1,
                    userID: 1,
                    email: 1,
                    publish_date: 1,
                    stateID: 1,
                    uid: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    number_offers: 1,
                    images: 1,
                    files: 1,
                    winOffer: {
                        uid: 1,
                        userID: 1,
                        entityID: 1,
                    }, // Aquí incluimos todos los campos de la oferta ganadora
                    userName: { $ifNull: ["$profile.name", "$company.name"] },
                },
            },
        ];
        const result = yield serviceModel_1.default.aggregate([
            ...pipeline,
            {
                $sort: {
                    [fieldName]: order, // Orden descendente (más reciente primero)
                },
            },
            {
                $skip: (page - 1) * pageSize, // Saltar documentos según la página
            },
            {
                $limit: pageSize, // Limitar a la cantidad de documentos por página
            },
        ]).collation({ locale: "en", strength: 2 });
        // Asociar la ciudad al resultado
        const resultWithCities = result.map((item) => {
            // Buscar el país que contiene la ciudad con el cityID
            const country = Countries_1.countries.find((country) => country.cities.some((city) => city.id === item.cityID));
            // Si se encuentra el país, buscar la ciudad
            if (country) {
                const city = country.cities.find((city) => city.id === item.cityID);
                item.cityName = city ? city.value : null; // Agregar el nombre de la ciudad
            }
            else {
                item.cityName = null;
            }
            return item;
        });
        let resultData;
        if (fieldName === "cityID") {
            // Ordenamos el arreglo según 'cityName' basado en el valor de `order`
            resultData = resultWithCities.sort((a, b) => {
                var _b, _c;
                // Normalizamos las cadenas para asegurarnos de que las comparaciones sean correctas
                const cityA = ((_b = a.cityName) === null || _b === void 0 ? void 0 : _b.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) || ""; // Normaliza y elimina tildes
                const cityB = ((_c = b.cityName) === null || _c === void 0 ? void 0 : _c.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) || ""; // Normaliza y elimina tildes
                // Compara las ciudades con `localeCompare` para tratar los acentos correctamente
                const comparison = cityA.localeCompare(cityB);
                // Si `order` es 1 (ascendente), utilizamos la comparación tal cual, si es -1 (descendente) la invertimos
                return order === 1 ? comparison : -comparison;
            });
        }
        else {
            resultData = resultWithCities;
        }
        //  console.log(sortedResult);
        // Obtener el número total de documentos (sin paginación)
        const totalData = yield serviceModel_1.default.aggregate(pipeline);
        const totalDocuments = totalData.length;
        return {
            success: true,
            code: 200,
            data: resultWithCities,
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
            error: { msg: "Error interno en el Servidor" },
        };
    }
});
RequerimentService.getRequerimentsbySubUser = (uid, page, pageSize, fieldName, orderType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!page || page < 1)
            page = 1; // Valor por defecto para la página
        if (!pageSize || pageSize < 1)
            pageSize = 10; // Valor por defecto para el tamaño de página
        if (!fieldName) {
            fieldName = "publish_date"; // Valor por defecto para el campo de ordenación
        }
        let order;
        if (!orderType || orderType === Types_1.OrderType.DESC) {
            order = -1;
        }
        else {
            order = 1;
        }
        const pipeline = [
            // Buscar el requerimiento por su userid
            {
                $match: {
                    userID: uid,
                    stateID: { $ne: 7 }, // Excluir documentos donde stateID = 7
                },
            },
            // Relacionar la colección 'OffersProducts' (ofertas) con la colección de requerimientos (Products)
            {
                $lookup: {
                    from: "offersservices", // Nombre de la colección de ofertas
                    localField: "winOffer.uid", // El campo en los requerimientos (Products) que relacionamos (winOffer.uid)
                    foreignField: "uid", // El campo en las ofertas (Offers) con el que se relaciona (uid de la oferta)
                    as: "winOffer", // El alias para la relación, esto almacenará la oferta ganadora relacionada
                },
            },
            // Opcionalmente, puedes agregar un paso $unwind si solo quieres una única oferta ganadora
            {
                $unwind: {
                    path: "$winOffer", // Esto descompone el array de ofertas ganadoras
                    preserveNullAndEmptyArrays: true, // Mantiene el documento aún si no hay oferta ganadora
                },
            },
            // Proyección de los campos que deseas devolver (todos los campos del requerimiento)
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    categoryID: 1,
                    cityID: 1,
                    budget: 1,
                    currencyID: 1,
                    payment_methodID: 1,
                    completion_date: 1,
                    submission_dateID: 1,
                    warranty: 1,
                    duration: 1,
                    allowed_bidersID: 1,
                    entityID: 1,
                    subUserEmail: 1,
                    userID: 1,
                    email: 1,
                    publish_date: 1,
                    stateID: 1,
                    uid: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    number_offers: 1,
                    images: 1,
                    files: 1,
                    winOffer: {
                        uid: 1,
                        userID: 1,
                        entityID: 1,
                    }, // Aquí incluimos todos los campos de la oferta ganadora
                },
            },
        ];
        const result = yield serviceModel_1.default.aggregate([
            ...pipeline,
            {
                $sort: {
                    [fieldName]: order, // Orden descendente (más reciente primero)
                },
            },
            {
                $skip: (page - 1) * pageSize, // Saltar documentos según la página
            },
            {
                $limit: pageSize, // Limitar a la cantidad de documentos por página
            },
        ]).collation({ locale: "en", strength: 2 });
        const resultWithCities = result.map((item) => {
            // Buscar el país que contiene la ciudad con el cityID
            const country = Countries_1.countries.find((country) => country.cities.some((city) => city.id === item.cityID));
            // Si se encuentra el país, buscar la ciudad
            if (country) {
                const city = country.cities.find((city) => city.id === item.cityID);
                item.cityName = city ? city.value : null; // Agregar el nombre de la ciudad
            }
            else {
                item.cityName = null;
            }
            return item;
        });
        let resultData;
        if (fieldName === "cityID") {
            // Ordenamos el arreglo según 'cityName' basado en el valor de `order`
            resultData = resultWithCities.sort((a, b) => {
                var _b, _c;
                // Normalizamos las cadenas para asegurarnos de que las comparaciones sean correctas
                const cityA = ((_b = a.cityName) === null || _b === void 0 ? void 0 : _b.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) || ""; // Normaliza y elimina tildes
                const cityB = ((_c = b.cityName) === null || _c === void 0 ? void 0 : _c.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) || ""; // Normaliza y elimina tildes
                // Compara las ciudades con `localeCompare` para tratar los acentos correctamente
                const comparison = cityA.localeCompare(cityB);
                // Si `order` es 1 (ascendente), utilizamos la comparación tal cual, si es -1 (descendente) la invertimos
                return order === 1 ? comparison : -comparison;
            });
        }
        else {
            resultData = resultWithCities;
        }
        // Obtener el número total de documentos (sin paginación)
        const totalData = yield serviceModel_1.default.aggregate(pipeline);
        const totalDocuments = totalData.length;
        return {
            success: true,
            code: 200,
            data: resultData,
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
            error: { msg: "Error interno en el Servidor" },
        };
    }
});
RequerimentService.updateRequeriment = (uid, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Buscar y actualizar el requerimiento por su UID
        const updatedRequeriment = yield serviceModel_1.default.findOneAndUpdate({ uid }, Object.assign(Object.assign({}, data), { updated_at: new Date() }), { new: true } // Retorna el documento actualizado
        );
        // Si no se encuentra el requerimiento o no se puede actualizar
        if (!updatedRequeriment) {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "No se ha encontrado el requerimiento",
                },
            };
        }
        // Si la actualización fue exitosa
        return {
            success: true,
            code: 200,
            res: {
                msg: "El requerimiento ha sido actualizado correctamente",
                data: updatedRequeriment,
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
RequerimentService.selectOffer = (requerimentID, offerID, observation, price_Filter, deliveryTime_Filter, location_Filter, warranty_Filter) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    try {
        const requerimentData = _a.getRequerimentById(requerimentID);
        if (!(yield requerimentData).success ||
            ((_b = (yield requerimentData).data) === null || _b === void 0 ? void 0 : _b.length) == 0) {
            return {
                success: false,
                code: 400,
                error: {
                    msg: "El requerimiento seleccionado no existe",
                },
            };
        }
        const stateID = (_c = (yield requerimentData).data) === null || _c === void 0 ? void 0 : _c[0].stateID;
        switch (stateID) {
            case 1:
                const offerData = offerService_1.OfferService.GetDetailOffer(offerID);
                const stateOffer = (_d = (yield offerData).data) === null || _d === void 0 ? void 0 : _d[0].stateID;
                if (stateOffer !== 1) {
                    return {
                        success: false,
                        code: 401,
                        error: {
                            msg: "El estado de la Oferta no permite ser seleccionada",
                        },
                    };
                }
                if ((yield offerData).success) {
                    const updatedProduct = yield serviceModel_1.default.findOneAndUpdate({ uid: requerimentID }, {
                        $set: {
                            winOffer: { uid: offerID, observation },
                            stateID: 2,
                        },
                    }, { new: true } // Devolver el documento actualizado
                    );
                    if (!updatedProduct) {
                        return {
                            success: false,
                            code: 403,
                            error: {
                                msg: "No se encontró el Requerimiento",
                            },
                        };
                    }
                    const purchaseOrder = yield purchaseOrderService_1.PurchaseOrderService.CreatePurchaseOrder(requerimentID, offerID, price_Filter, deliveryTime_Filter, location_Filter, warranty_Filter);
                    if (!purchaseOrder.success) {
                        yield serviceModel_1.default.findOneAndUpdate({ uid: requerimentID }, {
                            $set: {
                                winOffer: "",
                                stateID: 1,
                            },
                        }, { new: true } // Devolver el documento actualizado
                        );
                        return {
                            success: false,
                            code: 409,
                            error: {
                                msg: purchaseOrder.error,
                            },
                        };
                    }
                    const updatedOffer = yield offerModel_1.OfferModel.findOneAndUpdate({ uid: offerID }, {
                        $set: {
                            stateID: 2,
                            selectionDate: new Date(),
                        },
                    }, { new: true });
                    if (!updatedOffer) {
                        return {
                            success: false,
                            code: 403,
                            error: {
                                msg: "No se encontró la oferta",
                            },
                        };
                    }
                    return {
                        success: true,
                        code: 200,
                        data: updatedProduct,
                        res: {
                            msg: "La oferta ganadora ha sido seleccionada y guardada exitosamente",
                            offerUID: updatedOffer.uid,
                            purchaseOrderUID: (_e = purchaseOrder.res) === null || _e === void 0 ? void 0 : _e.uidPurchaseOrder,
                        },
                    };
                }
                else {
                    return {
                        success: false,
                        code: 403,
                        error: {
                            msg: "No se ha encontrado la Oferta",
                        },
                    };
                }
            default:
                let stateLabel;
                switch (stateID) {
                    case 2:
                        stateLabel = "Atendido";
                        break;
                    case 3:
                        stateLabel = "Culminado";
                        break;
                    case 5:
                        stateLabel = "Expirado";
                        break;
                    case 6:
                        stateLabel = "Cancelado";
                        break;
                    case 7:
                        stateLabel = "Eliminado";
                        break;
                    case 8:
                        stateLabel = "En Disputa";
                        break;
                }
                return {
                    success: false,
                    code: 405,
                    error: {
                        msg: "El Requerimiento se encuentra " + stateLabel,
                    },
                };
        }
    }
    catch (error) {
        console.error("Error al seleccionar la oferta:", error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno del servidor",
            },
        };
    }
});
RequerimentService.BasicRateData = (requerimentID) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g;
    try {
        const result = yield serviceModel_1.default.aggregate([
            {
                // Match para encontrar el producto con el requerimentID
                $match: { uid: requerimentID },
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
            result[0].subUserName = (_g = (_f = userBase.data.data) === null || _f === void 0 ? void 0 : _f[0].auth_users) === null || _g === void 0 ? void 0 : _g.name;
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
RequerimentService.expired = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield serviceModel_1.default.find({
            completion_date: { $lt: new Date() },
            stateID: 1,
        });
        for (const product of products) {
            product.stateID = 5;
            yield product.save(); // Guardar cada documento actualizado
        }
        return {
            success: true,
            code: 200,
            res: {
                msg: "Se han actualizado los productos expirados",
                socketData: {
                    data: products,
                },
            },
        };
    }
    catch (error) {
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno del servidor",
            },
        };
    }
});
RequerimentService.delete = (requirementID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requirementData = yield serviceModel_1.default.findOne({
            uid: requirementID,
            stateID: {
                $in: [
                    Types_1.RequirementState.CANCELED,
                    Types_1.RequirementState.EXPIRED,
                    Types_1.RequirementState.PUBLISHED,
                ],
            }, // oferta seleccionada ya debe estar cancelada o no hay oferta seleccionada
        });
        let offerUIDs;
        if (requirementData) {
            if (requirementData.stateID != Types_1.RequirementState.CANCELED ||
                (requirementData.stateID != Types_1.RequirementState.CANCELED &&
                    !requirementData.winOffer) // no hay oferta seleccionada cancelada
            ) {
                const offers = yield offerService_1.OfferService.getOffersByRequeriment(requirementID);
                if (offers.success && offers.data && offers.data.length > 0) {
                    // eliminar todas las ofertas del requerimiento
                    offerUIDs = offers.data.map((offer) => offer.uid);
                    yield Promise.all(offers.data.map((offer) => __awaiter(void 0, void 0, void 0, function* () {
                        yield offerService_1.OfferService.deleteOffer(offer.uid);
                    })));
                }
            }
            const updatedRequirement = yield serviceModel_1.default.findOneAndUpdate({ uid: requirementID }, {
                $set: {
                    stateID: Types_1.RequirementState.ELIMINATED,
                },
            }, { new: true });
            //Eliminamos
            yield _a.manageCount(requirementData.entityID, requirementData.userID, "numDelete" + Types_1.NameAPI.NAME + "s", true);
            //Eliminamos
            yield _a.manageCount(requirementData.entityID, requirementData.userID, "num" + Types_1.NameAPI.NAME + "s", false);
            return {
                success: true,
                code: 200,
                data: requirementID,
                res: {
                    msg: "Se ha eliminado el requerimiento",
                    socketData: {
                        offerUIDs: offerUIDs,
                    },
                },
            };
        }
        else
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Requerimiento no encontrado o estado no permite eliminar",
                },
            };
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
RequerimentService.republish = (requirementID, completionDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offerUids = [];
        const requirementData = yield serviceModel_1.default.findOne({
            uid: requirementID,
        });
        if (requirementData) {
            if (requirementData.stateID == Types_1.RequirementState.CANCELED ||
                requirementData.stateID == Types_1.RequirementState.EXPIRED) {
                const offers = yield offerService_1.OfferService.getOffersByRequeriment(requirementID);
                if (offers.success && offers.data && offers.data.length > 0) {
                    // eliminar todas las ofertas del requerimiento
                    yield Promise.all(offers.data.map((offer) => __awaiter(void 0, void 0, void 0, function* () {
                        yield offerService_1.OfferService.updateStateOffer(offer.uid, Types_1.OfferState.ACTIVE, { canceledByCreator: { $ne: true } });
                        // Guardar la offer.uid en el array
                        offerUids.push(offer.uid);
                    })));
                }
                const updatedRequirement = yield serviceModel_1.default.findOneAndUpdate({ uid: requirementID }, {
                    $set: {
                        stateID: Types_1.RequirementState.PUBLISHED,
                        publish_date: new Date(),
                        completion_date: completionDate,
                    },
                }, { new: true });
                return {
                    success: true,
                    code: 200,
                    data: updatedRequirement,
                    res: {
                        msg: "Se ha republicado el requerimiento",
                        offerUids: offerUids,
                    },
                };
            }
            else {
                return {
                    success: false,
                    code: 400,
                    error: {
                        msg: "Estado de requerimiento no permite republicar",
                    },
                };
            }
        }
        else
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Requerimiento no encontrado",
                },
            };
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
RequerimentService.culminate = (requerimentID, delivered, score, comments) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    let purchaseOrderUID;
    let requerimentUID;
    let offerUID;
    try {
        const requerimentData = yield serviceModel_1.default.findOne({
            uid: requerimentID,
        });
        if (!requerimentData) {
            return {
                success: false,
                code: 403,
                error: {
                    msg: "Requerimiento no encontrado",
                },
            };
        }
        if (requerimentData.stateID !== Types_1.RequirementState.SELECTED) {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "El estado del requerimiento no permite realizar esta acción",
                },
            };
        }
        const offerID = requerimentData.winOffer.uid;
        const purchaseOrderData = yield purchaseOrder_1.default.aggregate([
            {
                $match: {
                    requerimentID: requerimentID, // Sustituye por el valor real
                    offerID: offerID, // Sustituye por el valor real
                },
            },
        ]);
        const requestBody = {
            typeScore: "Provider", // Tipo de puntaje
            uidEntity: purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].userProviderID, // ID de la empresa a ser evaluada
            uidUser: purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].userClientID, // ID del usuario que evalua
            offerId: offerID,
            score: score, // Puntaje
            comments: comments, // Comentarios
            type: purchaseOrder_interface_1.TypeRequeriment.SERVICES,
        };
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
        // AQUI USAR LA FUNCION EN DISPUTA //
        if (((_c = purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].scoreState) === null || _c === void 0 ? void 0 : _c.scoreProvider) &&
            ((_d = purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].scoreState) === null || _d === void 0 ? void 0 : _d.deliveredProvider) !== delivered) {
            purchaseOrderUID = (_e = (yield _a.inDispute(purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].uid, purchaseOrder_1.default)).res) === null || _e === void 0 ? void 0 : _e.uid;
            requerimentUID = (_f = (yield _a.inDispute(requerimentID, serviceModel_1.default)).res) === null || _f === void 0 ? void 0 : _f.uid;
            offerUID = (_g = (yield _a.inDispute(offerID, offerModel_1.OfferModel)).res) === null || _g === void 0 ? void 0 : _g.uid;
            return {
                success: true,
                code: 200,
                res: {
                    msg: "El proveedor ha reportado una discrepancia, por lo que el estado del proceso se ha marcado como EN DISPUTA.",
                    purchaseOrderUID,
                    requerimentUID,
                    offerUID,
                    dispute: true,
                },
            };
        }
        else {
            if (((_h = purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].scoreState) === null || _h === void 0 ? void 0 : _h.scoreProvider) &&
                ((_j = purchaseOrderData === null || purchaseOrderData === void 0 ? void 0 : purchaseOrderData[0].scoreState) === null || _j === void 0 ? void 0 : _j.deliveredProvider) === delivered) {
                purchaseOrderUID = yield purchaseOrder_1.default.findOneAndUpdate({
                    requerimentID: requerimentID,
                    offerID: offerID,
                }, {
                    $set: {
                        "scoreState.scoreClient": true,
                        "scoreState.deliveredClient": delivered,
                        stateID: Types_1.PurchaseOrderState.FINISHED,
                    },
                }, { new: true } // Devuelve el documento actualizado
                );
                purchaseOrderUID = purchaseOrderUID === null || purchaseOrderUID === void 0 ? void 0 : purchaseOrderUID.uid;
            }
            else {
                purchaseOrderUID = yield purchaseOrder_1.default.findOneAndUpdate({
                    requerimentID: requerimentID,
                    offerID: offerID,
                }, {
                    $set: {
                        "scoreState.scoreClient": true,
                        "scoreState.deliveredClient": delivered,
                        stateID: Types_1.PurchaseOrderState.PENDING,
                    },
                }, { new: true } // Devuelve el documento actualizado
                );
                purchaseOrderUID = purchaseOrderUID === null || purchaseOrderUID === void 0 ? void 0 : purchaseOrderUID.uid;
            }
            requerimentUID = yield serviceModel_1.default.findOneAndUpdate({
                uid: requerimentID,
            }, {
                $set: {
                    stateID: Types_1.RequirementState.FINISHED,
                },
            }, { new: true } // Devuelve el documento actualizado
            );
            requerimentUID = requerimentUID === null || requerimentUID === void 0 ? void 0 : requerimentUID.uid;
            return {
                success: true,
                code: 200,
                res: {
                    msg: "Se ha culminado correctamente el Requerimiento",
                    purchaseOrderUID: purchaseOrderUID,
                    requerimentUID: requerimentUID,
                    offerUID: offerUID,
                    dispute: false,
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
RequerimentService.inDispute = (uid, Model) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedDocument = yield Model.findOneAndUpdate({ uid }, { $set: { stateID: Types_1.PurchaseOrderState.DISPUTE } }, { new: true } // Devuelve el documento actualizado
        );
        // Verificar si se encontró y actualizó el documento
        if (!updatedDocument) {
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
            res: {
                msg: "El estado se actualizó correctamente.",
                uid: updatedDocument.uid, // Devolvemos el documento actualizado
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
RequerimentService.canceled = (uid, reason) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    try {
        let offerUids;
        let purchaseOrderUid;
        let requerimentUid;
        let selectOfferUid;
        const resultData = yield serviceModel_1.default.find({ uid: uid });
        if (((_b = resultData[0]) === null || _b === void 0 ? void 0 : _b.stateID) === Types_1.RequirementState.CANCELED) {
            return {
                success: false,
                code: 401,
                error: {
                    msg: "El Requerimiento ya se encuentra cancelado.",
                },
            };
        }
        if (((_c = resultData[0]) === null || _c === void 0 ? void 0 : _c.stateID) === Types_1.RequirementState.SELECTED) {
            const OfferID = (_d = resultData[0]) === null || _d === void 0 ? void 0 : _d.winOffer.uid;
            const offerData = (yield offerService_1.OfferService.GetDetailOffer(OfferID)).data;
            const purchaseOrderData = yield purchaseOrder_1.default.find({
                requerimentID: uid, // Filtro por requerimentID
                offerID: OfferID, // Filtro por offerID
            });
            if (purchaseOrderData[0].stateID === Types_1.PurchaseOrderState.CANCELED) {
                offerUids = yield _a.changeStateOffer(uid, Types_1.OfferState.CANCELED, true);
                requerimentUid = yield _a.changeStateID(serviceModel_1.default, uid, Types_1.RequirementState.CANCELED);
                return {
                    success: true,
                    code: 200,
                    res: {
                        msg: "Se ha cancelado el Requerimiento exitosamente",
                        requerimentUid: requerimentUid,
                    },
                };
            }
            else if (((_e = purchaseOrderData[0].scoreState) === null || _e === void 0 ? void 0 : _e.scoreProvider) === true &&
                (offerData === null || offerData === void 0 ? void 0 : offerData[0].stateID) === Types_1.OfferState.FINISHED) {
                return {
                    success: false,
                    code: 400,
                    error: {
                        msg: "No se puede cancelar el Requerimiento porque el creador de la Oferta ya ha culminado",
                    },
                };
            }
            else {
                yield purchaseOrder_1.default.findOneAndUpdate({ uid: purchaseOrderData[0].uid }, // Filtro para buscar por uid
                {
                    canceledByCreator: true,
                    reasonCancellation: reason,
                    cancellationDate: new Date(),
                    stateID: Types_1.PurchaseOrderState.CANCELED,
                }, // Campos a actualizar
                { new: true } // Devuelve el documento actualizado
                );
            }
            offerUids = yield _a.changeStateOffer(uid, Types_1.OfferState.CANCELED, true); // cancelo todas las Ofertas del requerimiento
            selectOfferUid = yield _a.changeStateID(offerModel_1.OfferModel, OfferID, Types_1.OfferState.CANCELED); // cancelo la oferta asociada
            yield offerModel_1.OfferModel.updateOne({ uid: OfferID }, // Encuentra el documento por UID
            {
                $set: {
                    canceledByCreator: false, // Si no existe, lo agrega automáticamente
                },
            });
            requerimentUid = yield _a.changeStateID(serviceModel_1.default, uid, Types_1.RequirementState.CANCELED);
            return {
                success: true,
                code: 200,
                res: {
                    msg: "Se ha cancelado el Requerimiento exitosamente",
                    offerUids: offerUids,
                    requerimentUid: requerimentUid,
                    selectOfferUid: selectOfferUid,
                    purchaseOrderUid: purchaseOrderData[0].uid,
                },
            };
        }
        else {
            offerUids = yield _a.changeStateOffer(uid, Types_1.OfferState.CANCELED, false);
            requerimentUid = yield _a.changeStateID(serviceModel_1.default, uid, Types_1.RequirementState.CANCELED);
            return {
                success: true,
                code: 200,
                res: {
                    msg: "Se ha cancelado el Requerimiento exitosamente",
                    offerUids: offerUids,
                    requerimentUid: requerimentUid,
                },
            };
        }
    }
    catch (error) {
        console.error("Error en canceled", error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Error interno del servidor.",
            },
        };
    }
});
RequerimentService.changeStateID = (ServiceModel, uid, stateID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ServiceModel.updateOne({ uid: uid }, {
            $set: {
                stateID: stateID,
            },
        });
        return uid;
    }
    catch (error) {
        const msg = "Error interno del servidor.";
        return msg;
    }
});
RequerimentService.changeStateOffer = (uid, stateID, canceledByCreator) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Encuentra los documentos que coinciden con los criterios
        const offersToUpdate = yield offerModel_1.OfferModel.find({
            requerimentID: uid,
            stateID: { $nin: [5, 7] },
        }, { uid: 1 } // Solo selecciona el campo `uid`
        );
        // Extrae las `uids` de los documentos encontrados
        const offerUids = offersToUpdate.map((offer) => offer.uid);
        yield offerModel_1.OfferModel.updateMany({
            requerimentID: uid,
            stateID: { $nin: [5, 7] },
        }, {
            $set: {
                stateID: stateID,
                canceledByCreator: canceledByCreator,
            },
        });
        return offerUids;
    }
    catch (error) {
        const msg = "Error interno del servidor.";
        return msg;
    }
});
RequerimentService.updateNumberOffersRequeriment = (uid, increase) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Buscar y actualizar el requerimiento por su UID
        const product = yield serviceModel_1.default.findOne({ uid }); // Encuentra el producto
        if (product) {
            // Actualiza el documento
            const updatedProduct = yield serviceModel_1.default.findOneAndUpdate({ uid }, // Busca por uid
            {
                $inc: { number_offers: increase ? 1 : -1 }, // Suma o resta 1
                updated_at: new Date(), // Actualiza la fecha
            }, { new: true, runValidators: true } // Devuelve el documento actualizado y valida restricciones
            )
                .where("number_offers")
                .gt(0); // Asegura que solo reste si es mayor a 0
            // Si no se encuentra el requerimiento o no se puede actualizar
            if (!updatedProduct) {
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "No se ha actualizado el requerimiento",
                    },
                };
            }
            // Si la actualización fue exitosa
            return {
                success: true,
                code: 200,
                res: {
                    msg: "El requerimiento ha sido actualizado correctamente",
                    data: updatedProduct,
                },
            };
        }
        else {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "No se ha encontrado el requerimiento",
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
                msg: "Error interno en el Servidor",
            },
        };
    }
});
RequerimentService.searchMainFilters = (keyWords, location, category, startDate, endDate, companyId, page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    page = !page || page < 1 ? 1 : page;
    pageSize = !pageSize || pageSize < 1 ? 10 : pageSize;
    let total = 0;
    try {
        if (!keyWords) {
            keyWords = "";
        }
        const searchConditions = {
            $or: [
                { name: { $regex: keyWords, $options: "i" } },
                { description: { $regex: keyWords, $options: "i" } },
            ],
            $and: [
                { stateID: 1 }, // Filtra solo los documentos con stateID igual a 1
            ],
        };
        // Definimos la proyección para excluir campos específicos
        const projection = {
            _id: 1,
            createdAt: 0, // Excluir el campo 'createdAt'
            updatedAt: 0, // Excluir el campo 'updatedAt'
            payment_methodID: 0, // Excluir el campo 'payment_methodID'
            submission_dateID: 0,
            allowed_bidersID: 0,
        };
        if (location) {
            searchConditions.cityID = location;
        }
        if (category) {
            searchConditions.categoryID = category;
        }
        if (companyId) {
            searchConditions.entityID = companyId;
        }
        if (startDate || endDate) {
            // Si ambos startDate y endDate están presentes
            if (startDate && endDate) {
                searchConditions.publish_date = {
                    $gte: new Date(startDate), // startDate se aplica a publish_date (inicio)
                };
                searchConditions.completion_date = {
                    $lte: new Date(endDate), // endDate se aplica a completion_date (fin)
                };
            }
            else {
                // Si solo startDate está presente, se aplica solo a publish_date
                if (startDate) {
                    searchConditions.publish_date = {
                        $gte: new Date(startDate), // Aplicar startDate solo a publish_date
                    };
                }
                // Si solo endDate está presente, se aplica solo a completion_date
                if (endDate) {
                    const end = new Date(endDate);
                    end.setUTCHours(23, 59, 59, 999); // Ajuste de horas para que incluya todo el día
                    searchConditions.completion_date = {
                        $lte: end, // Aplicar endDate solo a completion_date
                    };
                }
            }
        }
        // Primero intentamos hacer la búsqueda en MongoDB
        const skip = (page - 1) * pageSize;
        let results = yield serviceModel_1.default.find(searchConditions, projection)
            .skip(skip)
            .limit(pageSize)
            .sort({ publish_date: -1 });
        // Si no hay resultados en MongoDB, usamos Fuse.js para hacer una búsqueda difusa
        if (keyWords && results.length === 0) {
            // Eliminar el filtro de keyWords del searchConditions para obtener todos los registros
            const searchConditionsWithoutKeyWords = Object.assign({}, searchConditions);
            delete searchConditionsWithoutKeyWords.$or; // Quitamos la condición que filtra por palabras clave
            // Obtener todos los registros sin aplicar el filtro de palabras clave
            const allResults = yield serviceModel_1.default.find(searchConditionsWithoutKeyWords, projection);
            // Configurar Fuse.js
            const fuse = new fuse_js_1.default(allResults, {
                keys: ["name", "description"], // Las claves por las que buscar (name y description)
                threshold: 0.4, // Define qué tan "difusa" puede ser la coincidencia (0 es exacto, 1 es muy permisivo)
            });
            // Buscar usando Fuse.js
            results = fuse.search(keyWords).map((result) => result.item);
            // Ordenar los resultados obtenidos de Fuse.js por publish_date en orden descendente
            results.sort((a, b) => {
                return b.publish_date.getTime() - a.publish_date.getTime(); // Convertimos las fechas a timestamps
            });
            // Total de resultados (count usando Fuse.js)
            total = results.length;
            // Aplicar paginación sobre los resultados ordenados de Fuse.js
            const start = (page - 1) * pageSize;
            results = results.slice(start, start + pageSize);
        }
        else {
            // Si encontramos resultados en MongoDB, el total es la cantidad de documentos encontrados
            total = yield serviceModel_1.default.countDocuments(searchConditions);
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
RequerimentService.searchProductsByUser = (keyWords, userId, typeUser, page, pageSize, fieldName, orderType, filterColumn, filterData) => __awaiter(void 0, void 0, void 0, function* () {
    page = !page || page < 1 ? 1 : page;
    pageSize = !pageSize || pageSize < 1 ? 10 : pageSize;
    let total = 0;
    try {
        if (!keyWords) {
            keyWords = "";
        }
        if (!fieldName) {
            fieldName = "publish_date";
        }
        let userType, userName, subUserName;
        if (typeUser === Types_2.TypeEntity.COMPANY || typeUser === Types_2.TypeEntity.USER) {
            userType = "entityID";
            subUserName = "subUserName";
        }
        else {
            userType = "userID";
            subUserName = "";
        }
        let tableName;
        switch (typeUser) {
            case Types_2.TypeEntity.COMPANY:
                tableName = "companys";
                break;
            case Types_2.TypeEntity.USER:
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
            // 🔹 Relacionar con 'offersproducts' usando solo winOffer.uid
            {
                $lookup: {
                    from: "offersservices", // Nombre de la colección
                    localField: "winOffer.uid", // Relación con la oferta ganadora
                    foreignField: "uid", // Clave en 'offersproducts'
                    as: "offerDetails",
                },
            },
            {
                $unwind: { path: "$offerDetails", preserveNullAndEmptyArrays: true },
            },
            // Filtro inicial (searchConditions)
            {
                $match: {
                    $and: [
                        { [userType]: userId },
                        //  { stateID: { $ne: RequirementState.ELIMINATED } },
                        {
                            $or: [
                                { name: { $regex: keyWords, $options: "i" } },
                                { subUserName: { $regex: keyWords, $options: "i" } },
                            ],
                        },
                        ...(filterColumn && filterData && filterData.length > 0
                            ? [{ [filterColumn]: { $in: filterData } }] // Campo dinámico con valores de filterData
                            : []), // Si no hay filterColumn o filterData, no añade esta condición
                    ],
                },
            },
            // Proyección de los campos que queremos devolver
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    categoryID: 1,
                    cityID: 1,
                    budget: 1,
                    currencyID: 1,
                    payment_methodID: 1,
                    completion_date: 1,
                    submission_dateID: 1,
                    warranty: 1,
                    duration: 1,
                    allowed_bidersID: 1,
                    entityID: 1,
                    subUserEmail: 1,
                    userID: 1,
                    email: 1,
                    publish_date: 1,
                    stateID: 1,
                    uid: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    number_offers: 1,
                    images: 1,
                    files: 1,
                    winOffer: {
                        uid: "$offerDetails.uid", // UID de la oferta ganadora
                        userID: "$offerDetails.userID", // Tomado de 'offersproducts'
                        entityID: "$offerDetails.entityID", // Tomado de 'offersproducts'
                    }, // Aquí incluimos todos los campos de la oferta ganadora
                    subUserName: { $ifNull: ["$profile.name", "$company.name"] },
                    userName: { $ifNull: ["$company.name", "$profile.name"] },
                },
            },
        ];
        // Primero intentamos hacer la búsqueda en MongoDB
        const skip = (page - 1) * pageSize;
        let results = yield serviceModel_1.default.aggregate(pipeline)
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
            // Ejecutar el pipeline sin el filtro de palabras clave
            const allResults = yield serviceModel_1.default.aggregate(pipelineWithoutKeyWords);
            // Configurar Fuse.js para la búsqueda difusa
            const fuse = new fuse_js_1.default(allResults, {
                keys: ["name", subUserName], // Claves por las que buscar
                threshold: 0.4, // Define qué tan "difusa" es la coincidencia
            });
            // Buscar usando Fuse.js
            results = fuse.search(keyWords).map((result) => result.item);
            // Asegurar que fieldName tenga un valor predeterminado antes de ser usado
            const sortField = fieldName !== null && fieldName !== void 0 ? fieldName : "publish_date"; // Si fieldName es undefined, usar "publish_date"
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
            const resultData = yield serviceModel_1.default.aggregate(pipeline);
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
//# sourceMappingURL=requerimentService.js.map