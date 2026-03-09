/**
 * Copyright 2025-2026 Arm Limited
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

import path from 'node:path';
import * as fs from 'node:fs';
import * as fsUtils from '../utils/fs-utils';
import * as vscodeUtils from '../utils/vscode-utils';
import { ITextParser } from './text-parser';
import { ITextRenderer } from './text-renderer';
import { ErrorList, IErrorList } from './error-list';
import { convertCrLfToLf } from '../utils/string-utils';

/** Describes the result of saving or reading a file.
 *
 * - Unchanged: The file was not changed.
 * - Success: The operation completed successfully.
 * - Error: The operation failed due to an error.
 * - NotExists: The file does not exist.
 */
export enum ETextFileResult {
    /** The file was not changed. */
    Unchanged = 0,
    /** The operation completed successfully. */
    Success = 1,
    /** The operation failed due to an error. */
    Error = 2,
    /** The file does not exist. */
    NotExists = 3
}

type ExternalFileStamp = {
    path: string;
    mtimeMs: number;
    size: number;
};

/**
 * Represents a text file with parsing, rendering, and error handling capabilities.
 * Provides methods and properties for managing file content, file metadata, and associated parsers/renderers.
 *
 * @remarks
 * This interface extends {@link IErrorList} to include error tracking functionality.
 *
 * @property {string} text - Gets or sets the file text content.
 * @property {string} fileName - Gets or sets the file name.
 * @property {string} fileDir - Gets the file directory.
 * @property {unknown | undefined} content - Gets the parsed content object.
 * @property {object} object - Gets the parsed content object as a plain object.
 * @property {ITextParser | undefined} parser - Gets or sets the text parser.
 * @property {ITextRenderer | undefined} renderer - Gets or sets the text renderer.
 * @property {boolean} readOnly - Gets or sets the read-only state of the file.
 *
 * @method load
 * Loads file content and parses it.
 * @param {string} [filename] - Optional file name to load. If not provided, uses the current file name.
 * @returns {Promise<ETextFileResult>} The result of the file load operation.
 *
 * @method save
 * Stringifies file content and saves it.
 * @param {string} [filename] - Optional file name to save. If not provided, uses the current file name.
 * @returns {Promise<ETextFileResult>} The result of the file save operation.
 *
 * @method parse
 * Renders and parses the file text, returning the parsed content object.
 * Neither text nor content is changed.
 * @returns {unknown} The parsed content object.
 *
 * @method render
 * Renders the file text using the renderer, if set.
 * @returns {string} The rendered text.
 *
 * @method stringify
 * Converts the parsed content object to a string.
 * @returns {string} Stringified content.
 */
export interface ITextFile extends IErrorList {
    /** Gets the file text content */
    get text(): string;
    /** Sets the file text content */
    set text(content: string);

    /** Gets the file name */
    get fileName(): string;
    /** Sets the file name */
    set fileName(fileName: string);
    /** Gets the file directory */
    get fileDir(): string;

    /** Gets the parsed content object */
    get content(): unknown | undefined;

    /** Set the content object */
    set content(content: unknown | undefined);

    /** Gets the parsed content object as plain object */
    get object(): object;

    /** Gets the text parser */
    get parser(): ITextParser | undefined;
    /** Sets the text parser */
    set parser(parser: ITextParser | undefined);

    /** Gets the text renderer */
    get renderer(): ITextRenderer | undefined;
    /** Sets the text renderer */
    set renderer(renderer: ITextRenderer | undefined);

    /**
     * Check if file exists
     * @returns true if file exists
     */
    exists(): boolean;

    /**
     * Deletes underlying file if it exists
     */
    unlink(): void;

    /**
     * Loads file content and parses it
     * @param filename optional alternative filename
    */
    load(filename?: string): Promise<ETextFileResult>;
    /**
     * Stringifies file content and saves it
     * @param filename optional alternative filename
    */
    save(filename?: string): Promise<ETextFileResult>;

    /**
     * Renders and parses the file text, returning the parsed content object.
     * Neither text nor content is changed
     * @returns The parsed content object
     */
    parse(): unknown;

    /**
     * Renders the file text using the renderer, if set.
     * @returns The rendered text
     */
    render(): string;

    /**
     * Converts the parsed content object to a string.
     * @returns Stringified content
     */
    stringify(): string;

    /**
     * Gets the read-only state of the file.
     */
    get readOnly(): boolean;

    /**
     * Sets the read-only state of the file.
     */
    set readOnly(value: boolean);

    /**
     * Checks if the in-memory content has been modified
     */
    isModified(): boolean;

    /** Clears file content and errors */
    clear(): void;

    /**
     * Refreshes the stored external file stamp baseline.
     */
    refreshExternalFileStamp(): void;

    /**
     * Checks whether the file changed externally since the last stamp refresh/check.
     */
    hasExternalFileChanged(): boolean;

