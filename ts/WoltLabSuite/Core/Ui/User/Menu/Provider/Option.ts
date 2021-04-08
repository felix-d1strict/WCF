import DomUtil from "../../../../Dom/Util";

export type CallbackClick = (option: Option) => void;

export class Option {
  readonly identifier: string;
  private readonly callbackClick: CallbackClick;
  private element?: HTMLLIElement = undefined;
  private readonly label: string;
  private visible = true;

  constructor(identifier: string, label: string, callbackClick: CallbackClick) {
    this.callbackClick = callbackClick;
    this.identifier = identifier;
    this.label = label;
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
    link.textContent = this.label;
    link.href = "#";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      this.callbackClick(this);
    });
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

export default Option;
