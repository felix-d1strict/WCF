/**
 * Provides the touch-friendly fullscreen user menu.
 *
 * @author Alexander Ebert
 * @copyright 2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @module WoltLabSuite/Core/Ui/Page/Menu/User
 */
define(["require", "exports", "tslib", "../../Screen", "../../../User", "./Provider/Notification", "../../../Dom/Change/Listener"], function (require, exports, tslib_1, UiScreen, User_1, Notification_1, Listener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.disable = exports.enable = void 0;
    UiScreen = tslib_1.__importStar(UiScreen);
    User_1 = tslib_1.__importDefault(User_1);
    Listener_1 = tslib_1.__importDefault(Listener_1);
    const _callbackOpen = (event) => {
        event.preventDefault();
        event.stopPropagation();
        showMenu();
    };
    const _container = document.createElement("div");
    function buildMenu() {
        if (_container.classList.contains("pageMenuOverlayContainer")) {
            return;
        }
        _container.classList.add("pageMenuOverlayContainer");
        _container.dataset.menu = "user";
        _container.addEventListener("click", (event) => {
            if (event.target === _container) {
                event.preventDefault();
                hideMenu();
            }
        });
        const wrapper = document.createElement("div");
        wrapper.classList.add("pageMenuOverlayWrapper");
        const header = buildHeader();
        wrapper.appendChild(header);
        const content = document.createElement("div");
        content.classList.add("pageMenuOverlayContent");
        generateContent(content);
        //content.innerHTML = '<div class="pageMenuOverlayContentEmpty">Keine aktuellen Benachrichtigungen</div>';
        wrapper.appendChild(content);
        const footer = buildFooter();
        wrapper.appendChild(footer);
        _container.appendChild(wrapper);
    }
    async function generateContent(content) {
        const notification = new Notification_1.UiPageMenuProviderNotification();
        await notification.loadContent();
        content.innerHTML = "";
        notification.getContent().forEach((element) => content.appendChild(element));
        Listener_1.default.trigger();
        /*
        const source = document.getElementById("notification-data")!.querySelector("ul")!;
        Array.from(source.children).forEach((data) => {
          const item = document.createElement("div");
          item.classList.add("pageMenuOverlayContentItem");
      
          const avatar = data.querySelector("img")!.cloneNode() as HTMLImageElement;
          avatar.classList.add("pageMenuOverlayItemImage");
          item.appendChild(avatar);
      
          const text = document.createElement("div");
          text.classList.add("pageMenuOverlayItemText");
          text.innerHTML = data.querySelector("h3")!.innerHTML;
          item.appendChild(text);
      
          const time = data.querySelector("time")!.cloneNode(true) as HTMLElement;
          time.classList.add("pageMenuOverlayItemTime");
          item.appendChild(time);
      
          content.appendChild(item);
        });
        */
    }
    function findMenuItems(parent) {
        const menuItems = [];
        Array.from(parent.children).forEach((child) => {
            const link = child.querySelector(".boxMenuLink");
            const children = [];
            if (child.classList.contains("boxMenuHasChildren")) {
                const ol = child.querySelector("ol");
                findMenuItems(ol);
            }
            menuItems.push({ link, children });
        });
        return menuItems;
    }
    function buildHeader() {
        const header = document.createElement("div");
        header.classList.add("pageMenuOverlayHeader", "pageMenuOverlayHeaderTabs");
        const tabMenu = document.createElement("div");
        tabMenu.classList.add("pageMenuHeaderTabMenu");
        const tabs = new Map([
            ["Benachrichtigungen", "fa-bell-o"],
            ["Moderation", "fa-warning"],
            ["Konversationen", "fa-comments"],
            [User_1.default.username, "fa-user"],
        ]);
        tabs.forEach((iconName, identifier) => {
            const tab = document.createElement("a");
            tab.classList.add("pageMenuHeaderTab");
            tab.dataset.identifier = identifier;
            tab.dataset.title = identifier;
            tab.href = "#";
            tab.addEventListener("click", (event) => selectTab(event));
            tab.innerHTML = `<span class="icon icon24 ${iconName}"></span>`;
            tabMenu.appendChild(tab);
        });
        header.appendChild(tabMenu);
        const headerMenuTitle = document.createElement("div");
        headerMenuTitle.classList.add("pageMenuHeaderTitle");
        header.appendChild(headerMenuTitle);
        return header;
    }
    function buildFooter() {
        const footer = document.createElement("div");
        footer.classList.add("pageMenuOverlayFooter");
        const buttons = new Map([
            ["Gelesen markieren", "fa-check"],
            ["Alle anzeigen", "fa-list"],
        ]);
        buttons.forEach((icon, title) => {
            const button = document.createElement("a");
            button.classList.add("pageMenuOverlayFooterButton");
            button.href = "#";
            button.addEventListener("click", (event) => event.preventDefault());
            button.innerHTML = `<span class="icon icon24 ${icon}"></span><span class="pageMenuOverlayFooterButtonText">${title}</span>`;
            footer.appendChild(button);
        });
        /*
        const links = ["Einstellungen", "Mehr"];
        links.forEach((title) => {
          const link = document.createElement("a");
          link.classList.add("pageMenuOverlayFooterLink");
          link.textContent = title;
          link.href = "#";
          link.addEventListener("click", (event) => event.preventDefault());
      
          footer.appendChild(link);
        });
      */
        return footer;
    }
    function selectTab(event) {
        var _a;
        event.preventDefault();
        const tab = event.currentTarget;
        const tabMenu = tab.parentElement;
        (_a = tabMenu.querySelector(".pageMenuHeaderTab.active")) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
        tab.classList.add("active");
        const title = tabMenu.parentElement.querySelector(".pageMenuHeaderTitle");
        title.textContent = tab.dataset.identifier;
    }
    function showMenu() {
        buildMenu();
        _container.classList.add("open");
        UiScreen.scrollDisable();
    }
    function hideMenu() {
        _container.classList.remove("open");
        UiScreen.scrollEnable();
    }
    function enable() {
        document.querySelector(".userPanel").addEventListener("click", _callbackOpen);
        document.body.appendChild(_container);
    }
    exports.enable = enable;
    function disable() {
        _container.remove();
        document.querySelector(".userPanel").removeEventListener("click", _callbackOpen);
    }
    exports.disable = disable;
});
