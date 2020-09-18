<template lang="pug">
div.row
  q-btn(
    v-if="subscribed === false"
    @click="follow()"
    round flat color="green" no-caps icon="rss_feed"
    :loading="loading")
  q-btn(
    v-if="subscribed === true"
    round flat color="red" no-caps icon="rss_feed"
    :loading="loading")
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
      loading: false,
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
      try {
        this.$log('follow start')
        this.loading = true
        let res = await UserApi.subscribe(this.oid)
        await this.$wait(500)
        this.subscribed = await UserApi.isSubscribed(this.oid)
        this.subscribed = true
        this.$log('follow done')
        this.loading = false
      }
      catch (e) {
        this.$log('follow error', e)
        this.loading = false
      }
    },
    async unFollow () {
      try {
        this.$log('unFollow')
        this.loading = false
        let res = await UserApi.unSubscribe(this.oid)
        await this.$wait(500)
        this.subscribed = await UserApi.isSubscribed(this.oid)
        this.subscribed = false
        this.$log('unFollow done')
        this.loading = false
      }
      catch (e) {
        this.$log('unFollow error', e)
        this.loading = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
    // TODO add event animation to PULSE in menu mobile?
    // signs that we subscribed to something...
  }
}
</script>
