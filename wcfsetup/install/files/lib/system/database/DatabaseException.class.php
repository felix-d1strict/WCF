<?php
namespace wcf\system\database;
use wcf\system\database\statement\PreparedStatement;
use wcf\system\exception\SystemException;
use wcf\util\StringUtil;

/**
 * DatabaseException is a specific SystemException for database errors.
 * 
 * @author	Marcel Werk
 * @copyright	2001-2011 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	com.woltlab.wcf
 * @subpackage	system.database
 * @category 	Community Framework
 */
class DatabaseException extends SystemException {
	/**
	 * error number
	 * @var integer
	 */
	protected $errorNumber = null;
	
	/**
	 * error description
	 * @var string
	 */
	protected $errorDesc = null;
	
	/**
	 * sql version number
	 * @var string
	 */
	protected $sqlVersion = null;
	
	/**
	 * sql type
	 * @var string
	 */
	protected $DBType = null;
	
	/**
	 * Database object
	 * @var Database
	 */
	protected $db = null;
	
	/**
	 * PreparedStatement object
	 * @var	PreparedStatement
	 */
	protected $preparedStatement = null;
	
	/**
	 * Creates a new DatabaseException.
	 * 
	 * @param	string			$message		error message
	 * @param	Database		$db			affected db object
	 * @param	PreparedStatement	$preparedStatement	affected prepared statement
	 */
	public function __construct($message, Database $db, PreparedStatement $preparedStatement = null) {
		$this->db = $db;
		$this->DBType = $db->getDBType();
		$this->preparedStatement = $preparedStatement;
		
		// prefer errors from prepared statement
		if (($this->preparedStatement instanceof PreparedStatement) && $this->preparedStatement->getErrorNumber()) {
			$this->errorNumber = $this->preparedStatement->getErrorNumber();
			$this->errorDesc = $this->preparedStatement->getErrorDesc();
		}
		else {
			$this->errorNumber = $this->db->getErrorNumber();
			$this->errorDesc = $this->db->getErrorDesc();
		}
		
		parent::__construct($message, intval($this->errorNumber));
	}
	
	/**
	 * Returns the error number of this exception.
	 * 
	 * @return	integer
	 */
	public function getErrorNumber() {
		return $this->errorNumber;
	}
	
	/**
	 * Returns the error description of this exception.
	 * 
	 * @return	string
	 */
	public function getErrorDesc() {
		return $this->errorDesc;
	}
	
	/**
	 * Returns the current sql version of the database.
	 * 
	 * @return	string
	 */
	public function getSQLVersion() {
		if ($this->sqlVersion === null) {
			try {
				$this->sqlVersion = $this->db->getVersion();
			}
			catch (DatabaseException $e) {
				$this->sqlVersion = 'unknown';
			}
		}
		
		return $this->sqlVersion;
	}
	
	/**
	 * Returns the sql type of the active database.
	 * 
	 * @return	string 
	 */
	public function getDBType() {
		return $this->DBType;
	}
	
	/**
	 * Prints the error page.
	 */
	public function show() {
		$this->information .= '<b>sql type:</b> ' . StringUtil::encodeHTML($this->getDBType()) . '<br />';
		$this->information .= '<b>sql error:</b> ' . StringUtil::encodeHTML($this->getErrorDesc()) . '<br />';
		$this->information .= '<b>sql error number:</b> ' . StringUtil::encodeHTML($this->getErrorNumber()) . '<br />';
		$this->information .= '<b>sql version:</b> ' . StringUtil::encodeHTML($this->getSQLVersion()) . '<br />';
		
		$this->information .= "\n<!-- db error: #".$this->db->getErrorNumber().': '.$this->db->getErrorDesc()." -->\n";
		if ($this->preparedStatement !== null) {
			$this->information .= "\n<!-- statement error: #".$this->preparedStatement->getErrorNumber().': '.$this->preparedStatement->getErrorDesc()." -->\n";
		}
		
		parent::show();
	}
}
