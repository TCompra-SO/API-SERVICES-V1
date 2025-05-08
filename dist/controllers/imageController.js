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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImagesOffer = exports.uploadImagesRequeriment = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const imageService_1 = require("../services/imageService");
const uploadDir = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
// Configuración para almacenar archivos en una carpeta temporal
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
// Filtrar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        cb(new Error("Formato de archivo no permitido"), false);
    }
};
// Configuración de multer para máximo 5 imágenes
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { files: 5, fileSize: 5 * 1024 * 1024 },
}).array("images", 5);
const uploadImagesRequeriment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.body;
        const files = req.files; // Archivos cargados
        // Validar que se hayan cargado archivos y que no superen el límite de 5
        if (!files || files.length === 0) {
            return res
                .status(400)
                .json({ message: "Debes cargar al menos una imagen." });
        }
        if (files.length > 5) {
            return res
                .status(400)
                .json({ message: "No puedes cargar más de 5 imágenes." });
        }
        // Extraer las rutas de las imágenes
        const filePaths = files.map((file) => file.path);
        // Subir imágenes y recibir las URLs
        const responseUser = yield imageService_1.ImageService.uploadImagesRequeriment(filePaths, uid);
        // Eliminar archivos temporales después de subir
        for (const filePath of filePaths) {
            fs_1.default.unlink(filePath, (err) => { });
        }
        if (responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al cargar las imágenes", error });
    }
});
exports.uploadImagesRequeriment = uploadImagesRequeriment;
const uploadImagesOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.body;
        const files = req.files; // Archivos cargados
        // Validar que se hayan cargado archivos y que no superen el límite de 5
        if (!files || files.length === 0) {
            return res
                .status(400)
                .json({ message: "Debes cargar al menos una imagen." });
        }
        if (files.length > 5) {
            return res
                .status(400)
                .json({ message: "No puedes cargar más de 5 imágenes." });
        }
        // Extraer las rutas de las imágenes
        const filePaths = files.map((file) => file.path);
        // Subir imágenes y recibir las URLs
        const responseUser = yield imageService_1.ImageService.uploadImagesOffer(filePaths, uid);
        // Eliminar archivos temporales después de subir
        for (const filePath of filePaths) {
            fs_1.default.unlink(filePath, (err) => { });
        }
        if (responseUser.success) {
            res.status(responseUser.code).send(responseUser);
        }
        else {
            res.status(responseUser.code).send(responseUser.error);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al cargar las imágenes", error });
    }
});
exports.uploadImagesOffer = uploadImagesOffer;
//# sourceMappingURL=imageController.js.map