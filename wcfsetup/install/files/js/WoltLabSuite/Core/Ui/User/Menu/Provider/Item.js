define(["require", "exports", "../../../../Date/Util"], function (require, exports, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Item = void 0;
    class Item {
        constructor(data, callbackMarkAsRead) {
            this.element = undefined;
            this.markAsReadIcon = undefined;
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
        isConfirmed() {
            return this.data.isConfirmed;
        }
        render() {
            const item = document.createElement("div");
            item.classList.add("userMenuProviderItem");
            item.setAttribute("role", "row");
            const content = document.createElement("div");
            content.setAttribute("role", "gridcell");
            item.appendChild(content);
            const link = document.createElement("a");
            link.classList.add("userMenuProviderItemLink");
            link.href = this.data.link;
            link.tabIndex = 0;
            content.appendChild(link);
            const image = this.renderImage();
            image.classList.add("userMenuProviderItemImage");
            link.appendChild(image);
            const text = document.createElement("div");
            text.classList.add("userMenuProviderItemText");
            text.innerHTML = this.data.text;
            link.appendChild(text);
            const date = new Date(this.data.time * 1000);
            const time = Util_1.getTimeElement(date);
            time.classList.add("userMenuProviderItemMeta");
            link.appendChild(time);
            const interaction = document.createElement("div");
            interaction.setAttribute("role", "gridcell");
            item.appendChild(interaction);
            const markAsRead = document.createElement("span");
            markAsRead.classList.add("userMenuProviderItemMarkAsRead");
            markAsRead.addEventListener("click", (event) => this.markAsRead(event));
            markAsRead.tabIndex = 0;
            markAsRead.setAttribute("role", "button");
            interaction.appendChild(markAsRead);
            this.markAsReadIcon = document.createElement("span");
            this.markAsReadIcon.classList.add("icon", "icon16", "fa-check");
            markAsRead.appendChild(this.markAsReadIcon);
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
        async markAsRead(event) {
            event.preventDefault();
            event.stopPropagation();
            const icon = this.markAsReadIcon;
            if (icon.classList.contains("fa-spinner")) {
                return;
            }
            icon.classList.replace("fa-check", "fa-spinner");
            try {
                await this.callbackMarkAsRead(this.data.objectId);
                this.data.isConfirmed = true;
                this.rebuild();
            }
            finally {
                icon.classList.replace("fa-spinner", "fa-check");
            }
        }
    }
    exports.Item = Item;
    exports.default = Item;
});
