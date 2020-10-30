<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', borderRadius: '10px 10px 0 0'}`
    ).row.full-width.items-center.content-center.justify-between.q-pt-sm.b-40.q-pb-xs
    div(@click="$router.back()").col
      .row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat dense color="white" icon="keyboard_arrow_left")
        .row.full-width.justify-center
          small.text-grey-6 Назад
    router-link(:to="{name: 'feeds'}").col
      .row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat dense icon="explore"
          :color="$route.name.split('.')[0] === 'feeds' ? 'green' : 'grey-4'")
        .row.full-width.justify-center
          small.text-grey-6 Новое
    router-link(:to="'/workspace/node/new'").col
      .row.full-height.items-center.content-center.justify-center
        q-btn(
          round dense color="green" icon="add"
          :style=`{borderRadius: '50%'}`)
        .row.full-width.justify-center
          small.text-grey-6 Создать
    router-link(:to="{name: 'workspace'}").col
      .row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat dense icon="school"
          :color="$route.name.split('.')[0] === 'workspace' ? 'green' : 'grey-4'")
        .row.full-width.justify-center
          small.text-grey-6 Мастерская
    div(@click="$store.commit('ui/stateSet', ['appShowMenu', !$store.state.ui.appShowMenu])").col
      .row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat dense icon="menu"
          :color="$store.state.ui.appShowMenu ? 'green' : 'white'")
        .row.full-width.justify-center
          small.text-grey-6 Меню
</template>

<script>
export default {
  name: 'kalpaMenuMobile',
  data () {
    return {
    }
  }
}
</script>
