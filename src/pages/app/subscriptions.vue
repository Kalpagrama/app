<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      .row.full-width.items-center.q-px-md.q-pb-sm.q-pt-md
        span(:style=`{fontSize: '19px',}`).text-bold.text-white {{ $t('pageApp_subscriptions_title', 'Подписки') }}
  //- body
  .col.full-width
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
