<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    nav-mobile(
      v-if="$q.screen.lt.md"
      :pageId="pageId"
      @pageId="pageIdChange")
  template(v-slot:body)
    .row.full-width.items-start.content-start
      //- header
      .row.full-width.justify-center.b-30
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
            borderRadius: '10px',
          }`).row.full-width.items-center.content-center.b-40
          q-icon(name="hub" color="white" size="30px").q-ml-sm
          .col
          h1.text-white.text-bold {{$t('Graph')}}
          .col
          //- tutorial
          q-btn(
            @click="$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'node_first', useIntro: false, useProfileEditor: false}])"
            round flat color="white" icon="fas fa-info")
      //- body
      div(
        v-if="oid"
        :style=`{
          //- paddingTop: '8px',
          paddingBottom: '200px',
        }`).row.full-width.justify-center.b-30
          div(
            :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
            //- block wrapper
            graph-navigator(:oid="oid" :height="$q.screen.height - 115")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import navMobile from 'src/pages/app/node/nav_mobile.vue'
import graphNavigator from 'src/components/graph/graph_navigator.vue'

export default {
  name: 'pageApp_graph',
  components: {
    navMobile,
    graphNavigator
  },
  props: ['oid'],
  data () {
    return {
      item: null,
    }
  },
  computed: {
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted', this.oid)
  }
}
</script>
