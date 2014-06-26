<?php
namespace wcf\system\user\notification\event;
use wcf\data\user\User;
use wcf\system\request\LinkHandler;
use wcf\system\user\notification\event\AbstractUserNotificationEvent;
use wcf\system\WCF;

/**
 * User notification event for profile commment response likes.
 * 
 * @author	Alexander Ebert
 * @copyright	2001-2014 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf
 * @subpackage	system.user.notification.event
 * @category	Community Framework
 */
class UserProfileCommentResponseLikeUserNotificationEvent extends AbstractUserNotificationEvent {
	/**
	 * @see	\wcf\system\user\notification\event\AbstractUserNotificationEvent::$stackable
	 */
	protected $stackable = true;
	
	/**
	 * @see	\wcf\system\user\notification\event\IUserNotificationEvent::getTitle()
	 */
	public function getTitle() {
		$count = count($this->getAuthors());
		if ($count > 1) {
			return $this->getLanguage()->getDynamicVariable('wcf.user.notification.commentResponse.like.title.stacked', array(
				'count' => $count,
				'timesTriggered' => $this->timesTriggered
			));
		}
		
		return $this->getLanguage()->get('wcf.user.notification.commentResponse.like.title');
	}
	
	/**
	 * @see	\wcf\system\user\notification\event\IUserNotificationEvent::getMessage()
	 */
	public function getMessage() {
		$authors = array_values($this->getAuthors());
		$count = count($authors);
		$commentUser = $owner = null;
		if ($this->additionalData['objectID'] != WCF::getUser()->userID) {
			$owner = new User($this->additionalData['objectID']);
		}
		if ($this->additionalData['commentUserID'] != WCF::getUser()->userID) {
			$commentUser = new User($this->additionalData['commentUserID']);
		}
		
		if ($count > 1) {
			return $this->getLanguage()->getDynamicVariable('wcf.user.notification.commentResponse.like.message.stacked', array(
				'author' => $this->author,
				'authors' => $authors,
				'commentUser' => $commentUser,
				'count' => $count,
				'others' => $count - 1,
				'owner' => $owner
			));
		}
		
		return $this->getLanguage()->getDynamicVariable('wcf.user.notification.commentResponse.like.message', array(
			'author' => $this->author,
			'comment' => $this->userNotificationObject,
			'owner' => $owner
		));
	}
	
	/**
	 * @see	\wcf\system\user\notification\event\IUserNotificationEvent::getEmailMessage()
	 */
	public function getEmailMessage($notificationType = 'instant') { /* not supported */ }
	
	/**
	 * @see	\wcf\system\user\notification\event\IUserNotificationEvent::getLink()
	 */
	public function getLink() {
		return LinkHandler::getInstance()->getLink('User', array('object' => WCF::getUser()), '#wall');
	}
	
	/**
	 * @see	\wcf\system\user\notification\event\IUserNotificationEvent::getEventHash()
	 */
	public function getEventHash() {
		return sha1($this->eventID . '-' . $this->additionalData['commentID']);
	}
	
	/**
	 * @see	\wcf\system\user\notification\event\IUserNotificationEvent::supportsEmailNotification()
	 */
	public function supportsEmailNotification() {
		return false;
	}
}
