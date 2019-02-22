<script>
const settings = require('../appSettings')
import axios from 'axios'
import Trigger from './Trigger.vue'
import Action from './Action.vue'
export default {
  name: 'orchestration',
  components: { Trigger, Action },
  props: {
    orchestrationId: {
      type: Number,
    },
    symphonyId: {
      type: Number,
    },
  },
  data() {
    return {
      lstTriggers: [],
      lstTriggersUncategorized: [],
      orchestration: {},
      deleteConfirmDialogVisible: false,
      editMode: false,
      loading: true,
      editActionDialogVisible: false,
    }
  },
  methods: {
    async startEdit() {
      if (this.orchestration.id == undefined) {
        this.orchestration = {
          symphonyId: this.symphonyId,
          autoStart: false,
          startDelayMin: 0,
          startDelayMax: 0,
        }
      }
      this.editMode = true
    },
    async addAction() {
      const newAction = {
        id: 0,
        type: 'SOUND',
        orchestrationId: this.orchestration.id,
        nextOrchestrationId: 0,
        sound: {
          soundId: 0,
          speakers: [],
          volume: 0,
        },
      }
      const resp = await axios.post(
        `${settings.orchestrationAPI}/actions`,
        newAction
      )
      newAction.id = resp.data.id
      this.orchestration.actions.push(newAction)
    },
    async save() {
      // Validate changes
      if (
        this.orchestration.name == undefined ||
        this.orchestration.name == ''
      ) {
        this.$message.error('Please give your orchestration a title.')
        return
      }
      if (
        this.orchestration.startDelayMin == undefined ||
        !Number.isInteger(this.orchestration.startDelayMin)
      ) {
        this.orchestration.startDelayMin = 0
      }
      if (
        this.orchestration.startDelayMax == undefined ||
        !Number.isInteger(this.orchestration.startDelayMax)
      ) {
        this.orchestration.startDelayMax = 0
      }
      // Save the changes to the API
      if (this.orchestration.id != undefined) {
        if (!Number.isInteger(this.orchestration.id))
          this.orchestration.id = Number.parseInt(this.orchestration.id)
        const resp = await axios.put(
          `${settings.orchestrationAPI}/orchestrations/${
            this.orchestration.id
          }`,
          this.orchestration
        )
        if (resp.status == 200) {
          this.$message.success('Orchestration updated.')
        } else {
          this.$message.error(`Error updating orchestration!! ${resp.data}`)
        }
      } else {
        const resp = await axios.post(
          `${settings.orchestrationAPI}/orchestrations`,
          this.orchestration
        )
        if (resp.status == 201) {
          this.$message.success('Orchestration created.')
        } else {
          this.$message.error(`Error creating orchestration!! ${resp.data}`)
        }
      }
      this.orchestration.actions = []
      this.orchestration = await this.getOrchestration()

      //this.$emit('updated', this.orchestration.id) // Notify the parent needs to refresh.

      // Update the display object
      this.editMode = false
    },
    cancelEdit() {
      this.getOrchestration(false)
      this.editMode = false
    },
    handleStartDelayMin() {
      // Make sure the max start delay is equal or greater to the min start delay
      if (this.orchestration.startDelayMax < this.orchestration.startDelayMin)
        this.orchestration.startDelayMax = this.orchestration.startDelayMin
    },
    handleStartDelayMax() {
      // Make sure the max start delay is equal or greater to the min start delay
      if (this.orchestration.startDelayMin > this.orchestration.startDelayMax)
        this.orchestration.startDelayMin = this.orchestration.startDelayMax
    },
    async loadTriggersBulk() {
      try {
        const response = await axios.get(
          `${settings.orchestrationAPI}/triggers`
        )
        // assign the ungrouped list
        this.lstTriggersUncategorized = response.data
      } catch (e) {
        this.$message.error(`Error loading triggers: ${e.message}`)
      }
    },
    async loadTriggers() {
      // Get all triggers and build a categorized list
      try {
        const response = await axios.get(
          `${settings.orchestrationAPI}/triggers`
        )
        // Build group of Switch triggers
        const switchTriggers = response.data.filter(obj => {
          return obj.type == 'SWITCH'
        })
        this.lstTriggers.push({
          label: 'Hardware Switches',
          triggers: switchTriggers,
        })
        //Build group of Manual triggers
        const manTriggers = response.data.filter(obj => {
          return obj.type == 'MANUAL'
        })
        this.lstTriggers.push({
          label: 'Manual Triggers',
          triggers: manTriggers,
        })
      } catch (e) {
        this.$message.error(`Error loading triggers: ${e.message}`)
      }
    },
    getTriggerLabel(triggerId) {
      const trigger = this.lstTriggersUncategorized.find(obj => {
        return obj.id == triggerId
      })
      if (trigger != undefined) {
        return trigger.name
      }
    },
    async getOrchestration() {
      try {
        let response = await axios.get(
          `${settings.orchestrationAPI}/orchestrations/${this.orchestrationId}`
        )
        return response.data // Load the display object
      } catch (e) {
        this.$message.error(`Error loading orchestration: ${e.message}`)
      }
    },
    deleteOrchestration() {
      this.$confirm(
        'This will permanently delete the orchestration. Continue?',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }
      )
        .then(async () => {
          // Good to go.  Blow it away!
          await axios.delete(
            `${settings.orchestrationAPI}/orchestrations/${
              this.orchestrationId
            }`
          )
          this.$message({
            type: 'success',
            message: 'Delete completed',
          })
          this.$emit('deleted', this.orchestration.id) // Notify the parent needs to refresh.
        })
        .catch(e => {
          this.$message({
            type: 'info',
            message: 'Delete canceled: ' + e.message,
          })
        })
    },
    async executeOrchestration(orchestrationId) {
      this.$message.success('Executing orchestration...')
      try {
        await axios.post(
          `${
            settings.orchestrationAPI
          }/orchestrations/${orchestrationId}/execute`
        )
      } catch (error) {
        this.$message.error(`Error executing orchestration: ${error.message}`)
      }
    },
  },
  async created() {
    await this.loadTriggers()
    await this.loadTriggersBulk()
    this.$on('actionDeleted', actionId => {
      // Find this action and pop it out of our actions array
      alert('Need to pop this action out of our array!')
    })
    if (this.orchestrationId) {
      // Get the orchestration object
      this.orchestration = await this.getOrchestration()
    } else {
      // No orchestration Id implies that this has been instantiated to create a new orchestration.
      this.loading = false
      this.startEdit()
    }
  },
  mounted() {
    this.loading = false
  },
}
</script>

