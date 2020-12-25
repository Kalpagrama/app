<style lang="sass">
a
  color: rgb(76,175,79)
  font-weight: bold
</style>

<template lang="pug">
  q-layout(view="lHh lpR lFf")
    q-drawer(
      v-model="docsDrawerOpened"
      behavior="mobile"
      side="right")
      div(
        :style=`{
        borderRadius: '10px 0 0 10px'
      }`
      ).column.full-width.window-height.b-30
        div(:style=`{height: '60px',}`).row.full-width.items-center.content-center.q-pa-md
          span(:style=`{fontSize: '20px',}`).text-white.text-bold Оглавление
        .col.full-width.scroll
          .row.full-width.items-start.content-start.q-pa-sm
            router-link(
              v-for="(d,di) in docs" :key="di"
              :to="'/docs/'+d.id"
              :style=`{
              minHeight: '40px',
            }`
            ).row.full-width.q-pa-sm.q-mb-sm
              span.text-white {{ d.name }}
    q-header(reveal).b-30
      .row.full-width.justify-center.q-pt-sm.q-px-sm
        div(
          :style=`{maxWidth: '700px', height: '60px',borderRadius: '10px',}`
        ).row.full-width.items-center.content-center.b-40.q-px-sm
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
          .col
            span(:style=`{fontSize: '20px'}`).text-bold Документы
          q-btn(
            @click="docsDrawerOpened = true"
            round flat color="white" icon="list")
    player-book(epub-url='/other/22606412.epub' theme='night').row.full-width.justify-center
</template>

<script>
import playerBook from 'src/components/content_player/player_book'
export default {
  name: 'BookReader',
  components: {
    playerBook
  }
}
</script>
