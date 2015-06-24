//Adapted from https://github.com/inorganik/countUp.js

var lastTime = 0;
var vendors = ['webkit', 'moz', 'ms', 'o'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
}
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    }
}
if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    }
}

class Counter {
    private target: HTMLElement;
    private countDown: boolean;
    private startTime: number;
    private timestamp: number;
    private remaining: number;
    private startValue: number;
    private endValue: number;
    private currentValue: number;
    private duration: number;
    private animationId: number;
    private animationTimestamp: number;
    private finishedCallback: () => void;
    private valueFormatter: (value: number) => any;

    constructor(target: HTMLElement, duration: number, valueFormatter: (value: number) => any) {
        this.target = target;
        this.duration = duration;
        this.valueFormatter = valueFormatter;
    }
    
    private printCurrentValue(): void {
        this.target.textContent = this.valueFormatter(this.currentValue);
    }

    private easeOutExpo(t, b, c, d): number {
        return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
    }

    private count(timestamp): void {
        var progress = 0;
        var isInProgress = false;

        if (this.startTime == null) 
            this.startTime = timestamp;

        this.timestamp = timestamp;

        progress = timestamp - this.startTime;
        this.remaining = this.duration - progress;

        if (this.countDown) {
            var easedValue = this.easeOutExpo(progress, 0, this.startValue - this.endValue, this.duration);
            this.currentValue = this.startValue - easedValue;
        } else {
            this.currentValue = this.easeOutExpo(progress, this.startValue, this.endValue - this.startValue, this.duration);
        }

        // don't go past endValue since progress can exceed duration in the last frame
        if (this.countDown) {
            this.currentValue = (this.currentValue < this.endValue) ? this.endValue : this.currentValue;
        } else {
            this.currentValue = (this.currentValue > this.endValue) ? this.endValue : this.currentValue;
        }

        this.printCurrentValue();

        isInProgress = progress < this.duration
        if (isInProgress) {
            this.animationId = requestAnimationFrame((timestamp) => this.count(timestamp));
        }else{
            this.animationId = null;
            if (this.finishedCallback){
                this.finishedCallback();
                this.finishedCallback = null;
            }
        }
    }

    public stop() {
        if (this.animationId)
            cancelAnimationFrame(this.animationId);
    }

    public update(endValue: number, finished?: () => void) {
        if (this.finishedCallback)
            this.finishedCallback();

        this.stop();
        this.finishedCallback = finished;
        this.startTime = null;
        this.startValue = this.endValue || 0;
        this.endValue = endValue;
        this.countDown = (this.startValue > this.endValue) ? true : false;
        this.animationId = requestAnimationFrame((timestamp) => this.count(timestamp));
    }

    public setValue(newValue) {
        this.currentValue = newValue;
        this.printCurrentValue();
    }
}

export = Counter;