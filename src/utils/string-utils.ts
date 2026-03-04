/**
 * Copyright 2024-2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Splits string in two parts
 * @param str string to split
 * @param delimiter separator string
 * @return tuple of prefix/suffix strings
*/
export function splitInTwo(str: string | undefined, delimiter: string): string[] {
    if (!str) {
        return ['', ''];
    }
    const parts = str.split(delimiter);
    const suffix = (parts.length > 1) ? parts.slice(1).join(delimiter) : '';
    return [parts[0], suffix];
}

/**
 * Splits string in tree parts
 * @param str string to split
 * @param prefixDelimiter first separator string
 * @param suffixDelimiter last separator string
 * @return array of prefix/root/suffix strings
*/
export function splitInThree(str: string | undefined, prefixDelimiter: string, suffixDelimiter: string): string[] {
    if (!str) {
        return ['', '', ''];
    }
    return [
        extractPrefix(str, prefixDelimiter),
        stripAffix(str, prefixDelimiter, suffixDelimiter),
        extractSuffix(stripPrefix(str, prefixDelimiter), suffixDelimiter),
    ];
}


/**
 * Extracts the prefix part of a string before the first occurrence of delimiter
 * @param str string to extract from
 * @param delimiter separator string
 * @returns prefix part before delimiter, or empty if delimiter not found
 */
export function extractPrefix(str: string | undefined, delimiter: string): string {
    if (!str) {
        return '';
    }
    const index = str.indexOf(delimiter);
    return index !== -1 ? str.substring(0, index) : '';
}

/**
 * Extracts the suffix part of a string after the last occurrence of delimiter
 * @param str string to extract from
 * @param delimiter separator string
 * @returns suffix part after delimiter, or empty string if delimiter not found
 */
export function extractSuffix(str: string | undefined, delimiter: string): string {
    if (!str) {
        return '';
    }
    const lastIndex = str.lastIndexOf(delimiter);
    return lastIndex !== -1 ? str.substring(lastIndex + delimiter.length) : '';
}

/**
 * Removes the prefix part of a string up to and including the first occurrence of delimiter
 * @param str string to process
 * @param delimiter separator string to remove up to
 * @returns string with prefix removed, or original string if delimiter not found
 */
export function stripPrefix(str: string | undefined, delimiter: string): string {
    if (!str) {
        return '';
    }
    const index = str.indexOf(delimiter);
    return index !== -1 ? str.substring(index + delimiter.length) : str;
}

/**
 * Removes the suffix part of a string from the last occurrence of delimiter onwards
 * @param str string to process
 * @param delimiter separator string to remove from
 * @returns string with suffix removed
 */
export function stripSuffix(str: string | undefined, delimiter: string): string {
    if (!str) {
        return '';
    }
    const lastIndex = str.lastIndexOf(delimiter);
    return lastIndex !== -1 ? str.substring(0, lastIndex) : str;
}

/**
 * Removes both prefix and suffix from a string using different delimiters
 * @param str string to process
 * @param prefixDelimiter delimiter to remove prefix up to
 * @param suffixDelimiter delimiter to remove suffix from
 * @returns string with both prefix and suffix removed
 */
export function stripAffix(str: string | undefined, prefixDelimiter: string, suffixDelimiter: string): string {
    return stripSuffix(stripPrefix(str, prefixDelimiter), suffixDelimiter);
}

/**
 * Removes the file extension from a filename (everything from the last dot onwards)
 * @param str filename to process
 * @returns filename without extension
 */
export function stripExtension(str: string | undefined): string {
    return stripSuffix(str, '.');
}

/**
 * Removes two file extensions from a filename (e.g., .tar.gz becomes just the base name)
 * @param str filename to process
 * @returns filename with two extensions removed
 */
export function stripTwoExtensions(str: string | undefined): string {
    return stripExtension(stripExtension(str));
}

/**
 * Removes version information from a package/component name (everything from '@' onwards)
 * @param name a string with version (e.g., "package@1.0.0")
 * @returns name without version (e.g., "package")
 */
export function stripVersion(name?: string) {
    return stripSuffix(name, '@');
}

/**
 * Extracts version information from a package/component name (everything from '@' onwards)
 * @param name a string with version (e.g., "package@1.0.0")
 * @returns version (e.g., "1.0.0")
 */
export function extractVersion(name?: string) {
    return extractSuffix(name, '@');
}

/**
 * Removes vendor prefix from a name (everything up to and including '::')
 * @param name a string with vendor (e.g., "Vendor::PackageName")
 * @returns package name without vendor (e.g., "PackageName")
 */
export function stripVendor(name?: string) {
    return stripPrefix(name, '::');
}

/**
 * Removes both vendor prefix and version suffix from a name
 * @param name a full name (e.g., "Vendor::PackageName@1.0.0")
 * @returns clean  name (e.g., "PackageName")
 */
export function stripVendorAndVersion(name?: string) {
    return stripAffix(name, '::', '@');
}
/**
 * Returns a string with indentation
 * @param level indentation level
 * @param indentSize number of indent size per level, default 2
 * @returns string with number of spaces equal to level * indentSize
 */

export function getIndentString(level: number, indentSize: number = 2): string {
    return ' '.repeat(level * indentSize);
}

/**
 * Extracts processor name (Pname) from full or partial device string
 * @param deviceName device name [vendor::][name][.pname] or undefined
 * Pname if specified, or undefined
 */
export function extractPname(deviceName?: string) {
    const device = stripVendor(deviceName);
    const pname = extractSuffix(device, ':');
    return pname ? (pname) : undefined;
}
/**
 * Converts CRLF line endings to LF
 * @param text input text with CRLF line endings
 * @returns text with LF line endings
 */
export function convertCrLfToLf(text: string): string {
    return text.replace(/\r\n?|\n/g, '\n');
}
/**
 * Converts LF line endings to CRLF
 * @param text input text with LF line endings
 * @returns text with CRLF line endings
 */
export function convertLfToCrLf(text: string): string {
    return text.replace(/\r\n?|\n/g, '\r\n');
}
