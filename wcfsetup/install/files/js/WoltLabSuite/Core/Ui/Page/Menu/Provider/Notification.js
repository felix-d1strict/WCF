define(["require", "exports", "tslib", "../../../../Ajax", "./Abstract", "./Item"], function (require, exports, tslib_1, Ajax, Abstract_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UiPageMenuProviderNotification = void 0;
    Ajax = tslib_1.__importStar(Ajax);
    Abstract_1 = tslib_1.__importDefault(Abstract_1);
    class UiPageMenuProviderNotification extends Abstract_1.default {
        constructor() {
            super(...arguments);
            this.notifications = undefined;
        }
        async loadContent() {
            if (this.notifications) {
                return;
            }
            return new Promise((resolve, reject) => {
                Ajax.apiOnce({
                    data: {
                        actionName: "getOutstandingNotifications",
                        className: "wcf\\data\\user\\notification\\UserNotificationAction",
                    },
                    silent: true,
                    success: (data) => {
                        this.notifications = data.returnValues.map((itemData) => new Item_1.UiPageMenuProviderItem(itemData));
                        resolve();
                    },
                    failure() {
                        reject();
                        return true;
                    },
                });
            });
        }
        hasContent() {
            throw new Error("Method not implemented.");
        }
        getContent() {
            if (!this.notifications) {
                return [];
            }
            return this.notifications.map((item) => item.getElement());
        }
    }
    exports.UiPageMenuProviderNotification = UiPageMenuProviderNotification;
});
