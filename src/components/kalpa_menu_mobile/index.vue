<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', borderRadius: '10px 10px 0 0'}`
    ).row.full-width.items-center.content-center.justify-between.q-px-sm.q-pt-sm.b-40.q-pb-xs
    .row.full-height.items-center.content-center.justify-center
      q-btn(
        @click="$router.back()"
        round flat dense color="white" icon="keyboard_arrow_left")
      .row.full-width.justify-center
        small.text-grey-6 Back
    .row.full-height.items-center.content-center.justify-center
      q-btn(
        :to="{name: 'home'}"
        round flat dense icon="rss_feed"
        :color="$route.name.split('.')[0] === 'home' ? 'green' : 'grey-4'")
      .row.full-width.justify-center
        small.text-grey-6 Feeds
    //- router-link(
      v-if="$store.getters.currentUser()"
      :to="'/user/'+$store.getters.currentUser().oid"
      :style=`{
        border: $route.name.split('.')[0] === 'user' ? '3px solid #4caf50' : 'none',
        borderRadius: '50%', overflow: 'hidden',
      }`)
      user-avatar(:url="$store.getters.currentUser().profile.photoUrl" :width="25" :height="25")
    .row.full-height.items-center.content-center.justify-center
      q-btn(
        :to="'/workspace/node/new'"
        round dense color="green" icon="add"
        :style=`{borderRadius: '50%'}`)
      .row.full-width.justify-center
        small.text-grey-6 Create
    .row.full-height.items-center.content-center.justify-center
      q-btn(
        :to="{name: 'workspace'}"
        round flat dense icon="school"
        :color="$route.name.split('.')[0] === 'workspace' ? 'green' : 'grey-4'")
      .row.full-width.justify-center
        small.text-grey-6 Workspace
    .row.full-height.items-center.content-center.justify-center
      q-btn(
        @click="$store.commit('ui/stateSet', ['appShowMenu', !$store.state.ui.appShowMenu])"
        round flat dense color='white' icon="menu")
      .row.full-width.justify-center
        small.text-grey-6 Menu
</template>

<script>
export default {
  name: 'kalpaMenuMobile',
  data () {

  }
}
</script>
