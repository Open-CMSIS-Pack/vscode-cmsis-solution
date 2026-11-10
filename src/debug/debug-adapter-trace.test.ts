/**
 * Copyright 2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CTreeItem } from '@open-cmsis-pack/cmsis-common/tree-item';
import { DebuggerWrap } from '../solutions/files/csolution-wrap';
import { DebugAdapterSections } from './debug-adapter-sections';
import { createTraceSectionDefinition } from './debug-adapter-trace';

/** Uses the real debugger model and generic section operations with the trace definition. */
function createTrace(data: object = {}) {
    const item = new CTreeItem('debugger');
    item.fromObject(data);
    const debuggerWrap = new DebuggerWrap(item);
    const settings = new DebugAdapterSections([], [createTraceSectionDefinition(debuggerWrap)], () => debuggerWrap, () => debuggerWrap);
    return { item, debuggerWrap, settings };
}

describe('trace section definition', () => {
    it('keeps existing SWO editable and removable with JTAG while only offering Trace Buffer for adding', () => {
        const { item, settings } = createTrace({ protocol: 'jtag', trace: [{ 'swo-uart': null, mode: 'off', 'input-clock': 48000000 }] });
        expect(settings.sections[0].select).toBeUndefined();
        expect(settings.sections[0].addOptions).toEqual([{ id: 'tracebuffer', name: 'Trace Buffer' }]);
        expect(settings.sections[0].subsections?.[0]).toEqual(expect.objectContaining({
            select: false, removable: true, warning: 'SWO requires SWD protocol',
        }));
        settings.setEnabled('trace', ['serialwire'], true);
        expect(settings.sections[0].subsections?.[0]).toEqual(expect.objectContaining({ select: true, warning: 'SWO requires SWD protocol' }));
        settings.remove('trace', ['serialwire']);
        settings.add('trace', ['serialwire']);
        expect(item.toObject()).toEqual({ protocol: 'jtag' });
    });

    it('defaults capture to file output and preserves active server settings and unknown sources', () => {
        const { item, settings } = createTrace({ trace: [{ file: 'existing.raw', 'swo-uart': null, mode: 'server', 'input-clock': 48000000 }, { custom: null }] });
        settings.setEnabled('trace', ['serialwire'], true);
        expect(item.getChild('trace')?.getChildren()[0].getValue('mode')).toBe('server');
        settings.setEnabled('trace', ['serialwire'], false);
        settings.setEnabled('trace', ['serialwire'], true);
        settings.add('trace', ['tracebuffer']);
        expect(item.toObject()).toEqual({ trace: [
            { file: 'existing.raw', 'swo-uart': null, mode: 'file', 'input-clock': 48000000 },
            { custom: null },
            { 'trace-buffer': null, mode: 'file' },
        ] });
    });

    it('describes kHz display while validating and storing integer Hz through the generic editor', () => {
        const { settings, debuggerWrap } = createTrace();
        settings.add('trace', ['serialwire']);
        expect(settings.sections[0].subsections?.[0].options[0]).toEqual(expect.objectContaining({ name: 'Input Clock (kHz)', scale: 1000 }));
        settings.setParameter('trace', ['serialwire'], 'input-clock', 96000500);
        for (const invalid of [-1, 1.5, 1001.5, 0.0001, Number.NaN, Number.MAX_SAFE_INTEGER + 1]) {
            settings.setParameter('trace', ['serialwire'], 'input-clock', invalid);
        }
        expect(debuggerWrap.getTraceSource('swo-uart')?.inputClock).toBe(96000500);
        settings.setParameter('trace', ['serialwire'], 'input-clock', Number.MAX_SAFE_INTEGER);
        expect(debuggerWrap.getTraceSource('swo-uart')?.inputClock).toBe(Number.MAX_SAFE_INTEGER);
    });
});
