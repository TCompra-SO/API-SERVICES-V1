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
exports.uploadDocumentsOffer = exports.uploadDocumentsRequeriment = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fileService_1 = require("../services/fileService"); // Asegúrate de que el servicio esté importado correctamente
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
// Filtrar solo archivos PDF
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    }
    else {
        cb(new Error("Formato de archivo no permitido. Solo se permiten PDF"), false);
    }
};
// Configuración de multer para máximo 5 documentos PDF
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { files: 5, fileSize: 5 * 1024 * 1024 },
}).array("documents", 5);
const uploadDocumentsRequeriment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.body;
        const files = req.files; // Archivos cargados
        // Validar que se hayan cargado archivos y que no superen el límite de 5
        if (!files || files.length === 0) {
            return res
                .status(400)
                .json({ message: "Debes cargar al menos un documento PDF." });
        }
        if (files.length > 5) {
            return res
                .status(400)
                .json({ message: "No puedes cargar más de 5 documentos PDF." });
        }
        // Extraer las rutas de los documentos
        const filePaths = files.map((file) => file.path);
        // Subir documentos y recibir las URLs
        const responseUser = yield fileService_1.FileService.uploadDocumentsRequeriment(filePaths, uid);
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
        res.status(500).json({ message: "Error al cargar los documentos", error });
    }
});
exports.uploadDocumentsRequeriment = uploadDocumentsRequeriment;
const uploadDocumentsOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.body;
        const files = req.files; // Archivos cargados
        // Validar que se hayan cargado archivos y que no superen el límite de 5
        if (!files || files.length === 0) {
            return res
                .status(400)
                .json({ message: "Debes cargar al menos un documento PDF." });
        }
        if (files.length > 5) {
            return res
                .status(400)
                .json({ message: "No puedes cargar más de 5 documentos PDF." });
        }
        // Extraer las rutas de los documentos
        const filePaths = files.map((file) => file.path);
        // Subir documentos y recibir las URLs
        const responseUser = yield fileService_1.FileService.uploadDocumentsOffer(filePaths, uid);
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
        res.status(500).json({ message: "Error al cargar los documentos", error });
    }
});
exports.uploadDocumentsOffer = uploadDocumentsOffer;
//# sourceMappingURL=fileController.js.map