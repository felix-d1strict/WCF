define(["require", "exports", "../../../../Date/Util"], function (require, exports, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Item = void 0;
    class Item {
        constructor(data, callbackMarkAsRead) {
            this.element = undefined;
            this.data = data;
            this.callbackMarkAsRead = callbackMarkAsRead;
        }
        getElement() {
            if (!this.element) {
                this.element = this.render();
            }
            this.rebuild();
            return this.element;
        }
        render() {
            const item = document.createElement("div");
            item.classList.add("userMenuProviderItem");
            const image = this.renderImage();
            image.classList.add("userMenuProviderItemImage");
            item.appendChild(image);
            const text = document.createElement("div");
            text.classList.add("userMenuProviderItemText");
            text.innerHTML = this.data.text;
            item.appendChild(text);
            const markAsRead = document.createElement("div");
            markAsRead.classList.add("userMenuProviderItemMarkAsRead");
            markAsRead.innerHTML = '<span class="icon icon16 fa-check"></span>';
            markAsRead.addEventListener("click", (event) => this.markAsRead(event));
            item.appendChild(markAsRead);
            const date = new Date(this.data.time * 1000);
            const time = Util_1.getTimeElement(date);
            time.classList.add("userMenuProviderItemMeta");
            item.appendChild(time);
            const link = document.createElement("a");
            link.classList.add("userMenuProviderItemShadow");
            link.href = this.data.link;
            item.appendChild(link);
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
        rebuild() {
            const element = this.element;
            if (this.data.isConfirmed) {
                element.classList.remove("userMenuProviderItemOutstanding");
            }
            else {
                element.classList.add("userMenuProviderItemOutstanding");
            }
        }
        markAsRead(event) {
            event.preventDefault();
            event.stopPropagation();
            this.callbackMarkAsRead(this.data.objectId);
            this.data.isConfirmed = true;
            this.rebuild();
        }
    }
    exports.Item = Item;
    exports.default = Item;
});
