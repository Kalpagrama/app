<template lang="pug">
q-layout(:style=`{width: width+'px', height: height+'px'}`).bg-grey-3.q-pt-sm
  .row.full-width.justify-center
    div(:style=`{width: '600px', overflow: 'hidden', borderRadius: '10px'}`)
      subscriptions
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
