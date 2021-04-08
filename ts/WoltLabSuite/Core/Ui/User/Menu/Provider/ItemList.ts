import Item, { ItemData } from "./Item";
import Option from "./Option";
import * as DropDown from "../../../Dropdown/Reusable";
import { NotificationAction } from "../../../Dropdown/Data";

let _counter = 0;

type Position = Record<"row" | "column", number>;

export type CallbackItemOptionsToggle = (item: Item, options: Option[]) => void;

interface ItemListOptions {
  callbackItemOptionsToggle: CallbackItemOptionsToggle;
  itemOptions: Option[];
}

export class ItemList {
  private activeItem?: Item = undefined;
  private element?: HTMLElement = undefined;
  private readonly identifier: string;
  private items: Item[] = [];
  private readonly options: ItemListOptions;
  private position: Position = {
    column: -1,
    row: -1,
  };

  constructor(options: ItemListOptions) {
    this.identifier = "userMenuProviderList_" + _counter++;
    this.options = options;
  }

  setItems(itemData: ItemData[]): void {
    this.items = itemData.map((data) => new Item(data, { callbackToggleOptions: (item) => this.toggleOptions(item) }));
  }

  getItems(): Item[] {
    return this.items;
  }

  hasItems(): boolean {
    return this.items.length !== 0;
  }

  getElement(): HTMLElement {
    if (!this.element) {
      this.element = this.render();
    }

    return this.element;
  }

  hasUnconfirmedItems(): boolean {
    return this.items.some((item) => !item.isConfirmed());
  }

  getActiveItem(): Item | undefined {
    return this.activeItem;
  }

  private toggleOptions(item: Item): void {
    if (this.activeItem) {
      const closeOnly = this.activeItem === item;
      DropDown.toggleDropdown(this.identifier, this.activeItem.getOptionButton());

      if (closeOnly) {
        return;
      }
    }

    this.activeItem = item;
    DropDown.toggleDropdown(this.identifier, item.getOptionButton());
  }

  private render(): HTMLElement {
    const element = document.createElement("div");
    element.classList.add("userMenuProviderItemContainer");
    element.setAttribute("role", "grid");
    element.setAttribute("aria-readonly", "true");
    element.addEventListener("keydown", (event) => this.keydown(event));
    this.items.forEach((item) => {
      element.appendChild(item.getElement());
    });

    this.enableTabFocus();

    const menu = this.buildDropDownMenu();
    DropDown.init(this.identifier, menu);
    DropDown.registerCallback(this.identifier, (_containerId, action) => this.dropDownCallback(action));

    return element;
  }

  private dropDownCallback(action: NotificationAction): void {
    const item = this.activeItem!;

    const button = item.getOptionButton();
    if (action === "close") {
      button.classList.remove("active");
      this.activeItem = undefined;
    } else {
      button.classList.add("active");

      this.options.callbackItemOptionsToggle(item, this.options.itemOptions);
    }
  }

  private enableTabFocus(): void {
    if (!this.hasItems()) {
      return;
    }

    const firstRow = this.items[0].getElement();
    const firstCell = firstRow.querySelector('[role="gridcell"]') as HTMLElement;
    const firstFocusableElement = firstCell.querySelector("[tabindex]") as HTMLElement;
    firstFocusableElement.tabIndex = 0;

    this.position = {
      column: 0,
      row: 0,
    };
  }

  private buildDropDownMenu(): HTMLElement {
    const menu = document.createElement("div");
    menu.classList.add("dropdownMenu");

    this.options.itemOptions.forEach((option) => {
      menu.appendChild(option.getElement());
    });

    return menu;
  }

  private keydown(event: KeyboardEvent): void {
    const captureKeystrokes = ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"];
    if (!captureKeystrokes.includes(event.key)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const position: Position = { ...this.position };
    switch (event.key) {
      case "ArrowUp":
        position.row--;
        break;

      case "ArrowDown":
        position.row++;
        break;

      case "ArrowLeft":
        position.column--;
        break;

      case "ArrowRight":
        position.column++;
        break;
    }

    const cell = this.getCellAt(position);
    if (cell) {
      const oldCell = this.getCellAt(this.position);
      if (oldCell) {
        const target = oldCell.querySelector("[tabindex]") as HTMLElement;
        target.tabIndex = -1;
      }

      const newTarget = cell.querySelector("[tabindex]") as HTMLElement;
      newTarget.tabIndex = 0;
      newTarget.focus();

      this.position = position;
    }
  }

  private getCellAt({ column, row }: Position): HTMLElement | null {
    if (row < 0 || row === this.items.length) {
      return null;
    }

    if (column < 0) {
      return null;
    }

    const cells = Array.from(this.items[row].getElement().querySelectorAll('[role="gridcell"]')) as HTMLElement[];
    return cells[column] || null;
  }
}

export default ItemList;
