import * as Ajax from "../../../../Ajax";
import DomChangeListener from "../../../../Dom/Change/Listener";
import * as UiAlignment from "../../../Alignment";
import UiCloseOverlay from "../../../CloseOverlay";
import { NotificationAction } from "../../../Dropdown/Data";
import UiDropdownSimple from "../../../Dropdown/Simple";
import Item, { ItemData } from "./Item";
import ItemList from "./ItemList";
import Option from "./Option";
import * as Language from "../../../../Language";

type Links = Record<"settings" | "showAll", string>;

export class NotificationProvider {
  private body?: HTMLElement = undefined;
  private readonly button: HTMLAnchorElement;
  private readonly buttonListItem: HTMLLIElement;
  private container?: HTMLElement = undefined;
  private itemList?: ItemList = undefined;
  private readonly links: Links;
  private optionContainer?: HTMLElement = undefined;
  private placeholderEmpty?: HTMLElement = undefined;
  private placeholderLoading?: HTMLElement = undefined;
  private readonly providerOptions = new Map<string, Option>();
  private readonly settings = new Map<number, boolean>();
  private state: State = State.Idle;
  private tabIndex = -1;
  private title?: HTMLElement = undefined;

  constructor(links: Links) {
    this.button = document.querySelector("#userNotifications > a") as HTMLAnchorElement;
    this.button.addEventListener("click", (event) => this.click(event));
    this.button.tabIndex = 0;
    this.button.setAttribute("role", "button");

    this.buttonListItem = this.button.parentElement as HTMLLIElement;

    this.links = links;
  }

  private click(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.build();
    this.toggle();
  }

  private build(): void {
    if (this.container) {
      return;
    }

    this.container = document.createElement("div");
    this.container.classList.add("userMenuProvider");
    this.container.setAttribute("role", "dialog");

    this.container.addEventListener("click", (event) => {
      event.stopPropagation();

      UiDropdownSimple.closeAll();
    });
    this.container.addEventListener("keydown", (event) => this.keydown(event));

    const header = this.buildHeader();
    this.container.appendChild(header);

    this.body = this.buildBody();
    this.container.appendChild(this.body);
  }

