import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export const calculateAngle = (
    A: NormalizedLandmark,
    B: NormalizedLandmark,
    C: NormalizedLandmark
) => {
    let angle =
        Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
    angle = Math.abs((angle * 180) / Math.PI);
    if (angle > 195) {
        angle = 360 - angle;
    }
    return Math.round(angle);
};
