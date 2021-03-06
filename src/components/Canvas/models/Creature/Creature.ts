import {
    calcPointDistance,
    randomIntFromRange,
    getNearestPointFromPointsArray,
} from '../helpers';
import { IArea, IFood, IPoint } from '../interface';
import { creatureParams } from './config';

export class Creature {
    protected fillStyle: string;
    protected velocity: number;
    protected energyIntensity: number;
    protected isMutated: boolean;
    protected dX: number;
    protected dY: number;
    protected energy: number;
    protected visibilityRadius: number;
    protected size: number;
    protected visibilitySize: number;

    protected readonly mutationChance: number;
    protected readonly selectionSpeed: number;
    protected readonly area: IArea;

    private readonly wasteEnergyVal: number;
    private readonly exitAreaPoints: IPoint[];
    private readonly ctx: CanvasRenderingContext2D;

    private radius: number;
    private x: number;
    private y: number;
    private returnedToHome: boolean;
    private isDie: boolean;
    private grabbedFoodCount: number;
    private noFoodForPosterity: boolean;

    public constructor({ x, y, ctx, area, selectionSpeed, mutationChance }: IProps) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.area = area;

        this.selectionSpeed = selectionSpeed;
        this.mutationChance = mutationChance;

        this.size = creatureParams.size;
        this.velocity = creatureParams.velocity * this.selectionSpeed;
        this.energyIntensity = creatureParams.energyIntensity;
        this.visibilitySize = creatureParams.visibilitySize;
        this.fillStyle = creatureParams.fillStyle;

        this.isMutated = false;
        this.returnedToHome = false;
        this.isDie = false;
        this.noFoodForPosterity = false;
        this.grabbedFoodCount = 0;
        this.wasteEnergyVal = 4;
        this.exitAreaPoints = this.getExitAreaPoints();

