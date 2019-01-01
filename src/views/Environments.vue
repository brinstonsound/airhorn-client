<script>
const settings = require('../appSettings')
import axios from 'axios'
export default {
  name: 'environments',
  data() {
    return {
      lstSymphonies: [],
      activeSymphonyId: {},
    }
  },
  methods: {
    async setActiveSymphony() {
      // When the symphony selector changes, the activeSymphony
      // variable is changed.  This method persists that change
      // back to the orchestration API.
      try {
        const activeSymphony = this.lstSymphonies.find(obj => {
          return obj.id = this.activeSymphonyId
        })
        const payload = {
          id: this.activeSymphonyId,
          name: activeSymphony.name,
          isActive: true,
        }
        alert(JSON.stringify(payload))
        await axios.put(
          `${settings.orchestrationAPI}/symphonies/${this.activeSymphonyId}`,
          payload
        )
        this.$message.success('Active environment updated.')
      } catch (error) {
        this.$message.error(`Error setting active environment: ${error.message}`)
      }
    },
  },
  async mounted() {
    // Load the list of symphonies
    try {
      const response = await axios.get(
        `${settings.orchestrationAPI}/symphonies`
      )
      this.lstSymphonies = response.data
      this.lstSymphonies.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      )
    } catch (error) {
      this.$message.error(`Error loading environments list: ${error.message}`)
    }
    // Get active symphony
    try {
      const response = await axios.get(
        `${settings.orchestrationAPI}/symphonies?active=true`
      )
      this.activeSymphonyId = response.data.id
    } catch (error) {
      this.$message.error(`Error loading active environment: ${error.message}`)
    }
  },
}
</script>

<template>
  <div>
    <h1>Environment Management</h1>
    <p>This screen is for setting up an environment (symphony). Here the user will create/edit/delete orchestrations, actions and triggers.</p>
    <div id="environmentSelection">
      <div>Active Environment:</div>
      <div>
        <el-select v-model="activeSymphonyId" @change="setActiveSymphony()">
          <el-option
            v-for="item in lstSymphonies"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>