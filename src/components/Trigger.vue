<script>
const settings = require('../appSettings')
import axios from 'axios'
export default {
  name: 'trigger',
  props: {
    triggerId: {
      type: Number,
    },
  },
  data() {
    return {
      trigger: {},
      deleteConfirmDialogVisible: false,
    }
  },
  async created() {
    // Get the trigger object
    try {
      let response = await axios.get(
        `${settings.orchestrationAPI}/triggers/${this.triggerId}`
      )
      this.trigger = response.data

    } catch (e) {
      this.$message.error(`Error loading trigger: ${e.message}`)
    }
  },
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <span class="card-title">{{trigger.name}}</span>
      <el-tooltip content="Fire this trigger" placement="bottom">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 3px"
          icon="el-icon-caret-right"
          circle
          @click="execute()"
        ></el-button>
      </el-tooltip>
      <el-tooltip content="Edit this trigger" placement="bottom">
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 10px"
          icon="el-icon-edit"
          circle
          @click="edit()"
        ></el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 300px;
  border-style: solid;
  border-width: 2px;
  border-radius: 3px;
  border-color: rgb(79, 19, 102);
}
.card-header {
  height: 30px;
  background-color: rgb(79, 19, 102);
  padding-top: 4px;
  padding-left: 4px;
  padding-right: 4px;
}
.card-title {
  font-size: 1.1em;
  font-weight: 700;
  color: white;
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