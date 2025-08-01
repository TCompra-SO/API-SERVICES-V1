import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { NotificationI } from "../interfaces/notification.interface";
import { NotificationAction } from "../utils/Types";

function sendNotification(notification: NotificationI | undefined) {
  if (notification?.targetId && notification?.receiverId)
    axios
      .post(`${process.env.API_USER}/v1/notification/send`, notification)
      .catch((error) => {
        console.error("Error al enviar notificación:", error);
      });
}
export async function sendNotificationScore(
  notification: NotificationI | undefined
): Promise<boolean> {
  if (notification?.targetId && notification?.receiverId) {
    try {
      await axios.post(
        `${process.env.API_USER}/v1/notification/send`,
        notification
      );
      return true; // ✅ Enviado correctamente
    } catch (error) {
      console.error("Error al enviar notificación:", error);
      return false; // ❌ Falló el envío
    }
  }
  console.warn("Notificación incompleta, faltan targetId o receiverId");
  return false;
}

export const saveNotificationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send.bind(res);
  let notificationSaved = false;

  res.send = function (body: any) {
    try {
      if (
        !notificationSaved &&
        res.statusCode >= 200 &&
        res.statusCode < 300 &&
        req.body.notification
      ) {
        notificationSaved = true;
        let notification: NotificationI | undefined = req.body.notification;
        const extraNotifications: NotificationI[] | undefined =
          req.body.extraNotifications;
        if (notification) {
          // Descargar orden de oferta seleccionada
          if (
            notification.action == NotificationAction.DOWNLOAD_PURCHASE_ORDER &&
            !notification.targetId
          ) {
            notification.targetId = body.res?.purchaseOrderUID;
          }
          // Cancelar 'mi' oferta seleccionada
          else if (
            notification.action == NotificationAction.VIEW_REQUIREMENT &&
            !notification.receiverId
          ) {
            notification.receiverId = body.res?.requirementSubUserUid; // creador del requerimiento
          }
          // Se produjo una disputa al culminar
          else if (
            (notification.action == NotificationAction.VIEW_OFFER ||
              notification.action == NotificationAction.VIEW_REQUIREMENT) &&
            body.res?.dispute
          ) {
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
    } catch (e) {
      console.log("Error en saveNotificationMiddleware", e);
    }

    return originalSend(body);
  };

  next();
};
