<template lang="pug">
div(:style=`{height: '60px', overflow: 'hidden'}`
  ).row.full-width.items-center.content-center.justify-between.q-px-sm.bg-primary
  q-btn(round flat icon="blur_on" :color="$route.path === '/app/home' ? 'accent' : 'white'" @click.stop="pageClick('/app/home')")
  q-btn(round flat icon="whatshot" :color="$route.path.split('/')[2] === 'hot' ? 'accent' : 'white'" @click.stop="pageClick('/app/hot')")
  q-btn(round push icon="add" color="accent" size="md" @click.stop="pageClick('/app/create')")
  q-btn(round flat icon="img:statics/icons/anvil.svg" :color="$route.path === '/app/workspace' ? 'accent' : 'white'" @click.stop="pageClick('/app/workspace')")
  q-btn(round flat icon="menu" :color="inMenu" @click.stop="pageClick('/app/menu')")
</template>

<script>
export default {
  name: 'kMenuMobile',
  data () {
    return {
    }
  },
  computed: {
    inMenu () {
      let arr = ['/app/home', '/app/hot', '/app/create', '/app/workspace']
      let p = this.$route.path
      if (arr.includes(p)) return 'white'
      else return 'green'
    }
  },
  methods: {
    pageCreate () {
      this.$log('pageCreate')
    },
    pageClick (path) {
      try {
        this.$log('pageClick start', path)
        // this.$store.commit('ui/stateSet', ['page', path])
        // this.$router.push(path)
        switch (path) {
          case '/app/create': {
            this.$log('/app/create GOGOGOG')
            this.$store.commit('ui/stateSet', ['nodeCreatorDialogOpened', true])
            break
          }
          default: {
            this.$router.push(path)
          }
        }
        this.$log('pageClick done')
      } catch (e) {
        this.$log('pageClick error', e)
      }
    }
  }
}
</script>
