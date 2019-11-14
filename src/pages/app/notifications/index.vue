<template lang="pug">
q-layout(:style=`{width: width+'px', height: height+'px'}`).bg-grey-3.q-pt-sm
  .row.full-width.justify-center
    div(:style=`{width: '600px', overflow: 'hidden', borderRadius: '10px'}`)
      notifications
  q-footer(reveal).lt-sm
    k-menu-horiz
</template>

<script>
import notifications from 'pages/app/notifications/notifications'
export default {
  name: 'pageApp__Notifications',
  components: { notifications },
  props: [ 'width', 'height' ],
  data () {
    return {
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
