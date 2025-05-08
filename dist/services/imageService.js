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
exports.ImageService = void 0;
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
class ImageService {
}
exports.ImageService = ImageService;
_a = ImageService;
ImageService.uploadImagesRequeriment = (filePaths, uid) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const imageUrls = [];
    let num = 1;
    try {
        // Obtener información de requerimiento
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
        // Obtener imágenes actuales de la base de datos
        const existingProduct = yield serviceModel_1.default.findOne({ uid: uidData });
        const existingImages = (existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.images) || [];
        // Eliminar las imágenes existentes en Cloudinary
        for (const imageUrl of existingImages) {
            // Extraer el public_id de la URL
            const publicId = imageUrl
                .split("/")
                .slice(-2) // Tomar las dos últimas partes de la URL
                .join("/") // Volver a unirlas
                .replace(".jpg", "") // Remover la extensión del archivo
                .replace(".png", ""); // Opcional: manejar también PNG si es necesario
            // Eliminar la imagen de Cloudinary
            yield cloudinary_1.default.v2.uploader.destroy(publicId);
        }
        // Limitar las imágenes a un máximo de 5
        const limitedFilePaths = filePaths.slice(0, 5);
        // Eliminar imágenes existentes en la base de datos
        yield serviceModel_1.default.findOneAndUpdate({ uid: uidData }, { $set: { images: [] } });
        // Subir nuevas imágenes a Cloudinary y guardar sus URLs
        for (const path of limitedFilePaths) {
            const result = yield cloudinary_1.default.v2.uploader.upload(path, {
                folder: `services`,
                public_id: `${uidData}ServiceImage${num}`,
            });
            imageUrls.push(result.secure_url);
            num++;
        }
        // Guardar las nuevas URLs en la base de datos
        yield serviceModel_1.default.findOneAndUpdate({ uid: uidData }, { $set: { images: imageUrls } }, { new: true });
        return {
            success: true,
            code: 200,
            url: imageUrls,
            res: {
                msg: "Se han cargado las nuevas imágenes correctamente",
            },
        };
    }
    catch (error) {
        console.error("Error al subir las imágenes:", error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Hubo un error con el servidor",
            },
        };
    }
});
ImageService.uploadImagesOffer = (filePaths, uid) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const imageUrls = [];
    let num = 1;
    try {
        // Obtener información de requerimiento
        const resultData = yield offerService_1.OfferService.GetDetailOffer(uid);
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
        // Obtener imágenes actuales de la base de datos
        const existingOffer = yield offerModel_1.OfferModel.findOne({ uid: uidData });
        const existingImages = (existingOffer === null || existingOffer === void 0 ? void 0 : existingOffer.images) || [];
        // Eliminar las imágenes existentes en Cloudinary
        for (const imageUrl of existingImages) {
            // Extraer el public_id de la URL
            const publicId = imageUrl
                .split("/")
                .slice(-2) // Tomar las dos últimas partes de la URL
                .join("/") // Volver a unirlas
                .replace(".jpg", "") // Remover la extensión del archivo
                .replace(".png", ""); // Opcional: manejar también PNG si es necesario
            // Eliminar la imagen de Cloudinary
            yield cloudinary_1.default.v2.uploader.destroy(publicId);
        }
        // Limitar las imágenes a un máximo de 5
        const limitedFilePaths = filePaths.slice(0, 5);
        // Eliminar imágenes existentes en la base de datos
        yield offerModel_1.OfferModel.findOneAndUpdate({ uid: uidData }, { $set: { images: [] } });
        // Subir nuevas imágenes a Cloudinary y guardar sus URLs
        for (const path of limitedFilePaths) {
            const result = yield cloudinary_1.default.v2.uploader.upload(path, {
                folder: `services-image-offer`,
                public_id: `${uidData}ServiceImageOffer${num}`,
            });
            imageUrls.push(result.secure_url);
            num++;
        }
        // Guardar las nuevas URLs en la base de datos
        yield offerModel_1.OfferModel.findOneAndUpdate({ uid: uidData }, { $set: { images: imageUrls } }, { new: true });
        return {
            success: true,
            code: 200,
            url: imageUrls,
            res: {
                msg: "Se han cargado las nuevas imágenes correctamente",
            },
        };
    }
    catch (error) {
        console.error("Error al subir las imágenes:", error);
        return {
            success: false,
            code: 500,
            error: {
                msg: "Hubo un error con el servidor",
            },
        };
    }
});
//# sourceMappingURL=imageService.js.map