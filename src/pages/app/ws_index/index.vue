<template lang="pug">
.row.full-width.justify-center
  kalpa-finder(
    @contentKalpa="contentKalpaFound"
    :pagesShow="true"
    :pages=`{
      content: {views: ['image', 'video']},
      workspace: {views: ['image', 'video', 'node', 'user', 'sphere']},
    }`
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      height: $q.screen.height+'px',
    }`).b-30
    template(v-slot:header)
      .row.full-width.q-py-sm
        div(
          :style=`{
            minHeight: '60px',
            borderRadius: '10px', overflow: 'hidden',
          }`).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-icon(name="bookmark_outline" color="white" size="30px").q-ml-sm
          .col.q-px-sm
            span(
              :style=`{fontSize: '18px'}`
              ).text-white.text-bold Закладки
</template>

<script>
export default {
  name: 'wsCreate',
  components: {
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
  }
}
</script>
