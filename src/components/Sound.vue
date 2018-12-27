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
          @click="editSound(sound.id)"
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
  </div>
</template>

<script>
const settings = require('@/appSettings')
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
    }
  },
  methods: {
    playSound(soundId) {
      alert(`Playing sound ${soundId}`)
    },
    editSound(soundId) {
      alert(`Editing sound ${soundId}`)
    },
  },
  async created() {
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
      alert(e)
    }
  },
}
</script>

<style scoped>
.card {
  width: 350px;
  border-style: solid;
  border-width: 2px;
  border-radius: 3px;
  border-color: cornflowerblue;
}
.card-header {
  height: 34px;
  background-color: cornflowerblue;
  padding-top: 4px;
  padding-left: 4px;
  padding-right: 4px;
}
.card-title {
  font-size: 16px;
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