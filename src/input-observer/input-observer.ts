import { Point } from "src/index";
import { createDefaultRelayControlCenter, InputControlCenter, RelayControlCenter } from "src/control-center";
import BoardCamera from "src/board-camera";
import { Observable, Observer } from "src/util";

export type UnsubscribeToUserRawInput = () => void;

export type RawUserPanInputEventPayload = {
    diff: Point;
}

export type RawUserPanInputEvent = {
    type: "pan",
} & RawUserPanInputEventPayload;

export type RawUserZoomInputEventPayload = {
    deltaZoomAmount: number;
    anchorPoint: Point;
}

export type RawUserZoomInputEvent = {
    type: "zoom",
} & RawUserZoomInputEventPayload;

export type RawUserRotateInputEventPayload = {
    deltaRotation: number;
}

export type RawUserRotateInputEvent = {
    type: "rotate",
} & RawUserRotateInputEventPayload;

export type RawUserInputEventMap = {
    "pan": RawUserPanInputEventPayload,
    "zoom": RawUserZoomInputEventPayload,
    "rotate": RawUserRotateInputEventPayload,
    "all": RawUserInputEvent,
}

export type RawUserInputEvent = RawUserPanInputEvent | RawUserZoomInputEvent | RawUserRotateInputEvent;

export type RawUserInputCallbackList<K extends keyof RawUserInputEventMap> = ((event: RawUserInputEventMap[K])=>void)[];

export type RawUserInputCallback<K extends keyof RawUserInputEventMap> = (event: RawUserInputEventMap[K])=>void;

/**
 * @category Input Observer
 * @translationBlock This is the observer class that listens to input events and notifies the control center.
 */
export class InputObserver {

    private panCallbackList: RawUserInputCallbackList<"pan"> = [];
    private zoomCallbackList: RawUserInputCallbackList<"zoom"> = [];
    private rotateCallbackList: RawUserInputCallbackList<"rotate"> = [];

    private _controlCenter: InputControlCenter;

    constructor(controlCenter: InputControlCenter){
        this._controlCenter = controlCenter;
    }

    notifyOnPan(diff: Point): void{
        this._controlCenter.notifyPanInput(diff);
        this.panCallbackList.forEach((callback) => {
            queueMicrotask(()=>{callback({diff: diff});});
        });
    }

    notifyOnZoom(deltaZoomAmount: number, anchorPoint: Point): void{
        this._controlCenter.notifyZoomInput(deltaZoomAmount, anchorPoint);
        this.zoomCallbackList.forEach((callback) => {
            queueMicrotask(()=>{callback({deltaZoomAmount: deltaZoomAmount, anchorPoint: anchorPoint});});
        });
    }

    notifyOnRotation(camera: BoardCamera, deltaRotation: number): void{
        this._controlCenter.notifyRotationInput(deltaRotation);
        this.rotateCallbackList.forEach((callback) => {
            queueMicrotask(()=>{callback({deltaRotation: deltaRotation});});
        });
    }

    onInput<K extends keyof RawUserInputEventMap>(eventName: K, callback: (event: RawUserInputEventMap[K])=>void): UnsubscribeToUserRawInput {
        switch (eventName){
        case "pan":
            this.panCallbackList.push(callback as (event: RawUserInputEventMap["pan"])=>void);
            return () => {
                this.panCallbackList = this.panCallbackList.filter((cb) => cb !== callback);
            }
        case "zoom":
            this.zoomCallbackList.push(callback as (event: RawUserInputEventMap["zoom"])=>void);
            return () => {
                this.zoomCallbackList = this.zoomCallbackList.filter((cb) => cb !== callback);
            }
        case "rotate":
            this.rotateCallbackList.push(callback as (event: RawUserInputEventMap["rotate"])=>void);
            return () => {
                this.rotateCallbackList = this.rotateCallbackList.filter((cb) => cb !== callback);
            }
        default:
            throw new Error("Invalid input event name");
        }
    }

    get controlCenter(): InputControlCenter {
        return this._controlCenter;
    }

    set controlCenter(value: InputControlCenter){
        this._controlCenter = value;
    }
}

export function createDefaultInputObserverWithCamera(camera: BoardCamera){
    return new InputObserver(createDefaultRelayControlCenter(camera));
}

export class RawUserInputObservable {

    private pan: Observable<Parameters<RawUserInputCallback<"pan">>>;
    private zoom: Observable<Parameters<RawUserInputCallback<"zoom">>>;
    private rotate: Observable<Parameters<RawUserInputCallback<"rotate">>>;
    private all: Observable<Parameters<RawUserInputCallback<"all">>>;
    private cameraInputControlCener: InputControlCenter;

    constructor(inputControlCenter: InputControlCenter){
        this.pan = new Observable<Parameters<RawUserInputCallback<"pan">>>();
        this.zoom = new Observable<Parameters<RawUserInputCallback<"zoom">>>();
        this.rotate = new Observable<Parameters<RawUserInputCallback<"rotate">>>();
        this.all = new Observable<Parameters<RawUserInputCallback<"all">>>();
        this.cameraInputControlCener = inputControlCenter;
    }

    notifyPan(diff: Point): void {
        this.cameraInputControlCener.notifyPanInput(diff);
        this.pan.notify({diff: diff});
        this.all.notify({type: "pan", diff: diff});
    }

    notifyZoom(deltaZoomAmount: number, anchorPoint: Point): void {
        this.cameraInputControlCener.notifyZoomInput(deltaZoomAmount, anchorPoint);
        this.zoom.notify({deltaZoomAmount: deltaZoomAmount, anchorPoint: anchorPoint});
        this.all.notify({type: "zoom", deltaZoomAmount: deltaZoomAmount, anchorPoint: anchorPoint});
    }

    notifyRotate(deltaRotation: number): void {
        this.cameraInputControlCener.notifyRotationInput(deltaRotation);
        this.rotate.notify({deltaRotation: deltaRotation});
        this.all.notify({type: "rotate", deltaRotation: deltaRotation});
    }
    
    on<K extends keyof RawUserInputEventMap>(eventName: K, callback: (event: RawUserInputEventMap[K])=>void): UnsubscribeToUserRawInput {
        switch (eventName){
        case "pan":
            return this.pan.subscribe(callback as Observer<Parameters<RawUserInputCallback<"pan">>>);
        case "zoom":
            return this.zoom.subscribe(callback as Observer<Parameters<RawUserInputCallback<"zoom">>>);
        case "rotate":
            return this.rotate.subscribe(callback as Observer<Parameters<RawUserInputCallback<"rotate">>>);
        case "all":
            return this.all.subscribe(callback as Observer<Parameters<RawUserInputCallback<"all">>>);
        default:
            throw new Error("Invalid raw user input event name");
        }
    }

    get controlCenter(): InputControlCenter {
        return this.cameraInputControlCener;
    }
}

export function createDefaultRawUserInputObservable(camera: BoardCamera): RawUserInputObservable {
    return new RawUserInputObservable(createDefaultRelayControlCenter(camera));
}
