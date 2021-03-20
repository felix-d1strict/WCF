/**
 * Provides the touch-friendly fullscreen user menu.
 *
 * @author Alexander Ebert
 * @copyright 2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @module WoltLabSuite/Core/Ui/Page/Menu/User
 */

import * as UiScreen from "../../Screen";
import User from "../../../User";
import { UiPageMenuProviderNotification } from "./Provider/Notification";
import DomChangeListener from "../../../Dom/Change/Listener";

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

function buildMenu(): void {
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

async function generateContent(content: HTMLDivElement): Promise<void> {
  const notification = new UiPageMenuProviderNotification();
  await notification.loadContent();

  content.innerHTML = "";
  notification.getContent().forEach((element) => content.appendChild(element));

  DomChangeListener.trigger();
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
  header.classList.add("pageMenuOverlayHeader", "pageMenuOverlayHeaderTabs");

  const tabMenu = document.createElement("div");
  tabMenu.classList.add("pageMenuHeaderTabMenu");

  const tabs = new Map<string, string>([
    ["Benachrichtigungen", "fa-bell-o"],
    ["Moderation", "fa-warning"],
    ["Konversationen", "fa-comments"],
    [User.username, "fa-user"],
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

function buildFooter(): HTMLDivElement {
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

function selectTab(event: Event): void {
  event.preventDefault();

  const tab = event.currentTarget as HTMLAnchorElement;

  const tabMenu = tab.parentElement!;
  tabMenu.querySelector(".pageMenuHeaderTab.active")?.classList.remove("active");

  tab.classList.add("active");

  const title = tabMenu.parentElement!.querySelector(".pageMenuHeaderTitle")!;
  title.textContent = tab.dataset.identifier!;
}

function showMenu(): void {
  buildMenu();

  _container.classList.add("open");

  UiScreen.scrollDisable();
}

function hideMenu(): void {
  _container.classList.remove("open");

  UiScreen.scrollEnable();
}

export function enable(): void {
  document.querySelector(".userPanel")!.addEventListener("click", _callbackOpen);

  document.body.appendChild(_container);
}

export function disable(): void {
  _container.remove();

  document.querySelector(".userPanel")!.removeEventListener("click", _callbackOpen);
}
