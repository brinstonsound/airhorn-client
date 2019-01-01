<template>
  <div class="flex-grid">
    <div id="copyright">Copyright &copy; 2019 - Brinston Sound Images</div>
  </div>
</template>

<script>
export default {
  name: 'appFooter',
}
</script>

<style scoped>
.flex-grid {
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
  position: fixed;
  bottom: 30px;
  margin-left: 20px;
}
#copyright {
  font-size: 0.8em;
}
</style>