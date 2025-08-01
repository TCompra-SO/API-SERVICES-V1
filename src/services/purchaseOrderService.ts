import axios from "axios";
import {
  PurchaseOrderI,
  PurchaseOrderState,
  TypeRequeriment,
} from "../interfaces/purchaseOrder.interface";
import PurchaseOrderModel from "../models/purchaseOrder";
import { OfferService } from "./offerService";
import { igv } from "../initConfig";
import { RequerimentService } from "./requerimentService";
import { sendEmailPurchaseOrder } from "../utils/NodeMailer";
import puppeteer from "puppeteer";
import { Buffer } from "node:buffer";
import { OrderPurchaseTemplate } from "../utils/OrderPurchaseTemplate";
import { OrderType, TypeEntity, TypeUser } from "../utils/Types";
import Fuse from "fuse.js";
import { PipelineStage, SortOrder } from "mongoose";

let API_USER = process.env.API_USER + "/v1/";
export class PurchaseOrderService {
  static CreatePurchaseOrder = async (
    requerimentID: string,
    offerID: string,
    price_Filter: number,
    deliveryTime_Filter: number,
    location_Filter: number,
    warranty_Filter: number
  ) => {
    try {
      const offerBasicData = await OfferService.BasicRateData(offerID);
      const offerData = await OfferService.GetDetailOffer(offerID);
      const userProviderID = offerBasicData.data?.[0].userId;
      const subUserProviderID = offerBasicData.data?.[0].subUserId;

      const requerimentBasicData = await RequerimentService.BasicRateData(
        requerimentID
      );
      const requerimentData = await RequerimentService.getRequerimentById(
        requerimentID
      );
      const userClientID = requerimentBasicData.data?.[0].userId;
      const subUserClientID = requerimentBasicData.data?.[0].subUserId;

      const emailUser = offerData.data?.[0].email;
      const emailSubUser = offerData.data?.[0].subUserEmail;

      if (requerimentID !== offerData.data?.[0].requerimentID) {
        return {
          success: false,
          code: 404,
          error: {
            msg: "La oferta seleccionada no pertenece a este requerimiento",
          },
        };
      }

      if (offerData.data?.[0].stateID !== 1) {
        return {
          success: false,
          code: 401,
          error: {
            msg: "La Oferta no puede ser seleccionada",
          },
        };
      }
      const userProviderData = await axios.get(
        `${API_USER}auth/getBaseDataUser/${subUserProviderID}`
      );

      const basicProviderData = await axios.get(
        `${API_USER}auth/getUser/${userProviderID}`
      );

      const baseClientData = await axios.get(
        `${API_USER}auth/getUser/${userClientID}`
      );

      const currencyData = await axios.get(`${API_USER}util/utilData/currency`);

      const currencyId = requerimentData.data?.[0].currencyID; // Cambia este valor al ID que deseas buscar
      const currencyValue = currencyData.data.currencies.find(
        (currency: { id: number; value: string; alias: string }) =>
          currency.id === currencyId
      )?.alias;

      const daysDeliveryData = await axios.get(
        `${API_USER}util/utilData/delivery_time`
      );

      const deliveryTimeID = offerData.data?.[0].deliveryTimeID;
      let days = 0;
      let deliveryDate;
      if (deliveryTimeID !== 6) {
        deliveryDate = new Date();
        days = daysDeliveryData.data.times.find(
          (days: { id: number; value: string; days: number }) =>
            days.id === deliveryTimeID
        )?.days;

        deliveryDate.setDate(deliveryDate.getDate() + days);
      } else {
        deliveryDate = null;
      }

      if (!offerBasicData.success) {
        return {
          success: false,
          code: 403,
          error: {
            msg: "No se encontro la Oferta",
          },
        };
      }

      let price = offerData.data?.[0].budget;
      let subTotal = price;
      let total, totalIgv;
      if (!offerData.data?.[0].includesIGV) {
        totalIgv = (offerData.data?.[0].budget * igv) / 100;
        totalIgv = parseFloat(totalIgv.toFixed(2));
        total = subTotal + totalIgv;
      } else {
        subTotal = price / (1 + igv / 100);
        subTotal = parseFloat(subTotal.toFixed(2));
        totalIgv = parseFloat((price - subTotal).toFixed(2));
        total = price;
      }

      const newPurchaseOrder: Omit<PurchaseOrderI, "uid"> = {
        type: TypeRequeriment.SERVICES,
        userClientID: userClientID,
        userNameClient: requerimentBasicData.data?.[0].userName,
        addressClient: baseClientData.data.data?.address,
        documentClient: baseClientData.data.data?.document,
        emailClient: requerimentData.data?.[0].email,
        subUserClientID: subUserClientID,
        subUserClientEmail: requerimentData.data?.[0].subUserEmail,
        nameSubUserClient: requerimentBasicData.data?.[0].subUserName,
        createDate: new Date(),
        deliveryDate: deliveryDate,
        requerimentID: requerimentID,
        requerimentTitle: offerData.data?.[0].requerimentTitle,
        currency: currencyValue,
        price: price,
        subtotal: subTotal,
        totaligv: totalIgv,
        total: total,
        igv: igv,
        userProviderID: userProviderID,
        nameUserProvider: offerBasicData.data?.[0].userName,
        subUserProviderID: subUserProviderID,
        nameSubUserProvider: offerBasicData.data?.[0].subUserName,
        subUserEmailProvider: offerData.data?.[0].subUserEmail,
        addressProvider: basicProviderData.data.data?.address,
        documentProvider: userProviderData.data.data?.[0].document,
        emailProvider: offerData.data?.[0].email,
        stateID: PurchaseOrderState.PENDING,
        offerID: offerData.data?.[0].uid,
        offerTitle: offerData.data?.[0].name,
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

      const CreateOrder = new PurchaseOrderModel(newPurchaseOrder);
      const uidPurchaseOrder = await CreateOrder.save();
      await RequerimentService.manageCount(
        userProviderID,
        subUserProviderID,
        "numPurchaseOrdersProvider",
        true
      );

      await RequerimentService.manageCount(
        userClientID,
        subUserClientID,
        "numPurchaseOrdersClient",
        true
      );
      // const sendMail = sendEmailPurchaseOrder(newPurchaseOrder);
      let responseEmail = "";
      /*  if ((await sendMail).success) {
        responseEmail = "Orden de Compra enviada al Email correctamente";
      } else {
        responseEmail = "No se ha podido enviar la Orden al Correo";
      }*/

      // Inicia el envío del correo en segundo plano

      if (emailUser) {
        sendEmailPurchaseOrder(newPurchaseOrder, emailUser)
          .then((result) => {
            if (result.success) {
              responseEmail = "Orden de Compra enviada al Email correctamente";
            } else {
              responseEmail = "No se ha podido enviar la Orden al Correo";
            }
          })
          .catch((error) => {
            console.error("Error al enviar el correo:", error);
          });
      }
      if (emailSubUser && emailSubUser !== emailUser) {
        sendEmailPurchaseOrder(newPurchaseOrder, emailSubUser)
          .then((result) => {
            if (result.success) {
              responseEmail = "Orden de Compra enviada al Email correctamente";
            } else {
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
    } catch (error) {
      console.log(error);
      return {
        success: false,
        code: 500,
        error: {
          msg: "Error interno en el Servidor, no se ha podido Crear la Orden de Compra",
        },
      };
    }
  };

  static getPurchaseOrders = async (page: number, pageSize: number) => {
    if (!page || page < 1) page = 1;
    if (!pageSize || pageSize < 1) pageSize = 10;
    try {
      const result = await PurchaseOrderModel.find()
        .sort({ createDate: -1 })
        .skip((page - 1) * pageSize) // Omitir documentos según la página
        .limit(pageSize); // Limitar el número de documentos por página;

      const totalDocuments = await PurchaseOrderModel.countDocuments();
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
    } catch (error) {
      console.log(error);
      return {
        success: false,
        code: 500,
        error: {
          msg: "Error interno con el Servidor",
        },
      };
    }
  };

  static getPurchaseOrdersClient = async (
    userClientID: string,
    page: number,
    pageSize: number
  ) => {
    if (!page || page < 1) page = 1;
    if (!pageSize || pageSize < 1) pageSize = 10;

    try {
      const result = await PurchaseOrderModel.find({ userClientID })
        .sort({ createDate: -1 })
        .skip((page - 1) * pageSize) // Omitir documentos según la página
        .limit(pageSize); // Limitar el número de documentos por página;;
      const totalDocuments = (await PurchaseOrderModel.find({ userClientID }))
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
    } catch (error) {
      console.log(error);
      return {
        success: false,
        code: 500,
        error: {
          res: "Se ha producido un error interno en el Servidor",
        },
      };
    }
  };

  static getPurchaseOrdersProvider = async (
    userProviderID: string,
    page: number,
    pageSize: number
  ) => {
    if (!page || page < 1) page = 1;
    if (!pageSize || pageSize < 1) pageSize = 10;
    try {
      const result = await PurchaseOrderModel.find({ userProviderID })
        .sort({ createDate: -1 })
        .skip((page - 1) * pageSize) // Omitir documentos según la página
        .limit(pageSize); // Limitar el número de documentos por página;
      const totalDocuments = (await PurchaseOrderModel.find({ userProviderID }))
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
    } catch (error) {
      console.log(error);
      return {
        success: false,
        code: 500,
        error: {
          res: "Se ha producido un error interno en el Servidor",
        },
      };
    }
  };

  static getPurchaseOrderID = async (uid: string) => {
    try {
      const result = await PurchaseOrderModel.aggregate([
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
    } catch (error) {
      console.log(error);
      return {
        success: false,
        code: 500,
        error: {
          msg: "Error interno en el Servidor",
        },
      };
    }
  };

  static getPurchaseOrdersByEntityProvider = async (
    uid: string,
    typeUser: number,
    page: number,
    pageSize: number
  ) => {
    if (!page || page < 1) page = 1;
    if (!pageSize || pageSize < 1) pageSize = 10;
    try {
      let result;
      let totalDocuments;
      if (TypeUser.ADMIN === typeUser) {
        result = await PurchaseOrderModel.find({ userProviderID: uid })
          .sort({ createDate: -1 })
          .skip((page - 1) * pageSize) // Omitir documentos según la página
          .limit(pageSize); // Limitar el número de documentos por página
        totalDocuments = (
          await PurchaseOrderModel.find({ userProviderID: uid })
        ).length;
      } else {
        result = await PurchaseOrderModel.find({
          subUserProviderID: uid,
        })
          .sort({ createDate: -1 })
          .skip((page - 1) * pageSize) // Omitir documentos según la página
          .limit(pageSize); // Limitar el número de documentos por página
        totalDocuments = (
          await PurchaseOrderModel.find({ subUserProviderID: uid })
        ).length;
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
    } catch (error) {
      console.log(error);
      return {
        success: false,
        code: 500,
        error: {
          msg: "Error interno en el Servidor",
        },
      };
    }
  };

  static getPurchaseOrdersByEntityClient = async (
    uid: string,
    typeUser: number,
    page: number,
    pageSize: number
  ) => {
    try {
      let result;
      let totalDocuments;
      if (TypeUser.ADMIN === typeUser) {
        result = await PurchaseOrderModel.find({
          userClientID: uid,
        })
          .sort({ createDate: -1 })
          .skip((page - 1) * pageSize) // Omitir documentos según la página
          .limit(pageSize); // Limitar el número de documentos por página;

        totalDocuments = (await PurchaseOrderModel.find({ userClientID: uid }))
          .length;
      } else {
        result = await PurchaseOrderModel.find({
          subUserClientID: uid,
        })
          .sort({ createDate: -1 })
          .skip((page - 1) * pageSize) // Omitir documentos según la página
          .limit(pageSize); // Limitar el número de documentos por página;

        totalDocuments = (
          await PurchaseOrderModel.find({ subUserClientID: uid })
        ).length;
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
    } catch (error) {
      console.log(error);
      return {
        success: false,
        code: 500,
        error: {
          msg: "Error interno en el Servidor",
        },
      };
    }
  };

  static searchPurchaseOrderByProvider = async (
    keyWords: string,
    typeUser: TypeEntity,
    userId: string,
    page?: number,
    pageSize?: number,
    fieldName?: string,
    orderType?: number,
    filterColumn?: string,
    filterData?: [string]
  ) => {
    page = !page || page < 1 ? 1 : page;
    pageSize = !pageSize || pageSize < 1 ? 10 : pageSize;
    let total = 0;
    try {
      if (!keyWords) {
        keyWords = "";
      }
      let fieldUserName, fieldSubUserName;
      if (TypeEntity.COMPANY === typeUser || TypeEntity.USER === typeUser) {
        fieldUserName = "userProviderID";
        fieldSubUserName = "nameSubUserProvider";
      } else {
        fieldUserName = "subUserProviderID";
        fieldSubUserName = "";
      }

      if (!fieldName) {
        fieldName = "createDate";
      }
      let order: SortOrder;
      if (!orderType || orderType === OrderType.DESC) {
        order = -1;
      } else {
        order = 1;
      }
      const searchConditions: any = {
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

      let results = await PurchaseOrderModel.find(searchConditions)
        .sort({ [fieldName]: order })
        .skip(skip)
        .limit(pageSize)
        .collation({ locale: "en", strength: 2 });

      // COREGIR
      if (keyWords && results.length === 0) {
        // Crear una copia del array $and sin la condición $or
        const searchConditionsWithoutKeyWords = {
          ...searchConditions,
          $and: searchConditions.$and.filter(
            (condition: any) => !condition.$or
          ),
        };

        // Obtener todos los registros sin aplicar el filtro de palabras clave
        const allResults = await PurchaseOrderModel.find(
          searchConditionsWithoutKeyWords
        );
        PurchaseOrderState;
        // Configurar Fuse.js
        const fuse = new Fuse(allResults, {
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

        const sortField = fieldName ?? "createDate"; // Si fieldName es undefined, usar "publish_date"

        // Ordenar los resultados por el campo dinámico sortField
        results.sort((a, b) => {
          const valueA = (a as any)[sortField];
          const valueB = (b as any)[sortField];

          if (typeof valueA === "string" && typeof valueB === "string") {
            // Usar localeCompare para comparar cadenas ignorando mayúsculas, minúsculas y acentos
            return (
              valueA.localeCompare(valueB, undefined, {
                sensitivity: "base",
              }) * (orderType === OrderType.ASC ? 1 : -1)
            );
          }

          if (valueA > valueB) return orderType === OrderType.ASC ? 1 : -1;
          if (valueA < valueB) return orderType === OrderType.ASC ? -1 : 1;
          return 0; // Si son iguales, no cambiar el orden
        });
        // Total de resultados (count usando Fuse.js)
        total = results.length;

        // Aplicar paginación sobre los resultados ordenados de Fuse.js
        const start = (page - 1) * pageSize;
        results = results.slice(start, start + pageSize);
      } else {
        // Si encontramos resultados en MongoDB, el total es la cantidad de documentos encontrados
        total = await PurchaseOrderModel.countDocuments(searchConditions);
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
    } catch (error) {
      console.log(error);
      return {
        success: false,
        code: 500,
        error: {
          msg: "Error interno en el Servidor",
        },
      };
    }
  };

  static searchPurchaseOrderByClient = async (
    keyWords: string,
    typeUser: TypeEntity,
    userId: string,
    page?: number,
    pageSize?: number,
    fieldName?: string,
    orderType?: number,
    filterColumn?: string,
    filterData?: [string]
  ) => {
    page = !page || page < 1 ? 1 : page;
    pageSize = !pageSize || pageSize < 1 ? 10 : pageSize;
    let total = 0;
    try {
      if (!keyWords) {
        keyWords = "";
      }
      let fieldUserName, fieldSubUserName;
      if (TypeEntity.COMPANY === typeUser || TypeEntity.USER === typeUser) {
        fieldUserName = "userClientID";
        fieldSubUserName = "nameSubUserClient";
      } else {
        fieldUserName = "subUserClientID";
        fieldSubUserName = "";
      }

      if (!fieldName) {
        fieldName = "createDate";
      }
      let order: SortOrder;
      if (!orderType || orderType === OrderType.DESC) {
        order = -1;
      } else {
        order = 1;
      }
      const searchConditions: any = {
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

      let results = await PurchaseOrderModel.find(searchConditions)
        .sort({ [fieldName]: order })
        .skip(skip)
        .limit(pageSize)
        .collation({ locale: "en", strength: 2 });

      if (keyWords && results.length === 0) {
        // Crear una copia del array $and sin la condición $or
        const searchConditionsWithoutKeyWords = {
          ...searchConditions,
          $and: searchConditions.$and.filter(
            (condition: any) => !condition.$or
          ),
        };

        // Obtener todos los registros sin aplicar el filtro de palabras clave
        const allResults = await PurchaseOrderModel.find(
          searchConditionsWithoutKeyWords
        );

        // Configurar Fuse.js
        const fuse = new Fuse(allResults, {
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

        const sortField = fieldName ?? "createDate"; // Si fieldName es undefined, usar "publish_date"

        // Ordenar los resultados por el campo dinámico sortField
        results.sort((a, b) => {
          const valueA = (a as any)[sortField];
          const valueB = (b as any)[sortField];

          if (typeof valueA === "string" && typeof valueB === "string") {
            // Usar localeCompare para comparar cadenas ignorando mayúsculas, minúsculas y acentos
            return (
              valueA.localeCompare(valueB, undefined, {
                sensitivity: "base",
              }) * (orderType === OrderType.ASC ? 1 : -1)
            );
          }

          if (valueA > valueB) return orderType === OrderType.ASC ? 1 : -1;
          if (valueA < valueB) return orderType === OrderType.ASC ? -1 : 1;
          return 0; // Si son iguales, no cambiar el orden
        });
        // Total de resultados (count usando Fuse.js)
        total = results.length;

        // Aplicar paginación sobre los resultados ordenados de Fuse.js
        const start = (page - 1) * pageSize;
        results = results.slice(start, start + pageSize);
      } else {
        // Si encontramos resultados en MongoDB, el total es la cantidad de documentos encontrados
        total = await PurchaseOrderModel.countDocuments(searchConditions);
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
    } catch (error) {
      console.log(error);
      return {
        success: false,
        code: 500,
        error: {
          msg: "Error interno en el Servidor",
        },
      };
    }
  };

  static createPDF = async (htmlContent: string): Promise<Buffer> => {
    // Iniciar el navegador de Puppeteer
    //const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"], // Deshabilitar sandbox
    });

    const page = await browser.newPage();
    let pdfBuffer;
    // Establecer el contenido HTML
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generar el PDF como Buffer (con formato A4)
    /*  pdfBuffer = (await page.pdf({
      format: "A4",
      printBackground: true,
    })) as Buffer;
*/
    pdfBuffer = Buffer.from(
      await page.pdf({
        format: "A4",
        printBackground: true,
      })
    );
    // Cerrar el navegador
    await browser.close();

    // Retornar el buffer del PDF
    return pdfBuffer;
  };

  static getPurchaseOrderPDF = async (uid: string) => {
    try {
      const data = await this.getPurchaseOrderID(uid);
      if (data && data.success && data.data) {
        const html = await OrderPurchaseTemplate(data.data[0]);

        // Genera el PDF a partir de la plantilla HTML
        const pdfBuffer: Buffer = await this.createPDF(html);

        // Convierte el PDF a base64
        const pdfBase64 = pdfBuffer.toString("base64");

        return {
          success: true,
          code: 200,
          data: pdfBase64,
        };
      } else {
        return {
          success: false,
          code: 403,
          error: {
            msg: "No se ha encontrado la Orden de Compra",
          },
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        code: 500,
        error: {
          msg: "Error al generar el PDF",
        },
      };
    }
  };

  static canceled = async (purchaseOrderID: string) => {
    try {
      const purchaseOrderData = await this.getPurchaseOrderID(purchaseOrderID);
      if (purchaseOrderData.data?.[0].stateID === PurchaseOrderState.PENDING) {
        console.log(purchaseOrderData.data?.[0].stateID);
      }
      return {
        success: true,
        code: 200,
        data: purchaseOrderData,
        res: {
          message: "La Orden de Compra ha sido cancelada con éxito",
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        code: 500,
        error: {
          msg: "Error interno en el Servidor",
        },
      };
    }
  };

  static updateField = async (uid: string, field: string, value: any) => {
    try {
      const updatedOrder = await PurchaseOrderModel.findOneAndUpdate(
        { uid },
        { $set: { [field]: value } },
        { new: true }
      );

      return updatedOrder;
    } catch (error) {
      return {
        success: false,
        code: 500,
        error: {
          msg: "Error interno en el Servidor",
        },
      };
    }
  };
}
