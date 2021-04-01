import Item, { ItemData } from "./Item";
import Option from "./Option";
import { init as initDropdown, toggleDropdown } from "../../../Dropdown/Reusable";

let _counter = 0;

export class ItemList {
  private element?: HTMLElement = undefined;
  private readonly identifier: string;
  private items: Item[] = [];
  private readonly options: Option[];
  private position: Position = {
    column: -1,
    row: -1,
  };

  constructor(extraOptions: Option[]) {
    this.identifier = "userMenuProviderList_" + _counter++;
    this.options = this.buildOptions(extraOptions);
  }

  private buildOptions(extraOptions: Option[]): Option[] {
    const markAsRead = new Option({
      label: "Mark as read",
      click: (option: Option) => {},
    });

    return [markAsRead, ...extraOptions];
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

  private toggleOptions(item: Item): void {
    toggleDropdown(this.identifier, item.getOptionButton());
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
    initDropdown(this.identifier, menu);

    return element;
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

    this.options.forEach((option) => {
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

type Position = Record<"row" | "column", number>;

export default ItemList;
