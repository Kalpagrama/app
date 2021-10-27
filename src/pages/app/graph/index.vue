<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
      template(v-slot:left-button)
        nav-mobile(
          :pageId="pageId"
           @pageId="pageIdChange")
      template(v-slot:center)
        .row.content-center
          span.text-grey-7 {{$t('Graph view', 'Граф связей')}}
  template(v-slot:body)
    .row.full-width.items-start.content-start
      //- header
      div(v-if="!$q.screen.lt.md").row.full-width.justify-center.b-30.q-pa-sm
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
            borderRadius: '10px',
          }`).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-btn(@click="$routerKalpa.back()" flat round color="white" icon="west" no-caps)
          .col
          h1.text-white.text-bold {{$t('Graph view')}}
          .col
          //- tutorial
          q-btn(
            @click=""
            round flat color="white" icon="fas fa-info" :style=`{opacity:'0'}`)
          //q-btn(
          //  @click="$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'node_first', useIntro: false, useProfileEditor: false}])"
          //  round flat color="white" icon="fas fa-info")
      //- body
      div(
        v-if="oid"
        :style=`{
          //- paddingTop: '8px',
          paddingBottom: '50px',
        }`).row.full-width.justify-center.b-30
          div(
            :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
            //- block wrapper
            graph-navigator(:oid="oid" :height="$q.screen.height - 115")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import graphNavigator from 'src/components/graph/graph_navigator.vue'
import navMobile from 'src/components/kalpa_menu_mobile/nav_mobile.vue'

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
