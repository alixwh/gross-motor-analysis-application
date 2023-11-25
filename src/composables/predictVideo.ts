import { DrawingUtils, Landmark, NormalizedLandmark, PoseLandmarker, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { ref } from "vue";
import { calculateAngle } from "./calculateAngles";
import { createPoseLandmarker } from "./poseLandmarker";
import { calculateDistance } from "./calculateDistance";
import { Joint } from '../jointsData';

const landmarkDescriptions = [ 'nose', 'left eye (inner)', 'left eye', 'left eye (outer)', 'right eye (inner)', 'right eye', 'right eye (outer)', 'left ear', 'right ear',
'mouth (left)', 'mouth (right)', 'left shoulder', 'right shoulder', 'left elbow', 'right elbow', 'left wrist', 'right wrist', 'left pinky', 'right pinky', 'left index', 'right index',
'left thumb', 'right thumb', 'left hip', 'right hip', 'left knee', 'right knee', 'left ankle', 'right ankle', 'left heel', 'right heel', 'left foot index', 'right foot index'
];
let poseLandmarker: PoseLandmarker | undefined;
const poseLandmarkere = async () => {
    poseLandmarker = await createPoseLandmarker();
}
poseLandmarkere();
const calculatedAngles = ref<Map<string, number>>(new Map());
const positionsByFrame = ref<Map<number, NormalizedLandmark[]>>(new Map());
const videoData = ref<FrameData[]>([]);
const addedFrames = ref<number[]>([]);
const webcamEnabled = ref<boolean>(false);
let videoElement: undefined | HTMLVideoElement = undefined;
let canvasElement: HTMLCanvasElement | undefined = undefined;
let canvasCtx: CanvasRenderingContext2D | null = null;
let drawingUtils: DrawingUtils | undefined = undefined;
let enableWebcamButton: HTMLButtonElement;

export const selectedJointIndexes = ref<number[]>([]);

export const initializeCanvas = (video: HTMLVideoElement, canvas: HTMLCanvasElement, webcam: boolean) => {
    positionsByFrame.value = new Map();
    videoElement = video;
    canvasElement = canvas;
    canvasCtx = canvasElement.getContext("2d");
    drawingUtils = new DrawingUtils(canvasCtx!);
    canvasElement!.addEventListener("click", handleCanvasClick);
    webcamEnabled.value = webcam;
    enableWebcamButton = document.getElementById("webcamButton") as HTMLButtonElement;
};

export const getFrameNumber = (videoElement: HTMLVideoElement): number => {
    return Math.floor(videoElement.currentTime * 10);
};

export const getAllPositions = () => {
    return videoData.value.sort((a, b) => a.frameNumber - b.frameNumber);;
}

export const getPositionsBetweenFrames = (start: number, end:number) => {
    const result: FrameData[] = [];
    for (let frameNumber = start; frameNumber <= end; frameNumber++) {
        const frameData = videoData.value.find((data) => data.frameNumber === frameNumber);
        if (frameData) {
            result.push(frameData);
        } else {
            videoElement!.currentTime = frameNumber / 10;
            detect(performance.now(), frameNumber);
            const frameData = videoData.value.find((data) => data.frameNumber === frameNumber);
            result.push(frameData!);
        }
    }
    return videoData.value.filter((frameData) => frameData.frameNumber >= start && frameData.frameNumber <= end).sort((a, b) => a.frameNumber - b.frameNumber);
}
export function detectForVideoOrWebcam(startTimeMs: number, frameNumber: number, selectedAngles: Joint[], showAnglesOnVideo: boolean): Map<string, number> {
    poseLandmarker?.detectForVideo(videoElement!, startTimeMs, (result) => {
        canvasCtx!.save();
        canvasCtx!.clearRect(0, 0, canvasElement!.width, canvasElement!.height);
        if (result.landmarks[ 0 ]) {
            let x = result.landmarks[ 0 ];
            drawPointsAndConnectors(x, frameNumber);
            drawAngles(selectedAngles, x, showAnglesOnVideo);
            positionsByFrame.value.set(getFrameNumber(videoElement!), x);
            drawTrajectory(frameNumber);
        }
    });
    return calculatedAngles.value;
}
const detect = (startTimeMs: number, frame: number) => {
    poseLandmarker?.detectForVideo(videoElement!, startTimeMs, (result) => {
        if (result.landmarks[ 0 ]) {
            let x = result.landmarks[ 0 ];
            x.forEach((landmark, index) => {
                drawPoint(index, landmark);
                videoData.value.push({ frameNumber: frame, time: videoElement!.currentTime,landmark: landmarkDescriptions.at(index)!, x: landmark.x, y: landmark.y, z: landmark.z })
            });
            positionsByFrame.value.set(frame, x)
        }
    })
}
function drawAngles(selectedAngles: Joint[], x: Landmark[], showAnglesOnVideo: boolean) {
    for (let { name, connectedJoints: points } of selectedAngles) {
        let angle = calculateAngle(x[ points[ 0 ] ], x[ points[ 1 ] ], x[ points[ 2 ] ]);
        calculatedAngles.value.set(name, angle);
        if (showAnglesOnVideo) {
            canvasCtx!.fillText(String(angle), x[ points[ 1 ] ].x * canvasElement!.width, x[ points[ 1 ] ].y * canvasElement!.height);
            canvasCtx!.fillStyle = "#00ffff";
            canvasCtx!.font = "20px Arial";
        }
    }
}

const drawPointsAndConnectors = (result: NormalizedLandmark[], frameNumber: number) => {
    drawingUtils!.drawConnectors(result, PoseLandmarker.POSE_CONNECTIONS);
    result.forEach((landmark, index) => {
        drawPoint(index, landmark);
        if (addedFrames.value.includes(frameNumber)) {return}
        videoData.value.push({ frameNumber: frameNumber, time: videoElement!.currentTime,landmark: landmarkDescriptions.at(index)!, x: landmark.x, y: landmark.y, z: landmark.z })
    });
    addedFrames.value.push(frameNumber);
};

const handleCanvasClick = (event: MouseEvent) => {
    const { offsetX, offsetY } = event;
    const mouseX = offsetX / canvasElement!.width;
    const mouseY = offsetY / canvasElement!.height;
    const landmarks = positionsByFrame.value.get(getFrameNumber(videoElement!));
    if (landmarks?.length) {
        let closestIndex = -1;
        closestIndex = findClosestLandmark(landmarks, mouseX, mouseY, closestIndex);
        if (closestIndex !== -1) {
            toggleSelectedLandmark(closestIndex);
            if (videoElement?.paused) {
                drawPointsAndConnectors(landmarks, getFrameNumber(videoElement));
            }
        }
    }
};

const toggleSelectedLandmark = (closestLandmarkIndex: number) => {
    const selectedArray = selectedJointIndexes.value;
    const indexToRemove = selectedArray.indexOf(closestLandmarkIndex);
    if (indexToRemove === -1) {
        selectedArray.push(closestLandmarkIndex);
    } else {
        selectedArray.splice(indexToRemove, 1);
    }
};
const findClosestLandmark = (
    landmarks: NormalizedLandmark[],
    mouseX: number,
    mouseY: number,
    closestIndex: number
) => {
    let minDistance = 0.03;
    for (let i = 0; i < landmarks.length; i++) {
        const { x, y } = landmarks[ i ];
        const distance = calculateDistance(mouseX, mouseY, x, y);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
        }
    }
    return closestIndex;
};

const drawTrajectory = (frameNumber: number) => {
    if (frameNumber < 2 || selectedJointIndexes.value.length === 0) {
        return;
    }
    const last = frameNumber - 100 > 0 ? frameNumber - 100 : 1;
    for (const jointIndex of selectedJointIndexes.value) {
        for (let index = frameNumber - 1; index > last; index--) {
            const element = positionsByFrame.value.get(index);
            const joint = element?.at(jointIndex) as NormalizedLandmark;
            if (joint) {
                drawPoint(jointIndex, joint);
            }
        }
    }
}

const drawPoint = (index: number, landmark: NormalizedLandmark) => {
    const color = selectedJointIndexes.value.includes(index) ? "red" : "white";
    drawingUtils!.drawLandmarks([ landmark ], {
        radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 8, 1),
        color: color,
    });
}