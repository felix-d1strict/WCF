define(["require", "exports", "tslib", "../../../../Dom/Util"], function (require, exports, tslib_1, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Option = void 0;
    Util_1 = tslib_1.__importDefault(Util_1);
    class Option {
        constructor(data) {
            this.element = undefined;
            this.visible = true;
            this.data = data;
        }
        show() {
            this.visible = true;
        }
        hide() {
            this.visible = false;
        }
        isVisible() {
            return this.visible;
        }
        getElement() {
            if (!this.element) {
                this.element = this.render();
            }
            this.rebuild();
            return this.element;
        }
        render() {
            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = this.data.label;
            if (this.data.link) {
                link.href = this.data.link;
            }
            else {
                link.href = "#";
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    this.data.click(this);
                });
            }
            listItem.appendChild(link);
            return listItem;
        }
        rebuild() {
            const element = this.element;
            if (this.visible) {
                Util_1.default.show(element);
            }
            else {
                Util_1.default.hide(element);
            }
        }
    }
    exports.Option = Option;
    exports.default = Option;
});
