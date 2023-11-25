<template>
  <nav>
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
      <a class="nav-link active" id="sourceButton" data-bs-toggle="tab" data-bs-target="#source-subnavbar" role="tab" aria-controls="source-subnavbar" aria-selected="true">Source</a>

      <a class="nav-link" id="angleButton" data-bs-toggle="tab" data-bs-target="#angle-subnavbar" role="tab" aria-controls="angle-subnavbar" aria-selected="false">Angle</a>

      <a class="nav-link" id="trajectoryButton" data-bs-toggle="tab" href="#trajectory-subnavbar" role="tab" aria-controls="trajectory-subnavbar" aria-selected="false">Trajectory</a>
    </div>
  </nav>

  <div class="tab-content" id="myTabContent">
    <div class="tab-pane fade show active" id="source-subnavbar" role="tabpanel" aria-labelledby="sourceButton">
      <div class="nav">
        <label class="nav-link" for="file">Choose file</label>
        <input id="file" type="file" accept="video/mp4" v-on:change="handleVideoUpload" :onclick=onInputClick style="display:none">
        <a class="nav-link" id="webcamButton" @click="$emit('webcam')">{{ buttonText }} webcam</a>
        <a class="nav-link" @click="$emit('downloadCsv')">Download csv</a>
      </div>
    </div>
    <div class="tab-pane fade" id="angle-subnavbar" role="tabpanel" aria-labelledby="angleButton">
      <div class="nav">
        <div class="dropdown nav-link">
          <button class="btn btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
            Choose angles
          </button>
          <ul class="dropdown-menu">
            <li class="dropdown-item" v-for="value in joints" :key="value.name">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="value.name" :value="value" v-model="selectedAngles" v-on:change="updateSelectedAngles"/>
                  <label class="form-check-label" :for="value.name">{{ value.name }}</label>
                </div>
            </li>
          </ul>
        </div>
        <div class="form-check nav-link">
          <input class="form-check-input" type="checkbox" value="" id="checkShowAngles" @click="$emit('showAngles')" checked>
          <label class="form-check-label" for="checkShowAngles">Show on video</label>
        </div>
      </div>
    </div>
    <div class="tab-pane fade" id="trajectory-subnavbar" role="tabpanel" aria-labelledby="trajectoryButton">
      <div class="nav">
        <div class="dropdown nav-link">
          <button class="btn btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
            Choose trajectories
          </button>
          <ul class="dropdown-menu">
            <li class="dropdown-item" v-for="value in joints" :key="value.name">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" :id="value.name" :value="value.connectedJoints[1]" v-model="selectedJointIndexes"/>
                  <label class="form-check-label" :for="value.name">{{ value.name }}</label>
                </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { joints, Joint } from '../jointsData';
import { selectedJointIndexes } from '../composables/predictVideo'

let selectedAngles = ref<Joint[]>([]);

const props = defineProps<{
  buttonText: string
}>()
const emit = defineEmits([ 'upload', 'webcam', 'showAngles', 'updateSelectedAngles', 'downloadCsv' ]);
const handleVideoUpload = (event: any) => {
  emit('upload', event.srcElement.files[ 0 ].path, event.srcElement.files[0].name);
}
const onInputClick = (event: any) => {
  const element = event.target as HTMLInputElement;
  element.value = ''
}

const updateSelectedAngles = () => {
  emit('updateSelectedAngles', selectedAngles.value)}
</script>


<style scoped>

.nav-link {
  color: black;
}

.nav-tabs {
  --bs-nav-link-padding-y: 0.2rem;
  background-color: #ced4da;
  --bs-nav-tabs-border-width: 0px;
  font-size: smaller;
}

.nav-tabs .nav-link.active {
  background-color: #e9ecef;
  color: black;
}

.tab-content {
  display: flex;
  height: 3rem;
  align-items: center;
  background-color: #e9ecef;
}

.form-check{
  margin-left: 1.5rem;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  padding: 0.3rem 0.5rem;
}
</style>
