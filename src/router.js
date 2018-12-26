import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    },
    {
      path: "/operations",
      name: "operations",
      component: () =>
        import(/* webpackChunkName: "operations" */ "./views/Operations.vue")
    },
    {
      path: "/environments",
      name: "environments",
      component: () =>
        import(/* webpackChunkName: "environments" */ "./views/Environments.vue")
    },
    {
      path: "/library",
      name: "library",
      component: () =>
        import(/* webpackChunkName: "library" */ "./views/SoundLibrary.vue")
    }
  ]
});
