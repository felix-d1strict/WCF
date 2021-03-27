import * as Ajax from "../../../../Ajax";
import DomChangeListener from "../../../../Dom/Change/Listener";
import * as UiAlignment from "../../../Alignment";
import { NotificationAction } from "../../../Dropdown/Data";
import UiDropdownSimple from "../../../Dropdown/Simple";
import Item, { CallbackMarkAsRead, ItemData } from "./Item";
import Option from "./Option";

export class NotificationProvider {
  private body?: HTMLElement = undefined;
  private readonly button: HTMLAnchorElement;
  private container?: HTMLElement = undefined;
  private items: Item[] = [];
  private readonly options = new Map<string, Option>();
  private placeholderEmpty?: HTMLElement = undefined;
  private placeholderLoading?: HTMLElement = undefined;
  private state: State = State.Idle;

  constructor() {
    this.button = document.querySelector("#userNotifications > a") as HTMLAnchorElement;
    this.button.addEventListener("click", (event) => this.click(event));
  }

  private click(event: MouseEvent): void {
    event.preventDefault();

    this.build();
    this.toggle();
  }

  private build(): void {
    if (this.container) {
      return;
    }

    this.container = document.createElement("div");
    this.container.classList.add("userMenuProvider");

    const header = this.buildHeader();
    this.container.appendChild(header);

    this.body = this.buildBody();
    this.container.appendChild(this.body);

    document.body.appendChild(this.container);
  }

  private toggle(): void {
    const listItem = this.button.parentElement!;

    const container = this.container!;
    if (container.classList.contains("userMenuProviderOpen")) {
      container.classList.remove("userMenuProviderOpen");
      listItem.classList.remove("open");
    } else {
      container.classList.add("userMenuProviderOpen");
      listItem.classList.add("open");

      this.render();

      UiAlignment.set(container, this.button, { horizontal: "center" });
    }
  }

  private buildHeader(): HTMLElement {
    const header = document.createElement("div");
    header.classList.add("userMenuProviderHeader");

    const title = document.createElement("span");
    title.classList.add("userMenuProviderTitle");
    title.textContent = "Notifications";
    header.appendChild(title);

    const optionContainer = document.createElement("div");
    optionContainer.classList.add("userMenuProviderOptionContainer", "dropdown");
    header.appendChild(optionContainer);

    const options = document.createElement("span");
    options.classList.add("userMenuProviderOptions", "dropdownToggle");
    options.innerHTML = '<span class="icon icon24 fa-ellipsis-h"></span>';
    optionContainer.appendChild(options);

    const optionMenu = document.createElement("ul");
    optionMenu.classList.add("dropdownMenu");
    optionMenu.appendChild(this.buildOptions());

    optionContainer.appendChild(optionMenu);
    UiDropdownSimple.init(options);
    UiDropdownSimple.registerCallback(optionContainer.id, (containerId, action) =>
      this.toggleOptions(containerId, action),
    );

    return header;
  }

  private buildOptions(): DocumentFragment {
    this.options.set(
      "markAllAsRead",
      new Option({
        click: (option: Option) => {},
        label: "Mark all as read",
      }),
    );

    this.options.set("settings", new Option({ label: "Notification Settings", link: "#" }));

    this.options.set("showAll", new Option({ label: "Show All Notifications", link: "#" }));

    const fragment = document.createDocumentFragment();
    this.options.forEach((option) => {
      fragment.appendChild(option.getElement());
    });

    return fragment;
  }

  private toggleOptions(_containerId: string, action: NotificationAction): void {
    if (action === "close") {
      return;
    }

    const markAllAsRead = this.options.get("markAllAsRead")!;
    if (this.items.some((item) => !item.isConfirmed())) {
      markAllAsRead.show();
    } else {
      markAllAsRead.hide();
    }

    markAllAsRead.rebuild();
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

    const callbackMarkAsRead: CallbackMarkAsRead = (objectId) => this.markAsRead(objectId);
    this.items = data.map((itemData) => new Item(itemData, callbackMarkAsRead));

    this.state = State.Ready;

    this.render();
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

    if (this.items.length === 0) {
      this.showPlaceholderEmpty();
    } else {
      const fragment = document.createDocumentFragment();
      this.items.map((item) => item.getElement()).forEach((element) => fragment.appendChild(element));
      body.classList.remove("userMenuProviderBodyPlaceholder");
      body.appendChild(fragment);

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

  private async markAsRead(objectId: number): Promise<void> {
    await Ajax.simpleApi({
      data: {
        actionName: "markAsConfirmed",
        className: "wcf\\data\\user\\notification\\UserNotificationAction",
        objectIDs: [objectId],
      },
      silent: true,
    });
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
