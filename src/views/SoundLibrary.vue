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
      activeCategory: 0,
      dialogVisible: false,
      uploadForm: {
        name: '',
        description: '',
        categories: [],
      },
    }
  },
  watch: {
    activeCategory: function() {
      this.selectCategory(this.activeCategory)
    },
  },
  methods: {
    async selectCategory(categoryId) {
      // Load all sounds from the selected category
      try {
        let response = {}
        response = await axios.get(
          `${settings.orchestrationAPI}/soundCategories/${categoryId}/sounds`
        )
        this.lstSounds = response.data
        this.lstSounds.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        )
      } catch (e) {
        this.errors.push(e)
      }
    },
    submitUpload() {
      this.$refs.upload.action = `${settings.orchestrationAPI}\\sounds`
      this.$refs.upload.submit()
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
      //this.lstCategories.push({ id: 0, name: '..All Categories' })
      this.lstCategories.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      )
    } catch (e) {
      alert(e)
    }
  },
}
</script>

<template>
  <div>
    <h1>Sound Library</h1>
    <div id="toolbar" class="flex-container">
      <div class="flex-item">
        <el-button type="primary" size="small">
          Search&nbsp;
          <i class="el-icon-search el-icon-right"></i>
        </el-button>
      </div>&nbsp;&nbsp;
      <div class="flex-item">
        <el-button type="primary" size="small" @click="dialogVisible = true">
          Upload&nbsp;
          <i class="el-icon-upload el-icon-right"></i>
        </el-button>
      </div>
    </div>

    <div>
      <el-collapse v-model="activeCategory" accordion>
        <el-collapse-item
          v-for="category in lstCategories"
          v-bind:key="category.id"
          :name="category.id"
          style="margin-top:10px"
        >
          <template slot="title">
            <div class="categoryHeader">
              <span class="categoryTitle">{{category.name}}</span>
              <!-- <i class="header-icon el-icon-info"></i> -->
            </div>
          </template>
          <div class="container">
            <div v-for="sound in lstSounds" :key="sound.id">
              <Sound v-bind:soundId="sound.id" class="sound-card"/>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <el-dialog title="Upload a New Sound" :visible.sync="dialogVisible" width="40%">
      <span>You can upload your own sound files to Airhorn. Sounds must be PCM Waveform files (.wav)</span>
      <br>
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="Title:">
          <el-input type="text" :model="uploadForm.name" placeholder="The title of your sound."></el-input>
        </el-form-item>
        <el-form-item label="Description:">
          <el-input type="text" :model="uploadForm.description" placeholder="A short description"></el-input>
        </el-form-item>
        <el-form-item label="Categories:">
          <el-select v-model="uploadForm.categories" multiple placeholder="Select">
            <el-option
              v-for="category in lstCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-upload ref="upload" action :auto-upload="false" accept=".wav">
          <el-button slot="trigger" size="small" type="primary">select file</el-button>
        </el-upload>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">Cancel</el-button>
        <el-button
          style="margin-left: 10px;"
          size="small"
          type="success"
          @click="submitUpload"
        >Upload to Airhorn Unit</el-button>
      </span>
    </el-dialog>
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
  -webkit-justify-content: flex-end;
  -ms-flex-pack: end;
  justify-content: flex-end;
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
  -webkit-align-self: auto;
  -ms-flex-item-align: auto;
  align-self: auto;
}

.toolbarItem {
  flex: 1;
  margin-right: 10px;
}
.categoryHeader {
  background-color: cornflowerblue;
  border-radius: 5px;
  width: 100%;
}
.categoryTitle {
  font-size: 1.25em;
  font-weight: 700;
  margin-left: 10px;
}
.container {
  display: flex; /* or inline-flex */
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 10px;
}
.sound-card {
  margin-bottom: 5px;
}
</style>