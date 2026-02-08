import { Point } from "foundry-pf2e/foundry/common/_types.mjs";

export class Circle {
    public radius: number;

    public get circumference(): number {
        return 2 * Math.PI * this.radius;
    }

    constructor(radius = 0) {
        this.radius = radius;
    }

    clone(): Circle {
        return new Circle(this.radius);
    }

    expand(value: number): Circle {
        return new Circle(this.radius + value);
    }

    getPoint(i: number, max: number): Point {
        const ratio = i / max;
        const initialRotation = (0.5 + (1 / max) * Math.PI) * Math.PI;
        const theta = -ratio * 2 * Math.PI - initialRotation;
        return {
            x: this.radius * Math.cos(theta),
            y: this.radius * Math.sin(theta)
        };
    }
}

export class Ellipse {
    public halfWidth: number;

    public halfHeight: number;

    public get circumference(): number {
        if (this.halfWidth <= 0 || this.halfHeight <= 0)
            throw new Error("halfWidth and halfHeight must be positive numbers.");

        const [a, b] =
            this.halfWidth < this.halfHeight ? [this.halfHeight, this.halfWidth] : [this.halfWidth, this.halfHeight];
        const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
        return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
    }

    constructor(halfWidth = 0, halfHeight = 0) {
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
    }

    clone(): Ellipse {
        return new Ellipse(this.halfWidth, this.halfHeight);
    }

    expand(value: number): Ellipse {
        return new Ellipse(this.halfWidth + value, this.halfHeight + value);
    }

    getPoint(i: number, max: number): Point {
        const ratio = i / max;
        const initialRotation = (0.5 + (1 / max) * Math.PI) * Math.PI;
        const theta = -ratio * 2 * Math.PI - initialRotation;
        return {
            x: this.halfWidth * Math.cos(theta),
            y: this.halfHeight * Math.sin(theta)
        };
    }
}
