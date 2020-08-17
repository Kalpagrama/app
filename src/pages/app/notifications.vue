<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- navigation
  q-btn(
    @click="$store.commit('ui/stateSet', ['appShowMenu', true])"
    round flat color="white" icon="menu"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '24px', right: '24px',}`)
  q-btn(
    @click="$router.back()"
    round flat color="white" icon="keyboard_arrow_left"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '24px', left: '24px',}`)
  //- header
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      .row.full-width.q-px-md.q-py-xs
        span(:style=`{fontSize: '20px',}`).text-bold.text-white {{$t('pageApp_notifications_title', 'Уведомления')}}
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      div(
        v-for="(n,ni) in 100" :key="ni"
        :style=`{
          position: 'relative',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.items-center.content-center.q-px-md.q-py-md.b-60.q-mb-xs
        span.text-white Notification {{ ni }}
</template>

<script>
export default {
  name: 'pageApp_notifications',
}
</script>
