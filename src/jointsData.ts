import { ref } from "vue";

export interface Joint {
    name: string;
    connectedJoints: number[];
  }
  
export const joints = ref<Joint[]>([
  {
    name: "right elbow",
    connectedJoints: [16, 14, 12],
  },
  {
    name: "left elbow",
    connectedJoints: [11, 13, 15],
  },
  {
    name: "right knee",
    connectedJoints: [24, 26, 28],
  },
  {
    name: "left knee",
    connectedJoints: [23, 25, 27],
  },
  {
    name: "right shoulder",
    connectedJoints: [14, 12, 24],
  },
  {
    name: "left shoulder",
    connectedJoints: [13, 11, 23],
  },
  {
    name: "right hip",
    connectedJoints: [12, 24, 26],
  },
  {
    name: "left hip",
    connectedJoints: [11, 23, 25],
  },
]);
