<template lang="pug">
div.row
  q-btn(
    v-if="subscribed === false"
    @click="follow()"
    round outline color="green" no-caps icon="rss_feed")
    //- {{ $t('follow', 'Подписаться') }}
  q-btn(
    v-if="subscribed === true"
    outline color="grey-7" no-caps) {{ $t('unfollow', 'Отписаться') }}
    q-menu(
      ref="userUnfollowMenu"
      dark anchor="bottom right" self="top right")
      div(
        :style=`{
          maxWidth: '240px',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.b-50.q-pa-md
        .row.full-width.q-pb-md
          span.text-white {{$t('Unfollow? You no longer see updates.', 'Отписаться?')}}
        .row.full-width
          q-btn(
            @click="$refs.userUnfollowMenu.hide()"
            flat no-caps).b-60 {{$t('cancel', 'Отмена')}}
          .col
          q-btn(
            @click="unFollow()"
            color="red" no-caps) {{ $t('Unfollow', 'Отписаться') }}
</template>

<script>
import { UserApi } from 'src/api/user'

export default {
  name: 'kalpaFollow',
  props: ['oid'],
  data () {
    return {
      subscribed: false,
    }
  },
  watch: {
    oid: {
      immediate: true,
      async handler (to, from) {
        this.$log('oid TO', to)
        if (to) this.subscribed = await UserApi.isSubscribed(to)
      }
    }
  },
  methods: {
    async follow () {
      this.$log('follow')
      let res = await UserApi.subscribe(this.oid)
      // await this.$wait(300)
      this.subscribed = await UserApi.isSubscribed(this.oid)
    },
    async unFollow () {
      this.$log('unFollow')
      let res = await UserApi.unSubscribe(this.oid)
      // await this.$wait(300)
      this.subscribed = await UserApi.isSubscribed(this.oid)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
