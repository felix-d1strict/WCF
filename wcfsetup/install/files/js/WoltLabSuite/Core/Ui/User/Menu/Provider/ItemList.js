define(["require", "exports", "tslib", "./Item", "../../../Dropdown/Reusable"], function (require, exports, tslib_1, Item_1, DropDown) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemList = void 0;
    Item_1 = tslib_1.__importDefault(Item_1);
    DropDown = tslib_1.__importStar(DropDown);
    let _counter = 0;
    class ItemList {
        constructor(options) {
            this.activeItem = undefined;
            this.element = undefined;
            this.items = [];
            this.position = {
                column: -1,
                row: -1,
            };
            this.identifier = "userMenuProviderList_" + _counter++;
            this.options = options;
        }
        setItems(itemData) {
            this.items = itemData.map((data) => new Item_1.default(data, { callbackToggleOptions: (item) => this.toggleOptions(item) }));
        }
        getItems() {
            return this.items;
        }
        hasItems() {
            return this.items.length !== 0;
        }
        getElement() {
            if (!this.element) {
                this.element = this.render();
            }
            return this.element;
        }
        hasUnconfirmedItems() {
            return this.items.some((item) => !item.isConfirmed());
        }
        getActiveItem() {
            return this.activeItem;
        }
        toggleOptions(item) {
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
        render() {
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
        dropDownCallback(action) {
            const item = this.activeItem;
            const button = item.getOptionButton();
            if (action === "close") {
                button.classList.remove("active");
                this.activeItem = undefined;
            }
            else {
                button.classList.add("active");
                this.options.callbackItemOptionsToggle(item, this.options.itemOptions);
            }
        }
        enableTabFocus() {
            if (!this.hasItems()) {
                return;
            }
            const firstRow = this.items[0].getElement();
            const firstCell = firstRow.querySelector('[role="gridcell"]');
            const firstFocusableElement = firstCell.querySelector("[tabindex]");
            firstFocusableElement.tabIndex = 0;
            this.position = {
                column: 0,
                row: 0,
            };
        }
        buildDropDownMenu() {
            const menu = document.createElement("div");
            menu.classList.add("dropdownMenu");
            this.options.itemOptions.forEach((option) => {
                menu.appendChild(option.getElement());
            });
            return menu;
        }
        keydown(event) {
            const captureKeystrokes = ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"];
            if (!captureKeystrokes.includes(event.key)) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            const position = Object.assign({}, this.position);
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
                    const target = oldCell.querySelector("[tabindex]");
                    target.tabIndex = -1;
                }
                const newTarget = cell.querySelector("[tabindex]");
                newTarget.tabIndex = 0;
                newTarget.focus();
                this.position = position;
            }
        }
        getCellAt({ column, row }) {
            if (row < 0 || row === this.items.length) {
                return null;
            }
            if (column < 0) {
                return null;
            }
            const cells = Array.from(this.items[row].getElement().querySelectorAll('[role="gridcell"]'));
            return cells[column] || null;
        }
    }
    exports.ItemList = ItemList;
    exports.default = ItemList;
});
