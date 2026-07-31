// See: https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#configuring-your-testing-environment
global.IS_REACT_ACT_ENVIRONMENT = true;

const { TextFile } = require('./src/generic/text-file');
const fsUtils = require('./src/utils/fs-utils');
const path = require('node:path');

// Route TextFile operations through fsUtils so tests can replace them with Jest spies after setup.
TextFile.setFileSystem({
  exists: fileName => fsUtils.fileExists(fileName),
  read: fileName => fsUtils.readTextFile(fileName),
  write: (fileName, content) => fsUtils.writeTextFile(fileName, content),
  unlink: fileName => fsUtils.deleteFileIfExists(fileName),
  dirname: fileName => path.dirname(fileName),
  resolve: (...pathSegments) => path.resolve(...pathSegments),
});

// Fixes errors in tests, when components from vscode-webview-ui-toolkit are used.
if (typeof window !== 'undefined') { // Only in jsdom
  Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(), // Deprecated
          removeListener: jest.fn(), // Deprecated
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
      })),
  });

  const { TextDecoder, TextEncoder } = require('node:util')

  Object.defineProperties(globalThis, {
    TextDecoder: { value: TextDecoder },
    TextEncoder: { value: TextEncoder },
  });
}
