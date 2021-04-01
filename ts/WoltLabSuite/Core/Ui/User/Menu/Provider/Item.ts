import { getTimeElement } from "../../../../Date/Util";

export class Item {
  private buttonOptions?: HTMLElement = undefined;
  private readonly callbackToggleOptions: CallbackToggleOptions;
  private readonly data: ItemData;
  private element?: HTMLElement = undefined;
  private markAsReadIcon?: HTMLSpanElement = undefined;

  constructor(data: ItemData, options: ItemOptions) {
    this.data = data;
    this.callbackToggleOptions = options.callbackToggleOptions;
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

  getMetaData(): MetaData {
    return this.data.meta;
  }

  getOptionButton(): HTMLElement {
    return this.buttonOptions!;
  }

  private render(): HTMLElement {
    const item = document.createElement("div");
    item.classList.add("userMenuProviderItem");
    item.setAttribute("role", "row");

    const content = document.createElement("div");
    content.setAttribute("role", "gridcell");
    item.appendChild(content);

    const link = document.createElement("a");
    link.classList.add("userMenuProviderItemLink");
    link.href = this.data.link;
    link.tabIndex = -1;
    content.appendChild(link);

    const image = this.renderImage();
    image.classList.add("userMenuProviderItemImage");
    link.appendChild(image);

    const text = document.createElement("div");
    text.classList.add("userMenuProviderItemText");
    text.innerHTML = this.data.text;
    link.appendChild(text);

    const date = new Date(this.data.time * 1_000);
    const time = getTimeElement(date);
    time.classList.add("userMenuProviderItemMeta");
    link.appendChild(time);

    const interaction = document.createElement("div");
    interaction.setAttribute("role", "gridcell");
    item.appendChild(interaction);

    const markAsRead = document.createElement("span");
    markAsRead.classList.add("userMenuProviderItemOptions");
    markAsRead.addEventListener("click", (event) => this.callbackToggleOptions(this));
    markAsRead.tabIndex = -1;
    markAsRead.setAttribute("role", "button");
    this.buttonOptions = markAsRead;
    interaction.appendChild(markAsRead);

    this.markAsReadIcon = document.createElement("span");
    this.markAsReadIcon.classList.add("icon", "icon24", "fa-ellipsis-h");
    markAsRead.appendChild(this.markAsReadIcon);

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

  /*
  private async markAsRead(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const icon = this.markAsReadIcon!;
    if (icon.classList.contains("fa-spinner")) {
      return;
    }

    icon.classList.replace("fa-ellipsis-h", "fa-spinner");

    try {
      await this.callbackMarkAsRead(this.data.objectId);

      this.data.isConfirmed = true;
      this.rebuild();
    } finally {
      icon.classList.replace("fa-spinner", "fa-ellipsis-h");
    }
  }
  */
}

type MetaData = Record<string, unknown>;

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
  meta: MetaData;
  objectId: number;
  text: string;
  time: number;
}

export interface ItemOptions {
  callbackToggleOptions: CallbackToggleOptions;
}

export type CallbackToggleOptions = (item: Item) => void;

export default Item;
