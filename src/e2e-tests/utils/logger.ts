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

/**
 * Centralized Logging Utility
 *
 * This module provides a centralized logging system for E2E tests with
 * configurable log levels via environment variable.
 *
 * Key responsibilities:
 * - Provide consistent logging interface across all E2E test framework files
 * - Support multiple log levels: error, warn, info, debug
 * - Filter logs based on E2E_LOG_LEVEL environment variable
 * - Prefix all log messages with log level for easy filtering
 *
 * Example:
 * ```
 * E2E_LOG_LEVEL=debug npm run e2e  # Show all logs
 * E2E_LOG_LEVEL=error npm run e2e  # Show errors only
 * ```
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

// Define an ordering for log levels
const LEVELS: Record<LogLevel, number> = {
    error: 0,
    warn:  1,
    info:  2,
    debug: 3,
};

// Read the desired log-level from an env var (default to 'warn')
export const CURRENT_LEVEL: LogLevel =
    (process.env.E2E_LOG_LEVEL as LogLevel) || 'warn';

/**
 * Centralized logging function that respects the CURRENT_LEVEL
 * and always prefixes output with the log level and timestamp.
 */
export function log(
    level: LogLevel,
    ...args: unknown[]
): void {
    // Only emit if this level is at or above the current threshold
    if (LEVELS[level] <= LEVELS[CURRENT_LEVEL]) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        // Forward to console.<level>, prepending the timestamp and level prefix
        console[level](prefix, ...args);
    }
}
