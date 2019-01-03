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
      this.$message.error(`Error loading sound: ${e.message}`)
    }
  },
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <span class="card-title">{{orchestration.name}}</span>
      <el-tooltip content="Execute this orchestration" placement="bottom" open-delay="1000">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 3px"
          icon="el-icon-caret-right"
          circle
          @click="execute()"
        ></el-button>
      </el-tooltip>
      <el-tooltip content="Edit this orchestration" placement="bottom" open-delay="1000">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 10px"
          icon="el-icon-edit"
          circle
          @click="edit()"
        ></el-button>
      </el-tooltip>
    </div>
    <p>A list of this orchestration's Actions will go here.</p>
    <p>An "Add Action" button will go here.</p>
  </div>
</template>

<style scoped>
.card {
  width: 300px;
  border-style: solid;
  border-width: 2px;
  border-radius: 3px;
  border-color: #46607F;
}
.card-header {
  height: 30px;
  background-color: #46607F;
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
</style>