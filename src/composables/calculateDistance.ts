import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export const calculateDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
};
export const jointDistance = (
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const calculateAcceleration = (
  start: NormalizedLandmark,
  videoTimeBuffer: number[],
  end: NormalizedLandmark,
  body: BodyPart
) => {
  const currentTime = videoTimeBuffer[1];
  const lastTime = videoTimeBuffer[0];
  const time = currentTime - lastTime;
  if (start && end) {
    const displacement = jointDistance(
      end.x, end.y, end.z,
      start.x, start.y, start.z
    );
    const speed = displacement / time;
    body.velocityList.push(speed);
  }
  const list = body?.velocityList;
  const velocityListLength = list?.length;
  if (velocityListLength >= 2) {
    // calculate acceleration
    const dSpeed = list[velocityListLength - 1] - list[velocityListLength - 2];
    const acceleration = dSpeed / time;
    body.accelerationList?.push(acceleration);
    body.accelerationMass += acceleration;
  }
};
