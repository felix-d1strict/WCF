/**
 * Provides the touch-friendly fullscreen user menu.
 *
 * @author Alexander Ebert
 * @copyright 2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @module WoltLabSuite/Core/Ui/Page/Menu/User
 */
define(["require", "exports", "tslib", "../../Screen", "../../../User"], function (require, exports, tslib_1, UiScreen, User_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.disable = exports.enable = void 0;
    UiScreen = tslib_1.__importStar(UiScreen);
    User_1 = tslib_1.__importDefault(User_1);
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
        const menuContainer = document.createElement("div");
        menuContainer.classList.add("pageMenuOverlayMenu");
        const mainBoxMenu = document.querySelector(".mainMenu .boxMenu");
        const mainMenuItems = findMenuItems(mainBoxMenu);
        const mainMenu = buildMenuItems(mainMenuItems);
        menuContainer.appendChild(mainMenu);
        const footerBoxMenu = document.querySelector('.box[data-box-identifier="com.woltlab.wcf.FooterMenu"] .boxMenu');
        if (footerBoxMenu) {
            const footerMenuItems = findMenuItems(footerBoxMenu);
            const footerMenu = buildMenuItems(footerMenuItems);
            footerMenu.classList.add("pageMenuOverlayItemGroupBottom");
            menuContainer.appendChild(footerMenu);
        }
        wrapper.appendChild(menuContainer);
        _container.appendChild(wrapper);
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
        header.classList.add("pageMenuOverlayHeader");
        const headerLink = document.createElement("a");
        headerLink.classList.add("pageMenuOverlayHeaderLink");
        headerLink.dataset.type = "home";
        const logoLink = document.querySelector("#pageHeaderLogo a");
        headerLink.href = logoLink.href;
        const headerText = document.createElement("span");
        headerText.classList.add("pageMenuOverlayHeaderText");
        headerText.textContent = User_1.default.username;
        headerLink.appendChild(headerText);
        header.appendChild(headerLink);
        return header;
    }
    function buildMenuItems(menuItems) {
        const group = document.createElement("div");
        group.classList.add("pageMenuOverlayItemGroup");
        menuItems.forEach((item) => {
            const menuItem = document.createElement("div");
            menuItem.classList.add("pageMenuOverlayItem");
            const link = document.createElement("a");
            link.classList.add("pageMenuOverlayItemLink");
            link.dataset.identifier = item.link.dataset.identifier;
            link.href = item.link.href;
            link.textContent = item.link.textContent;
            menuItem.appendChild(link);
            if (item.children.length > 0) {
                const moreLink = document.createElement("a");
                moreLink.classList.add("pageMenuOverlayItemLinkMore");
                moreLink.href = "#";
                moreLink.addEventListener("click", (event) => {
                    event.preventDefault();
                    moreLink.classList.toggle("open");
                });
                menuItem.appendChild(moreLink);
                const subMenu = document.createElement("div");
                subMenu.classList.add("pageMenuOverlaySubMenu");
                buildSubMenu(subMenu, item.children, 2);
                menuItem.appendChild(subMenu);
            }
            group.appendChild(menuItem);
        });
        return group;
    }
    function buildSubMenu(subMenu, menuItems, depth) {
        menuItems.forEach((item) => {
            const displayDepth = Math.min(depth, 3);
            const menuItem = document.createElement("a");
            menuItem.classList.add("pageMenuOverlaySubMenuItem", `pageMenuOverlaySubMenuDepth${displayDepth}`);
            menuItem.dataset.identifier = item.link.dataset.identifier;
            menuItem.href = item.link.href;
            menuItem.textContent = item.link.textContent;
            subMenu.appendChild(menuItem);
            if (item.children.length > 0) {
                buildSubMenu(subMenu, item.children, depth + 1);
            }
        });
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
