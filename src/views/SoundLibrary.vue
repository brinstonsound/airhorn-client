<script>
const settings = require('@/appSettings')
import axios from 'axios'
import Sound from '../components/Sound.vue'
export default {
  name: 'SoundLibrary',
  components: {
    Sound,
  },
  data() {
    return {
      orchestrationAPI: '',
      errors: [],
      lstCategories: [],
      lstSounds: [],
      form: {
        soundCategory: 0,
      },
    }
  },
  methods: {
    async selectCategory() {
      // Fires when the selected category changes.  New category Id is in form.soundCategory

      // Load all sounds from the selected category
      try {
        let response = {}
        if(this.form.soundCategory === 0){
          // Load All sounds
                  response = await axios.get(
          `${settings.orchestrationAPI}/sounds`)
        } else {
        response = await axios.get(
          `${settings.orchestrationAPI}/soundCategories/${
            this.form.soundCategory
          }/sounds`
        )
        }
        this.lstSounds = response.data
        this.lstSounds.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      )
      } catch (e) {
        this.errors.push(e)
      }
    },
  },
  async mounted() {
    this.orchestrationAPI = settings.orchestrationAPI
    try {
      const response = await axios.get(
        `${settings.orchestrationAPI}/soundCategories`
      )
      this.lstCategories = response.data
      //this.lstCategories.push({ id: -1, name: '...Select' })
      this.lstCategories.push({ id: 0, name: '..All Categories' })
      this.lstCategories.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      )
      // Load the sounds without filter
      this.selectCategory()

    } catch (e) {
      alert(e)
    }
  },
}
</script>

<template>
  <div>
    <h1>Sound Library</h1>

    <div style="margin-bottom: 8px">
      <div>
        <el-form ref="form" :model="form" label-width="120px">
          <el-select v-model="form.soundCategory" @change="selectCategory">
            <el-option
              v-for="item in lstCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form>
      </div>
    </div>
    <div class="container">
      <div v-for="sound in lstSounds" :key="sound.id">
        <Sound v-bind:soundId="sound.id" class="sound-card"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex; /* or inline-flex */
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}
.sound-card {
  margin-bottom: 5px;
}
</style>