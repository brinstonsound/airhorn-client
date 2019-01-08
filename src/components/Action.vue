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
  async created() {
    // Load this action
    try {
      const actionResp = await axios.get(
        `${settings.orchestrationAPI}/actions/${this.actionId}`
      )
      this.action = actionResp.data
      if(this.action.type == 'SOUND'){
      const soundResp = await axios.get(
        `${settings.orchestrationAPI}/sounds/${this.action.sound.soundId}`
      )
      this.sound = soundResp.data
      }
      if(this.action.type == 'ORCHESTRATION'){
      const orchResp = await axios.get(
        `${settings.orchestrationAPI}/orchestrations/${this.action.nextOrchestrationId}`
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
    <div class="flex-item">[{{action.type}}] -> </div>
    <div class="flex-item" v-if="action.type == 'SOUND'">{{sound.name}}</div>
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
</style>