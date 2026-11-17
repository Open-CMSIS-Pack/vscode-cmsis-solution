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

import { DebuggerTraceWrap, DebuggerWrap } from '../solutions/files/csolution-wrap';
import { DebugAdapterSectionDefinition, SectionSwitchBinding } from './debug-adapter-sections';

/** Preserves trace settings when capture is switched off and defaults newly enabled capture to file output. */
const traceSwitch: SectionSwitchBinding = {
    read: section => new DebuggerTraceWrap(section.item).enabled,
    write: (section, enabled) => { new DebuggerTraceWrap(section.item).enabled = enabled; },
};

/** Validates the clock in stored Hz, allowing fractional kHz that resolve to whole Hz. */
function validInputClock(value: string | number): boolean {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

/** Defines trace sources and their protocol rules without creating or modifying debugger configuration. */
export function createTraceSectionDefinition(debuggerWrap?: DebuggerWrap): DebugAdapterSectionDefinition {
    const serialWireAvailable = (debuggerWrap?.protocol ?? 'swd').toLocaleLowerCase() === 'swd';
    return {
        ui: { section: 'Trace', 'yml-node': 'trace', options: [] },
        dynamic: {
            kind: 'sequence',
            label: count => `Trace (${count})`,
            types: [
                {
                    ui: {
                        id: 'serialwire', 'yml-node': 'swo-uart', section: 'Serial Wire', select: true, removable: true,
                        ...(!serialWireAvailable ? { warning: 'SWO requires SWD protocol' } : {}),
                        options: [{
                            name: 'Input Clock (kHz)', 'yml-node': 'input-clock', type: 'number', scale: 1000,
                            default: 0, range: [0, Number.MAX_SAFE_INTEGER / 1000],
                        }],
                    },
                    addable: serialWireAvailable,
                    switch: traceSwitch,
                    initialValues: { mode: 'file' },
                    validators: { 'input-clock': validInputClock },
                },
                {
                    ui: { id: 'tracebuffer', 'yml-node': 'trace-buffer', section: 'Trace Buffer', select: true, removable: true, options: [] },
                    switch: traceSwitch,
                    initialValues: { mode: 'file' },
                },
            ],
        },
    };
}
