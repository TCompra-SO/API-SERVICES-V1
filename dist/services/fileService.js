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
exports.FileService = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const dotenv_1 = __importDefault(require("dotenv"));
const serviceModel_1 = __importDefault(require("../models/serviceModel"));
const requerimentService_1 = require("./requerimentService");
const offerService_1 = require("./offerService");
const offerModel_1 = require("../models/offerModel");
dotenv_1.default.config();
// Configurar Cloudinary con las credenciales desde .env
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class FileService {
}
exports.FileService = FileService;
_a = FileService;
FileService.uploadDocumentsRequeriment = (filePaths, uid) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const documentUrls = [];
    let num = 1;
    try {
        // Obtener información del requerimiento
        const resultData = yield requerimentService_1.RequerimentService.getRequerimentById(uid);
        const uidData = (_b = resultData.data) === null || _b === void 0 ? void 0 : _b[0].uid;
        if (!uidData) {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "UID no encontrado en los datos de requerimiento",
                },
            };
        }
        // Obtener documentos actuales de la base de datos
        const existingProduct = yield serviceModel_1.default.findOne({ uid: uidData });
        const existingDocuments = (existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.files) || [];
        // Eliminar los documentos existentes en Cloudinary
        for (const documentUrl of existingDocuments) {
            const publicId = documentUrl
                .split("/")
                .slice(-2) // Tomar las dos últimas partes de la URL
                .join("/") // Volver a unirlas
                .replace(".pdf", ""); // Remover la extensión del archivo
            // Eliminar el documento de Cloudinary
            yield cloudinary_1.default.v2.uploader.destroy(publicId, {
                resource_type: "raw",
            });
        }
        // Limitar los documentos a un máximo de 5
        const limitedFilePaths = filePaths.slice(0, 5);
        // Eliminar documentos existentes en la base de datos
        yield serviceModel_1.default.findOneAndUpdate({ uid: uidData }, { $set: { files: [] } });
        // Subir nuevos documentos a Cloudinary y guardar sus URLs con el icono de PDF
        for (const path of limitedFilePaths) {
            const result = yield cloudinary_1.default.v2.uploader.upload(path, {
                resource_type: "raw",
                folder: `services-documents`,
                public_id: `${uidData}ServiceDocument${num}`,
                type: "upload",
                access_type: "anonymous",
                flags: "attachment", // Agrega el archivo como adjunto
            });
            documentUrls.push(result.secure_url);
            num++;
        }
        // Guardar las nuevas URLs en la base de datos
        yield serviceModel_1.default.findOneAndUpdate({ uid: uidData }, { $set: { files: documentUrls } }, { new: true });
        return {
            success: true,
            code: 200,
            url: documentUrls,
            res: {
                msg: "Se han cargado los nuevos documentos correctamente",
            },
        };
    }
    catch (error) {
        console.error("Error al subir los documentos:", error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Hubo un error con el servidor",
            },
        };
    }
});
FileService.uploadDocumentsOffer = (filePaths, uid) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const documentUrls = [];
    let num = 1;
    try {
        // Obtener información del requerimiento
        const resultData = yield offerService_1.OfferService.GetDetailOffer(uid);
        const uidData = (_b = resultData.data) === null || _b === void 0 ? void 0 : _b[0].uid;
        if (!uidData) {
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Oferta no encontrada",
                },
            };
        }
        // Obtener documentos actuales de la base de datos
        const existingOffer = yield offerModel_1.OfferModel.findOne({ uid: uidData });
        const existingDocuments = (existingOffer === null || existingOffer === void 0 ? void 0 : existingOffer.files) || [];
        // Eliminar los documentos existentes en Cloudinary
        for (const documentUrl of existingDocuments) {
            const publicId = documentUrl
                .split("/")
                .slice(-2) // Tomar las dos últimas partes de la URL
                .join("/") // Volver a unirlas
                .replace(".pdf", ""); // Remover la extensión del archivo
            // Eliminar el documento de Cloudinary
            yield cloudinary_1.default.v2.uploader.destroy(publicId, {
                resource_type: "raw",
            });
        }
        // Limitar los documentos a un máximo de 5
        const limitedFilePaths = filePaths.slice(0, 5);
        // Eliminar documentos existentes en la base de datos
        yield serviceModel_1.default.findOneAndUpdate({ uid: uidData }, { $set: { files: [] } });
        // Subir nuevos documentos a Cloudinary y guardar sus URLs con el icono de PDF
        for (const path of limitedFilePaths) {
            const result = yield cloudinary_1.default.v2.uploader.upload(path, {
                resource_type: "raw",
                folder: `services-documents-offer`,
                public_id: `${uidData}ServiceDocumentOffer${num}`,
                type: "upload",
                access_type: "anonymous",
                flags: "attachment", // Agrega el archivo como adjunto
            });
            documentUrls.push(result.secure_url);
            num++;
        }
        // Guardar las nuevas URLs en la base de datos
        yield offerModel_1.OfferModel.findOneAndUpdate({ uid: uidData }, { $set: { files: documentUrls } }, { new: true });
        return {
            success: true,
            code: 200,
            url: documentUrls,
            res: {
                msg: "Se han cargado los nuevos documentos correctamente",
            },
        };
    }
    catch (error) {
        console.error("Error al subir los documentos:", error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Hubo un error con el servidor",
            },
        };
    }
});
//# sourceMappingURL=fileService.js.map