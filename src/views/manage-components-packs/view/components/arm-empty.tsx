import React from 'react';

/**
 * @description A component that displays an empty state for the Arm view.
 * It can display an icon and a text message.
 * The icon is specified using the armCodiconIcon prop, which should be a string representing the icon.
 * The text message is specified using the text prop.
 * @param armCodiconIcon The icon to display. It should be a string representing the icon.
 * @param text The text message to display. It should be a string.
 * @returns A React component that displays an empty state with an icon and a text message.
 * @method ArmEmpty
 * @private
 */
export const ArmEmpty: React.FC<{ armCodiconIcon?: string; text?: string }> = ({ armCodiconIcon, text }) => {
    return (
        <>
            {armCodiconIcon && <div style={{ fontFamily: 'arm-codicon', fontSize: 54 }}>{armCodiconIcon}</div>}
            {text && <div>{text}</div>}
        </>
    );
};
