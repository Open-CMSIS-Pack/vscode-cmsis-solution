/**
 * Copyright 2022-2026 Arm Limited
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

/*
 * Mocks for the vscode API, used in unit tests.
 */

/* eslint-disable no-undef */

import { URI, Utils as UriUtils } from 'vscode-uri';

class Uri extends URI {
    static joinPath = UriUtils.joinPath;
}

class MarkdownString extends String {
    constructor(value, supportThemeIcons) {
        super(value);
        this.supportThemeIcons = supportThemeIcons;
    }
}

// Classes
const Disposable = jest.fn(() => {
    return { dispose: jest.fn() };
});
Disposable.from = disposable => disposable;
const EventEmitter = jest.fn(() => {
    const callbacks = [];
    return {
        dispose: jest.fn(),
        event: (callback, thisArg, disposables) => {
            callbacks.push(thisArg ? callback.bind(thisArg) : callback);
            const disposable = { dispose: jest.fn() };
            disposables?.push(disposable);
            return disposable;
        },
        fire: event => callbacks.forEach(callback => callback(event))
    };
});
const RelativePattern = jest.fn((base, pattern) => ({ base, pattern }));
const ShellExecution = jest.fn((executablePath, executionArgs, options) => (
    { executablePath, executionArgs, options }
));
const Task = jest.fn((definition, scope, name, source, execution) => (
    { definition, scope, name, source, execution }
));
const CustomExecution = jest.fn((callback) => ({ callback }));
const ColorThemeKind = {
    Dark: 1,
};

const Position = jest.fn((line, character) => ({ line, character }));

class Range {
    constructor(startLine, startCharacter, endLine, endCharacter) {
        this.start = Position(startLine, startCharacter);
        this.end = Position(endLine, endCharacter);
    }
}

class Diagnostic {
    constructor(range, message, severity) {
        this.range = range;
        this.message = message;
        this.severity = severity;
    }
}

const WorkspaceEdit = jest.fn(() => ({
    replace: jest.fn(),
    insert: jest.fn(),
}));

const QuickPickItemKind = {
    Separator: -1
};

const DiagnosticSeverity = {
    Error: 0,
}

const CodeActionKind = {
    QuickFix: jest.fn(),
}
const CodeAction = jest.fn();

// Enums
const ShellQuoting = { Escape: 'Escape' };
const StatusBarAlignment = { Left: 'Left' };
const TaskScope = { Workspace: 'Workspace' };
const ViewColumn = {
    Active: -1,
    Beside: -2
}
const ProgressLocation = { Notification: 1 };

// Namespaces
const commands = {
    executeCommand: jest.fn(),
    registerCommand: jest.fn(),
    getCommands: jest.fn(() => []),
};
const debug = {
    startDebugging: jest.fn()
};
const DiagnosticCollection = {
    set: jest.fn(),
    get: jest.fn(),
    clear: jest.fn(),
    delete: jest.fn(),
    dispose: jest.fn(),
    forEach: jest.fn(),
    has: jest.fn(),
};
const languages = {
    createDiagnosticCollection: jest.fn().mockReturnValue(DiagnosticCollection),
};
const tasks = {
    executeTask: jest.fn(),
    fetchTasks: jest.fn(() => []),
    onDidStartTaskProcess: new EventEmitter().event,
    onDidEndTaskProcess: new EventEmitter().event
};
const window = {
    activeColorTheme: { kind: 1 },
    createStatusBarItem: jest.fn(() => ({ show: jest.fn(), hide: jest.fn() })),
    createTerminal: jest.fn(() => ({ show: jest.fn(), hide: jest.fn(), dispose: jest.fn() })),
    createWebviewPanel: jest.fn(),
    registerWebviewPanelSerializer: jest.fn(),
    registerWebviewViewProvider: jest.fn(),
    registerCustomEditorProvider: jest.fn(() => ({ dispose: jest.fn() })),
    showTextDocument: jest.fn(),
    showOpenDialog: jest.fn(),
    showQuickPick: jest.fn(),
    createQuickPick: jest.fn(),
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    registerUriHandler: jest.fn(),
};
const fs = {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    stat: jest.fn(),
    delete: jest.fn(),
}
const workspace = {
    fs,
    findFiles: jest.fn(async () => []),
    getConfiguration: jest.fn(),
    onDidChangeConfiguration: new EventEmitter().event,
    onDidChangeWorkspaceFolders: jest.fn(() => ({ dispose: jest.fn() })),
    onDidSaveTextDocument: new EventEmitter().event,
    onDidChangeTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
    onWillSaveTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
    applyEdit: jest.fn().mockResolvedValue(true),
    openTextDocument: jest.fn(),
    updateWorkspaceFolders: jest.fn(),
};
const extensions = {
    getExtension: jest.fn(),
    onDidChange: jest.fn(() => ({ dispose: jest.fn() })),
};

class FileSystemError extends Error {
    code;
    static FileNotFound(message) {
        const err = new FileSystemError(message);
        err.code = 'FileNotFound';
        return err;
    }

    static NoPermissions(message) {
        const err = new FileSystemError(message);
        err.code = 'NoPermissions';
        return err;
    }
}

export const env = {
    clipboard: {
        writeText: jest.fn()
    }
};

const EnvironmentVariableMutatorType = {
    Append: 'Append',
    Prepend: 'Prepend',
    Replace: 'Replace',
}

module.exports = {
    MarkdownString,
    CodeAction,
    ColorThemeKind,
    CodeActionKind,
    CustomExecution,
    DiagnosticSeverity,
    Disposable,
    EventEmitter,
    Position,
    QuickPickItemKind,
    Range,
    Diagnostic,
    RelativePattern,
    ShellExecution,
    Task,
    Uri,
    WorkspaceEdit,
    ShellQuoting,
    StatusBarAlignment,
    TaskScope,
    ViewColumn,
    ProgressLocation,
    commands,
    debug,
    languages,
    tasks,
    window,
    workspace,
    extensions,
    FileSystemError,
    env,
    EnvironmentVariableMutatorType,
};
