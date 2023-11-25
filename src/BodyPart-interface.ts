interface BodyPart {
  name: string;
  euclideanDistance?: number;
  trajectoryMass: number;
  velocityList: number[];
  accelerationMass: number;
  accelerationList: number[];
  jerk?: number;
}
