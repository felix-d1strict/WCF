define(["require", "exports", "tslib", "../../../../Ajax", "../../../../Dom/Change/Listener", "../../../Alignment", "../../../Dropdown/Simple", "./Item"], function (require, exports, tslib_1, Ajax, Listener_1, UiAlignment, Simple_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationProvider = void 0;
    Ajax = tslib_1.__importStar(Ajax);
    Listener_1 = tslib_1.__importDefault(Listener_1);
    UiAlignment = tslib_1.__importStar(UiAlignment);
    Simple_1 = tslib_1.__importDefault(Simple_1);
    Item_1 = tslib_1.__importDefault(Item_1);
    class NotificationProvider {
        constructor() {
            this.body = undefined;
            this.container = undefined;
            this.items = [];
            this.options = undefined;
            this.placeholderEmpty = undefined;
            this.placeholderLoading = undefined;
            this.state = 0 /* Idle */;
            this.button = document.querySelector("#userNotifications > a");
            this.button.addEventListener("click", (event) => this.click(event));
        }
        click(event) {
            event.preventDefault();
            this.build();
            this.toggle();
        }
        build() {
            if (this.container) {
                return;
            }
            this.container = document.createElement("div");
            this.container.classList.add("userMenuProvider");
            const header = this.buildHeader();
            this.container.appendChild(header);
            this.body = this.buildBody();
            this.container.appendChild(this.body);
            document.body.appendChild(this.container);
        }
        toggle() {
            const listItem = this.button.parentElement;
            const container = this.container;
            if (container.classList.contains("userMenuProviderOpen")) {
                container.classList.remove("userMenuProviderOpen");
                listItem.classList.remove("open");
            }
            else {
                container.classList.add("userMenuProviderOpen");
                listItem.classList.add("open");
                this.render();
                UiAlignment.set(container, this.button, { horizontal: "center" });
            }
        }
        buildHeader() {
            const header = document.createElement("div");
            header.classList.add("userMenuProviderHeader");
            const title = document.createElement("span");
            title.classList.add("userMenuProviderTitle");
            title.textContent = "Notifications";
            header.appendChild(title);
            const options = document.createElement("span");
            options.classList.add("userMenuProviderOptions");
            options.innerHTML = '<span class="icon icon24 fa-ellipsis-h"></span>';
            header.appendChild(options);
            this.options = document.createElement("ul");
            this.options.classList.add("dropdownMenu");
            header.appendChild(this.options);
            Simple_1.default.initV2(options, this.options);
            Simple_1.default.registerCallback(options.id, (containerId, action) => this.toggleOptions(containerId, action));
            return header;
        }
        toggleOptions(containerId, action) {
            console.log(containerId, action);
        }
        buildBody() {
            const body = document.createElement("div");
            body.classList.add("userMenuProviderBody");
            return body;
        }
        render() {
            switch (this.state) {
                case 0 /* Idle */:
                    void this.load();
                    break;
                case 1 /* Loading */:
                case 3 /* Failure */:
                    // Do nothing.
                    break;
                case 2 /* Ready */:
                    this.showContent();
                    break;
                default:
                    throw new Error(`Unexpected state '${this.state}'`);
            }
        }
        async load() {
            this.state = 1 /* Loading */;
            this.showPlaceholderLoading();
            let data;
            try {
                data = await this.loadData();
            }
            catch (e) {
                this.state = 3 /* Failure */;
                return;
            }
            const callbackMarkAsRead = (objectId) => this.markAsRead(objectId);
            this.items = data.map((itemData) => new Item_1.default(itemData, callbackMarkAsRead));
            this.state = 2 /* Ready */;
            this.render();
        }
        showPlaceholderLoading() {
            if (!this.placeholderLoading) {
                this.placeholderLoading = document.createElement("div");
                this.placeholderLoading.classList.add("userMenuProviderPlaceholder", "userMenuProviderLoading");
                this.placeholderLoading.textContent = "Loading…";
            }
            const body = this.body;
            body.innerHTML = "";
            body.classList.add("userMenuProviderBodyPlaceholder");
            body.appendChild(this.placeholderLoading);
        }
        showContent() {
            const body = this.body;
            body.innerHTML = "";
            if (this.items.length === 0) {
                this.showPlaceholderEmpty();
            }
            else {
                const fragment = document.createDocumentFragment();
                this.items.map((item) => item.getElement()).forEach((element) => fragment.appendChild(element));
                body.classList.remove("userMenuProviderBodyPlaceholder");
                body.appendChild(fragment);
                Listener_1.default.trigger();
            }
        }
        showPlaceholderEmpty() {
            if (!this.placeholderEmpty) {
                this.placeholderEmpty = document.createElement("div");
                this.placeholderEmpty.classList.add("userMenuProviderPlaceholder", "userMenuProviderEmpty");
                this.placeholderEmpty.textContent = "There is nothing to display.";
            }
            const body = this.body;
            body.classList.add("userMenuProviderBodyPlaceholder");
            body.appendChild(this.placeholderEmpty);
        }
        async loadData() {
            return new Promise((resolve, reject) => {
                Ajax.apiOnce({
                    data: {
                        actionName: "getOutstandingNotifications",
                        className: "wcf\\data\\user\\notification\\UserNotificationAction",
                    },
                    silent: true,
                    success: (data) => resolve(data.returnValues),
                    failure() {
                        reject();
                        return true;
                    },
                });
            });
        }
        markAsRead(objectId) {
            Ajax.apiOnce({
                data: {
                    actionName: "markAsConfirmed",
                    className: "wcf\\data\\user\\notification\\UserNotificationAction",
                    objectIDs: [objectId],
                },
                silent: true,
            });
        }
    }
    exports.NotificationProvider = NotificationProvider;
    exports.default = NotificationProvider;
});
