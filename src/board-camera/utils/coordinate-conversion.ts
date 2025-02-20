import { Point } from "src";
import { PointCal } from "point2point";

export function convert2WorldSpaceWRT(targetPosition: Point, interestPoint: Point, viewPortWidth: number, viewPortHeight: number, cameraZoomLevel: number, cameraRotation: number): Point{
    // this function is to find the world space coordinate of the interest point if the camera is at target position
    
    // the target position is the position of the camera in world space
    // the coordinate for the interest point is in view port space where bottom left corner is the origin 
    let cameraFrameCenter = {x: viewPortWidth / 2, y: viewPortHeight / 2};
    let delta2Point = PointCal.subVector(interestPoint, cameraFrameCenter);
    delta2Point = PointCal.multiplyVectorByScalar(delta2Point, 1 / cameraZoomLevel);
    delta2Point = PointCal.rotatePoint(delta2Point, cameraRotation);
    return PointCal.addVector(targetPosition, delta2Point);
}

export function convert2WorldSpace(point: Point, viewPortWidth: number, viewPortHeight: number, cameraPosition: Point, cameraZoomLevel: number, cameraRotation: number): Point{
    let cameraFrameCenter = {x: viewPortWidth / 2, y: viewPortHeight / 2};
    let delta2Point = PointCal.subVector(point, cameraFrameCenter);
    delta2Point = PointCal.multiplyVectorByScalar(delta2Point, 1 / cameraZoomLevel);
    delta2Point = PointCal.rotatePoint(delta2Point, cameraRotation);
    return PointCal.addVector(cameraPosition, delta2Point);
}

// the origin of the view port is at the camera position; the point is in view port space (relative to the camera position)
export function convert2WorldSpaceAnchorAtCenter(point: Point, cameraPosition: Point, cameraZoomLevel: number, cameraRotation: number): Point{
    const scaledBack = PointCal.multiplyVectorByScalar(point, 1 / cameraZoomLevel);
    const rotatedBack = PointCal.rotatePoint(scaledBack, cameraRotation);
    const withOffset = PointCal.addVector(rotatedBack, cameraPosition);
    return withOffset;
}

// the origin of the view port is at the camera position; the point is in world space; the returned point is in view port space (relative to the camera position)
export function convert2ViewPortSpaceAnchorAtCenter(point: Point, cameraPosition: Point, cameraZoomLevel: number, cameraRotation: number): Point{
    const withOffset = PointCal.subVector(point, cameraPosition);
    const scaled = PointCal.multiplyVectorByScalar(withOffset, cameraZoomLevel);
    const rotated = PointCal.rotatePoint(scaled, -cameraRotation);
    return rotated;
}

export function invertFromWorldSpace(point: Point, viewPortWidth: number, viewPortHeight: number, cameraPosition: Point, cameraZoomLevel: number, cameraRotation: number): Point{
    let cameraFrameCenter = {x: viewPortWidth / 2, y: viewPortHeight / 2};
    let delta2Point = PointCal.subVector(point, cameraPosition);
    delta2Point = PointCal.rotatePoint(delta2Point, -cameraRotation);
    delta2Point = PointCal.multiplyVectorByScalar(delta2Point, cameraZoomLevel);
    return PointCal.addVector(cameraFrameCenter, delta2Point);
}

export function pointIsInViewPort(point: Point, viewPortWidth: number, viewPortHeight: number, cameraPosition: Point, cameraZoomLevel: number, cameraRotation: number): boolean{
    const pointInCameraFrame = invertFromWorldSpace(point, viewPortWidth, viewPortHeight, cameraPosition, cameraZoomLevel, cameraRotation);
    if(pointInCameraFrame.x < 0 || pointInCameraFrame.x > viewPortWidth || pointInCameraFrame.y < 0 || pointInCameraFrame.y > viewPortHeight){
        return false;
    }
    return true;
}

export function convertDeltaInViewPortToWorldSpace(delta: Point, cameraZoomLevel: number, cameraRotation: number): Point{
    return PointCal.multiplyVectorByScalar(PointCal.rotatePoint(delta, cameraRotation), 1 / cameraZoomLevel);
}

export function convertDeltaInWorldToViewPortSpace(delta: Point, cameraZoomLevel: number, cameraRotation: number): Point{
    return PointCal.multiplyVectorByScalar(PointCal.rotatePoint(delta, -cameraRotation), cameraZoomLevel);
}

export function cameraPositionToGet(pointInWorld: Point, toPointInViewPort: Point, cameraZoomLevel: number, cameraRotation: number): Point {
    const scaled = PointCal.multiplyVectorByScalar(toPointInViewPort, 1 / cameraZoomLevel);
    const rotated = PointCal.rotatePoint(scaled, cameraRotation);
    return PointCal.subVector(pointInWorld, rotated);
}
