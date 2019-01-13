<script>
const settings = require('../appSettings')
import axios from 'axios'
import Orchestration from '../components/Orchestration.vue'
//import Trigger from '../components/Trigger.vue'
export default {
  name: 'environments',
  components: { Orchestration },
  data() {
    return {
      lstSymphonies: [],
      lstTriggers: [],
      activeSymphony: {},
      newEnvironmentDialogVisible: false,
      symphonyForm: {
        name: '',
        isActive: false,
      },
      checkDeleteDialogVisible: false,
      orchEditDialogVisible: false,
    }
  },
  methods: {
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
        this.getActiveSymphony()
        this.$message.success(
          `Active environment set to ${activeSymphony.name}`
        )
      } catch (error) {
        this.$message.error(
          `Error setting active environment: ${error.message}`
        )
      }
    },
    async deleteSymphony() {
      //this.$message.error('Not implemented yet.')

      // Get all orchestrations associated with this symphony
      // The GET /symphonies/{id} gives us all the orchestration and trigger id's we will need
      const resp = await axios.get(
        `${settings.orchestrationAPI}/symphonies/${this.activeSymphony.id}`
      )
      const theSymphony = resp.data
      // Delete all orchestrations
      theSymphony.orchestrations.forEach(orchestration => {
        // Delete all triggers
        orchestration.triggers.forEach(triggerId => {
          axios.delete(`${settings.orchestrationAPI}/triggers/${triggerId}`)
        })
        // Delete the orchestration
        axios.delete(
          `${settings.orchestrationAPI}/orchestrations/${orchestration.id}`
        )
      })
      // Delete the symphony
      axios.delete(
        `${settings.orchestrationAPI}/symphonies/${this.activeSymphony.id}`
      )
      // Set the active symphony to the first symphony in the list
      await this.loadSymphonies()
      this.activeSymphony = this.lstSymphonies[0]
      this.setActiveSymphony()

      this.checkDeleteDialogVisible = false
      return
    },
    async submitNewSymphony() {
      // Validate input
      if (this.symphonyForm.name == undefined || this.symphonyForm.name == '') {
        this.$message.error('Please give your new environment a name.')
        return
      }
      // Submit the request
      await axios.post(
        `${settings.orchestrationAPI}/symphonies`,
        this.symphonyForm,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      // Refresh the set of symphonies
      this.loadSymphonies()
      this.newEnvironmentDialogVisible = false
    },
    async loadSymphonies() {
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
    },
    async loadTriggers() {
      // Load the list of symphonies
      try {
        const response = await axios.get(
          `${settings.orchestrationAPI}/triggers`
        )
        this.lstTriggers = response.data
        this.lstTriggers.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        )
      } catch (error) {
        this.$message.error(`Error loading triggers list: ${error.message}`)
      }
    },
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
    evtOrchestrationCreated() {
      this.getActiveSymphony()
      this.orchEditDialogVisible = false
    },
    evtOrchestrationDeleted() {
      this.getActiveSymphony()
    },
  },
  async mounted() {
    this.loadSymphonies()
    this.loadTriggers()
    this.getActiveSymphony()
  },
}
</script>

<template>
  <div>
    <h1>Environment Management</h1>
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
      <div class="flex-item button">
        <el-button
          type="success"
          size="small"
          @click="newEnvironmentDialogVisible = true"
        >New Environment</el-button>
      </div>
      <div class="flex-item button">
        <el-button
          v-if="lstSymphonies.length > 1"
          type="danger"
          size="small"
          @click="checkDeleteDialogVisible = true"
        >Delete This Environment</el-button>
      </div>
      <div class="flex-item button">
        <el-button type="primary" size="small" @click="orchEditDialogVisible = true">
          Add an Orchestration&nbsp;
          <i class="el-icon-circle-plus-outline el-icon-right"></i>
        </el-button>
      </div>
    </div>
    <!-- <h4>{{activeSymphony.name}}</h4> -->
    <div id="symphony-components-container">
      <!-- <div id="triggers" class="flex-container">
        <div class="form-container" v-for="trigger in lstTriggers" :key="trigger.id">
          <Trigger :triggerId="trigger.id"></Trigger>
        </div>
      </div>-->
      <div id="orchestrations" class="flex-container">
        <div
          class="form-container"
          v-for="orchestration in activeSymphony.orchestrations"
          :key="orchestration.id"
        >
          <Orchestration
            :orchestrationId="orchestration.id"
            v-on:deleted="evtOrchestrationDeleted()"
          ></Orchestration>
        </div>
      </div>
    </div>
    <el-dialog
      title="Create a New Environment"
      :visible.sync="newEnvironmentDialogVisible"
      width="40%"
    >
      <div class="flex-container form-container">
        <div class="flex-item form-label">Name:</div>
        <div class="flex-item form-field">
          <input type="text" v-model="symphonyForm.name" class="form-field">
        </div>
      </div>
      <div class="flex-container form-container">
        <div class="flex-item form-label">Make Active:</div>
        <div class="flex-item form-field">
          <el-switch v-model="symphonyForm.isActive" active-text="Yes" inactive-text="No"></el-switch>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="newEnvironmentDialogVisible = false">Cancel</el-button>
        <el-button
          style="margin-left: 10px;"
          size="small"
          type="success"
          @click="submitNewSymphony()"
        >Save</el-button>
      </span>
    </el-dialog>
    <el-dialog title="Confirm Delete" :visible.sync="checkDeleteDialogVisible" width="33%">
      <p>
        Are you
        <b>SURE</b> you want to delete this environment?
      </p>
      <p>It will also delete all of the orchestrations and triggers associated with it. (not for the faint of heart...)</p>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="checkDeleteDialogVisible = false">No</el-button>
        <el-button
          style="margin-left: 10px;"
          size="small"
          type="success"
          @click="deleteSymphony()"
        >Yes</el-button>
      </span>
    </el-dialog>
    <el-dialog title="Create Orchestration" :visible.sync="orchEditDialogVisible">
      <Orchestration :symphonyId="activeSymphony.id" v-on:updated="evtOrchestrationCreated()"></Orchestration>
    </el-dialog>
  </div>
</template>

<style scoped>
.component-title {
  font-size: 1.1em;
  font-weight: bolder;
}

.flex-container {
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;

  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;

  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;

  -webkit-justify-content: flex-start;
  -ms-flex-pack: start;
  justify-content: flex-start;

  -webkit-align-content: center;
  -ms-flex-line-pack: center;
  align-content: center;

  -webkit-align-items: flex-start;
  -ms-flex-align: start;
  align-items: flex-start;
}
.flex-item {
  -webkit-order: 0;
  -ms-flex-order: 0;
  order: 0;

  -webkit-flex: 0 1 auto;
  -ms-flex: 0 1 auto;
  flex: 0 1 auto;

  -webkit-align-self: center;
  -ms-flex-item-align: center;
  align-self: center;
}
.form-container {
  margin: 10px;
}
.form-label {
  width: 200px;
}
.form-field {
  width: 85%;
}
.button {
  margin-left: 15px;
}
#symphony-components-container {
  display: grid;
  /* grid-template-columns: 50% 50%; */
  grid-template-columns: 100%;
  align-items: start;
}
/* #triggers {
  grid-column: 1;
} */
#orchestrations {
  grid-column: 1;
}
</style>