<?php
namespace wcf\data\user\notification;
use wcf\data\DatabaseObjectEditor;

/**
 * Provides functions to edit user notifications.
 * 
 * @author	Marcel Werk
 * @copyright	2001-2011 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf.notification
 * @subpackage	data.user.notification
 * @category 	Community Framework
 */
class UserNotificationEditor extends DatabaseObjectEditor {
	/**
	 * @see	DatabaseObjectEditor::$baseClass
	 */
	protected static $baseClass = 'wcf\data\user\notification\UserNotification';
}
