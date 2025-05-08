"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformData = transformData;
function transformData(response) {
    const arrayData = Array.isArray(response.data)
        ? response.data
        : [response.data];
    const transformedData = arrayData.map((item) => ({
        key: item.uid, // Aquí 'uid' viene de RequerimentI y lo renombramos a 'key'
        title: item.name, // 'name' renombrado a 'title'
        description: item.description, // Sin cambios
        category: item.categoryID, // 'categoryID' renombrado a 'category'
        location: item.cityID, // 'cityID' renombrado a 'location'
        cityName: item.cityName,
        email: item.email,
        price: item.budget, // 'budget' renombrado a 'price'
        coin: item.currencyID, // 'currencyID' renombrado a 'coin'
        payment_methodID: item.payment_methodID,
        publishDate: item.publish_date, // 'completion_date' convertido a 'publishDate'
        completion_date: item.completion_date,
        submission_date: item.submission_dateID,
        numberOffers: item.number_offers, // 'allowed_bidersID' renombrado a 'numberOffers'
        allowed_bidersID: item.allowed_bidersID,
        user: item.entityID, // Sin cambios
        subUser: item.userID,
        subUserEmail: item.subUserEmail,
        warranty: item === null || item === void 0 ? void 0 : item.warranty, // Mantener el campo 'warranty'
        duration: item === null || item === void 0 ? void 0 : item.durationID, // Mantener el campo 'duration'// Convertir string de fecha a objeto Date
        state: item.stateID, // Añadir un valor por defecto o según lógica
        images: item.images,
        files: item.files,
        winOffer: item.winOffer,
        userName: item.userName,
        subUserName: item.subUserName,
    }));
    return {
        success: response.success,
        code: response.code,
        data: transformedData,
        res: response.res,
    };
}
//# sourceMappingURL=requeriment.front.Interface.js.map