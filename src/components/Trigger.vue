<script>
const settings = require('../appSettings')
import axios from 'axios'
export default {
  name: 'trigger',
  props: {
    triggerId: {
      type: Number
    },
  },
  data() {
    return {
      trigger: {},
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
  <div>{{trigger.name}}</div>
</template>

<style scoped>

</style>