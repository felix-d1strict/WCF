/**
 * Provides the touch-friendly fullscreen main menu.
 *
 * @author Alexander Ebert
 * @copyright 2001-2021 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @module WoltLabSuite/Core/Ui/Page/Menu/Main
 */

import * as UiScreen from "../../Screen";

interface MenuItem {
  link: HTMLAnchorElement;
  children: MenuItem[];
}

const _callbackOpen = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();

  showMenu();
};
const _container = document.createElement("div");
const _footerMenu = document.querySelector(
  '.box[data-box-identifier="com.woltlab.wcf.FooterMenu"] .boxMenu',
) as HTMLOListElement | null;
const _mainMenu = document.querySelector(".mainMenu .boxMenu") as HTMLOListElement;

function buildMenu(): void {
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

    const mainMenuItems = findMenuItems(_mainMenu);
    const mainMenu = buildMenuItems(mainMenuItems);
    menuContainer.appendChild(mainMenu);

    if (_footerMenu) {
      const footerMenuItems = findMenuItems(_footerMenu);
      const footerMenu = buildMenuItems(footerMenuItems);
      menuContainer.appendChild(footerMenu);
    }

    wrapper.appendChild(menuContainer);
    _container.appendChild(wrapper);
  }
}

function findMenuItems(parent: HTMLElement): MenuItem[] {
  const menuItems: MenuItem[] = [];

  Array.from(parent.children).forEach((child: HTMLLIElement) => {
    const link = child.querySelector(".boxMenuLink") as HTMLAnchorElement;

    const children: MenuItem[] = [];
    if (child.classList.contains("boxMenuHasChildren")) {
      const ol = child.querySelector("ol") as HTMLOListElement;
      findMenuItems(ol);
    }

    menuItems.push({ link, children });
  });

  return menuItems;
}

function buildHeader(): HTMLDivElement {
  const header = document.createElement("div");
  header.classList.add("pageMenuOverlayHeader");

  const headerLink = document.createElement("a");
  headerLink.classList.add("pageMenuOverlayHeaderLink");
  headerLink.dataset.type = "home";

  const logoLink = document.querySelector("#pageHeaderLogo a") as HTMLAnchorElement;
  headerLink.href = logoLink.href;

  const headerText = document.createElement("span");
  headerText.classList.add("pageMenuOverlayHeaderText");
  headerText.textContent = window.PAGE_TITLE;

  headerLink.appendChild(headerText);
  header.appendChild(headerLink);

  return header;
}

function buildMenuItems(menuItems: MenuItem[]): HTMLDivElement {
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

function buildSubMenu(subMenu: HTMLDivElement, menuItems: MenuItem[], depth: number): void {
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

function showMenu(): void {
  _container.classList.add("open");

  UiScreen.scrollDisable();
}

function hideMenu(): void {
  _container.classList.remove("open");

  UiScreen.scrollEnable();
}

export function enable(): void {
  buildMenu();

  document.querySelector(".mainMenu")!.addEventListener("click", _callbackOpen);

  document.body.appendChild(_container);
}

export function disable(): void {
  _container.remove();

  document.querySelector(".mainMenu")!.removeEventListener("click", _callbackOpen);
}
