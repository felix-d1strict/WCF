import DomUtil from "../../../../Dom/Util";

export class Option {
  private element?: HTMLLIElement = undefined;
  private readonly data: OptionData;
  private visible = true;

  constructor(data: OptionData) {
    this.data = data;
  }

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }

  isVisible(): boolean {
    return this.visible;
  }

  getElement(): HTMLLIElement {
    if (!this.element) {
      this.element = this.render();
    }

    this.rebuild();

    return this.element;
  }

  private render(): HTMLLIElement {
    const listItem = document.createElement("li");

    const link = document.createElement("a");
    link.textContent = this.data.label;
    if (this.data.link) {
      link.href = this.data.link;
    } else {
      link.href = "#";
      link.addEventListener("click", (event) => {
        event.preventDefault();

        this.data.click!(this);
      });
    }
    listItem.appendChild(link);

    return listItem;
  }

  rebuild(): void {
    const element = this.element!;

    if (this.visible) {
      DomUtil.show(element);
    } else {
      DomUtil.hide(element);
    }
  }
}

type CallbackClick = (option: Option) => void;

interface OptionButton {
  click: CallbackClick;
  label: string;
  link?: never;
}
interface OptionLink {
  click?: never;
  label: string;
  link: string;
}

export type OptionData = OptionButton | OptionLink;

export default Option;
