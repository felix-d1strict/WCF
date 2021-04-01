define(["require", "exports", "tslib", "../../../../Ajax", "../../../../Dom/Change/Listener", "../../../Alignment", "../../../CloseOverlay", "../../../Dropdown/Simple", "./ItemList", "./Option"], function (require, exports, tslib_1, Ajax, Listener_1, UiAlignment, CloseOverlay_1, Simple_1, ItemList_1, Option_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationProvider = void 0;
    Ajax = tslib_1.__importStar(Ajax);
    Listener_1 = tslib_1.__importDefault(Listener_1);
    UiAlignment = tslib_1.__importStar(UiAlignment);
    CloseOverlay_1 = tslib_1.__importDefault(CloseOverlay_1);
    Simple_1 = tslib_1.__importDefault(Simple_1);
    ItemList_1 = tslib_1.__importDefault(ItemList_1);
    Option_1 = tslib_1.__importDefault(Option_1);
    class NotificationProvider {
        constructor() {
            this.body = undefined;
            this.container = undefined;
            this.items = [];
            this.itemList = undefined;
            this.options = new Map();
            this.placeholderEmpty = undefined;
            this.placeholderLoading = undefined;
            this.state = 0 /* Idle */;
            this.tabIndex = -1;
            this.title = undefined;
            this.button = document.querySelector("#userNotifications > a");
            this.button.addEventListener("click", (event) => this.click(event));
            this.button.tabIndex = 0;
            this.button.setAttribute("role", "button");
        }
        click(event) {
            event.preventDefault();
            event.stopPropagation();
            this.build();
            this.toggle();
        }
        build() {
            if (this.container) {
                return;
            }
            this.container = document.createElement("div");
            this.container.classList.add("userMenuProvider");
            this.container.setAttribute("role", "dialog");
            // TODO: This prevents the dialog from closing via unintentional clicks, but
            // will also prevent the options drop-down menu from being closed.
            this.container.addEventListener("click", (event) => event.stopPropagation());
            this.container.addEventListener("keydown", (event) => this.keydown(event));
            const header = this.buildHeader();
            this.container.appendChild(header);
            this.body = this.buildBody();
            this.container.appendChild(this.body);
        }
        keydown(event) {
            if (event.key === "Escape") {
                // TODO: The signature of the `close()` method is awful.
                this.close(this.container, this.button);
                this.button.focus();
            }
            if (event.key === "Tab") {
                event.preventDefault();
                event.stopPropagation();
                let element;
                if (event.shiftKey) {
                    element = this.getPreviousFocusableElement();
                }
                else {
                    element = this.getNextFocusableElement();
                }
                if (element) {
                    element.focus();
                }
            }
        }
        getFocusableElements() {
            return Array.from(this.container.querySelectorAll('[tabindex]:not([tabindex^="-"]):not([inert])'));
        }
        getNextFocusableElement() {
            const elements = this.getFocusableElements();
            this.tabIndex++;
            if (this.tabIndex === elements.length) {
                this.tabIndex = 0;
            }
            return elements[this.tabIndex] || null;
        }
        getPreviousFocusableElement() {
            const elements = this.getFocusableElements();
            this.tabIndex--;
            if (this.tabIndex < 0) {
                this.tabIndex = elements.length - 1;
            }
            return elements[this.tabIndex] || null;
        }
        toggle() {
            const listItem = this.button.parentElement;
            const container = this.container;
            if (container.parentElement !== null) {
                this.close(container, listItem);
            }
            else {
                this.open(container, listItem);
            }
        }
        open(container, listItem) {
            listItem.classList.add("open");
            document.body.appendChild(container);
            this.render();
            UiAlignment.set(container, this.button, { horizontal: "center" });
            this.title.focus();
            const identifier = "WoltLabSuite/Core/Ui/User/Menu/Provider";
            CloseOverlay_1.default.add(identifier, () => {
                this.close(container, listItem);
            });
        }
        close(container, listItem) {
            listItem.classList.remove("open");
            container.remove();
            const identifier = "WoltLabSuite/Core/Ui/User/Menu/Provider";
            CloseOverlay_1.default.remove(identifier);
        }
        buildHeader() {
            const header = document.createElement("div");
            header.classList.add("userMenuProviderHeader");
            this.title = document.createElement("span");
            this.title.classList.add("userMenuProviderTitle");
            this.title.textContent = "Notifications";
            this.title.tabIndex = -1;
            this.container.setAttribute("aria-label", "Notifications");
            header.appendChild(this.title);
            const optionContainer = document.createElement("div");
            optionContainer.classList.add("userMenuProviderOptionContainer", "dropdown");
            header.appendChild(optionContainer);
            const options = document.createElement("span");
            options.classList.add("userMenuProviderOptions", "dropdownToggle");
            options.innerHTML = '<span class="icon icon24 fa-ellipsis-h"></span>';
            options.tabIndex = 0;
            options.setAttribute("role", "button");
            optionContainer.appendChild(options);
            const optionMenu = document.createElement("ul");
            optionMenu.classList.add("dropdownMenu");
            optionMenu.appendChild(this.buildOptions());
            optionContainer.appendChild(optionMenu);
            Simple_1.default.init(options);
            Simple_1.default.registerCallback(optionContainer.id, (containerId, action) => this.toggleOptions(containerId, action));
            return header;
        }
        buildOptions() {
            this.options.set("markAllAsRead", new Option_1.default({
                click: (_option) => { },
                label: "Mark all as read",
            }));
            this.options.set("settings", new Option_1.default({ label: "Notification Settings", link: "#" }));
            this.options.set("showAll", new Option_1.default({ label: "Show All Notifications", link: "#" }));
            const fragment = document.createDocumentFragment();
            this.options.forEach((option) => {
                fragment.appendChild(option.getElement());
            });
            return fragment;
        }
        toggleOptions(_containerId, action) {
            if (action === "close") {
                return;
            }
            const markAllAsRead = this.options.get("markAllAsRead");
            if (this.items.some((item) => !item.isConfirmed())) {
                markAllAsRead.show();
            }
            else {
                markAllAsRead.hide();
            }
            markAllAsRead.rebuild();
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
            if (!this.itemList) {
                const options = [
                    new Option_1.default({ label: "Mark as Read", click: (option) => { } }),
                    new Option_1.default({ label: "Disable this type of notification", link: "#" }),
                ];
                this.itemList = new ItemList_1.default(options);
            }
            this.itemList.setItems(data);
            /*const callbackMarkAsRead: CallbackMarkAsRead = (objectId) => this.markAsRead(objectId);
            this.items = data.map((itemData) => new Item(itemData, callbackMarkAsRead));*/
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
            const itemList = this.itemList;
            if (!itemList.hasItems()) {
                this.showPlaceholderEmpty();
            }
            else {
                const element = itemList.getElement();
                body.classList.remove("userMenuProviderBodyPlaceholder");
                body.appendChild(element);
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
            const data = (await Ajax.simpleApi({
                data: {
                    actionName: "getOutstandingNotifications",
                    className: "wcf\\data\\user\\notification\\UserNotificationAction",
                },
                silent: true,
            }));
            return data.returnValues;
        }
        async markAsRead(objectId) {
            await Ajax.simpleApi({
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
