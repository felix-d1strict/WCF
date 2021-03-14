/**
 * Provides the touch-friendly fullscreen main menu.
 *
 * @author Alexander Ebert
 * @copyright 2001-2021 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @module WoltLabSuite/Core/Ui/Page/Menu/Main
 */
define(["require", "exports", "tslib", "../../Screen"], function (require, exports, tslib_1, UiScreen) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.disable = exports.enable = void 0;
    UiScreen = tslib_1.__importStar(UiScreen);
    const _callbackOpen = (event) => {
        event.preventDefault();
        event.stopPropagation();
        showMenu();
    };
    const _container = document.createElement("div");
    const _footerMenu = document.querySelector('.box[data-box-identifier="com.woltlab.wcf.FooterMenu"] .boxMenu');
    const _mainMenu = document.querySelector(".mainMenu .boxMenu");
    const _menuItems = new Map();
    const _menuItemStructure = new Map();
    function buildMenu() {
        if (!_container.classList.contains("pageMenuOverlayContainer")) {
            _container.classList.add("pageMenuOverlayContainer");
            _container.dataset.menu = "main";
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
            findMenuItems(_mainMenu, "");
            const mainMenu = buildMenuItems();
            menuContainer.appendChild(mainMenu);
            if (_footerMenu) {
                _menuItems.clear();
                _menuItemStructure.clear();
                findMenuItems(_footerMenu, "");
                const footerMenu = buildMenuItems();
                menuContainer.appendChild(footerMenu);
            }
            wrapper.appendChild(menuContainer);
            _container.appendChild(wrapper);
        }
    }
    function findMenuItems(parent, parentIdentifier) {
        const menuItems = [];
        Array.from(parent.children).forEach((child) => {
            const identifier = child.dataset.identifier;
            const link = child.querySelector(".boxMenuLink");
            _menuItems.set(identifier, link);
            menuItems.push(identifier);
            if (child.classList.contains("boxMenuHasChildren")) {
                const ol = child.querySelector("ol");
                findMenuItems(ol, identifier);
            }
        });
        _menuItemStructure.set(parentIdentifier, menuItems);
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
        headerText.textContent = window.PAGE_TITLE;
        headerLink.appendChild(headerText);
        header.appendChild(headerLink);
        return header;
    }
    function buildMenuItems() {
        const group = document.createElement("div");
        group.classList.add("pageMenuOverlayItemGroup");
        _menuItemStructure.get("").forEach((identifier) => {
            const item = _menuItems.get(identifier);
            const menuItem = document.createElement("div");
            menuItem.classList.add("pageMenuOverlayItem");
            const link = document.createElement("a");
            link.classList.add("pageMenuOverlayItemLink");
            link.dataset.identifier = identifier;
            link.href = item.href;
            link.textContent = item.textContent;
            menuItem.appendChild(link);
            if (_menuItemStructure.has(identifier)) {
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
                buildSubMenu(subMenu, identifier, 2);
                menuItem.appendChild(subMenu);
            }
            group.appendChild(menuItem);
        });
        return group;
    }
    function buildSubMenu(subMenu, parentIdentifier, depth) {
        _menuItemStructure.get(parentIdentifier).forEach((identifier) => {
            const displayDepth = Math.min(depth, 3);
            const menuItem = document.createElement("a");
            menuItem.classList.add("pageMenuOverlaySubMenuItem", `pageMenuOverlaySubMenuDepth${displayDepth}`);
            menuItem.dataset.identifier = identifier;
            const link = _menuItems.get(identifier);
            menuItem.href = link.href;
            menuItem.textContent = link.textContent;
            subMenu.appendChild(menuItem);
            if (_menuItemStructure.has(identifier)) {
                buildSubMenu(subMenu, identifier, depth + 1);
            }
        });
    }
    function showMenu() {
        _container.classList.add("open");
        UiScreen.scrollDisable();
    }
    function hideMenu() {
        _container.classList.remove("open");
        UiScreen.scrollEnable();
    }
    function enable() {
        buildMenu();
        document.querySelector(".mainMenu").addEventListener("click", _callbackOpen);
        document.body.appendChild(_container);
    }
    exports.enable = enable;
    function disable() {
        _container.remove();
        document.querySelector(".mainMenu").removeEventListener("click", _callbackOpen);
    }
    exports.disable = disable;
});
