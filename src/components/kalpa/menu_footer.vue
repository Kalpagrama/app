<template lang="pug">
q-footer(v-if="$q.screen.width < 1300")
  .row.full-width.justify-center
    div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius: '10px 10px 0 0'}`
      ).row.full-width.items-center.content-center.bg-grey-8.q-px-sm
      q-btn(round flat color="grey-5" icon="menu")
        q-menu(anchor="top left" self="bottom left" :offset="[0, 20]")
          div(:style=`{width: $q.screen.width-19+'px', borderRadius: '10px', overflow: 'hidden'}`).row.bg-grey-9
            kalpa-menu
      .col
        .row.fit.items-center.content-center.justify-center
          q-btn(
            round push color="green" icon="add"
            :style=`{borderRadius: '50%'}`)
      q-btn(round flat color="grey-4" icon="more_vert")
        q-menu(anchor="top left" self="bottom left" :offset="[0, 20]")
          div(:style=`{width: $q.screen.width-19+'px', borderRadius: '10px', overflow: 'hidden'}`).row.bg-grey-8
            slot(name="menuRight")
</template>

<script>
export default {
  name: 'kalpaMenuFooter',
  props: []
}
</script>
