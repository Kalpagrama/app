<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.b-30
        div(
          :style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between.q-px-md
          span(:style=`{fontSize: '19px'}`).text-white.text-bold {{ $t('pageApp_subscriptions_title', 'Подписки') }}
  q-page-container
    q-page(style="padding-top: 0px")
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px', paddingBottom: '1000px',}`).row.full-width.items-start.content-start.q-px-sm
          user-subscriptions()
</template>

<script>
import userSubscriptions from 'components/user_subscriptions/index.vue'

export default {
  name: 'pageApp_subscriptions',
  components: {userSubscriptions},
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
