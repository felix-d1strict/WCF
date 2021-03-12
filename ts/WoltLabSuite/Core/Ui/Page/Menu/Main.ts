/**
 * Provides the touch-friendly fullscreen main menu.
 *
 * @author Alexander Ebert
 * @copyright 2001-2021 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @module WoltLabSuite/Core/Ui/Page/Menu/Main
 */

const _container = document.createElement("div");
const _mainMenu = document.querySelector(".mainMenu .boxMenu") as HTMLOListElement;
const _menuItems = new Map<string, HTMLAnchorElement>();
const _menuItemStructure = new Map<string, string[]>();

function buildMenu(): void {
  _container.classList.add("pageMenuOverlayContainer");
  _container.dataset.menu = "main";

  findMenuItems(_mainMenu, "");

  console.log(_menuItems, _menuItemStructure);

  document.body.appendChild(_container);

  showMenu();
}

function findMenuItems(parent: HTMLElement, parentIdentifier: string): void {
  const menuItems: string[] = [];

  Array.from(parent.children).forEach((child: HTMLLIElement) => {
    const identifier = child.dataset.identifier!;
    const link = child.querySelector(".boxMenuLink") as HTMLAnchorElement;

    _menuItems.set(identifier, link);
    menuItems.push(identifier);

    if (child.classList.contains("boxMenuHasChildren")) {
      const ol = child.querySelector("ol") as HTMLOListElement;
      findMenuItems(ol, identifier);
    }
  });

  _menuItemStructure.set(parentIdentifier, menuItems);
}

function showMenu(): void {
  const wrapper = document.createElement("div");
  wrapper.classList.add("pageMenuOverlayWrapper");

  const menu = document.createElement("div");
  menu.classList.add("pageMenuOverlayMenu");

  const header = document.createElement("div");
  header.classList.add("pageMenuOverlayHeader");

  const headerLink = document.createElement("a");
  headerLink.classList.add("pageMenuOverlayHeaderLink");
  headerLink.dataset.type = "home";
  headerLink.href = "#";
  headerLink.addEventListener("click", (event) => event.preventDefault());

  const headerText = document.createElement("span");
  headerText.classList.add("pageMenuOverlayHeaderText");
  headerText.textContent = "WoltLab Suite";

  headerLink.appendChild(headerText);
  header.appendChild(headerLink);
  menu.appendChild(header);

  const group = document.createElement("div");
  group.classList.add("pageMenuOverlayItemGroup");

  _menuItemStructure.get("")!.forEach((identifier) => {
    const item = _menuItems.get(identifier)!;

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

  menu.appendChild(group);
  wrapper.appendChild(menu);
  _container.appendChild(wrapper);
}

function buildSubMenu(subMenu: HTMLDivElement, parentIdentifier: string, depth: number): void {
  _menuItemStructure.get(parentIdentifier)!.forEach((identifier: string) => {
    const displayDepth = Math.min(depth, 3);

    const menuItem = document.createElement("a");
    menuItem.classList.add("pageMenuOverlaySubMenuItem", `pageMenuOverlaySubMenuDepth${displayDepth}`);
    menuItem.dataset.identifier = identifier;

    const link = _menuItems.get(identifier)!;
    menuItem.href = link.href;
    menuItem.textContent = link.textContent;

    subMenu.appendChild(menuItem);

    if (_menuItemStructure.has(identifier)) {
      buildSubMenu(subMenu, identifier, depth + 1);
    }
  });
}

function hideMenu(): void {}

export function enable(): void {
  buildMenu();
}

export function disable(): void {}
