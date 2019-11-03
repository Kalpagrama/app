<template lang="pug">
div(:style=`{}`).column.fit.bg-grey-2
  .col
    q-item(clickble v-ripple :to="`/app/user`" :style=`{height: '70px'}` @click="pageClick('/app/user')").row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        img(@click="$router.push(`/app/user/${$store.state.auth.user.oid}`)"
          :src="$store.state.auth.user ? $store.state.auth.user.thumbUrl : ''" style=`width: 40px; height: 40px; borderRadius: 50%; overflow: hidden`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400;`) {{ $store.state.auth.user ? $store.state.auth.user.name : ''}}
    q-item(clickble :to="`/app/hot`" @click="pageClick('/app/hot')"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="whatshot" color="primary" style=`fontSize: 30px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) В тренде
    q-item(clickble :to="`/app/create`" @click="pageClick('/app/create')"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="add" color="primary" style=`fontSize: 30px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) Создать ядро
    q-item(clickble :to="`/`" @click="pageClick('/')"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="subscriptions" color="primary" style=`fontSize: 30px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) Подписки
    q-item(clickble :to="`/`" @click="pageClick('/')"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="notifications" color="primary" style=`fontSize: 30px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) Уведомления
    q-item(clickble :to="`/`" @click="pageClick('/')"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="insert_invitation" color="primary" style=`fontSize: 30px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) Пригласить друга
    q-item(clickble :to="`/`" @click="pageClick('/')"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="settings" color="primary" style=`fontSize: 30px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) Настройки
</template>
<script>
export default {
  name: 'menumobile',
  components: {},
  data () {
    return {
    }
  },
  methods: {
    async pageClick (path) {
      this.$log('pageClick', path)
      this.$root.$emit('toggle_menu')
      await this.$wait(200)
      this.$router.push(path)
    },
    async logout () {
      this.$log('logout')
    }
  }
}
</script>