    /** Copy text and parse it to the object, does not change filename
     * @param src source file
     */
    copyFrom(src?: ITextFile): ETextFileResult;

    /**
     * Resolves a path relative to the file's directory
     * @param pathToResolve  path to resolve, relative or absolute or undefined
     * @returns resolved path or empty if input is undefined
     */
    resolvePath(pathToResolve: string | undefined): string;
}

export class TextFile extends ErrorList implements ITextFile {
    private _dirty = false;
    private _fileName: string;
    private _fileDir: string;

    private contentString = '';
    protected contentObject?: unknown;
    protected textParser?: ITextParser;
    protected textRenderer?: ITextRenderer;

    private _readOnly = false;
    private externalFileStamp?: ExternalFileStamp;

    /**
     * Constructs a TextFile instance
     * @param fileName File name
     * @param textParser Optional text parser
     * @param textRenderer Optional text renderer
     */
    constructor(
        fileName?: string,
        textParser?: ITextParser,
        textRenderer?: ITextRenderer
    ) {
        super();
        this._fileName = fileName ?? '';
        this.textParser = textParser;
        this.textRenderer = textRenderer;
        this._fileDir = fileName ? path.dirname(fileName) : '';
    }

    /**
     * Gets the read-only state of the file.
     */
    public get readOnly(): boolean {
        return this._readOnly;
    }

    public set readOnly(value: boolean) {
        this._readOnly = value;
    }

    public get parser(): ITextParser | undefined {
        return this.textParser;
    }
    public set parser(parser: ITextParser | undefined) {
        this.textParser = parser;
    }

    public get renderer(): ITextRenderer | undefined {
        return this.textRenderer;
    }

    public set renderer(renderer: ITextRenderer | undefined) {
        this.textRenderer = renderer;
    }

    public clear() {
        this._dirty = false;
        this.contentString = '';
        this.contentObject = undefined;
        this.externalFileStamp = undefined;
        this.clearErrors();
    }

    copyFrom(src?: ITextFile): ETextFileResult {
        if (!src) {
            return ETextFileResult.Unchanged;
        }
        const newText = src.stringify();
        // we need a fresh copy
        if (this.text !== newText) {
            this.clearErrors();
            this.text = newText;
            this.content = this.parse();
            return this.errors.length === 0 ? ETextFileResult.Success : ETextFileResult.Error;
        }
        return ETextFileResult.Unchanged;
    }

    public get content(): unknown | undefined {
        return this.contentObject;
    }

    public set content(content: unknown | undefined) {
        if (this.contentObject !== content) {
            this.contentObject = content;
            this._dirty = true;
        }
    }

    public get object(): object {
        return this.contentObject ? this.contentObject as object : {};
    }

    public get fileName(): string {
        return this._fileName;
    }

    /** Sets the file name and updates file directory */
    public set fileName(value: string) {
        if (value !== this._fileName) {
            this._fileName = value;
            this._fileDir = path.dirname(value);
            this.externalFileStamp = undefined;
        }
    }

    /** Gets the file directory */
    public get fileDir(): string {
        return this._fileDir;
    }

    public exists(): boolean {
        return fsUtils.fileExists(this.fileName);
    }

    public unlink() {
        if (!this.readOnly) {
            fsUtils.deleteFileIfExists(this.fileName);
        }
    }

    /**
     * Protected method to safely read a text file.
     * @returns File content or empty string if error occurs
     */
    protected read(): string {
        try {
            return fsUtils.readTextFile(this.fileName);
        } catch (e) {
            this.addError(
                `${this.fileName}: Failed to read: ${e instanceof Error ? e.message : String(e)}`
            );
            return '';
        }
    }

    /**
     * Protected method to safely write a text file.
     * @returns true if successful, false otherwise
     */
    protected write(): boolean {
        if (!this.fileName) {
            return false;
        }
        try {
            fsUtils.writeTextFile(this.fileName, this.text);
        } catch (e) {
            this.addError(
                `${this.fileName}: Failed to write: ${e instanceof Error ? e.message : String(e)}`
            );
            return false;
        }
        return true;
    }

    protected showErrorMessage(result: ETextFileResult) {
        if (!this.hasErrors()) {
            return;
        }
        for (const err of this.errors) {
            console.error(err);
        }
        if (result === ETextFileResult.Error ||
            (result === ETextFileResult.NotExists && this.readOnly)) {
            vscodeUtils.showErrorMessage(this.errors.join('\n'));
        }
    }

    /**
     * Loads file content, parses it, and updates content object
     * @param fileName Optional file name to load
     * @returns Load result
     */
    public async load(fileName?: string): Promise<ETextFileResult> {
        if (fileName) {
            this.fileName = fileName;
        }
        const result = this.doLoad();
        this.refreshExternalFileStamp();
        this.showErrorMessage(result);
        return result;
    }

