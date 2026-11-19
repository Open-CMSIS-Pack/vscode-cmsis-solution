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

import { PreviewSession } from './preview-session';
import { settingsFields, settingsSections, type SettingsActionRequest } from '../manage-solution/settings-contract';

/** A UI-only adapter intentionally omits the runtime debugger template. */
const source = `debug-adapters:
  - name: Preview
    user-interface:
      - section: General
        options:
          - name: Speed
            yml-node: clock
            type: number
            scale: 1000
            default: 10
            range: [1, 100]
          - name: Protocol
            yml-node: protocol
            type: enum
            values: [swd, jtag]
            default: swd
          - name: Script
            yml-node: script
            type: file
      - section: Telnet
        yml-node: { name: telnet, kind: sequence }
        select: false
        options: []
        subsections:
          - section: \${{ processors.name }}
            collapsible: false
            yml-node: { name: pname, value: '\${{ processors.name }}', optional: true }
            options:
              - name: Mode
                yml-node: mode
                type: string
                default: monitor
`;

/** Builds a valid request from the latest snapshot without exposing storage paths. */
function request(session: PreviewSession, actionId: string, value?: string | number | boolean): SettingsActionRequest {
    const snapshot = session.state().snapshot!;
    return { contextId: snapshot.contextId, revision: snapshot.revision, requestId: 'test', actionId, value };
}

