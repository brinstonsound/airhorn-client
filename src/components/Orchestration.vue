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
      this.$emit('updated', this.orchestration.id) // Notify the parent needs to refresh.

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
        // Build group of Manual triggers
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

        // Get the orchestration's actions
        // this.orchestration.actions.forEach(action => {
        //   axios
        //     .get(`${settings.orchestrationAPI}/actions/${action.id}`)
        //     .then(resp => (this.lstActions += `[${resp.data.name}] `))
        // })
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
        .catch((e) => {
          this.$message({
            type: 'info',
            message: 'Delete canceled: ' + e.message,
          })
        })
    },
  },
  async created() {
    await this.loadTriggers()
    await this.loadTriggersBulk()
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
  <div class="card" v-loading="loading">
    <div class="card-header">
      <span v-if="editMode == false" class="card-title">{{orchestration.name}}</span>
      <div v-if="editMode == true" style="float: left; padding: 4px 4px; margin-right: 3px">
        <b>Name:</b>
        <input type="text" v-model="orchestration.name">
      </div>
      <el-tooltip v-if="editMode == false" content="Execute this orchestration" placement="bottom">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 3px"
          icon="el-icon-caret-right"
          circle
          @click="execute()"
        ></el-button>
      </el-tooltip>
      <el-tooltip v-if="editMode == false" content="Edit this orchestration" placement="bottom">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 10px"
          icon="el-icon-edit"
          circle
          @click="startEdit()"
        ></el-button>
      </el-tooltip>
      <el-tooltip
        v-if="editMode == true"
        content="Save changes to this orchestration"
        placement="bottom"
      >
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 10px"
          icon="el-icon-circle-check-outline"
          circle
          @click="save()"
        ></el-button>
      </el-tooltip>
      <el-tooltip
        v-if="editMode == true"
        content="Cancel changes to this orchestration"
        placement="bottom"
      >
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 10px"
          icon="el-icon-circle-close-outline"
          circle
          @click="cancelEdit()"
        ></el-button>
      </el-tooltip>
      <el-tooltip v-if="editMode == true" content="Delete this orchestration" placement="bottom">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 10px"
          icon="el-icon-delete"
          circle
          @click="deleteOrchestration()"
        ></el-button>
      </el-tooltip>
    </div>
    <div id="properties" class="flex-container">
      <span class="flex-item">
        <b>Auto Start:</b>
        <span v-if="editMode == false">{{orchestration.autoStart}}&nbsp;</span>
        <el-switch
          v-if="editMode == true"
          v-model="orchestration.autoStart"
          active-text="Yes"
          active-color="green"
          inactive-text="No"
          inactive-color="red"
        ></el-switch>
        <div class="flex-item tooltip">
          <i class="el-icon-question"></i>
          <span
            class="tooltiptext"
          >An orchestration with Auto Start set to true will automatically execute as soon as the Airhorn server is powered up.</span>
        </div>
        <!-- <el-popover
          placement="bottom"
          title="Orchestrations: Auto Start"
          width="250"
          trigger="click"
          content="An orchestration with Auto Start set to true will automatically execute as soon as the Airhorn server is powered up."
        >
          <el-button
            v-if="editMode == false"
            slot="reference"
            icon="el-icon-question"
            circle
            size="small"
          ></el-button>
        </el-popover>-->
      </span>
      <div class="flex-item">
        <div v-if="editMode == false">
          <b>Start Delay:</b>
          <span
            v-if="orchestration.startDelayMin == orchestration.startDelayMax"
          >{{orchestration.startDelayMin}} (secs.)</span>
          <span v-else>{{orchestration.startDelayMin}}-{{orchestration.startDelayMax}} (secs.)</span>
          <div class="flex-item tooltip">
            <i class="el-icon-question"></i>
            <span
              class="tooltiptext"
            >An orchestration with a Start Delay set will pause for the specified number of seconds before executing all of its actions simultaneously. If a minimum and maximum start delay are set, then the orchestration will pause for a RANDOM number of seconds between the minimum and maximum value.</span>
          </div>
          <!--<el-popover
            placement="bottom"
            title="Orchestrations: Start Delay"
            width="250"
            trigger="click"
            content="An orchestration with a Start Delay set will pause for the specified number of seconds before executing all of its actions simultaneously.  If a minimum and maximum start delay are set, then the orchestration will pause for a RANDOM number of seconds between the minimum and maximum value."
          >
            <el-button slot="reference" icon="el-icon-question" circle size="small"></el-button>
          </el-popover>-->
        </div>
        <div v-if="editMode == true">
          <div style="float:right">Start Delay (Min.):
            <el-input-number
              v-model="orchestration.startDelayMin"
              @change="handleStartDelayMin()"
              :min="0"
              :max="3600"
              size="mini"
            ></el-input-number>(secs.)
          </div>
          <div style="float:right">Start Delay (Max.):
            <el-input-number
              v-model="orchestration.startDelayMax"
              @change="handleStartDelayMax()"
              :min="0"
              :max="3600"
              size="mini"
            ></el-input-number>(secs.)
          </div>
        </div>
      </div>
    </div>
    <div id="orch-components-container">
      <div id="triggers">
        <h4>Triggers</h4>
        <div v-if="editMode == false">
          <div class="flex-container" v-for="t in orchestration.triggers" :key="t">
            <div class="flex-item">
              <Trigger :triggerId="t"></Trigger>
            </div>
          </div>
        </div>
        <div v-if="editMode == true">
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
                :label="getTriggerLabel(trigger.id)"
                :value="trigger.id"
                class="popup-text"
                style="font-weight:normal"
              ></el-option>
            </el-option-group>
          </el-select>
        </div>
      </div>
      <div id="actions">
        <h4>Actions</h4>
        <div class="flex-container" v-for="action in orchestration.actions" :key="action.id">
          <div class="flex-item">
            <Action :actionId="action.id"></Action>
          </div>
        </div>
        <el-button v-if="editMode == true" size="mini">Add Action</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  border-style: solid;
  border-width: 2px;
  border-radius: 3px;
  border-color: #05668d;
  background-color: #fdd9b5;
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
  font-size: smaller;
  font-weight: 300;
  padding-top: 2px;
  padding-left: 4px;
  padding-right: 4px;
  padding-bottom: 2px;
}
.popup-text {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: 0.9em;
}
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
  margin-right: 5px;
}
#orch-components-container {
  display: grid;
  grid-template-columns: 30% 70%;
  grid-column-gap: 10px;
  align-items: start;
  margin: 10px;
}
#triggers {
  grid-column: 1;
}
#actions {
  grid-column: 2;
}
/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 150px;
  background-color: white;
  color: black;
  text-align: center;
  padding: 5px;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>