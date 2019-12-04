<template lang="pug">
div(:style=`{height: '60px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`
  ).row.full-width.items-center.content-center.justify-between.bg-primary.q-px-md
  div(:style=`{width: '50px', height: '60px'}` @click="$go({name: 'home'})").row
    k-spinner(v-if="$route.name === 'home'" :width="40" :height="40")
    k-logo(v-else :width="40" :height="40")
  q-btn(round flat icon="whatshot" :color="$route.name === 'trends' ? 'accent' : 'white'" @click.stop="$go({name: 'trends'})")
  q-btn(round push icon="add" color="accent" size="md" @click.stop="$go({name: 'create'})")
  q-btn(round flat :color="$route.name === 'workspace' ? '#789dff' : '#fff'" @click.stop="$go({name: 'workspace'})")
    anvil(:width="26" :height="26" :color="$route.name === 'workspace' ? '#789dff' : '#fff'")
  q-btn(round flat icon="menu" :color="inMenu ? 'accent' : 'white'" @click.stop="$go({name: 'menu'})")
</template>

<script>
export default {
  name: 'kMenuMobile',
  data () {
    return {
      debug: false,
      show: true
    }
  },
  computed: {
    inMenu () {
      if (['home', 'trends', 'create', 'workspace'].includes(this.$route.name)) return false
      else return true
    }
  },
  methods: {
    menuToggle () {
      this.show = true
      setTimeout(() => {
        this.show = false
      }, 2000)
    }
  }
}
</script>
