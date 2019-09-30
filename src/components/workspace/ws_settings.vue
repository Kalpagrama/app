<template lang="pug">
div(:style=`{maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- header
  div(:style=`{minHeight: '70px'}`).row.full-width.items-center.q-py-sm
    //- menu
    div(:style=`{width: '70px'}`).row.full-height.items-center
      q-btn(icon="menu" round flat color="primary" @click="$emit('menu')").q-mx-sm
    //- name
    .col.full-height
      .row.fit.items-center.content-center.justify-center
        span.text-bold Настройки
    //- right action
    div(:style=`{width: '70px'}`).row.full-height
      //- q-btn(round flat icon="")
  //- body
  div(body-scroll-lock-ignore).col.scroll
    .row.full-width.items-start.content-start.q-px-sm
      div(:style=`{height: '200px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.justify-center.bg-grey-2
        span settings
      .row.full-width.q-py-sm
        q-btn(outline color="red" no-caps @click="wsClear()"
          style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
          span Очистить мастерскую
</template>

<script>
export default {
  name: 'wsSettings',
  data () {
    return {
    }
  },
  methods: {
    wsClear () {
      this.$log('wsClear')
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
