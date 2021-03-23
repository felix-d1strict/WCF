/**
 * Utility class to align elements relatively to another.
 *
 * @author  Alexander Ebert
 * @copyright  2001-2019 WoltLab GmbH
 * @license  GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @module  Ui/Alignment (alias)
 * @module  WoltLabSuite/Core/Ui/Alignment
 */
define(["require", "exports", "tslib", "../Core", "../Dom/Traverse", "../Dom/Util", "../Language"], function (require, exports, tslib_1, Core, DomTraverse, Util_1, Language) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.set = void 0;
    Core = tslib_1.__importStar(Core);
    DomTraverse = tslib_1.__importStar(DomTraverse);
    Util_1 = tslib_1.__importDefault(Util_1);
    Language = tslib_1.__importStar(Language);
    /**
     * Calculates top/bottom position and verifies if the element would be still within the page's boundaries.
     */
    function tryAlignmentVertical(alignment, elDimensions, refDimensions, refOffsets, windowHeight, verticalOffset, isFixedPosition) {
        let bottom = "auto";
        let top = "auto";
        let result = true;
        let pageHeaderOffset = 50;
        const pageHeaderPanel = document.getElementById("pageHeaderPanel");
        if (pageHeaderPanel !== null) {
            const position = window.getComputedStyle(pageHeaderPanel).position;
            if (position === "fixed" || position === "static") {
                pageHeaderOffset = pageHeaderPanel.offsetHeight;
            }
            else {
                pageHeaderOffset = 0;
            }
        }
        if (isFixedPosition) {
            const windowHeight = window.innerHeight;
            if (alignment === "top") {
                bottom = windowHeight - refOffsets.top + verticalOffset;
                if (windowHeight - (bottom + elDimensions.height) < 0) {
                    result = false;
                }
            }
            else {
                top = refOffsets.top + refDimensions.height + verticalOffset;
                if (top + elDimensions.height > windowHeight) {
                    result = false;
                }
            }
        }
        else {
            if (alignment === "top") {
                const bodyHeight = document.body.clientHeight;
                bottom = bodyHeight - refOffsets.top + verticalOffset;
                if (bodyHeight - (bottom + elDimensions.height) < (window.scrollY || window.pageYOffset) + pageHeaderOffset) {
                    result = false;
                }
            }
            else {
                top = refOffsets.top + refDimensions.height + verticalOffset;
                if (top + elDimensions.height - (window.scrollY || window.pageYOffset) > windowHeight) {
                    result = false;
                }
            }
        }
        return {
            align: alignment,
            bottom: bottom,
            top: top,
            result: result,
        };
    }
    /**
     * Calculates left/right position and verifies if the element would be still within the page's boundaries.
     */
    function tryAlignmentHorizontal(alignment, elDimensions, refDimensions, refOffsets, windowWidth) {
        let left = "auto";
        let right = "auto";
        let result = true;
        if (alignment === "left") {
            left = refOffsets.left;
            if (left + elDimensions.width > windowWidth) {
                result = false;
            }
        }
        else if (alignment === "right") {
            if (refOffsets.left + refDimensions.width < elDimensions.width) {
                result = false;
            }
            else {
                right = windowWidth - (refOffsets.left + refDimensions.width);
                if (right < 0) {
                    result = false;
                }
            }
        }
        else {
            left = refOffsets.left + refDimensions.width / 2 - elDimensions.width / 2;
            left = ~~left;
            if (left < 0 || left + elDimensions.width > windowWidth) {
                result = false;
            }
        }
        return {
            align: alignment,
            left: left,
            right: right,
            result: result,
        };
    }
    /**
     * Sets the alignment for target element relatively to the reference element.
     */
    function set(element, referenceElement, options) {
        options = Core.extend({
            // offset to reference element
            verticalOffset: 0,
            // align the pointer element, expects .elementPointer as a direct child of given element
            pointer: false,
            // use static pointer positions, expects two items: class to move it to the bottom and the second to move it to the right
            pointerClassNames: [],
            // alternate element used to calculate dimensions
            refDimensionsElement: null,
            // preferred alignment, possible values: left/right/center and top/bottom
            horizontal: "left",
            vertical: "bottom",
            // allow flipping over axis, possible values: both, horizontal, vertical and none
            allowFlip: "both",
        }, options || {});
        if (!Array.isArray(options.pointerClassNames) || options.pointerClassNames.length !== (options.pointer ? 1 : 2)) {
            options.pointerClassNames = [];
        }
        if (["left", "right", "center"].indexOf(options.horizontal) === -1) {
            options.horizontal = "left";
        }
        if (options.vertical !== "bottom") {
            options.vertical = "top";
        }
        if (["both", "horizontal", "vertical", "none"].indexOf(options.allowFlip) === -1) {
            options.allowFlip = "both";
        }
        // Place the element in the upper left corner to prevent calculation issues due to possible scrollbars.
        Util_1.default.setStyles(element, {
            bottom: "auto !important",
            left: "0 !important",
            right: "auto !important",
            top: "0 !important",
            visibility: "hidden !important",
        });
        const refElement = options.refDimensionsElement instanceof HTMLElement ? options.refDimensionsElement : referenceElement;
        const isFixedPosition = window.getComputedStyle(element).getPropertyValue("position") === "fixed";
        if (isFixedPosition) {
            if (window.getComputedStyle(refElement).getPropertyValue("position") !== "fixed") {
                if (!refElement.offsetParent ||
                    window.getComputedStyle(refElement.offsetParent).getPropertyValue("position") !== "fixed") {
                    throw new Error("Cannot calculate the position of a fixed element relative to a non-fixed element.");
                }
            }
        }
        const elDimensions = Util_1.default.outerDimensions(element);
        const refDimensions = Util_1.default.outerDimensions(refElement);
        const windowHeight = window.innerHeight;
        const windowWidth = isFixedPosition ? window.innerWidth : document.body.clientWidth;
        let refOffsets;
        if (isFixedPosition) {
            const clientRect = refElement.getBoundingClientRect();
            refOffsets = { left: clientRect.left, top: clientRect.top };
        }
        else {
            refOffsets = Util_1.default.offset(refElement);
        }
        let horizontal = null;
        let alignCenter = false;
        if (options.horizontal === "center") {
            alignCenter = true;
            horizontal = tryAlignmentHorizontal(options.horizontal, elDimensions, refDimensions, refOffsets, windowWidth);
            if (!horizontal.result) {
                if (options.allowFlip === "both" || options.allowFlip === "horizontal") {
                    options.horizontal = "left";
                }
                else {
                    horizontal.result = true;
                }
            }
        }
        // in rtl languages we simply swap the value for 'horizontal'
        if (Language.get("wcf.global.pageDirection") === "rtl") {
            options.horizontal = options.horizontal === "left" ? "right" : "left";
        }
        if (horizontal === null || !horizontal.result) {
            const horizontalCenter = horizontal;
            horizontal = tryAlignmentHorizontal(options.horizontal, elDimensions, refDimensions, refOffsets, windowWidth);
            if (!horizontal.result && (options.allowFlip === "both" || options.allowFlip === "horizontal")) {
                const horizontalFlipped = tryAlignmentHorizontal(options.horizontal === "left" ? "right" : "left", elDimensions, refDimensions, refOffsets, windowWidth);
                // only use these results if it fits into the boundaries, otherwise both directions exceed and we honor the demanded direction
                if (horizontalFlipped.result) {
                    horizontal = horizontalFlipped;
                }
                else if (alignCenter) {
                    horizontal = horizontalCenter;
                }
            }
        }
        const left = horizontal.left;
        const right = horizontal.right;
        let vertical = tryAlignmentVertical(options.vertical, elDimensions, refDimensions, refOffsets, windowHeight, options.verticalOffset, isFixedPosition);
        if (!vertical.result && (options.allowFlip === "both" || options.allowFlip === "vertical")) {
            const verticalFlipped = tryAlignmentVertical(options.vertical === "top" ? "bottom" : "top", elDimensions, refDimensions, refOffsets, windowHeight, options.verticalOffset, isFixedPosition);
            // only use these results if it fits into the boundaries, otherwise both directions exceed and we honor the demanded direction
            if (verticalFlipped.result) {
                vertical = verticalFlipped;
            }
        }
        const bottom = vertical.bottom;
        const top = vertical.top;
        // set pointer position
        if (options.pointer) {
            const pointers = DomTraverse.childrenByClass(element, "elementPointer");
            const pointer = pointers[0] || null;
            if (pointer === null) {
                throw new Error("Expected the .elementPointer element to be a direct children.");
            }
            if (horizontal.align === "center") {
                pointer.classList.add("center");
                pointer.classList.remove("left", "right");
            }
            else {
                pointer.classList.add(horizontal.align);
                pointer.classList.remove("center");
                pointer.classList.remove(horizontal.align === "left" ? "right" : "left");
            }
            if (vertical.align === "top") {
                pointer.classList.add("flipVertical");
            }
            else {
                pointer.classList.remove("flipVertical");
            }
        }
        else if (options.pointerClassNames.length === 2) {
            element.classList[top === "auto" ? "add" : "remove"](options.pointerClassNames[0 /* Bottom */]);
            element.classList[left === "auto" ? "add" : "remove"](options.pointerClassNames[1 /* Right */]);
        }
        Util_1.default.setStyles(element, {
            bottom: bottom === "auto" ? bottom : Math.round(bottom).toString() + "px",
            left: left === "auto" ? left : Math.ceil(left).toString() + "px",
            right: right === "auto" ? right : Math.floor(right).toString() + "px",
            top: top === "auto" ? top : Math.round(top).toString() + "px",
        });
        Util_1.default.show(element);
        element.style.removeProperty("visibility");
    }
    exports.set = set;
});
