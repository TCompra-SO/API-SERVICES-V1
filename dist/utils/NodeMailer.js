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
exports.sendEmailPurchaseOrder = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const OrderPurchaseTemplate_1 = require("./OrderPurchaseTemplate");
const purchaseOrderService_1 = require("../services/purchaseOrderService");
const sendEmailPurchaseOrder = (data, emailUser) => __awaiter(void 0, void 0, void 0, function* () {
    const html = yield (0, OrderPurchaseTemplate_1.OrderPurchaseTemplate)(data);
    const pdfBuffer = yield purchaseOrderService_1.PurchaseOrderService.createPDF(html);
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: "tcompraperu@gmail.com",
            pass: "uzof pfmc lcwz kgko",
        },
    });
    const mailOptions = {
        from: '"TCOMPRA" <tcompraperu@gmail.com>', // Cambia al correo de la empresa si es necesario
        to: emailUser,
        subject: `Se aceptó tu oferta para el requerimiento: ${data.requerimentTitle}`,
        html: `${yield (0, OrderPurchaseTemplate_1.OrderPurchaseTemplate)(data)}`,
        attachments: [
            {
                filename: `orden_de_compra_${data.userClientID}.pdf`,
                content: pdfBuffer, // Adjuntar el PDF generado
            },
        ],
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log("Mensaje enviado: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        console.error("Error al enviar el correo:", error);
        return { success: false, error: error };
    }
});
exports.sendEmailPurchaseOrder = sendEmailPurchaseOrder;
//# sourceMappingURL=NodeMailer.js.map