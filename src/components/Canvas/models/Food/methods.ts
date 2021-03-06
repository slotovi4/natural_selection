import { Food } from './Food';
import { foodParams } from './config';
import { IArea } from '../interface';

const createFood = ({ ctx, area }: IDefaultProps) => {
    const foodRadius = foodParams.radius;
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomRadius = (area.radius - foodRadius) * Math.sqrt(Math.random());

    const x = Math.floor(randomRadius * Math.cos(randomAngle) + area.centerX);
    const y = Math.floor(randomRadius * Math.sin(randomAngle) + area.centerY);

    return new Food({x, y, ctx});
};

/**
 * Создание массива еды для области
 * https://programming.guide/random-point-within-circle.html
 * @param canvas 
 * @param areaRadius 
 */
const createFoodArray = ({ ctx, area, foodCount }: ICreateFoodProps) => {
    const foodArray: Food[] = [];

    for (let i = 0; i < foodCount; i++) {
        foodArray.push(createFood({ ctx, area }));
    }

    return foodArray;
};

export const getMaxFoodCount = (area: IArea) => {
    const foodRadius = foodParams.radius;
    const foodDistance = foodRadius;

    const areaSquare = Math.floor(Math.PI * Math.pow(area.radius, 2));
    const foodSquare = Math.floor(Math.PI * Math.pow(foodRadius + foodDistance, 2));

    const maxFoodCount = Math.floor(areaSquare / foodSquare);

    return maxFoodCount / 10;
};

export const drawFood = (props: ICreateFoodProps) => {
    const foodArray = createFoodArray({ ...props });

    foodArray.forEach(food => {
        food.draw();
    });

    return foodArray;
};

export const updateFood = (foodArray: Food[]) => {
    const notEatenFood = foodArray.filter(food => !food.eaten);
    
    notEatenFood.forEach(food => {
        food.draw();
    });

    return notEatenFood;
};

interface ICreateFoodProps extends IDefaultProps {
    foodCount: number;
}

interface IDefaultProps {
    ctx: CanvasRenderingContext2D;
    area: IArea;
}