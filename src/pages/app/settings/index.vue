<template lang="pug">
.row.fit.justify-center
  div(style=`maxWidth: 1130px`).row.fit.justify-start.q-px-md.br
    //- left meny
    slot(name="menu")
    //- body
    .col.full-height.q-pa-md
      div(style=`borderRadius: 8px 8px 8px 8px`).col.full-height.bg-white
        router-view(@menu="menuShow = !menuShow")
          template(v-slot:header)
            div(style=`height: 60px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
              .col
                div(v-if="menuItem").row.fit.items-center.q-px-md
                  span {{menuItem.name}}
    //- right menu
    div(style=`width: 180px`).row.full-height.q-py-md
      div(style=`width: 180px; borderRadius: 8px; overflow: hidden`
        ).column.full-height.bg-white
        div(style=`height: 60px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
          q-icon(name="settings" size="24px" color="grey").q-mr-sm
          span Настройки
        .col.scroll
          div(v-for="(m, mi) in menuItems" :key="m.id" @click="menuItemClick(m, mi)"
            :style=`{
              height: '35px',
              background: menuItem.id === m.id ? '#eee' : 'none',
              borderLeft: menuItem.id === m.id ? '2px solid #027BE3' : 'none'
              }`
            ).row.full-width.items-center.q-px-sm.cursor-pointer.hr
            span {{ m.name }}
</template>

<script>
import kMenu from 'pages/app/menu'

export default {
  name: 'pageApp__Settings',
  components: {kMenu},
  data () {
    return {
      menuShow: false,
      menuItems: [
        {id: 'general', name: 'Основные'},
        {id: 'security', name: 'Безопасность'},
        {id: 'privacy', name: 'Приватность'},
        {id: 'notifications', name: 'Уведомления'},
        {id: 'payments', name: 'Плетежи и подписки'}
      ],
      menuItem: null
    }
  },
  methods: {
    menuItemClick (m, mi) {
      this.$log('menuItemClick', m, mi)
      this.$router.push({name: m.id})
    }
  },
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
        // if (this.$q.screen.width >= 600) this.menuShow = true
        if (to.matched[2]) {
          this.$set(this, 'menuItem', this.menuItems.find(i => i.id === to.matched[2].name))
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
