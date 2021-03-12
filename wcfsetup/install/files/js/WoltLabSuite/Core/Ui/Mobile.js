/**
 * Modifies the interface to provide a better usability for mobile devices.
 *
 * @author  Alexander Ebert
 * @copyright  2001-2019 WoltLab GmbH
 * @license  GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @module  WoltLabSuite/Core/Ui/Mobile
 */
define(["require", "exports", "tslib", "../Core", "../Dom/Change/Listener", "../Environment", "./Alignment", "./CloseOverlay", "./Dropdown/Reusable", "./Page/Menu/Main", "./Page/Menu/User", "./Screen"], function (require, exports, tslib_1, Core, Listener_1, Environment, UiAlignment, CloseOverlay_1, UiDropdownReusable, UiPageMenuMain, User_1, UiScreen) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removeShadow = exports.rebuildShadow = exports.disableShadow = exports.disable = exports.enableShadow = exports.enable = exports.setup = void 0;
    Core = tslib_1.__importStar(Core);
    Listener_1 = tslib_1.__importDefault(Listener_1);
    Environment = tslib_1.__importStar(Environment);
    UiAlignment = tslib_1.__importStar(UiAlignment);
    CloseOverlay_1 = tslib_1.__importDefault(CloseOverlay_1);
    UiDropdownReusable = tslib_1.__importStar(UiDropdownReusable);
    UiPageMenuMain = tslib_1.__importStar(UiPageMenuMain);
    User_1 = tslib_1.__importDefault(User_1);
    UiScreen = tslib_1.__importStar(UiScreen);
    /*
    interface MainMenuMorePayload {
      identifier: string;
      handler: UiPageMenuMain;
    }
    */
    let _dropdownMenu = null;
    let _dropdownMenuMessage = null;
    let _enabled = false;
    let _enabledLGTouchNavigation = false;
    let _enableMobileMenu = false;
    const _knownMessages = new WeakSet();
    let _mobileSidebarEnabled = false;
    //let _pageMenuMain: UiPageMenuMain;
    let _pageMenuUser;
    let _messageGroups = null;
    const _sidebars = [];
    function init() {
        _enabled = true;
        initButtonGroupNavigation();
        initMessages();
        initMobileMenu();
        CloseOverlay_1.default.add("WoltLabSuite/Core/Ui/Mobile", closeAllMenus);
        Listener_1.default.add("WoltLabSuite/Core/Ui/Mobile", () => {
            initButtonGroupNavigation();
            initMessages();
        });
        UiPageMenuMain.enable();
    }
    function initButtonGroupNavigation() {
        document.querySelectorAll(".buttonGroupNavigation").forEach((navigation) => {
            if (navigation.classList.contains("jsMobileButtonGroupNavigation")) {
                return;
            }
            else {
                navigation.classList.add("jsMobileButtonGroupNavigation");
            }
            const list = navigation.querySelector(".buttonList");
            if (list.childElementCount === 0) {
                // ignore objects without options
                return;
            }
            navigation.parentElement.classList.add("hasMobileNavigation");
            const button = document.createElement("a");
            button.className = "dropdownLabel";
            const span = document.createElement("span");
            span.className = "icon icon24 fa-ellipsis-v";
            button.appendChild(span);
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                navigation.classList.toggle("open");
            });
            list.addEventListener("click", function (event) {
                event.stopPropagation();
                navigation.classList.remove("open");
            });
            navigation.insertBefore(button, navigation.firstChild);
        });
    }
    function initMessages() {
        document.querySelectorAll(".message").forEach((message) => {
            if (_knownMessages.has(message)) {
                return;
            }
            const navigation = message.querySelector(".jsMobileNavigation");
            if (navigation) {
                navigation.addEventListener("click", (event) => {
                    event.stopPropagation();
                    // mimic dropdown behavior
                    window.setTimeout(() => {
                        navigation.classList.remove("open");
                    }, 10);
                });
                const quickOptions = message.querySelector(".messageQuickOptions");
                if (quickOptions && navigation.childElementCount) {
                    quickOptions.classList.add("active");
                    quickOptions.addEventListener("click", (event) => {
                        const target = event.target;
                        if (_enabled && UiScreen.is("screen-sm-down") && target.nodeName !== "LABEL" && target.nodeName !== "INPUT") {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleMobileNavigation(message, quickOptions, navigation);
                        }
                    });
                }
            }
            _knownMessages.add(message);
        });
    }
    function initMobileMenu() {
        if (_enableMobileMenu) {
            //_pageMenuMain = new UiPageMenuMain();
            _pageMenuUser = new User_1.default();
        }
    }
    function closeAllMenus() {
        document.querySelectorAll(".jsMobileButtonGroupNavigation.open, .jsMobileNavigation.open").forEach((menu) => {
            menu.classList.remove("open");
        });
        if (_enabled && _dropdownMenu) {
            closeDropdown();
        }
    }
    function enableMobileSidebar() {
        _mobileSidebarEnabled = true;
    }
    function disableMobileSidebar() {
        _mobileSidebarEnabled = false;
        _sidebars.forEach(function (sidebar) {
            sidebar.classList.remove("open");
        });
    }
    function setupMobileSidebar() {
        _sidebars.forEach(function (sidebar) {
            sidebar.addEventListener("mousedown", function (event) {
                if (_mobileSidebarEnabled && event.target === sidebar) {
                    event.preventDefault();
                    sidebar.classList.toggle("open");
                }
            });
        });
        _mobileSidebarEnabled = true;
    }
    function closeDropdown() {
        _dropdownMenu.classList.remove("dropdownOpen");
    }
    function toggleMobileNavigation(message, quickOptions, navigation) {
        if (_dropdownMenu === null) {
            _dropdownMenu = document.createElement("ul");
            _dropdownMenu.className = "dropdownMenu";
            UiDropdownReusable.init("com.woltlab.wcf.jsMobileNavigation", _dropdownMenu);
        }
        else if (_dropdownMenu.classList.contains("dropdownOpen")) {
            closeDropdown();
            if (_dropdownMenuMessage === message) {
                // toggle behavior
                return;
            }
        }
        _dropdownMenu.innerHTML = "";
        CloseOverlay_1.default.execute();
        rebuildMobileNavigation(navigation);
        const previousNavigation = navigation.previousElementSibling;
        if (previousNavigation && previousNavigation.classList.contains("messageFooterButtonsExtra")) {
            const divider = document.createElement("li");
            divider.className = "dropdownDivider";
            _dropdownMenu.appendChild(divider);
            rebuildMobileNavigation(previousNavigation);
        }
        UiAlignment.set(_dropdownMenu, quickOptions, {
            horizontal: "right",
            allowFlip: "vertical",
        });
        _dropdownMenu.classList.add("dropdownOpen");
        _dropdownMenuMessage = message;
    }
    function setupLGTouchNavigation() {
        _enabledLGTouchNavigation = true;
        document.querySelectorAll(".boxMenuHasChildren > a").forEach((element) => {
            element.addEventListener("touchstart", function (event) {
                if (_enabledLGTouchNavigation && element.getAttribute("aria-expanded") === "false") {
                    event.preventDefault();
                    element.setAttribute("aria-expanded", "true");
                    // Register an new event listener after the touch ended, which is triggered once when an
                    // element on the page is pressed. This allows us to reset the touch status of the navigation
                    // entry when the entry is no longer open, so that it does not redirect to the page when you
                    // click it again.
                    element.addEventListener("touchend", () => {
                        document.body.addEventListener("touchstart", () => {
                            document.body.addEventListener("touchend", (event) => {
                                const parent = element.parentElement;
                                const target = event.target;
                                if (!parent.contains(target) && target !== parent) {
                                    element.setAttribute("aria-expanded", "false");
                                }
                            }, {
                                once: true,
                            });
                        }, {
                            once: true,
                        });
                    }, { once: true });
                }
            });
        });
    }
    function enableLGTouchNavigation() {
        _enabledLGTouchNavigation = true;
    }
    function disableLGTouchNavigation() {
        _enabledLGTouchNavigation = false;
    }
    function rebuildMobileNavigation(navigation) {
        navigation.querySelectorAll(".button").forEach((button) => {
            if (button.classList.contains("ignoreMobileNavigation") || button.classList.contains("reactButton")) {
                return;
            }
            const item = document.createElement("li");
            if (button.classList.contains("active")) {
                item.className = "active";
            }
            const label = button.querySelector("span:not(.icon)");
            item.innerHTML = `<a href="#">${label.textContent}</a>`;
            item.children[0].addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (button.nodeName === "A") {
                    button.click();
                }
                else {
                    Core.triggerEvent(button, "click");
                }
                closeDropdown();
            });
            _dropdownMenu.appendChild(item);
        });
    }
    /**
     * Initializes the mobile UI.
     */
    function setup(enableMobileMenu) {
        _enableMobileMenu = enableMobileMenu;
        document.querySelectorAll(".sidebar").forEach((sidebar) => {
            _sidebars.push(sidebar);
        });
        if (Environment.touch()) {
            document.documentElement.classList.add("touch");
        }
        if (Environment.platform() !== "desktop") {
            document.documentElement.classList.add("mobile");
        }
        const messageGroupList = document.querySelector(".messageGroupList");
        if (messageGroupList) {
            _messageGroups = messageGroupList.getElementsByClassName("messageGroup");
        }
        UiScreen.on("screen-md-down", {
            match: enable,
            unmatch: disable,
            setup: init,
        });
        UiScreen.on("screen-sm-down", {
            match: enableShadow,
            unmatch: disableShadow,
            setup: enableShadow,
        });
        UiScreen.on("screen-md-down", {
            match: enableMobileSidebar,
            unmatch: disableMobileSidebar,
            setup: setupMobileSidebar,
        });
        // On the large tablets (e.g. iPad Pro) the navigation is not usable, because there is not the mobile
        // layout displayed, but the normal one for the desktop. The navigation reacts to a hover status if a
        // menu item has several submenu items. Logically, this cannot be created with the tablet, so that we
        // display the submenu here after a single click and only follow the link after another click.
        if (Environment.touch() && (Environment.platform() === "ios" || Environment.platform() === "android")) {
            UiScreen.on("screen-lg", {
                match: enableLGTouchNavigation,
                unmatch: disableLGTouchNavigation,
                setup: setupLGTouchNavigation,
            });
        }
    }
    exports.setup = setup;
    /**
     * Enables the mobile UI.
     */
    function enable() {
        _enabled = true;
        if (_enableMobileMenu) {
            UiPageMenuMain.enable();
            _pageMenuUser.enable();
        }
    }
    exports.enable = enable;
    /**
     * Enables shadow links for larger click areas on messages.
     */
    function enableShadow() {
        if (_messageGroups) {
            rebuildShadow(_messageGroups, ".messageGroupLink");
        }
    }
    exports.enableShadow = enableShadow;
    /**
     * Disables the mobile UI.
     */
    function disable() {
        _enabled = false;
        if (_enableMobileMenu) {
            UiPageMenuMain.disable();
            _pageMenuUser.disable();
        }
    }
    exports.disable = disable;
    /**
     * Disables shadow links.
     */
    function disableShadow() {
        if (_messageGroups) {
            removeShadow(_messageGroups);
        }
        if (_dropdownMenu) {
            closeDropdown();
        }
    }
    exports.disableShadow = disableShadow;
    function rebuildShadow(elements, linkSelector) {
        Array.from(elements).forEach((element) => {
            const parent = element.parentElement;
            let shadow = parent.querySelector(".mobileLinkShadow");
            if (shadow === null) {
                const link = element.querySelector(linkSelector);
                if (link.href) {
                    shadow = document.createElement("a");
                    shadow.className = "mobileLinkShadow";
                    shadow.href = link.href;
                    parent.appendChild(shadow);
                    parent.classList.add("mobileLinkShadowContainer");
                }
            }
        });
    }
    exports.rebuildShadow = rebuildShadow;
    function removeShadow(elements) {
        Array.from(elements).forEach((element) => {
            const parent = element.parentElement;
            if (parent.classList.contains("mobileLinkShadowContainer")) {
                const shadow = parent.querySelector(".mobileLinkShadow");
                if (shadow !== null) {
                    shadow.remove();
                }
                parent.classList.remove("mobileLinkShadowContainer");
            }
        });
    }
    exports.removeShadow = removeShadow;
});
