<template lang="pug">
.column.fit.bg-white
  //- header with animated height
  div(:style=`{height: headerHeight+'px'}`).row.full-width.items-center.content-center.q-pa-sm
    q-input(v-model="search" standout="bg-grey-3 text-black" placeholder="Search video or paste a video link" @click="searchClick").col
    q-btn(flat no-caps style=`height: 57px` @click="$emit('close')").q-ml-sm Cancel
  //- videos list
  div(v-if="showVideoList").col.scroll.bg-grey-2
    div(
      v-for="n in 100" :key="n"
      style=`height: 70px`
      ).row.full-width.bg-white.q-my-sm
      div(style=`height: 60px; width: 100px`).row.items-center.justify-center.bg-primary
      .col
        .row.fit.items-center
          span YouTube video {{ n }}
</template>

<script>
export default {
  name: 'findYoutube',
  data () {
    return {
      headerHeight: this.$store.state.ui.width,
      search: ''
    }
  },
  methods: {
    searchClick () {
      this.$log('searchClick')
      // TODO: animation with quasar??
      this.headerHeight = 70
    }
  },
  // watch: {},
  computed: {
    showVideoList () {
      // TODO: depends on the platform what to show
      // on cordova we ask permission to see videos from
      return true
    }
  },
  mounted () {
    this.$log('mounted')
    // TODO: it can be aggregator from any source, youtube, vk or device
    // load popular videos of what??? at the beginning
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
