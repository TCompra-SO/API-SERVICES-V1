"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveNotificationMiddleware = void 0;
const axios_1 = __importDefault(require("axios"));
const Types_1 = require("../utils/Types");
function sendNotification(notification) {
    if ((notification === null || notification === void 0 ? void 0 : notification.targetId) && (notification === null || notification === void 0 ? void 0 : notification.receiverId))
        axios_1.default
            .post(`${process.env.API_USER}notification/send`, notification)
            .catch((error) => {
            console.error("Error al enviar notificación:", error);
        });
}
const saveNotificationMiddleware = (req, res, next) => {
    const originalSend = res.send.bind(res);
    let notificationSaved = false;
    res.send = function (body) {
        var _a, _b, _c;
        try {
            if (!notificationSaved &&
                res.statusCode >= 200 &&
                res.statusCode < 300 &&
                req.body.notification) {
                notificationSaved = true;
                let notification = req.body.notification;
                const extraNotifications = req.body.extraNotifications;
                if (notification) {
                    // Descargar orden de oferta seleccionada
                    if (notification.action == Types_1.NotificationAction.DOWNLOAD_PURCHASE_ORDER &&
                        !notification.targetId) {
                        notification.targetId = (_a = body.res) === null || _a === void 0 ? void 0 : _a.purchaseOrderUID;
                    }
                    // Cancelar 'mi' oferta seleccionada
                    else if (notification.action == Types_1.NotificationAction.VIEW_REQUIREMENT &&
                        !notification.receiverId) {
                        notification.receiverId = (_b = body.res) === null || _b === void 0 ? void 0 : _b.requirementSubUserUid; // creador del requerimiento
                    }
                    // Se produjo una disputa al culminar
                    else if ((notification.action == Types_1.NotificationAction.VIEW_OFFER ||
                        notification.action == Types_1.NotificationAction.VIEW_REQUIREMENT) &&
                        ((_c = body.res) === null || _c === void 0 ? void 0 : _c.dispute)) {
                        notification = undefined;
                        if (Array.isArray(extraNotifications)) {
                            // Enviar notificaciones de disputa
                            extraNotifications.forEach((notification) => {
                                sendNotification(notification);
                            });
                        }
                    }
                    // Enviar notificación si existe
                    sendNotification(notification);
                }
            }
        }
        catch (e) {
            console.log("Error en saveNotificationMiddleware", e);
        }
        return originalSend(body);
    };
    next();
};
exports.saveNotificationMiddleware = saveNotificationMiddleware;
//# sourceMappingURL=notification.js.map