<template>
  <div ref="card" class="card" v-loading="loading">
    <div class="card-header">
      <span class="card-title">{{orchestration.name}}</span>
      <el-tooltip content="Test this orchestration" placement="bottom">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 3px"
          icon="el-icon-caret-right"
          circle
          @click="executeOrchestration(orchestration.id)"
        ></el-button>
      </el-tooltip>
      <el-tooltip content="Edit this orchestration" placement="bottom">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 10px"
          icon="el-icon-edit"
          circle
          @click="startEdit()"
        ></el-button>
      </el-tooltip>
      <el-tooltip content="Delete this orchestration" placement="bottom">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 10px"
          icon="el-icon-delete"
          circle
          @click="deleteOrchestration()"
        ></el-button>
      </el-tooltip>
    </div>
    <div class="card-body">
      <div id="autoStart">
        <div class="grid-box">
          <span>
            <div class="tooltip">
              <i class="el-icon-question"></i>
              <span
                class="tooltiptext"
              >An orchestration with Auto Start set to true will automatically execute as soon as the Airhorn server is powered up.</span>
            </div>
            <b>Auto Start:&nbsp;</b>
            <span>{{orchestration.autoStart ? 'Yes' : 'No'}}&nbsp;</span>
          </span>
        </div>
      </div>
      <div id="startDelay">
        <div>
          <div class="tooltip">
            <i class="el-icon-question"></i>
            <span
              class="tooltiptext"
            >An orchestration with a Start Delay set will pause for that number of seconds before executing all of its actions at once. If a minimum and maximum start delay are set, then the orchestration will pause for a RANDOM number of seconds between the minimum and maximum.</span>
          </div>
          <b>Start Delay:&nbsp;</b>
          <span
            v-if="orchestration.startDelayMin == orchestration.startDelayMax"
          >{{orchestration.startDelayMin}} (secs.)</span>
          <span v-else>{{orchestration.startDelayMin}}-{{orchestration.startDelayMax}} (secs.)</span>
        </div>
      </div>
      <div id="triggers">
        <div class="tooltip">
          <i class="el-icon-question"></i>
          <span
            class="tooltiptext"
          >An orchestration can be triggered manually or by a switch on the layout.</span>
        </div>
        <span style="font-weight:bolder">Triggers:</span>
        <div>
          <div class="grid-box" v-for="t in orchestration.triggers" :key="t">
            <div class="grid-col-1">
              <Trigger :triggerId="t"></Trigger>
            </div>
          </div>
        </div>
      </div>
      <div id="actions">
        <span style="font-weight:bolder">Actions:</span>

        <div class="grid-box" v-for="action in orchestration.actions" :key="action.id">
          <div class="grid-col-1">
            <Action :actionId="action.id"></Action>
          </div>
        </div>
      </div>
    </div>

    <!-- EDIT DIALOGUE -->
    <el-dialog :visible.sync="editMode" :close-on-click-modal="false" width="33%">
      <div slot="title" class="dialog-titlebar">Add/Edit An Orchestration</div>
      <el-row>
        <el-col :span="8">Name:</el-col>
        <el-col :span="16">
          <el-input v-model="orchestration.name" size="small"></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">Auto Start:</el-col>
        <el-col :span="16">
          <el-checkbox v-model="orchestration.autoStart"></el-checkbox>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">Min Start Delay (secs):</el-col>
        <el-col :span="16">
          <el-slider
            v-model="orchestration.startDelayMin"
            show-input
            :min="0"
            :max="360"
            :step="1"
            @change="handleStartDelayMin()"
          ></el-slider>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">Max Start Delay (secs):</el-col>
        <el-col :span="16">
          <el-slider
            v-model="orchestration.startDelayMax"
            show-input
            :min="0"
            :max="360"
            :step="1"
            @change="handleStartDelayMax()"
          ></el-slider>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">Triggers:</el-col>
        <el-col :span="16">
          <el-select
            v-model="orchestration.triggers"
            multiple
            placeholder="Select triggers"
            size="small"
          >
            <el-option-group
              v-for="group in lstTriggers"
              :key="group.label"
              :label="group.label"
              class="popup-text"
            >
              <el-option
                v-for="trigger in group.triggers"
                :key="trigger.id"
                :label="trigger.name"
                :value="trigger.id"
                class="popup-text"
                style="font-weight:normal"
              ></el-option>
            </el-option-group>
          </el-select>
        </el-col>
      </el-row>
      <div>
        <div class="tooltip">
          <i class="el-icon-question"></i>
          <span
            class="tooltiptext"
          >Actions are what an orchestration "does" when it is executed. All actions are executed at the same time.</span>
        </div>Actions:
      </div>
      <div v-for="action in orchestration.actions" :key="action.id">
        <Action
          :actionId="action.id"
          :orchestrationId="orchestration.orchestrationId"
          :symphonyId="orchestration.symphonyId"
          :editMode="true"
        ></Action>
      </div>
      <el-button type="success" size="small" @click="addAction()">Add an Action</el-button>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="editMode = false">Cancel</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="save()">Save</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  border-style: solid;
  border-width: 2px;
  border-radius: 3px;
  border-color: #05668d;
  background-color: #cfd7e7;
}
.card-header {
  height: 30px;
  background-color: #05668d;
  padding-top: 4px;
  padding-left: 4px;
  padding-right: 4px;
}
.card-title {
  color: white;
  font-size: 1.1em;
  font-weight: 700;
}
.card-body {
  display: grid;
  grid-template-columns: 40% 60%;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  align-items: start;
  margin: 10px;
}
.dialog-titlebar {
  background-color: #05668d;
  color: white;
  /* height: 30px; */
  padding: 5px;
  font-size: 1.2em;
  font-weight: bold;
}
.edit-grid-box {
  display: grid;
  grid-template-columns: 33% 66%;
  align-items: center;
  justify-items: start;
  grid-gap: 5px;
}
.el-row {
  margin-bottom: 10px;
}
#autoStart {
  grid-column: 1;
  grid-row: 1;
}
#startDelay {
  grid-column: 2;
  grid-row: 1;
}
#triggers {
  grid-column: 1;
  grid-row: 2;
}
#actions {
  grid-column: 2;
  grid-row: 2;
}
.grid-box {
  display: grid;
  align-items: center;
  justify-items: start;
  grid-gap: 5px;
}
.grid-col-1 {
  grid-column: 1;
  align-self: center;
}
.grid-col-2 {
  grid-column: 2;
  align-self: center;
}

/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  margin-left: 3px;
  /*border-bottom: 1px dotted black;  If you want dots under the hoverable text */
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 200px;
  background-color: lightgrey;
  color: black;
  text-align: left;
  padding: 5px;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 10;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>