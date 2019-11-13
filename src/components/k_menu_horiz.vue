<template lang="pug">
div(:style=`{borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).row.full-width.q-px-sm.bg-primary
  div(:style=`{height: '60px', overflow: 'hidden', borderRadius: '20px 20px 0 0'}`
    ).row.full-width.items-center.content-center.justify-between.q-px-xs
    q-btn(round flat icon="blur_on" :color="$route.path === '/app/home' ? 'green' : 'white'" @click.stop="pageClick('/app/home')")
    q-btn(round flat icon="whatshot" :color="$route.path.split('/')[2] === 'hot' ? 'green' : 'white'" @click.stop="pageClick('/app/hot')")
    q-btn(round push icon="add" color="green" size="md" @click.stop="pageCreate()")
    q-btn(round flat icon="img:statics/icons/anvil.svg" :color="$route.path === '/app/workspace' ? 'green' : 'white'" @click.stop="pageClick('/app/workspace')")
    q-btn(round flat icon="menu" :color="$route.path === '/app/menu' ? 'green' : 'white'" @click.stop="pageClick('/app/menu')")
</template>

<script>
export default {
  name: 'kMenuHoriz',
  data () {
    return {
    }
  },
  methods: {
    pageCreate () {
      this.$log('pageCreate')
    },
    pageClick (path) {
      try {
        this.$log('pageClick start')
        this.$store.commit('ui/stateSet', ['page', path])
        this.$router.push(path)
        this.$log('pageClick done')
      } catch (e) {
        this.$log('pageClick error', e)
      }
    }
  }
}
</script>