    /**
     * Loads file content, parses it, and updates content object
     * @returns Load result
     */
    protected doLoad(): ETextFileResult {
        this.clearErrors();
        if (!this.exists()) {
            this.addError(`${this.fileName}: File not exists`);
            return ETextFileResult.NotExists;
        }
        this._dirty = false;

        this.text = this.read();
        if (this.hasErrors()) {
            return ETextFileResult.Error;
        }

        if (this.resetDirty() || !this.contentObject) {
            this.contentObject = this.parse();
            if (this.hasErrors()) {
                return ETextFileResult.Error;
            }
            return ETextFileResult.Success;
        }
        return ETextFileResult.Unchanged;
    }


    /**
     * Saves file content to disk
     * @returns Save result
     */
    public async save(fileName?: string): Promise<ETextFileResult> {
        if (fileName && this.fileName !== fileName) {
            this.fileName = fileName;
            this._dirty = true; // force saving
        }
        const result = this.doSave();
        this.refreshExternalFileStamp();
        this.showErrorMessage(result);
        return result;
    }

    private getCurrentFileStamp(): ExternalFileStamp | undefined {
        if (!this.fileName || !fsUtils.fileExists(this.fileName)) {
            return undefined;
        }
        try {
            const stat = fs.statSync(this.fileName);
            return {
                path: this.fileName,
                mtimeMs: stat.mtimeMs,
                size: stat.size,
            };
        } catch {
            return undefined;
        }
    }

    public refreshExternalFileStamp(): void {
        this.externalFileStamp = this.getCurrentFileStamp();
    }

    public hasExternalFileChanged(): boolean {
        const currentStamp = this.getCurrentFileStamp();
        if (!this.externalFileStamp) {
            this.externalFileStamp = currentStamp;
            return false;
        }

        const changed = !currentStamp
            || currentStamp.path !== this.externalFileStamp.path
            || currentStamp.mtimeMs !== this.externalFileStamp.mtimeMs
            || currentStamp.size !== this.externalFileStamp.size;

        this.externalFileStamp = currentStamp;
        return changed;
    }

    /**
     * Saves file content to disk
     * @returns Save result
     */
    protected doSave(): ETextFileResult {
        this.clearErrors();
        if (this.readOnly) {
            return ETextFileResult.Error;
        }
        this.text = this.stringify();
        if (this.resetDirty() || !this.exists()) {
            if (this.write()) {
                return ETextFileResult.Success;
            }
            return ETextFileResult.Error;
        }
        return ETextFileResult.Unchanged;
    }

    /** Gets dirty state */
    public get isDirty(): boolean {
        return this._dirty;
    }

    /**
     * Resets dirty flag if set
     * @returns true if dirty state was true
     */
    protected resetDirty(): boolean {
        const oldDirty = this._dirty;
        this._dirty = false;
        return oldDirty;
    }

    /**
     * forces setting of the dirty flag
     * @returns true if dirty state was true
     */
    protected markDirty(): boolean {
        const oldDirty = this._dirty;
        this._dirty = true;
        return oldDirty;
    }

    /** Gets the file text content */
    public get text(): string {
        return this.contentString;
    }

    /** Sets the file text content and marks dirty if changed */
    public set text(content: string) {
        if (content !== this.contentString) {
            this.contentString = content;
            this._dirty = true;
        }
    }

    /**
     * Converts content object to string
     * Override in subclasses to update contentString before
     * @returns Stringified content
     */
    public stringify(): string {
        if (this.parser) {
            return this.parser.stringify(this.content);
        }
        return this.text;
    }

    /**
     * Parses content string into an object
     * Uses renderer if set before parsing
     * @returns Parsed object
     */
    public parse(): unknown {
        if (this.textParser) {
            const result = this.textParser.parse(this.render());
            if (this.textParser.hasErrors()) {
                this.addError(`${this.fileName}: Failed to parse:`);
                for (const err of this.textParser.errors) {
                    this.addError(err);
                }
            }
            return result;
        }
        return {};
    }

    /**
     * Renders the file text using the renderer, if set.
     * @returns The rendered text
     */
    public render(): string {
        if (this.textRenderer) {
            return this.textRenderer.render(this.text);
        }
        return this.text;
    }

    /**
     * Resolves a path relative to the file's directory
     * @param pathToResolve The path to resolve, relative or absolute
     * @returns The resolved path or undefined if input is undefined
     */
    resolvePath(pathToResolve: string | undefined) {
        if (pathToResolve === undefined) {
            return '';
        }
        return path.resolve(this.fileDir, pathToResolve);
    }

    public isModified(): boolean {
        return convertCrLfToLf(this.stringify()) !== convertCrLfToLf(this.text);
    }
}
