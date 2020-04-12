import React from 'react';
import { ControlSection } from '../../components';
import { IRootState, Dispatch } from '../../redux/store';
import { connect } from 'react-redux';

const ControlSectionContainer = ({
    start,
    setSelectionStart,
    clearSelectionState,
    clearFoodState,
    clearCreatureState,
    setFoodCount,
    setCreatureCount,
    foodSettings,
    creatureSettings,
}: IProps) => {
    return (
        <ControlSection
            onStartClick={setSelectionStart}
            onResetClick={() => {
                clearSelectionState();
                clearFoodState();
                clearCreatureState();
            }}
            disabled={start}
            foodProps={{ foodSettings, setFoodCount }}
            creatureProps={{ creatureSettings, setCreatureCount }}
        />
    );
};

const mapState = (state: IRootState) => ({
    start: state.selection.start,
    foodSettings: state.food,
    creatureSettings: state.creature
});

const mapDispatch = (dispatch: Dispatch) => ({
    setSelectionStart: () => dispatch.selection.startSelection(),
    setFoodCount: (foodCount: number) => dispatch.food.setNewFoodCount(foodCount),
    setCreatureCount: (creatureCount: number) => dispatch.creature.setNewCreatureCount(creatureCount),
    clearSelectionState: () => dispatch.selection.clearSelectionState(),
    clearFoodState: () => dispatch.food.clearFoodState(),
    clearCreatureState: () => dispatch.creature.clearCreatureState(),
});

export default connect(mapState, mapDispatch)(ControlSectionContainer);

type IProps = ReturnType<typeof mapState> & ReturnType<typeof mapDispatch>;