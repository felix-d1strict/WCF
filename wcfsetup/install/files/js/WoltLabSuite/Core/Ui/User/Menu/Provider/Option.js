define(["require", "exports", "tslib", "../../../../Dom/Util"], function (require, exports, tslib_1, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Option = void 0;
    Util_1 = tslib_1.__importDefault(Util_1);
    class Option {
        constructor(identifier, label, callbackClick) {
            this.element = undefined;
            this.visible = true;
            this.callbackClick = callbackClick;
            this.identifier = identifier;
            this.label = label;
        }
        show() {
            this.visible = true;
            this.rebuild();
        }
        hide() {
            this.visible = false;
            this.rebuild();
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
