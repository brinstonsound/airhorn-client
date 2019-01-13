
<script>
const settings = require('../appSettings')
import axios from 'axios'

export default {
  name: 'operations',
  data() {
    return {
      activeSymphony: {},
      lstSymphonies: [],
      lstTriggers: [],
      lstManualButtons: [],
    }
  },
  methods: {
    async getActiveSymphony() {
      // Get active symphony
      try {
        const response = await axios.get(
          `${settings.orchestrationAPI}/symphonies?active=true`
        )
        const response2 = await axios.get(
          `${settings.orchestrationAPI}/symphonies/${response.data.id}`
        )
        this.activeSymphony = response2.data
      } catch (error) {
        this.$message.error(
          `Error loading active environment: ${error.message}`
        )
      }
    },
    async setActiveSymphony() {
      // When the symphony selector changes, the activeSymphony
      // variable is changed.  This method persists that change
      // back to the orchestration API.
      try {
        const activeSymphony = this.lstSymphonies.find(obj => {
          return obj.id == this.activeSymphony.id
        })
        const payload = {
          id: activeSymphony.id,
          name: activeSymphony.name,
          isActive: true,
        }
        //alert(JSON.stringify(payload))
        await axios.put(
          `${settings.orchestrationAPI}/symphonies/${this.activeSymphony.id}`,
          payload
        )
        await this.getActiveSymphony()
        await this.loadManualTriggers()
        this.$message.success(
          `Active environment set to ${activeSymphony.name}`
        )
      } catch (error) {
        this.$message.error(
          `Error setting active environment: ${error.message}`
        )
      }
    },
    async loadSymphonies() {
      // Load the list of symphonies
      try {
        const response = await axios.get(
          `${settings.orchestrationAPI}/symphonies`
        )
        this.lstSymphonies = response.data
        this.lstSymphonies = this.lstSymphonies.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        )
      } catch (error) {
        this.$message.error(`Error loading environments list: ${error.message}`)
      }
    },
    async loadManualTriggers() {
      try {
        // Load the list manual triggers
        this.lstManualButtons = []
        for (var i = 0; i < 10; i++) {
          const manualButton = {
            key: i,
            orchestration: {
              id: 0,
              name: 'Unassigned',
            },
          }
          this.lstManualButtons.push(manualButton)
        }

        const response = await axios.get(
          `${settings.orchestrationAPI}/triggers`
        )
        this.lstTriggers = response.data
        this.lstTriggers = this.lstTriggers.filter(obj => {
          return obj.type == 'MANUAL'
        })
        this.lstTriggers = this.lstTriggers.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        )
        // Link manual triggers with their associated orchestrations
        Object.keys(this.lstTriggers).forEach(idx => {
          const trigger = this.lstTriggers[idx]
          //alert('Trigger: ' + JSON.stringify(trigger))

          Object.keys(this.activeSymphony.orchestrations).forEach(idx => {
            const orch = this.activeSymphony.orchestrations[idx]
            //alert('Orch: ' + JSON.stringify(orch))
            if (orch.triggers != undefined) {
              const foundTrigger = orch.triggers.find(obj => {
                return obj == trigger.id
              })
              if (foundTrigger != undefined) {
                // Matched the trigger to the orchestration
                // Assign the trigger to the manual button
                Object.keys(this.lstManualButtons).forEach(idx => {
                  if(this.lstManualButtons[idx].key == trigger.keyBinding) {
                    this.lstManualButtons[idx].orchestration = orch
                  }
                })
              }
            }
          })
        })
      } catch (error) {
        this.$message.error(
          `Error loading manual triggers list: ${error.message}`
        )
      }
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
  async mounted() {
    await this.loadSymphonies()
    await this.getActiveSymphony()
    await this.loadManualTriggers()
  },
}
</script>

<template>
  <div>
    <h1>Operations Console</h1>
    <p>
      This is where the user will spend most of their time. It will display the current system status, which ambient sounds are playing,
      and provide a bank of manual switches that they can click to execute an orchestration.
    </p>
    <div id="environmentSelection" class="flex-container">
      <div class="flex-item form-label">Active Environment:</div>
      <div class="flex-item">
        <el-select v-model="activeSymphony.id" @change="setActiveSymphony()">
          <el-option
            v-for="item in lstSymphonies"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </div>
    </div>
    <h4>Manual Triggers</h4>
    <div class="flex-container" v-for="button in lstManualButtons" :key="button.key">
      <div class="flex-item">
        <el-button
          @click="executeOrchestration(button.orchestration.id)"
          :disabled="button.orchestration.name == 'Unassigned'"
        >{{button.orchestration.name}}</el-button>
      </div>
    </div>
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