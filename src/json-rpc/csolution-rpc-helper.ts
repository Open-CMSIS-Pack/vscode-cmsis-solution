/*
 * Copyright (C) 2025-2026 Arm Limited
 */


import { Optional } from '../generic/type-helper';


export function splitPackId(packId: string) : { vendor: string, name: string, version?: string };
export function splitPackId(packId: Optional<string>) : Optional<{ vendor: string, name: string, version?: string }>;
export function splitPackId(packId?: string) : Optional<{ vendor: string, name: string, version?: string }> {
    if (packId === undefined) {
        return undefined;
    }
    // Pattern: vendor::name@version
    const pattern = /^([^:]+)::([^@]+)(@(.*))?$/;
    const match = packId.match(pattern);
    if (!match) {
        throw new Error(`Invalid pack ID format: ${packId}`);
    }
    return { vendor: match[1], name: match[2], version: match[4] };
}

export function splitBoardId(boardId: string): { vendor?: string, name: string, revision?: string };
export function splitBoardId(boardId: Optional<string>): Optional<{ vendor?: string, name: string, revision?: string }>;
export function splitBoardId(boardId?: string): Optional<{ vendor?: string, name: string, revision?: string }> {
    if (boardId === undefined) {
        return undefined;
    }
    // Pattern: vendor::name:revision or name:revision or name
    const pattern = /^(([^:]+)::)?([^:]+)(:(.*))?$/;
    const match = boardId.match(pattern);
    if (!match) {
        throw new Error(`Invalid board ID format: ${boardId}`);
    }
    return { vendor: match[2], name: match[3], revision: match[5] };
}

export function splitDeviceId(deviceId: string): { vendor?: string, name: string };
export function splitDeviceId(deviceId: Optional<string>): Optional<{ vendor?: string, name: string }>;
export function splitDeviceId(deviceId?: string): Optional<{ vendor?: string, name: string }> {
    if (deviceId === undefined) {
        return undefined;
    }
    const pattern = /^(([^:]+)::)?([^:]+)(:(.*))?$/;
    const match = deviceId.match(pattern);
    if (!match) {
        throw new Error(`Invalid device ID format: ${deviceId}`);
    }
    return { vendor: match[2], name: match[3] };
}
