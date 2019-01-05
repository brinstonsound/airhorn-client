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
      orchestration: {},
      deleteConfirmDialogVisible: false,
    }
  },
  async created() {
    // Get the orchestration object
    try {
      let response = await axios.get(
        `${settings.orchestrationAPI}/orchestrations/${this.orchestrationId}`
      )
      this.orchestration = response.data

      // Get the orchestraiton's actions
      this.orchestration.actions.forEach(action => {
        axios
          .get(`${settings.orchestrationAPI}/actions/${action}`)
          .then(resp => (this.categoryNames += `[${resp.data.name}] `))
      })
    } catch (e) {
      this.$message.error(`Error loading orchestration: ${e.message}`)
    }
  },
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <span class="card-title">{{orchestration.name}}</span>
      <el-tooltip content="Execute this orchestration" placement="bottom">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 3px"
          icon="el-icon-caret-right"
          circle
          @click="execute()"
        ></el-button>
      </el-tooltip>
      <el-tooltip content="Edit this orchestration" placement="bottom">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 10px"
          icon="el-icon-edit"
          circle
          @click="edit()"
        ></el-button>
      </el-tooltip>
    </div>
    <div id="properties" class="flex-container">
      <span class="flex-item">
        Auto Start: {{orchestration.autoStart}}&nbsp;
        <el-popover
          placement="bottom"
          title="Orchestrations: Auto Start"
          width="250"
          trigger="click"
          content="An orchestration with Auto Start set to true will automatically execute as soon as the Airhorn server is powered up."
        >
          <el-button slot="reference" icon="el-icon-question" circle size="small"></el-button>
        </el-popover>
      </span>
      <div class="flex-item">
        <span
          v-if="orchestration.startDelayMin == orchestration.startDelayMax"
        >Start Delay: {{orchestration.startDelayMin}} (secs.)</span>
        <span
          v-else
        >Start Delay: {{orchestration.startDelayMin}}-{{orchestration.startDelayMax}} (secs.)</span>
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
    </div>
    <div id="orch-components-container">
      <div id="triggers">
        <p>A list of this orchestration's Triggers will go here.</p>
        <p>An "Add Trigger" button will go here.</p>
      </div>
      <div id="actions">
        <p>A list of this orchestration's Actions will go here.</p>
        <p>An "Add Action" button will go here.</p>
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
}
.card-header {
  height: 30px;
  background-color: #05668d;
  padding-top: 4px;
  padding-left: 4px;
  padding-right: 4px;
}
.card-title {
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

  -webkit-justify-content: space-around;
  justify-content: space-around;
  -ms-flex-pack: end;

  -webkit-align-content: center;
  -ms-flex-line-pack: center;
  align-content: center;

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
}
#orch-components-container {
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: start;
}
#triggers {
  grid-column: 1;
}
#actions {
  grid-column: 2;
}
</style>