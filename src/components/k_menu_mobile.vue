<template lang="pug">
div(:style=`{minHeight: '60px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`
  ).row.full-width.items-center.content-center.justify-between.bg-primary.q-px-md
  div(:style=`{width: '40px', height: '40px'}` @click="$router.push({name: 'home'})").row
    k-spinner(v-if="$route.name === 'home'" :width="40" :height="40")
    k-logo(v-else :width="40" :height="40")
  q-btn(round flat icon="whatshot" :color="$route.name === 'trends' ? 'accent' : 'white'" @click.stop="$router.push({name: 'trends'})")
  q-btn(round push icon="add" color="accent" size="md" @click.stop="$router.push({name: 'create'})")
  q-btn(round flat :color="$route.name === 'workspace' ? '#789dff' : '#fff'" @click.stop="$router.push({name: 'workspace'})")
    anvil(:width="26" :height="26" :color="$route.name === 'workspace' ? '#789dff' : '#fff'")
  q-btn(round flat icon="menu" :color="inMenu ? 'accent' : 'white'" @click.stop="$router.push({name: 'menu'})")
  //- debug
  div(v-if="debug").row.full-width.bg-red
    small $route.name: {{$route.name}}
</template>

<script>
export default {
  name: 'kMenuMobile',
  data () {
    return {
      debug: false
    }
  },
  computed: {
    inMenu () {
      if (['home', 'trends', 'create', 'workspace'].includes(this.$route.name)) return false
      else return true
    }
  }
}
</script>
