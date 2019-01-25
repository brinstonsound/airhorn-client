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
  <div>
    <div class="grid-box" v-if="action.type == 'SOUND'">
      <div style="grid-row:1; grid-column-start: 1; grid-column-end: 2;">PLAY: {{sound.name}}</div>
      <div style="grid-row:2; grid-column: 1;">&nbsp;&nbsp;&nbsp;Volume:</div>
      <div style="grid-row:2; grid-column: 2;">{{action.sound.volume * 100}}</div>
      <div style="grid-row:3; grid-column: 1;">&nbsp;&nbsp;&nbsp;Speakers:</div>
      <div style="grid-row:3; grid-column: 2;">{{JSON.stringify(action.sound.speakers)}}</div>
    </div>
    <div class="grid-box" v-if="action.type == 'ORCHESTRATION'">
      <div style="grid-row:1; grid-column: 1;">LINK TO: {{nextOrchestration.name}}</div>
    </div>
  </div>
</template>

<style scoped>
.grid-box {
  display: grid;
  align-items: center;
  grid-column-gap: 5px;
  margin-bottom: 5px;
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