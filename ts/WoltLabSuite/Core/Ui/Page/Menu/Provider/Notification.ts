import * as Ajax from "../../../../Ajax";
import UiPageMenuProviderAbstract from "./Abstract";
import { UiPageMenuProviderItem, ItemData } from "./Item";

export class UiPageMenuProviderNotification extends UiPageMenuProviderAbstract {
  private notifications?: UiPageMenuProviderItem[] = undefined;

  async loadContent(): Promise<void> {
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
        success: (data: AjaxResponse) => {
          this.notifications = data.returnValues.map((itemData) => new UiPageMenuProviderItem(itemData));

          resolve();
        },
        failure() {
          reject();

          return true;
        },
      });
    });
  }

  hasContent(): boolean {
    throw new Error("Method not implemented.");
  }

  getContent(): HTMLElement[] {
    if (!this.notifications) {
      return [];
    }

    return this.notifications.map((item) => item.getElement());
  }

  getFooterButtons(): HTMLElement[] {
    throw new Error("Method not implemented.");
  }
}

interface AjaxResponse {
  returnValues: ItemData[];
}