        // dependence variables
        this.setDependenceVariables();
    }

    public draw() {
        const { strokeStyle, lineWidth } = creatureParams;

        // draw creature
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.save();
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.closePath();

        // draw visibilityRadius
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius + this.visibilityRadius, 0, Math.PI * 2, false);
        this.ctx.save();
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.stroke();
        this.ctx.closePath();


        const tabSize = 15;
        const infoX = this.x + this.radius + tabSize;
        const infoY = this.y + this.radius - tabSize;

        // draw energy
        this.ctx.beginPath();
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(`e: ${Math.floor(this.energy)}`, infoX, infoY);
        this.ctx.closePath();

        // draw velocity
        this.ctx.beginPath();
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(`s: ${(this.velocity / this.selectionSpeed)}`, infoX, infoY + tabSize);
        this.ctx.closePath();

        // draw grabbed food count
        this.ctx.beginPath();
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(`f: ${this.grabbedFoodCount}`, infoX, infoY + tabSize * 2);
        this.ctx.closePath();
    }

    public update(foodArray: IFood[], creatureArray: Creature[], dayEnd: boolean) {
        this.checkDeath();
        // if (this.isDie && this.grabbedFoodCount === 1) {
        //     console.log(this);
        // }

        if(this.radius < 5) {
            console.log(123);
        }

        if (!this.isDie) {
            // if not returned to home
            if (!this.returnedToHome) {
                this.ifNotReturnedToHome(foodArray);
            }

            // if returned to home
            else if (dayEnd) {
                this.resetState();
            }

            this.draw();
        }

        return this;
    }

    public getCreatureParams(): ICreatureParams {
        return {
            velocity: this.velocity / this.selectionSpeed,
            visibilitySize: this.visibilitySize,
            energyIntensity: this.energyIntensity,
            size: this.size,
            radius: this.radius,
            x: this.x,
            y: this.y,
            returnedToHome: this.returnedToHome,
            isDie: this.isDie,
            grabbedFoodCount: this.grabbedFoodCount
        };
    }

    protected replenishEnergy() {
        return 200 * this.energyIntensity;
    }

    protected randomDirection() {
        return randomIntFromRange(0, 1) ? this.velocity : -this.velocity;
    }

    protected setDependenceVariables() {
        this.radius = this.size * creatureParams.radius;
        this.visibilityRadius = this.visibilitySize * creatureParams.visibilityAreaSize;

        this.energy = this.replenishEnergy();
        this.dX = this.randomDirection();
        this.dY = this.randomDirection();
    }

    private ifNotReturnedToHome = (foodArray: IFood[]) => {
        if (this.returnedToHome) {
            return;
        }

        const haveFood = foodArray.length > 0;

        if (this.grabbedFoodCount === 0) {
            if (haveFood) {
                this.searchFood(foodArray);
            } else {
                this.isDie = true;
            }
        }

        else if (this.grabbedFoodCount === 1 && !this.noFoodForPosterity && haveFood) {
            this.tryFindFoodForPosterity(foodArray);
        }

        else if (this.grabbedFoodCount === 2 || this.noFoodForPosterity || !haveFood) {
            this.goHome();
        }
    }

    private searchFood(foodArray: IFood[]) {
        const nearestFood = this.findNearestFood(foodArray);

        if (nearestFood) {
            if (this.foodWasGrabbedCheck(nearestFood)) {
                this.grabbedFoodCount += 1;
                this.energy = this.replenishEnergy();
                nearestFood.eat();
            } {
                this.moveToThePoint(nearestFood);
            }
        } else {
            this.move();
        }
    }

    private goHome() {
        if (this.creatureOutsideArea()) {
            this.returnedToHome = true;
        } else {
            const nearestAreaExitPoint = this.getNearestAreaExitPoint();

            if (nearestAreaExitPoint) {
                this.moveToThePoint(nearestAreaExitPoint);
            }
        }
    }

    private tryFindFoodForPosterity(foodArray: IFood[]) {
        const nearestAreaExitPoint = this.getNearestAreaExitPoint();

        if (nearestAreaExitPoint) {
            // расстояние до ближайшей точки выхода
            const nearestAreaExitPointDistance = calcPointDistance(this.x, this.y, nearestAreaExitPoint.x, nearestAreaExitPoint.y);

            const energyPerMove = this.getWasteEnergyPerMove();
            const stepsCountToExitPoint = (Math.floor(this.energy) / energyPerMove) || 0; // количество шагов до точки выхода
            const distanceCreatureCanTravel = stepsCountToExitPoint * this.velocity; // расстояние которое может пройти существо

            const res = distanceCreatureCanTravel > nearestAreaExitPointDistance;

            if (res && foodArray.length) {
                this.searchFood(foodArray);
            } else {
                this.noFoodForPosterity = true;
                this.goHome();
            }
        }
    }

    private findNearestFood(foodArray: IFood[]) {
        // отфильтровать еду и оставить только ту которая в радиусе видимости и не съедена
        const visibilityFoodArray = foodArray.filter(
            food => !food.eaten && calcPointDistance(this.x, this.y, food.x, food.y) < this.radius + this.visibilityRadius + food.radius
        );

        // выбрать ближайший кусок еды из еды в области видимости
        const nearestFood = getNearestPointFromPointsArray(visibilityFoodArray, { x: this.x, y: this.y });

        return nearestFood;
    }

    private move() {
        // random acceleration
        const { dx, dy } = this.randomAcceleration();

        this.x += dx;
        this.y += dy;

        // if creature outside area
        if (this.creatureOutsideArea()) {
            const tDx = this.x - this.area.centerX;
            const tDy = this.y - this.area.centerY;
            const theta = Math.atan2(tDy, tDx);
            const R = this.area.radius - this.radius;

            this.x = R * Math.cos(theta) + this.area.centerX;
            this.y = R * Math.sin(theta) + this.area.centerY;

            this.dX *= Math.random() > 0.5 ? 1 : -1;
            this.dY *= Math.random() > 0.5 ? 1 : -1;
        }

        this.wasteOfEnergy();
    }

    private moveToThePoint(point: IPoint) {
        this.dX = this.x > point.x ? -this.velocity : this.velocity;
        this.dY = this.y > point.y ? -this.velocity : this.velocity;

        if (this.x !== point.x) {
            this.x += this.dX;
        }
        if (this.y !== point.y) {
            this.y += this.dY;
        }

        this.wasteOfEnergy();
    }

    private getNearestAreaExitPoint() {
        const nearestAreaExitPoint = getNearestPointFromPointsArray(this.exitAreaPoints, { x: this.x, y: this.y });

        return nearestAreaExitPoint;
    }

    private resetState() {
        if (!this.isDie) {
            this.grabbedFoodCount = 0;
            this.returnedToHome = false;
            this.noFoodForPosterity = false;

            this.setDependenceVariables();
        }
    }

    /**
     * Проверка, добыло ли еду существо
     * @param food 
     */
    private foodWasGrabbedCheck(food: IFood) {
        return calcPointDistance(this.x, this.y, food.x, food.y) <= this.radius + food.radius;
    }

    /**
     * Проверка, на нахождение существа в пределах области
     */
    private creatureOutsideArea() {
        const pointDistance = calcPointDistance(this.x, this.y, this.area.centerX, this.area.centerY);

        return pointDistance + this.radius >= this.area.radius;
    }

    /**
     * Получить точки выхода из области
     */
    private getExitAreaPoints() {
        const areaPoints = [];
        const steps = this.area.radius / 2;

        for (let i = 0; i < steps; i++) {
            areaPoints.push({
                x: this.area.centerX + this.area.radius * Math.cos(2 * Math.PI * i / steps),
                y: this.area.centerY + this.area.radius * Math.sin(2 * Math.PI * i / steps)
            });
        }

        return areaPoints;
    }

    private randomAcceleration() {
        const maxVelocity = this.velocity * 2;

        this.dX += this.randomizeDValue();
        this.dY += this.randomizeDValue();

        if (this.dX > maxVelocity) {
            this.dX = maxVelocity;
        } else if (this.dX < -maxVelocity) {
            this.dX = -maxVelocity;
        }

        if (this.dY > maxVelocity) {
            this.dY = maxVelocity;
        } else if (this.dY < -maxVelocity) {
            this.dY = -maxVelocity;
        }

        return { dx: this.dX, dy: this.dY };
    }

    private randomizeDValue(): number {
        const accel = (this.velocity * (this.selectionSpeed / 2)) / 3; // чем меньше значение тем более прямые движения, чем больше тем больше поворотов
        const value = (1 - 2 * Math.random()) * accel;

        return value;
    }

    /**
     * Расход энергии
     */
    private wasteOfEnergy() {
        this.energy -= this.getWasteEnergyPerMove();
    }

    private getWasteEnergyPerMove() {
        const velocity = this.getVelocityFromD();
        const visibility = this.visibilitySize;
        const size = Math.pow(this.size, 3);

        return Math.round((((velocity * size) + visibility) / this.wasteEnergyVal) * 100) / 100;
    }

    private getVelocityFromD() {
        const xVelocity = Math.abs(this.dX);
        const yVelocity = Math.abs(this.dY);
        const velocity = (xVelocity + yVelocity) / 2;

        return velocity;
    }

    private checkDeath() {
        if (this.energy <= 0) {
            this.isDie = true;
        }
    }
}

export interface IProps {
    x: number;
    y: number;
    ctx: CanvasRenderingContext2D;
    area: IArea;
    selectionSpeed: number;
    mutationChance: number;
}

export interface ICreatureParams {
    velocity: number;
    visibilitySize: number;
    energyIntensity: number;
    size: number;

    radius: number;
    x: number;
    y: number;
    returnedToHome: boolean;
    isDie: boolean;
    grabbedFoodCount: number;
}