  private keydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.close();
      this.button!.focus();
    }

    if (event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();

      let element: HTMLElement | null;
      if (event.shiftKey) {
        element = this.getPreviousFocusableElement();
      } else {
        element = this.getNextFocusableElement();
      }

      if (element) {
        element.focus();
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    return Array.from(
      this.container!.querySelectorAll('[tabindex]:not([tabindex^="-"]):not([inert])'),
    ) as HTMLElement[];
  }

  private getNextFocusableElement(): HTMLElement | null {
    const elements = this.getFocusableElements();

    this.tabIndex++;
    if (this.tabIndex === elements.length) {
      this.tabIndex = 0;
    }

    return elements[this.tabIndex] || null;
  }

  private getPreviousFocusableElement(): HTMLElement | null {
    const elements = this.getFocusableElements();

    this.tabIndex--;
    if (this.tabIndex < 0) {
      this.tabIndex = elements.length - 1;
    }

    return elements[this.tabIndex] || null;
  }

  private toggle(): void {
    if (this.container!.parentElement !== null) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    const container = this.container!;
    this.buttonListItem.classList.add("open");
    document.body.appendChild(container);

    this.render();

    UiAlignment.set(container, this.button, { horizontal: "center" });

    this.title!.focus();

    const identifier = "WoltLabSuite/Core/Ui/User/Menu/Provider";
    UiCloseOverlay.add(identifier, () => this.close());
  }

  private close(): void {
    this.buttonListItem.classList.remove("open");

    this.container!.remove();

    const identifier = "WoltLabSuite/Core/Ui/User/Menu/Provider";
    UiCloseOverlay.remove(identifier);
  }

  private buildHeader(): HTMLElement {
    const header = document.createElement("div");
    header.classList.add("userMenuProviderHeader");

    this.title = document.createElement("span");
    this.title.classList.add("userMenuProviderTitle");
    this.title.textContent = Language.get("wcf.user.notification.notifications");
    this.title.tabIndex = -1;
    this.container!.setAttribute("aria-label", Language.get("wcf.user.notification.notifications"));
    header.appendChild(this.title);

    const optionContainer = document.createElement("div");
    optionContainer.classList.add("userMenuProviderOptionContainer", "dropdown");
    header.appendChild(optionContainer);

    const options = document.createElement("span");
    options.classList.add("userMenuProviderOptions", "dropdownToggle");
    options.innerHTML = '<span class="icon icon24 fa-ellipsis-h"></span>';
    options.tabIndex = 0;
    options.setAttribute("role", "button");
    optionContainer.appendChild(options);

    const optionMenu = document.createElement("ul");
    optionMenu.classList.add("dropdownMenu");
    optionMenu.appendChild(this.buildOptions());

    optionContainer.appendChild(optionMenu);
    UiDropdownSimple.init(options);
    UiDropdownSimple.registerCallback(optionContainer.id, (containerId, action) =>
      this.toggleOptions(containerId, action),
    );

    this.optionContainer = optionContainer;

    return header;
  }

  private buildOptions(): DocumentFragment {
    const fragment = document.createDocumentFragment();

    this.providerOptions.set(
      "markAllAsRead",
      new Option("markAllAsRead", Language.get("wcf.user.panel.markAllAsRead"), false, (option) =>
        this.optionClick(option),
      ),
    );
    this.providerOptions.set(
      "settings",
      new Option("settings", Language.get("wcf.user.panel.settings"), this.links.settings),
    );

    this.providerOptions.set(
      "showAll",
      new Option("showAll", Language.get("wcf.user.panel.showAll"), this.links.showAll),
    );

    this.providerOptions.forEach((option) => {
      fragment.appendChild(option.getElement());
    });

    return fragment;
  }

  private toggleOptions(_containerId: string, action: NotificationAction): void {
    if (action === "close") {
      return;
    }

    const markAllAsRead = this.providerOptions.get("markAllAsRead")!;
    if (this.itemList!.hasUnconfirmedItems()) {
      markAllAsRead.show();
    } else {
      markAllAsRead.hide();
    }

    markAllAsRead.rebuild();
  }

  private async optionClick(option: Option): Promise<void> {
    if (option.identifier === "markAllAsRead") {
      await Ajax.simpleApi({
        data: {
          actionName: "markAllAsConfirmed",
          className: "wcf\\data\\user\\notification\\UserNotificationAction",
        },
      });

      this.itemList!.getItems().forEach((item) => {
        item.markAsConfirmed();
      });
    }

    UiDropdownSimple.close(this.optionContainer!.id);
  }

  private buildBody(): HTMLElement {
    const body = document.createElement("div");
    body.classList.add("userMenuProviderBody");

    return body;
  }

  private render(): void {
    switch (this.state) {
      case State.Idle:
        void this.load();
        break;

      case State.Loading:
      case State.Failure:
        // Do nothing.
        break;

      case State.Ready:
        this.showContent();
        break;

      default:
        throw new Error(`Unexpected state '${this.state}'`);
    }
  }

  private async load(): Promise<void> {
    this.state = State.Loading;

    this.showPlaceholderLoading();

    let data: ItemData[];
    try {
      data = await this.loadData();
    } catch (e) {
      this.state = State.Failure;
      return;
    }

    if (!this.itemList) {
      const callbackClick = (option: Option) => {
        void this.callbackItemOptionSelect(this.itemList!.getActiveItem()!, option);

        UiDropdownSimple.closeAll();
      };
      const options = [
        new Option("markAsRead", Language.get("wcf.user.panel.markAsRead"), false, callbackClick),
        new Option("disable", Language.get("wcf.user.notification.disable"), false, callbackClick),
        new Option("enable", Language.get("wcf.user.notification.enable"), false, callbackClick),
      ];
      this.itemList = new ItemList({
        callbackItemOptionsToggle: (item, options) => this.callbackItemOptionsToggle(item, options),
        itemOptions: options,
      });
    }

    this.itemList.setItems(data);

    this.settings.clear();
    this.itemList.getItems().forEach((item) => {
      const settings = this.getSettings(item);
      this.settings.set(settings.eventID, settings.enabled);
    });

    this.state = State.Ready;

    this.render();
  }

  private getSettings(item: Item): NotificationSettings {
    const metaData = item.getMetaData() as NotificationMetaData;
    return metaData.notification;
  }

  private async callbackItemOptionSelect(item: Item, option: Option): Promise<void> {
    item.setIsBusy(true);

    switch (option.identifier) {
      case "markAsRead":
        await this.markAsRead(item);
        break;

      case "enable":
        await this.toggleNotification(item, true);
        break;

      case "disable":
        await this.toggleNotification(item, false);
        break;
    }

    item.setIsBusy(false);
  }

  private callbackItemOptionsToggle(item: Item, options: Option[]): void {
    const settings = this.getSettings(item);

    options.forEach((option) => {
      switch (option.identifier) {
        case "markAsRead":
          if (item.isConfirmed()) {
            option.hide();
          } else {
            option.show();
          }
          break;

        case "enable":
          if (this.settings.get(settings.eventID)) {
            option.hide();
          } else {
            option.show();
          }
          break;

        case "disable":
          if (this.settings.get(settings.eventID)) {
            option.show();
          } else {
            option.hide();
          }
          break;
      }
    });
  }

  private showPlaceholderLoading(): void {
    if (!this.placeholderLoading) {
      this.placeholderLoading = document.createElement("div");
      this.placeholderLoading.classList.add("userMenuProviderPlaceholder", "userMenuProviderLoading");
      this.placeholderLoading.textContent = "Loading…";
    }

    const body = this.body!;
    body.innerHTML = "";
    body.classList.add("userMenuProviderBodyPlaceholder");
    body.appendChild(this.placeholderLoading);
  }

  private showContent(): void {
    const body = this.body!;
    body.innerHTML = "";

    const itemList = this.itemList!;
    if (!itemList.hasItems()) {
      this.showPlaceholderEmpty();
    } else {
      const element = itemList.getElement();

      body.classList.remove("userMenuProviderBodyPlaceholder");
      body.appendChild(element);

      DomChangeListener.trigger();
    }
  }

  private showPlaceholderEmpty(): void {
    if (!this.placeholderEmpty) {
      this.placeholderEmpty = document.createElement("div");
      this.placeholderEmpty.classList.add("userMenuProviderPlaceholder", "userMenuProviderEmpty");
      this.placeholderEmpty.textContent = "There is nothing to display.";
    }

    const body = this.body!;
    body.classList.add("userMenuProviderBodyPlaceholder");
    body.appendChild(this.placeholderEmpty);
  }

  private async loadData(): Promise<ItemData[]> {
    const data = (await Ajax.simpleApi({
      data: {
        actionName: "getOutstandingNotifications",
        className: "wcf\\data\\user\\notification\\UserNotificationAction",
      },
      silent: true,
    })) as AjaxResponse;

    return data.returnValues;
  }

  private async markAsRead(item: Item): Promise<void> {
    await Ajax.simpleApi({
      data: {
        actionName: "markAsConfirmed",
        className: "wcf\\data\\user\\notification\\UserNotificationAction",
        objectIDs: [item.getObjectId()],
      },
      silent: true,
    });

    item.markAsConfirmed();
  }

  private async toggleNotification(item: Item, enable: boolean): Promise<void> {
    const actionName = enable ? "enableNotifications" : "disableNotifications";
    const eventId = this.getSettings(item).eventID;

    await Ajax.simpleApi({
      data: {
        actionName,
        className: "wcf\\data\\user\\notification\\event\\UserNotificationEventAction",
        objectIDs: [eventId],
      },
      silent: true,
    });

    this.settings.set(eventId, enable);
  }
}

export default NotificationProvider;

interface AjaxResponse {
  returnValues: ItemData[];
}

const enum State {
  Idle,
  Loading,
  Ready,
  Failure,
}

interface NotificationSettings {
  enabled: boolean;
  eventID: number;
}

interface NotificationMetaData {
  notification: NotificationSettings;
}
