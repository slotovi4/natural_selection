import React from 'react';
import {
    ExpansionPanel as MaterialExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { cn } from '@bem-react/classname';
import './ExpansionPanel.scss';

const ExpansionPanel = ({
    children,
    id,
    title,
    secondaryText,
    disabled,
    contentClassName,
    secondaryChild,
    expand,
    gray,
}: IProps) => {
    const cl = cn('ExpansionPanel');

    return (
        <MaterialExpansionPanel className={cl({ gray })} disabled={disabled}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="controlSelection"
                aria-label={expand ? 'Expand' : undefined}
                id={id}
            >
                <div className={cl('Expansion-Header')}>
                    <span className={cl('Title')}>{title}</span>
                    {secondaryChild ? secondaryChild : <span className={cl('Text', { secondary: true })}>{secondaryText}</span>}
                </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={contentClassName}>
                {children}
            </ExpansionPanelDetails>
        </MaterialExpansionPanel>
    );
};

export default ExpansionPanel;

interface IProps {
    children: React.ReactNode;
    title: string;
    id: string;
    disabled?: boolean;
    secondaryChild?: React.ReactNode;
    secondaryText?: string;
    contentClassName?: string;
    expand?: boolean;
    gray?: boolean;
}
