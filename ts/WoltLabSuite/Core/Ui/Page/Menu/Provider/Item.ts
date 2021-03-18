import { getTimeElement } from "../../../../Date/Util";

export class UiPageMenuProviderItem {
  private author?: string = undefined;
  private element?: HTMLElement = undefined;
  private unreadLink = "";

  constructor(private readonly data: ItemData) {}

  getElement(): HTMLElement {
    if (!this.element) {
      this.element = this.render();
    }

    return this.element;
  }

  private render(): HTMLElement {
    const item = document.createElement("div");
    item.classList.add("pageMenuOverlayContentItem");

    const image = this.renderImage();
    image.classList.add("pageMenuOverlayItemImage");
    item.appendChild(image);

    const text = document.createElement("div");
    text.classList.add("pageMenuOverlayItemText");
    text.innerHTML = this.data.text;
    item.appendChild(text);

    const date = new Date(this.data.time * 1_000);
    const time = getTimeElement(date);
    time.classList.add("pageMenuOverlayItemTime");
    item.appendChild(time);

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

export default UiPageMenuProviderItem;
