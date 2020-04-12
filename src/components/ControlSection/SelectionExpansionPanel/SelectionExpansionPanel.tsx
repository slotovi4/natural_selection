import React from 'react';
import { ExpansionPanel } from '../../index';

const SelectionExpansionPanel = ({ disabled }: IProps) => {
    return (
        <ExpansionPanel
            id='selection'
            title='Selection settings'
            secondaryText='Глобальные настройки естественного отбора'
        >
            <div className='row w-100'>
                <span>some params</span>
            </div>
        </ExpansionPanel>
    );
};

export default SelectionExpansionPanel;

interface IProps {
    disabled: boolean;
}