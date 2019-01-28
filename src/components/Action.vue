<script>
const settings = require('../appSettings')
import axios from 'axios'
export default {
  name: 'action',
  props: {
    actionId: {
      type: Number,
    },
    orchestrationId: {
      type: Number,
    },
    editMode: {
      type: Boolean,
    },
  },
  data() {
    return {
      action: {},
      sound: {},
      nextOrchestration: {},
      lstOrchestrations: [],
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
    speakerList() {
      let arySpeakers = []
      for (let index = 1; index < 17; index++) {
        arySpeakers.push(index)
      }
      return arySpeakers
    },
  },
  methods: {
    async loadOrchestrations() {
      // Load the list of orchestrations
      try {
        const response = await axios.get(
          `${settings.orchestrationAPI}/orchestrations`
        )
        this.lstOrchestrations = response.data
        this.lstOrchestrations = this.lstOrchestrations.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        )
      } catch (error) {
        this.$message.error(
          `Error loading orchestrations list: ${error.message}`
        )
      }
    },
  },
  async beforeMount() {
    if (this.actionId) {
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
    }
    this.loadOrchestrations()
  },
}
</script>

<template>
  <div>
    <div v-if="editMode">
      <h4>ACTION</h4>
      <!-- <div class="grid-box"> -->
      <el-row gutter="5">
        <el-col :span="8">Action Type:</el-col>
        <el-col :span="16">
          <el-select v-model="action.type" size="small">
            <el-option label="Play a Sound" value="SOUND"></el-option>
            <el-option label="Link to another Orchestration" value="ORCHESTRATION"></el-option>
          </el-select>
        </el-col>
      </el-row>
      <div v-if="action.type=='SOUND'">
        <el-row>
          <el-col :span="8">Volume:</el-col>
          <el-col :span="16">
            <el-slider v-model="action.sound.volume"></el-slider>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">Speakers:</el-col>
          <el-col :span="16">
            <el-select v-model="action.sound.speakers" multiple>
              <el-option
                v-for="speaker in speakerList"
                :key="speaker"
                :label="speaker"
                :value="speaker"
              ></el-option>
            </el-select>
          </el-col>
        </el-row>
      </div>
      <div v-else-if="action.type=='ORCHESTRATION'">
        <el-row>
          <el-col :span="8">Next Orchestration:</el-col>
          <el-col :span="16">
            <el-select v-model="action.nextOrchestrationId">
              <el-option
                v-for="orchestration in lstOrchestrations"
                :key="orchestration.id"
                :label="orchestration.name"
                :value="orchestration.id"
              ></el-option>
            </el-select>
          </el-col>
        </el-row>
      </div>
    </div>
    <!-- </div> -->
    <div v-else>
      <!-- DISPLAY -->
      <div class="grid-box" v-if="action.type == 'SOUND'">
        <div style="grid-column: 1 / 3;">PLAY: {{sound.name}}</div>
        <div>&nbsp;&nbsp;&nbsp;Volume:</div>
        <div>{{action.sound.volume * 100}}</div>
        <div>&nbsp;&nbsp;&nbsp;Speakers:</div>
        <div>{{JSON.stringify(action.sound.speakers)}}</div>
      </div>
      <div class="grid-box" v-if="action.type == 'ORCHESTRATION'">
        <div style="grid-column: 1 / 3;">LINK TO: {{nextOrchestration.name}}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-box {
  display: grid;
  grid-template-columns: 33% 66%;
  align-items: center;
  justify-content: start;
  grid-column-gap: 5px;
  margin-bottom: 5px;
}
</style>