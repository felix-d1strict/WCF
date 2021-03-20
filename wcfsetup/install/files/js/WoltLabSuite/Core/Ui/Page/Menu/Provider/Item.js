define(["require", "exports", "../../../../Date/Util"], function (require, exports, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UiPageMenuProviderItem = void 0;
    class UiPageMenuProviderItem {
        constructor(data) {
            this.data = data;
            this.author = undefined;
            this.element = undefined;
            this.unreadLink = "";
        }
        getElement() {
            if (!this.element) {
                this.element = this.render();
            }
            return this.element;
        }
        render() {
            const item = document.createElement("div");
            item.classList.add("pageMenuOverlayContentItem");
            if (!this.data.isConfirmed) {
                item.classList.add("pageMenuOverlayContentItemOutstanding");
            }
            const image = this.renderImage();
            image.classList.add("pageMenuOverlayItemImage");
            item.appendChild(image);
            const text = document.createElement("div");
            text.classList.add("pageMenuOverlayItemText");
            text.innerHTML = this.data.text;
            item.appendChild(text);
            const date = new Date(this.data.time * 1000);
            const time = Util_1.getTimeElement(date);
            time.classList.add("pageMenuOverlayItemTime");
            item.appendChild(time);
            return item;
        }
        renderImage() {
            let image;
            if (this.data.image.className) {
                image = document.createElement("span");
                image.classList.add("icon", "icon32", this.data.image.className);
            }
            else {
                image = document.createElement("img");
                image.classList.add("userAvatarImage");
                image.src = this.data.image.url;
            }
            return image;
        }
    }
    exports.UiPageMenuProviderItem = UiPageMenuProviderItem;
    exports.default = UiPageMenuProviderItem;
});