describe('debug adapter authoring session', () => {
    let session: PreviewSession;

    beforeEach(() => {
        session = new PreviewSession('untitled:debug-adapters.yml');
        session.update(source, true);
    });

    it('normalizes UI-only unsaved definitions and keeps control changes in detached YAML', () => {
        const state = session.state();
        expect(state.error).toBeUndefined();
        expect(state.adapters).toEqual(['Preview']);
        const fields = settingsFields(state.snapshot!.sections);
        expect(fields.find(field => field.label === 'Protocol')).toMatchObject({ choices: [
            { label: 'swd', value: 'swd' }, { label: 'jtag', value: 'jtag' },
        ] });
        expect(fields.find(field => field.type === 'file')).toMatchObject({
            browseAction: expect.any(String), openAction: undefined,
        });
        const speed = fields.find(field => field.label === 'Speed')!;
        expect(session.act(request(session, speed.editAction!, 20))?.status).toBe('applied');
        expect(session.state().yaml).toContain('clock: 20000');
        expect(source).not.toContain('clock: 20000');
        session.reset();
        expect(settingsFields(session.state().snapshot!.sections).find(field => field.label === 'Speed')?.value).toBe(10);
        expect(session.state().yaml).not.toContain('clock:');
    });

    it('shows file actions using production visibility and cancels them without changing preview values', () => {
        let file = settingsFields(session.state().snapshot!.sections).find(field => field.type === 'file')!;
        const initialYaml = session.state().yaml;

        expect(session.act(request(session, file.browseAction!))?.status).toBe('cancelled');
        expect(session.state().yaml).toBe(initialYaml);
        file = settingsFields(session.state().snapshot!.sections).find(field => field.type === 'file')!;
        expect(session.act(request(session, file.editAction!, 'script.ini'))?.status).toBe('applied');
        file = settingsFields(session.state().snapshot!.sections).find(field => field.type === 'file')!;
        expect(file.openAction).toEqual(expect.any(String));
        const editedYaml = session.state().yaml;

        expect(session.act(request(session, file.openAction!))?.status).toBe('cancelled');
        expect(session.state().yaml).toBe(editedYaml);
        file = settingsFields(session.state().snapshot!.sections).find(field => field.type === 'file')!;
        expect(session.act(request(session, file.editAction!, ''))?.status).toBe('applied');
        file = settingsFields(session.state().snapshot!.sections).find(field => field.type === 'file')!;
        expect(file.browseAction).toEqual(expect.any(String));
        expect(file.openAction).toBeUndefined();
    });

    it('retains the last preview through malformed YAML and rejects actions until recovery', () => {
        const snapshot = session.state().snapshot!;
        const action = request(session, settingsFields(snapshot.sections)[0].editAction!, 20);
        session.update('debug-adapters: [', true);
        expect(session.state().error).toBeDefined();
        expect(session.state().snapshot).toBe(snapshot);
        expect(session.act(action)?.status).toBe('rejected');
        session.update(source.replace('name: Speed', 'name: Frequency'), true);
        expect(session.state().error).toBeUndefined();
        expect(session.act(action)?.status).toBe('rejected');
        expect(settingsFields(session.state().snapshot!.sections)[0].label).toBe('Frequency');
    });

    it('preserves values across valid edits and applies production numeric normalization', () => {
        const fields = settingsFields(session.state().snapshot!.sections);
        expect(session.act(request(session, fields[0].editAction!, 200))?.status).toBe('applied');
        expect(settingsFields(session.state().snapshot!.sections)[0].value).toBe(100);
        expect(session.act(request(session, fields[1].editAction!, 'invalid'))?.status).toBe('rejected');
        session.act(request(session, fields[1].editAction!, 'jtag'));
        session.update(source.replace('section: General', 'section: Connection'), true);
        expect(session.state().yaml).toContain('protocol: jtag');
    });

    it('uses full device metadata and the selected subset of real processor records', () => {
        session.selectDevice({ id: 'Vendor::Dual', pack: 'Vendor::DFP@1.0.0', processors: [
            { name: 'cm33', core: 'Cortex-M33', attributes: { Dtz: 'TZ' } },
            { name: 'cm0', core: 'Cortex-M0' },
        ], trace: { serialwire: false, tracebuffer: [] } });
        session.selectProcessors(['cm33']);
        const context = JSON.parse(session.state().context);
        expect(context.device.processors).toHaveLength(2);
        expect(context.device.trace).toEqual({ serialwire: false, tracebuffer: [] });
        expect(context.processors).toEqual([{ name: 'cm33', core: 'Cortex-M33', attributes: { Dtz: 'TZ' } }]);
        const telnet = session.state().snapshot!.sections.find(section => section.label === 'Telnet')!;
        session.act(request(session, telnet.toggleAction!, true));
        expect(session.state().yaml).toContain('pname: cm33');
        expect(session.state().yaml).not.toContain('pname: cm0');
    });

    it.each([undefined, ''])('omits empty pname attributes and hides unnamed labels (%s)', name => {
        session.selectDevice({ id: 'Vendor::Single', processors: [{ name, core: 'Cortex-M3' }] });
        const telnet = session.state().snapshot!.sections.find(section => section.label === 'Telnet')!;
        session.act(request(session, telnet.toggleAction!, true));
        expect(session.state().yaml).toContain('mode: monitor');
        expect(session.state().yaml).not.toContain('pname:');
        expect(settingsSections(session.state().snapshot!.sections).some(section => section.label === 'Single Core')).toBe(false);
    });

    it('keeps device configurations independent and invalidates actions when switching', () => {
        session.selectDevice({ id: 'Vendor::A' });
        const speed = settingsFields(session.state().snapshot!.sections)[0];
        const oldAction = request(session, speed.editAction!, 20);
        session.act(oldAction);
        session.selectDevice({ id: 'Vendor::B' });
        expect(session.act(oldAction)?.status).toBe('rejected');
        expect(session.state().yaml).not.toContain('clock:');
        session.selectDevice({ id: 'Vendor::A' });
        expect(session.state().yaml).toContain('clock: 20000');
    });

    it('gates expression evaluation on workspace trust', () => {
        const untrusted = new PreviewSession('untrusted');
        untrusted.update(source, false);
        expect(untrusted.state().error).toContain('Trust this workspace');
        expect(untrusted.state().snapshot).toBeUndefined();
        untrusted.update(source, true);
        expect(untrusted.state().error).toBeUndefined();
        expect(untrusted.state().snapshot?.sections).toHaveLength(2);
    });
});
