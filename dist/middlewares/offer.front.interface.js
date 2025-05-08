"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformOffersData = transformOffersData;
function transformOffersData(response) {
    const transformedData = response.data.map((offer) => {
        var _a, _b;
        return ({
            key: offer.uid, // 'uid' renombrado a 'key'
            title: offer.name, // 'name' renombrado a 'title'
            user: offer.entityID, // 'userID' renombrado a 'user'
            subUser: offer.userID, // 'entityID' usado como 'subUser'
            requirementTitle: offer.requerimentTitle, // No está presente en OfferI; deberás buscarlo si es necesario
            requirementId: offer.requerimentID, // 'requerimentID' renombrado a 'requirementId'
            publishDate: offer.publishDate.toISOString(), // 'publishDate' convertido a string
            coin: offer.currencyID, // 'currencyID' renombrado a 'coin'
            price: offer.budget, // 'budget' renombrado a 'price'
            state: offer.stateID, // 'stateID' renombrado a 'state'
            description: offer.description, // Sin cambios
            warranty: offer === null || offer === void 0 ? void 0 : offer.warranty, // Sin cambios
            warrantyTime: offer === null || offer === void 0 ? void 0 : offer.timeMeasurementID, // 'timeMeasurementID' renombrado a 'warrantyTime'
            deliveryTime: offer.deliveryTimeID, // 'deliveryTimeID' renombrado a 'deliveryTime'
            location: offer.cityID, // 'cityID' renombrado a 'location'
            image: offer.images, //
            document: offer.files, //
            selectionDate: (_a = offer.selectionDate) === null || _a === void 0 ? void 0 : _a.toISOString(), //
            igv: offer.includesIGV, // 'includesIGV' renombrado a 'igv'
            deliveryDate: (_b = offer.deliveryDate) === null || _b === void 0 ? void 0 : _b.toISOString(), // 'deliveryDate' convertido a string
            canceledByCreator: offer.canceledByCreator, // Sin cambios
            includesDelivery: offer.includesDelivery,
            delivered: offer.delivered, // Sin cambios
            userName: offer.userName,
            subUserName: offer.subUserName,
            emailUser: offer === null || offer === void 0 ? void 0 : offer.email,
            emailSubUser: offer === null || offer === void 0 ? void 0 : offer.subUserEmail,
            cancelRated: offer === null || offer === void 0 ? void 0 : offer.cancelRated,
        });
    });
    return {
        success: response.success,
        code: response.code,
        data: transformedData,
        res: response.res,
    };
}
//# sourceMappingURL=offer.front.interface.js.map