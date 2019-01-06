<script>
const settings = require('../appSettings')
import axios from 'axios'
export default {
  name: 'orchestration',
  props: {
    orchestrationId: {
      type: Number,
    },
  },
  data() {
    return {
      lstTriggers: [],
      orchestration: {},
      deleteConfirmDialogVisible: false,
      editMode: false,
      editForm: {},
      loading: true,
    }
  },
  methods: {
    async startEdit() {
      await this.loadTriggers()
      this.editForm = Object.assign({}, await this.getOrchestration(false))
      this.editMode = true
    },
    async save() {
      // Validate changes
      if (this.editForm.name == undefined || this.editForm.name == '') {
        this.$message.error('Please give your orchestration a title.')
        return
      }
      if (
        this.editForm.startDelayMin == undefined ||
        !Number.isInteger(this.editForm.startDelayMin)
      ) {
        this.editForm.startDelayMin = 0
      }
      if (
        this.editForm.startDelayMax == undefined ||
        !Number.isInteger(this.editForm.startDelayMax)
      ) {
        this.editForm.startDelayMax = 0
      }

      // Save the changes to the API
      if (this.editForm.id != undefined) {
        if (!Number.isInteger(this.editForm.id))
          this.editForm.id = Number.parseInt(this.editForm.id)
        const resp = await axios.put(
          `${settings.orchestrationAPI}/orchestrations/${
            this.orchestration.id
          }`,
          this.editForm
        )
        if (resp.status == 200) {
          this.$message.success('Orchestration updated.')
        } else {
          this.$message.error(`Error updating orchestration!! ${resp.data}`)
        }
      } else {
        const resp = await axios.post(
          `${settings.orchestrationAPI}/orchestrations`,
          this.editForm
        )
        if (resp.status == 201) {
          this.$message.success('Orchestration created.')
        } else {
          this.$message.error(`Error creating orchestration!! ${resp.data}`)
        }
      }
      this.$emit('updated', this.orchestration.id) // Notify the parent needs to refresh.

      // Update the display object
      this.orchestration = Object.assign({}, await this.getOrchestration(true))
      this.editForm = null
      this.editMode = false
    },
    cancelEdit() {
      this.editForm = {}
      this.editMode = false
    },
    handleStartDelayMin() {
      // Make sure the max start delay is equal or greater to the min start delay
      if (this.editForm.startDelayMax < this.editForm.startDelayMin)
        this.editForm.startDelayMax = this.editForm.startDelayMin
    },
    handleStartDelayMax() {
      // Make sure the max start delay is equal or greater to the min start delay
      if (this.editForm.startDelayMin > this.editForm.startDelayMax)
        this.editForm.startDelayMin = this.editForm.startDelayMax
    },
    async loadTriggers() {
      // Get all triggers and build a categorized list
      try {
        let response = await axios.get(`${settings.orchestrationAPI}/triggers`)
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
    async getOrchestration(resolveTriggers) {
      try {
        let response = await axios.get(
          `${settings.orchestrationAPI}/orchestrations/${
            this.orchestrationId
          }?resolveTriggers=${resolveTriggers}`
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
  },
  async created() {
    if (this.orchestrationId) {
      // Get the orchestration object
      this.orchestration = Object.assign({}, await this.getOrchestration(true))
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
        <input type="text" v-model="editForm.name">
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
    </div>
    <div id="properties" class="flex-container">
      <span class="flex-item">
        <b>Auto Start:</b>
        <span v-if="editMode == false">{{orchestration.autoStart}}&nbsp;</span>
        <el-switch
          v-if="editMode == true"
          v-model="editForm.autoStart"
          active-text="Yes"
          active-color="green"
          inactive-text="No"
          inactive-color="red"
        ></el-switch>
        <el-popover
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
        </el-popover>
      </span>
      <div class="flex-item">
        <div v-if="editMode == false">
          <b>Start Delay:</b>
          <span
            v-if="orchestration.startDelayMin == orchestration.startDelayMax"
          >{{orchestration.startDelayMin}} (secs.)</span>
          <span v-else>{{orchestration.startDelayMin}}-{{orchestration.startDelayMax}} (secs.)</span>
          <el-popover
            placement="bottom"
            title="Orchestrations: Start Delay"
            width="250"
            trigger="click"
            content="An orchestration with a Start Delay set will pause for the specified number of seconds before executing all of its actions simultaneously.  If a minimum and maximum start delay are set, then the orchestration will pause for a RANDOM number of seconds between the minimum and maximum value."
          >
            <el-button slot="reference" icon="el-icon-question" circle size="small"></el-button>
          </el-popover>
        </div>
        <div v-if="editMode == true">
          <div style="float:right">Start Delay (Min.):
            <el-input-number
              v-model="editForm.startDelayMin"
              @change="handleStartDelayMin()"
              :min="0"
              :max="3600"
              size="mini"
            ></el-input-number>(secs.)
          </div>
          <div style="float:right">Start Delay (Max.):
            <el-input-number
              v-model="editForm.startDelayMax"
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
          <div class="flex-container" v-for="trigger in orchestration.triggers" :key="trigger.id">
            <div class="flex-item">{{trigger.name}}</div>
          </div>
        </div>
        <div v-if="editMode == true">
          <el-select
            v-model="editForm.triggers"
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
                :value="trigger"
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
          <div class="flex-item">{{action.name}} [{{action.type}}]</div>
        </div>
        <el-button v-if="editMode == true" size="mini">Add Action</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 500px;
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
</style>