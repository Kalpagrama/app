<template lang="pug">
.row.full-width.justify-center
  kalpa-finder(
    @item="itemFound"
    :workspaceFilter="['WS_BOOKMARK']"
    :typesFilter="['VIDEO', 'IMAGE']"
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      height: $q.screen.height+'px',
    }`)
    template(v-slot:header)
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
        .col
          span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-md Выбрать контент
        q-btn(round flat color="white" icon="clear" @click="$router.back()").q-mr-sm
</template>

<script>
export default {
  name: 'wsCreate',
  data () {
    return {
    }
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
