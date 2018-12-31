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
        file: '',
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
      if(categoryId == '') return

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
    handleFileUpload() {
      this.uploadForm.file = this.$refs.file.files[0]
    },
    submitUpload() {
      // Check for any manually entered sound categories
      try {
        this.uploadForm.categories.forEach(category => {
          let cat = this.lstCategories.find(obj => {
            return obj.id == category
          })
          if (cat == undefined) {
            // I think we need to create a new sound category using cat as the name
            axios
              .post(
                `${settings.orchestrationAPI}/soundCategories`,
                { name: category, parentId: 0 },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              )
              .then(function() {
                console.log('Created new sound category')
                // Replace the sound category name we had with the id
                let idx = this.uploadForm.categories.findIndex(cat2 => {
                  return cat2 == category
                })
                this.uploadForm.categories[idx] = cat
              })
              .catch(function(err) {
                console.log(`Error creating sound category: ${err.message}`)
              })
          }
        })

        let formData = new FormData()
        formData.append('file', this.uploadForm.file)
        formData.append('name', this.uploadForm.name)
        formData.append('description', this.uploadForm.description)
        formData.append('soundCategories', this.uploadForm.categories)
        console.log(JSON.stringify(formData))
        axios
          .post(`${settings.orchestrationAPI}/sounds`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(function() {
            console.log('SUCCESS!!')
          })
          .catch(function(err) {
            console.log(`FAILURE!! ${err.message}`)
          })
        this.dialogVisible = false
      } catch (err) {
        alert(err.message)
        console.log(err.message)
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
      <span>You can upload your own sound files to Airhorn. Sounds must be Waveform Audio File Format (.wav) files.</span>
      <br>
      <div class="upload-form-container">
        <div class="flex-item form-label">Title:</div>
        <div class="flex-item form-field">
          <input type="text" v-model="uploadForm.name" class="form-field">
        </div>
      </div>
      <div class="upload-form-container">
        <div class="flex-item form-label">Description:</div>
        <div class="flex-item form-field">
          <input type="text" v-model="uploadForm.description" class="form-field">
        </div>
      </div>
      <div class="upload-form-container">
        <div class="flex-item form-label">Categories:</div>
        <div class="flex-item form-field">
          <el-select
            v-model="uploadForm.categories"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="Select or enter sound categories"
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
      <div class="upload-form-container">
        <div class="flex-item form-label">Audio File:</div>
        <div class="flex-item form-field">
          <input type="file" id="file" ref="file" accept=".wav" @change="handleFileUpload()" class="form-field">
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">Cancel</el-button>
        <el-button
          style="margin-left: 10px;"
          size="small"
          type="success"
          @click="submitUpload()"
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

.upload-form-container {
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
  justify-content: flex-start;
  margin-top: 10px;
}
.sound-card {
  margin-bottom: 5px;
  margin-right: 10px;
}
</style>