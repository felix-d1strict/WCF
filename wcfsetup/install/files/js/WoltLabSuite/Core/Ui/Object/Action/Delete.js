/**
 * Reacts to objects being deleted.
 *
 * @author  Matthias Schmidt
 * @copyright  2001-2021 WoltLab GmbH
 * @license  GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @module  WoltLabSuite/Core/Ui/Object/Action/Delete
 */
define(["require", "exports", "tslib", "./Handler"], function (require, exports, tslib_1, Handler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setup = void 0;
    Handler_1 = tslib_1.__importDefault(Handler_1);
    function deleteObject(data, objectElement) {
        objectElement.remove();
    }
    function setup() {
        new Handler_1.default("delete", ["delete"], deleteObject);
    }
    exports.setup = setup;
});
