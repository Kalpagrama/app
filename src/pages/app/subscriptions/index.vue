<template lang="pug">
q-layout(:container="true" :style=`{height: height+'px', width: width+'px'}`).bg-grey-2
  q-header(reveal)
    div(:style=`{height: '60px'}`).row.full-width.justify-center.bg-white
      div(:style=`{maxWidth: '600px'}`).row.full-width.bg-white
        div(:style=`{height: '60px'}`).row.full-width
          .col.full-height
            .row.fit.items-center.q-px-md
              span.text-bold.text-black Подписки
          div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
            q-btn(flat no-caps dense round icon="edit" color="primary" @click="$refs.myComponent.activeDelete()")
          //- div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          //-   q-btn(round dense flat color="primary" icon="clear" @click="$emit('hide')")
  q-page-container
    .row.full-width.justify-center
      div(:style=`{maxWidth: '600px'}`).row.full-width.items-start
        subscriptions(ref="myComponent")
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
  mathods: {
    activeDelete () {
      this.$refs.myComponent.activeDelete()
    }
  }
}
</script>

<style lang="stylus">
.q-footer
  background: none !important
</style>
