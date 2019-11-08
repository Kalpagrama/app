<template lang="pug">
q-layout(:style=`{width: width+'px', height: height+'px'}`).bg-grey-3
  q-page-container
    div(:style=`{height: '60px'}`).row.full-width.justify-center.bg-grey-3
      div(:style=`{maxWidth: '600px'}`).row.full-width.bg-white
        div(:style=`{height: '60px'}`).row.full-width.items-center.justify-end.q-px-md
          .row.items-center.full-width
            span.text-bold.text-black Подписки
            .col
            q-btn(flat no-caps dense round icon="edit" color="primary" @click="$refs.subs.activeDelete()")
    div(style=`height: calc(100vh-60px)`).row.full-width.justify-center.scroll
      div(:style=`{maxWidth: '600px'}`).row.full-width.items-start.bg-white
        subscriptions(ref="subs")
  q-footer(reveal).lt-sm
    k-menu-horiz
</template>
<script>
import subscriptions from 'pages/app/subscriptions/subscriptions'
export default {
  name: 'pageSubscriptions',
  components: { subscriptions },
  props: [ 'width', 'height' ],
  data () {
    return {
    }
  },
  methods: {
    activeDelete () {
      this.$refs.subs.activeDelete()
    }
  }
}
</script>
<style lang="stylus">
@media (max-width: 400px ) {
  ::-webkit-scrollbar {
  width: 2px !important
  height: 10px !important
  }
  ::-webkit-scrollbar-thumb {
    background: #000
  }
}
</style>
