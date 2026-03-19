/**
 * Copyright 2025-2026 Arm Limited
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

/**
 * E2E Test Constants
 *
 * Centralized constants for timeouts, delays, and other configuration values
 * used across E2E tests. This promotes consistency and makes it easier to tune
 * test timings.
 */

// ==================== BASE TIMEOUTS ====================

/** Base timeout for standard UI operations (5 seconds) */
export const SHORT_TIMEOUT_MS = 5000;

/** Base timeout for medium-duration operations (10 seconds) */
export const MEDIUM_TIMEOUT_MS = 10000;

/** Default timeout for VS Code operations (1 minute) */
export const DEFAULT_TIMEOUT_MS = 60000;

/** Timeout for task completion (2 minutes) */
export const TASK_TIMEOUT_MS = 120000;

/** Timeout for long-running operations like vcpkg activation (7 minutes) */
export const LONG_TIMEOUT_MS = 420000;

// ==================== UI INTERACTION DELAYS ====================

/** Delay for UI stability after interactions (200ms) */
export const UI_STABILITY_DELAY_MS = 200;

/** Delay for quick pick menu to appear (4 seconds) */
export const QUICK_PICK_DELAY_MS = 40000;

/** Delay after reloading VS Code window to allow reinitialization */
export const WORKSPACE_RELOAD_DELAY_MS = DEFAULT_TIMEOUT_MS;

// ==================== UI ELEMENT TIMEOUTS ====================

/** Timeout for quick pick list to become visible */
export const QUICK_PICK_TIMEOUT_MS = SHORT_TIMEOUT_MS;

/** Timeout for panel (terminal/output) to become visible */
export const PANEL_VISIBILITY_TIMEOUT_MS = MEDIUM_TIMEOUT_MS;

/** Timeout for building dialog to appear */
export const BUILDING_DIALOG_TIMEOUT_MS = SHORT_TIMEOUT_MS;

/** Timeout for panel text content to appear */
export const PANEL_TEXT_TIMEOUT_MS = MEDIUM_TIMEOUT_MS;

/** Timeout for context links to become visible */
export const CONTEXT_LINK_TIMEOUT_MS = 15000;

/** Timeout for VS Code action items to appear */
export const ACTION_ITEM_TIMEOUT_MS = DEFAULT_TIMEOUT_MS;

/** Timeout for pack installation dialog */
export const PACK_INSTALL_TIMEOUT_MS = LONG_TIMEOUT_MS;
