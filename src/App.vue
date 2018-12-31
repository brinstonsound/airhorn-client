<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />-->
    <el-container>
      <el-header class="layout-header-bar">
        <img id="imgLogo" src="./assets/AirhornLogo.png" alt="Airhorn Logo" height="50px">
        <span class="appTitle">Airhorn Audio Environment Controller</span>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <el-menu
            class="el-menu-vertical-demo"
            router
            background-color="#ffffff"
            text-color="#1d35b9"
            active-text-color
          >
            <el-menu-item index="operations">
              <i class="el-icon-service"></i>
              <span>Operations Console</span>
            </el-menu-item>
            <el-menu-item index="environments">
              <i class="el-icon-picture"></i>
              <span>Environments</span>
            </el-menu-item>
            <el-menu-item index="library">
              <i class="el-icon-document"></i>
              <span>Sound Library</span>
            </el-menu-item>
            <el-menu-item index="settings">
              <i class="el-icon-setting"></i>
              <span>Settings</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.layout-header-bar {
  height: 50px;
  color: #1d35b9;
  background: white;
}
.layout-header-bar > img {
  height: 50px;
  margin-left: 10px;
}
.appTitle {
  font-size: 1.5em;
  font-weight: 700;
}
</style>
