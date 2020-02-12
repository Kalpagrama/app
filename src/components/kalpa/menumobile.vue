<template lang="pug">
.row.full-width
  div(:style=`{height: '60px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`
    ).row.full-width.items-center.content-center.justify-between.q-px-md
    q-dialog(v-model="showDesktop" :maximized="true" position="left")
      .row.fit.justify-start
        kalpa-menu-desktop(:style=`{maxWidth: '80%'}`).bg-grey-10
    //- home
    //- div(:style=`{width: '50px', height: '60px'}` @click="$router.push({name: 'home'})").row
    //-   k-spinner(v-if="$route.name === 'home'" :width="40" :height="40")
    //-   k-logo(v-else :width="40" :height="40")
    //- //- trends
    //- q-btn(round flat icon="whatshot" :color="$route.name === 'trends' ? 'green' : 'white'" @click.stop="$router.push({name: 'trends'})")
    //- //- add fragment
    //- q-btn(round push color="green" size="md" @click.stop="$router.push('/workspace/nodes')")
    //-   //- q-spinner(v-if="$route.name === 'create'" size="20px" color="white")
    //-   q-icon(name="add" color="white")
    //- //- workspace
    //- q-btn(round flat :color="$route.name === 'workspace' ? 'green' : 'white'" @click.stop="$router.push({name: 'workspace'})"
    //-   icon="school")
    //-   //- anvil(:width="26" :height="26" :color="$route.name === 'workspace' ? '#4caf50' : '#fff'")
    //- menu
    q-btn(round flat icon="menu" :color="inMenu ? 'green' : 'white'" @click.stop="showDesktop = !showDesktop")
    .col
</template>

<script>
export default {
  name: 'kalpaMenuMobile',
  data () {
    return {
      debug: false,
      show: true,
      showDesktop: false
    }
  },
  computed: {
    inMenu () {
      if (['home', 'trends', 'create', 'workspace'].includes(this.$route.name)) return false
      else return true
    }
  },
  methods: {
  }
}
</script>
