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
    symphonyId: {
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
      lstSounds: [],
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
        this.lstOrchestrations = response.data.filter(obj => {
          return obj.symphonyId == this.symphonyId
        })
        this.lstOrchestrations = this.lstOrchestrations.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        )
      } catch (error) {
        this.$message.error(
          `Error loading orchestrations list: ${error.message}`
        )
      }
    },
    async loadSounds() {
      try {
        if (this.lstSounds.length == 0) {
          // Get a list of categories
          const response = await axios.get(
            `${settings.orchestrationAPI}/soundCategories`
          )
          response.data.forEach(async category => {
            let newCategory = {}
            newCategory.name = category.name
            newCategory.sounds = []
            // Get CategorySounds
            const catSounds = await axios.get(
              `${settings.orchestrationAPI}/soundCategories/${
                category.id
              }/sounds`
            )
            //console.log(JSON.stringify(catSounds.data))
            catSounds.data.forEach(sound => {
              newCategory.sounds.push({
                id: sound.id,
                name: sound.name,
              })
            })
            this.lstSounds.push(newCategory)
          })
        }
        // this.lstOrchestrations = response.data.sort((a, b) =>
        //   a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        // )
      } catch (error) {
        this.$message.error(`Error loading sound list: ${error.message}`)
      }
    },
    async loadThisAction() {
      if (this.actionId > 0) {
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
      } else {
        this.action.orchestrationId = this.orchestrationId
      }
    },
    async save() {
      try {
        if (this.action.id) {
          axios.put(
            `${settings.orchestrationAPI}/actions/${this.action.id}`,
            this.action
          )
        } else {
          axios.post(
            `${settings.orchestrationAPI}/actions/${this.action.id}`,
            this.action
          )
        }
      } catch (error) {
        this.$message.error(
          `Error saving orchestrations action: ${error.message}`
        )
      }
    },
  },
  // async created() {
  //   this.$parent.$on('updated', await this.loadThisAction())
  // },
  async beforeMount() {
    await this.loadThisAction()
    if (this.editMode) {
      this.loadOrchestrations()
      this.loadSounds()
    }
  },
}
</script>

<template>
  <div class="card-border">
    <!-- EDIT -->
    <div v-if="editMode">
      <!-- <h4>ACTION</h4> -->
      <el-row>
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
          <el-col :span="8">Sound File:</el-col>
          <el-col :span="16">
            <el-select v-model="action.sound.soundId" @change="save()" size="small">
              <el-option-group
                v-for="category in lstSounds"
                :key="category.name"
                :label="category.name"
              >
                <el-option
                  v-for="sound in category.sounds"
                  :key="sound.id"
                  :label="sound.name"
                  :value="sound.id"
                ></el-option>
              </el-option-group>
            </el-select>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">Volume:</el-col>
          <el-col :span="16">
            <el-slider v-model="action.sound.volume" @change="save()"></el-slider>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">Speakers:</el-col>
          <el-col :span="16">
            <el-select v-model="action.sound.speakers" multiple @change="save()">
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
            <el-select v-model="action.nextOrchestrationId" @change="save()" size="small">
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
    <div v-else>
      <!-- DISPLAY -->
      <div class="grid-box" v-if="action.type == 'SOUND'">
        <div style="grid-column: 1 / 4; font-weight: bolder;">PLAY:</div>
        <div style="grid-column: 2 / 4; font-weight: bolder;">{{sound.name}}</div>
        <div style="grid-column: 2 / 3;">Volume:</div>
        <div style="grid-column: 3 / 4 ;">{{action.sound.volume * 100}}</div>
        <div style="grid-column: 2 / 3;">Speakers:</div>
        <div style="grid-column: 3 / 4;">{{JSON.stringify(action.sound.speakers)}}</div>
      </div>
      <div class="grid-box" v-if="action.type == 'ORCHESTRATION'">
        <div style="grid-column: 1 / 4; font-weight: bolder;">LINK TO:</div>
        <div style="grid-column: 2 / 4; font-weight: bolder;">{{nextOrchestration.name}}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-box {
  display: grid;
  grid-template-columns: 1em auto auto auto;
  align-items: center;
  justify-content: start;
  grid-column-gap: 5px;
  margin-bottom: 5px;
}
.card-border {
  border-top: 1px solid;
  border-left: 1px solid;
  border-top-left-radius: 4px;
  border-color: black;
  padding: 5px;
  margin-top: 10px;
}
</style>