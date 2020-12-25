<template lang="pug">
//- memer()
//- .row.full-width.justify-center
kalpa-finder(
  @contentKalpa="contentKalpaFound"
  :pages=`{
    workspace: {views: ['image', 'video', 'node', 'user', 'sphere']},
    kalpagrama: {views: ['all', 'users', 'nodes']},
    gif: {views: ['all']},
    web: {views: ['all', 'image', 'video',]}
  }`
  :style=`{
    //- maxWidth: $store.state.ui.pageWidth+'px',
    height: $q.screen.height+'px',
  }`).b-30
  template(v-slot:header)
    .row.full-width.justify-center.q-py-sm
      div(
        :style=`{
          height: '60px',
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.b-40
        q-btn(round flat color="white" icon="west" @click="$router.back()").q-mr-sm
        .col
          span(:style=`{fontSize: '18px'}`).text-white.text-bold Выбрать контент
</template>

<script>
export default {
  name: 'wsCreate',
  components: {
    memer: () => import('./memer.vue'),
    kalpaFinder: () => import('components/kalpa_finder/index.vue'),
  },
  data () {
    return {
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      this.contentKalpaFound(item)
    },
    contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      this.$router.replace('/content/' + contentKalpa.oid)
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
  }
}
</script>
