/*
 * Copyright (c) 2023-2026 Arm Limited
 */

import * as React from 'react';

export const validationError = (error: string) => error && <div className="input-validation-error"><p>{error}</p></div>;
