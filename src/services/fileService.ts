import cloudinary from "cloudinary";
import dotenv from "dotenv";
import ServiceModel from "../models/serviceModel";
import { RequerimentService } from "./requerimentService";
import { OfferService } from "./offerService";
import { OfferModel } from "../models/offerModel";
dotenv.config();

// Configurar Cloudinary con las credenciales desde .env
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class FileService {
  static uploadDocumentsRequeriment = async (
    filePaths: string[],
    uid: string
  ) => {
    const documentUrls: string[] = [];
    let num = 1;

    try {
      // Obtener información del requerimiento
      const resultData = await RequerimentService.getRequerimentById(uid);
      const uidData = resultData.data?.[0].uid;

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
      const existingProduct = await ServiceModel.findOne({ uid: uidData });
      const existingDocuments = existingProduct?.files || [];

      // Eliminar los documentos existentes en Cloudinary
      for (const documentUrl of existingDocuments) {
        const publicId = documentUrl
          .split("/")
          .slice(-2) // Tomar las dos últimas partes de la URL
          .join("/") // Volver a unirlas
          .replace(".pdf", ""); // Remover la extensión del archivo

        // Eliminar el documento de Cloudinary
        await cloudinary.v2.uploader.destroy(publicId, {
          resource_type: "raw",
        });
      }

      // Limitar los documentos a un máximo de 5
      const limitedFilePaths = filePaths.slice(0, 5);

      // Eliminar documentos existentes en la base de datos
      await ServiceModel.findOneAndUpdate(
        { uid: uidData },
        { $set: { files: [] } }
      );

      // Subir nuevos documentos a Cloudinary y guardar sus URLs con el icono de PDF
      for (const path of limitedFilePaths) {
        const result = await cloudinary.v2.uploader.upload(path, {
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
      await ServiceModel.findOneAndUpdate(
        { uid: uidData },
        { $set: { files: documentUrls } },
        { new: true }
      );

      return {
        success: true,
        code: 200,
        url: documentUrls,
        res: {
          msg: "Se han cargado los nuevos documentos correctamente",
        },
      };
    } catch (error) {
      console.error("Error al subir los documentos:", error);
      return {
        success: false,
        code: 500,
        error: {
          msg: "Hubo un error con el servidor",
        },
      };
    }
  };

  static uploadDocumentsOffer = async (filePaths: string[], uid: string) => {
    const documentUrls: string[] = [];
    let num = 1;

    try {
      // Obtener información del requerimiento
      const resultData = await OfferService.GetDetailOffer(uid);
      const uidData = resultData.data?.[0].uid;

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
      const existingOffer = await OfferModel.findOne({ uid: uidData });
      const existingDocuments = existingOffer?.files || [];

      // Eliminar los documentos existentes en Cloudinary
      for (const documentUrl of existingDocuments) {
        const publicId = documentUrl
          .split("/")
          .slice(-2) // Tomar las dos últimas partes de la URL
          .join("/") // Volver a unirlas
          .replace(".pdf", ""); // Remover la extensión del archivo

        // Eliminar el documento de Cloudinary
        await cloudinary.v2.uploader.destroy(publicId, {
          resource_type: "raw",
        });
      }

      // Limitar los documentos a un máximo de 5
      const limitedFilePaths = filePaths.slice(0, 5);

      // Eliminar documentos existentes en la base de datos
      await ServiceModel.findOneAndUpdate(
        { uid: uidData },
        { $set: { files: [] } }
      );

      // Subir nuevos documentos a Cloudinary y guardar sus URLs con el icono de PDF
      for (const path of limitedFilePaths) {
        const result = await cloudinary.v2.uploader.upload(path, {
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
      await OfferModel.findOneAndUpdate(
        { uid: uidData },
        { $set: { files: documentUrls } },
        { new: true }
      );

      return {
        success: true,
        code: 200,
        url: documentUrls,
        res: {
          msg: "Se han cargado los nuevos documentos correctamente",
        },
      };
    } catch (error) {
      console.error("Error al subir los documentos:", error);
      return {
        success: false,
        code: 500,
        error: {
          msg: "Hubo un error con el servidor",
        },
      };
    }
  };
}
