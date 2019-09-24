<template lang="pug">
.row.full-width.q-px-sm
  div(:style=`{height: '60px', overflow: 'hidden', borderRadius: '20px 20px 0 0'}`).row.full-width.items-center.justify-between.q-px-md.q-mx-md
    //- home
    //- q-btn(round flat color="grey-6" :style=`{overflow: 'hidden', borderRadius: '50%', width: '40px', height: '40px', border: $route.path === '/app/home' ? '1px solid #027BE3' : 'none'}`
    //-   @click="menuClick('/app/home')")
    //-   template(v-slot:default)
    //-     img(:src="`statics/logo.png`" width="40px" height="40px")
    q-btn(round flat icon="blur_on" :color="$route.path === '/app/home' ? 'white' : 'grey-3'" @click="menuClick('/app/home')")
    //- hot
    q-btn(round flat icon="whatshot" :color="$route.path === '/app/hot' ? 'white' : 'grey-3'" @click="menuClick('/app/hot')")
    //- add
    q-btn(round flat icon="add" :color="$route.path === '/app/create' ? 'white' : 'grey-3'" @click="menuClick('/app/create')")
    //- workspace
    q-btn(round flat icon="cloud_queue" :color="$route.path === '/app/workspace' ? 'white' : 'grey-3'" @click="menuClick('/app/workspace')")
    //- user
    q-btn(round flat icon="menu" :color="$route.path === '/app/menu' ? 'white' : 'grey-3'" @click="menuClick('/app/user')")
    //- q-btn(round flat color="grey-6" :style=`{overflow: 'hidden', borderRadius: '50%', width: '40px', height: '40px', border: $route.name === 'user' ? '1px solid #027BE3' : 'none'}` @click="menuClick('/app/user')")
    //-   template(v-slot:default)
    //-     img(v-if="$store.state.auth.user" :src="$store.state.auth.user.thumbUrl[0]" style=`width: 42px; height: 42px`)
</template>

<script>
export default {
  name: 'kMenuHoriz',
  data () {
    return {
      pages: {
        'home': {name: 'Home', path: '/app/home'},
        'hot': {name: 'Hot', path: '/app/hot'},
        'create': {name: 'Create', path: '/app/create'},
        'workspace': {name: 'Workspace', path: '/app/workspace'},
        'user': {name: 'User', path: '/app/user'}
      }
    }
  },
  methods: {
    menuClick (path) {
      this.$log('menuClick')
      this.$router.push(path)
      this.$root.$emit('path', path)
    }
  }
}
</script>
