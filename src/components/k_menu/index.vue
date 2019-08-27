<template lang="pug">
.column.window-height.full-width
  //- header
  div(:style=`{height: '60px'}`).row.full-width.items-center
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat color="grey-6" @click="$router.push('/app/home')")
        template(v-slot:default)
          img(:src="`statics/logo.png`" width="40px" height="40px")
    div(v-if="!mini").col
      span(:style=`{fontSize: '18px'}`) Кальпаграмма
  .col.scroll
    div(:style=`{height: '60px'}` @click="$router.push(`/app/user/${$store.state.auth.user.oid}`)").row.full-width.items-center.hr.cursor-pointer
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(v-if="$store.state.auth.user" round flat color="grey-6" @click="$router.push(`/app/user/${$store.state.auth.user.oid}`)")
          q-tooltip {{$store.state.auth.user.name}}
          template(v-slot:default)
            img(:src="$store.state.auth.user.thumbUrl[0]" width="36px" height="36px" :style=`{borderRadius: '50%'}`)
      div(v-if="!mini").col
        span(v-if="$store.state.auth.user") {{$store.state.auth.user.name}}
    div(:style=`{height: '60px'}` @click="$router.push(`/app/create/node`)").row.full-width.items-center.hr.cursor-pointer
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(icon="add" round flat color="grey-9")
          q-tooltip Создать ядро
      div(v-if="!mini").col
        span Создать ядро
    //- refresh
    div(:style=`{height: '60px'}` @click="refresh").row.full-width.items-center.hr.cursor-pointer
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round flat icon="refresh" color="grey-9")
          q-tooltip Обновить
      div(v-if="!mini").col
        span {{$t('Обновить')}}
    //- logout
    div(:style=`{height: '60px'}` @click="logout").row.full-width.items-center.hr.cursor-pointer
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round flat icon="power_off" color="grey-9")
          q-tooltip Выйти
      div(v-if="!mini").col
        span {{$t('Выйти')}}
    .row.full-width.justify-start
      div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
        small.text-grey-6 0.0.9
</template>

<script>
export default {
  name: 'kMenu',
  props: ['mini'],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    userClick () {
      this.$log('userClick')
    },
    settingClick (s) {
      this.$log('settingClick', s)
      this.$set(this, 'setting', s)
    },
    menuItemClick (m, mi) {
      this.$log('menuItemClick', m, mi)
      this.$router.push(m.id)
    },
    refresh () {
      this.$log('refresh')
      window.location.reload(true)
    },
    async logout () {
      this.$log('logout')
      await this.$apollo.query({
        query: gql`
          query logout {
            logout
          }
        `
      })
      this.$router.push('/login')
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
