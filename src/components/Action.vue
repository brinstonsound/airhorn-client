<script>
const settings = require('../appSettings')
import axios from 'axios'
export default {
  name: 'action',
  props: {
    actionId: {
      type: Number,
    },
  },
  data() {
    return {
      action: {},
      sound: {},
      nextOrchestration: {},
    }
  },
  computed: {
    shortType() {
      if (this.action.type === 'ORCHESTRATION') {
        return 'ORCH'
      } else {
        return this.action.type
      }
    },
  },
  async created() {
    // Load this action
    try {
      const actionResp = await axios.get(
        `${settings.orchestrationAPI}/actions/${this.actionId}`
      )
      this.action = actionResp.data
      if (this.action.type == 'SOUND') {
        const soundResp = await axios.get(
          `${settings.orchestrationAPI}/sounds/${this.action.sound.soundId}`
        )
        this.sound = soundResp.data
      }
      if (this.action.type == 'ORCHESTRATION') {
        const orchResp = await axios.get(
          `${settings.orchestrationAPI}/orchestrations/${
            this.action.nextOrchestrationId
          }`
        )
        this.nextOrchestration = orchResp.data
      }
    } catch (e) {
      this.$message.error(`Error loading action: ${e.message}`)
    }
  },
}
</script>

<template>
  <div class="flex-container">
    <div class="flex-item">[{{this.shortType}}]&nbsp;</div>
    <div class="flex-item" v-if="action.type == 'SOUND'">
      <div class="grid-box">
        <div class="grid-col-1" style="grid-row:1">{{sound.name}}</div>
        <div class="grid-col-1" style="grid-row:2">Vol:{{action.sound.volume * 100}}</div>
        <div class="grid-col-1" style="grid-row:3">Spkrs: {{JSON.stringify(action.sound.speakers)}}</div>
      </div>
    </div>
    <div class="flex-item" v-if="action.type == 'ORCHESTRATION'">{{nextOrchestration.name}}</div>
  </div>
</template>

<style scoped>
.flex-container {
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: nowrap;
  -ms-flex-wrap: nowrap;
  flex-wrap: nowrap;

  -webkit-justify-content: flex-start;
  justify-content: flex-start;
  -ms-flex-pack: end;

  -webkit-align-content: flex-start;
  -ms-flex-line-pack: start;
  align-content: flex-start;

  -webkit-align-items: flex-start;
  -ms-flex-align: start;
  align-items: flex-start;
  margin: 10px;
}
.flex-item {
  -webkit-order: 0;
  -ms-flex-order: 0;
  order: 0;
  -webkit-flex: 0 1 auto;
  -ms-flex: 0 1 auto;
  flex: 0 1 auto;
  -webkit-align-self: auto;
  -ms-flex-item-align: auto;
  align-self: auto;
  margin-left: 5px;
}
.grid-box {
  display: grid;
  align-items: start;
  grid-column-gap: 5px;
}
.grid-col-1 {
  grid-column: 1;
  align-self: center;
}
.grid-col-2 {
  grid-column: 2;
  align-self: center;
}
</style>