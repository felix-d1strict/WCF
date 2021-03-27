import { getTimeElement } from "../../../../Date/Util";

export class Item {
  private readonly callbackMarkAsRead: CallbackMarkAsRead;
  private readonly data: ItemData;
  private element?: HTMLElement = undefined;
  private markAsReadIcon?: HTMLSpanElement = undefined;

  constructor(data: ItemData, callbackMarkAsRead: CallbackMarkAsRead) {
    this.data = data;
    this.callbackMarkAsRead = callbackMarkAsRead;
  }

  getElement(): HTMLElement {
    if (!this.element) {
      this.element = this.render();
    }

    this.rebuild();

    return this.element;
  }

  isConfirmed(): boolean {
    return this.data.isConfirmed;
  }

  private render(): HTMLElement {
    const item = document.createElement("div");
    item.classList.add("userMenuProviderItem");

    const image = this.renderImage();
    image.classList.add("userMenuProviderItemImage");
    item.appendChild(image);

    const text = document.createElement("div");
    text.classList.add("userMenuProviderItemText");
    text.innerHTML = this.data.text;
    item.appendChild(text);

    const markAsRead = document.createElement("div");
    markAsRead.classList.add("userMenuProviderItemMarkAsRead");
    this.markAsReadIcon = document.createElement("span");
    this.markAsReadIcon.classList.add("icon", "icon16", "fa-check");
    markAsRead.appendChild(this.markAsReadIcon);
    markAsRead.addEventListener("click", (event) => this.markAsRead(event));
    item.appendChild(markAsRead);

    const date = new Date(this.data.time * 1_000);
    const time = getTimeElement(date);
    time.classList.add("userMenuProviderItemMeta");
    item.appendChild(time);

    const link = document.createElement("a");
    link.classList.add("userMenuProviderItemShadow");
    link.href = this.data.link;
    item.appendChild(link);

    return item;
  }

  private renderImage(): HTMLElement {
    let image: HTMLElement;

    if (this.data.image.className) {
      image = document.createElement("span");
      image.classList.add("icon", "icon32", this.data.image.className!);
    } else {
      image = document.createElement("img");
      image.classList.add("userAvatarImage");
      (image as HTMLImageElement).src = this.data.image.url!;
    }

    return image;
  }

  private rebuild(): void {
    const element = this.element!;

    if (this.data.isConfirmed) {
      element.classList.remove("userMenuProviderItemOutstanding");
    } else {
      element.classList.add("userMenuProviderItemOutstanding");
    }
  }

  private async markAsRead(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const icon = this.markAsReadIcon!;
    if (icon.classList.contains("fa-spinner")) {
      return;
    }

    icon.classList.replace("fa-check", "fa-spinner");

    try {
      await this.callbackMarkAsRead(this.data.objectId);

      this.data.isConfirmed = true;
      this.rebuild();
    } finally {
      icon.classList.replace("fa-spinner", "fa-check");
    }
  }
}

export interface ItemIcon {
  className: string;
  url?: never;
}

export interface ItemImage {
  className?: never;
  url: string;
}

export interface ItemData {
  image: ItemIcon | ItemImage;
  isConfirmed: boolean;
  link: string;
  objectId: number;
  text: string;
  time: number;
}

export type CallbackMarkAsRead = (objectId: number) => Promise<void>;

export default Item;
