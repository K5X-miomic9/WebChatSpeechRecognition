/**
* @external String
* @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String|String}
*/

/**
 * Removes certain characters from the end of a string.
 * @param {string} charsToRemove - The characters to be removed.
 * @returns {string} - The shortened string
 * @memberof String
 */
String.prototype.trimEndChar = function (charsToRemove) {
	let endIndex = this.length;
	while (endIndex > 0 && charsToRemove.includes(this[endIndex - 1])) {
		endIndex--;
	}
	return this.substring(0, endIndex);
};

/**
 * Removes space characters from the end of a string.
 * @returns {string} - The shortened string
 * @function external:String#trimEndSpace
 */
String.prototype.trimEndSpace = () => this.replace(/[ ]+$/, '');

var x = 'dsd';
x.trimEndSpace();