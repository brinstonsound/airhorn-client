<script>
const settings = require('../appSettings')
import axios from 'axios'
export default {
  name: 'sound',
  props: {
    soundId: {
      type: Number,
    },
  },
  data() {
    return {
      sound: {},
      categoryNames: '',
      editDialogVisible: false,
      checkDeleteDialogVisible: false,
      lstCategories: [],
    }
  },
  methods: {
    playSound() {
      this.$message.error('Not implemented yet')
    },
    editSound() {
      this.editDialogVisible = true
    },
    saveChanges() {
      if (this.sound.name == undefined || this.sound.name == '') {
        this.$message.error('Please give your sound a title.')
        return
      }
      if (this.sound.description == undefined || this.sound.description == '') {
        this.$message.error('Please give your sound a description.')
        return
      }
      if (
        this.sound.soundCategories == undefined ||
        this.sound.soundCategories.length == 0
      ) {
        this.$message.error(
          'Please select at least one category for your sound.'
        )
        return
      }
      axios
        .put(`${settings.orchestrationAPI}/sounds/${this.sound.id}`, this.sound)
        .then(function() {
          this.$message.success('SUCCESS!! Sound updated.')
        })
        .catch(function(err) {
          this.$message.error(`Error updating sound!! ${err.message}`)
        })
      this.$emit('deleted', this.sound.id) // It's not really deleted, but the parent needs to refresh anyway.
      this.editDialogVisible = false
    },
    async deleteSound() {
      this.orchestrationAPI = settings.orchestrationAPI
      try {
        // Delete the sound.
        await axios.delete(
          `${settings.orchestrationAPI}/sounds/${this.sound.id}`
        )
        // Close the edit dialog
        this.editDialogVisible = false
        // Notify the sound library to reload (this will remove the sound from the visible library)
        this.$emit('deleted', this.sound.id)
      } catch (e) {
        this.$message.error(`Error deleting sound: ${e.message}`)
      }

      this.checkDeleteDialogVisible = false
    },
  },
  async created() {
    try {
      const response = await axios.get(
        `${settings.orchestrationAPI}/soundCategories`
      )
      this.lstCategories = response.data
      this.lstCategories.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      )
    } catch (e) {
      this.$message.error(`Error loading sound categories: ${e.message}`)
    }

    // Load the selected sound object
    try {
      let response = await axios.get(
        `${settings.orchestrationAPI}/sounds/${this.soundId}`
      )
      this.sound = response.data

      this.sound.soundCategories.forEach(category => {
        axios
          .get(`${settings.orchestrationAPI}/soundCategories/${category}`)
          .then(resp => (this.categoryNames += `[${resp.data.name}] `))
      })
    } catch (e) {
      this.$message.error(`Error loading sound: ${e.message}`)
    }
  },
}
</script>

<template>
  <div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">{{sound.name}}</span>
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 3px"
          icon="el-icon-caret-right"
          circle
          @click="playSound(sound.id)"
        ></el-button>
        <el-button
          style="float: right; padding: 4px 4px; margin-right: 10px"
          icon="el-icon-edit"
          circle
          @click="editSound()"
        ></el-button>
      </div>
      <div class="card-body">
        <div>
          <b>Description:</b>
          {{sound.description}}
        </div>
        <div>
          <b>Categories:</b>
          {{categoryNames}}
        </div>
      </div>
    </div>
    <el-dialog title="Edit Sound" :visible.sync="editDialogVisible" width="50%">
      <div class="edit-form-container">
        <div class="flex-item form-label">Title:</div>
        <div class="flex-item form-field">
          <input type="text" v-model="sound.name" class="form-field">
        </div>
      </div>
      <div class="edit-form-container">
        <div class="flex-item form-label">Description:</div>
        <div class="flex-item form-field">
          <input type="text" v-model="sound.description" class="form-field">
        </div>
      </div>
      <div class="edit-form-container">
        <div class="flex-item form-label">Categories:</div>
        <div class="flex-item form-field">
          <el-select
            v-model="sound.soundCategories"
            multiple
            placeholder="Select sound categories"
            class="form-field"
          >
            <el-option
              v-for="category in lstCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            ></el-option>
          </el-select>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="editDialogVisible = false">Cancel</el-button>
        <el-button
          style="margin-left: 10px;"
          size="small"
          type="success"
          @click="saveChanges()"
        >Save</el-button>
        <el-button
          style="margin-left: 10px;"
          size="small"
          type="danger"
          @click="checkDeleteDialogVisible = true"
        >Delete</el-button>
      </span>
    </el-dialog>
    <el-dialog title="Confirm Delete" :visible.sync="checkDeleteDialogVisible" width="25%">
      <p>Are you sure you want to delete this sound?</p>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="checkDeleteDialogVisible = false">No</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="deleteSound()">Yes</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style scoped>
.card {
  width: 300px;
  border-style: solid;
  border-width: 2px;
  border-radius: 3px;
  border-color: cornflowerblue;
}
.card-header {
  height: 30px;
  background-color: cornflowerblue;
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
.edit-form-container {
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
  -ms-flex-pack: end;
  justify-content: flex-start;
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
.form-label {
  width: 100px;
}

.form-field {
  width: 85%;
}
</style>