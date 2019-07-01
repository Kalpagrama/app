<template lang="pug">
.column.fit.bg-white
  //- body
  .col.scroll
    div(v-for="(m, mi) in menus" :key="m.id" v-if="menu && !m.hidden" @click="menuItemClick(m, mi)"
      :style=`{height: '40px', background: m.id === menu.id ? '#eee' : 'none'}`
        ).row.full-width.items-center.hr.cursor-pointer
      div(style=`height: 40px; width: 40px`).row.items-center.justify-center
        q-icon(:name="m.icon" size="24px" color="grey")
        q-tooltip {{ m.name }}
      span(v-if="!mini") {{ m.name }}
    //- refresh
    div(@click="refresh").row.full-width.items-center.hr.cursor-pointer
      div(style=`height: 40px; width: 40px`).row.items-center.justify-center
        q-icon(name="refresh" size="24px" color="grey")
        q-tooltip Обновить кэш
      span(v-if="!mini") Обновить кэш
    //- logout
    div(@click="logout").row.full-width.items-center.hr.cursor-pointer
      div(style=`height: 40px; width: 40px`).row.items-center.justify-center
        q-icon(name="power_off" size="24px" color="grey")
        q-tooltip Выйти
      span(v-if="!mini") Выйти
  //- mini
  div(@click="$emit('mini')" style=`height: 40px; borderTop: 1px solid #eee`
    ).row.full-width.items-center.hr.cursor-pointer
    div(style=`height: 40px; width: 40px`).row.items-center.justify-center
      q-icon(:name="mini ? 'keyboard_arrow_right' : 'keyboard_arrow_left'" size="24px" color="grey")
      q-tooltip {{mini ? 'Развернуть' : 'Свернуть' }}
    span(v-if="!mini") Свернуть
</template>

<script>
export default {
  name: 'pageApp__Menu',
  props: {
    mini: {
      type: Boolean
    }
  },
  data () {
    return {
      menu: null,
      menus: [
        {id: 'home', name: 'Домашняя', icon: 'home', hidden: false},
        {id: 'node', name: 'Ядро', icon: 'menu', hidden: true},
        {id: 'sphere', name: 'Сферы', icon: 'blur_circular', hidden: false},
        {id: 'workspace', name: 'Мастерская', icon: 'cloud_queue', hidden: false},
        {id: 'settings', name: 'Настройки', icon: 'settings', hidden: false},
        {id: 'create', name: 'Создать', icon: 'add', hidden: false}
      ]
    }
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
      this.$router.push('/app/' + m.id)
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
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to.matched)
        if (to.matched[1]) {
          this.$set(this, 'menu', this.menus.find(i => i.id === to.matched[1].name))
        }
      }
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
