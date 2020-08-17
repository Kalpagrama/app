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
      .row.full-width.items-center.q-px-md.q-py-xs
        span(:style=`{fontSize: '20px',}`).text-bold.text-white {{$t('pageApp_subscriptions_title', 'Подписки')}}
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      //- no subs
      div(
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.items-center.content-center.justify-center.q-pa-xl.b-60
        span.text-white No subs :(
</template>

<script>
export default {
  name: 'pageApp_subscriptions',
  data () {
    return {
    }
  }
}
</script>
