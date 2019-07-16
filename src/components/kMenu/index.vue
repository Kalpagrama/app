<template lang="pug">
.column.fit
  div(style=`height: 60px; borderBottom: 1px solid #eee`
    ).row.full-width.items-center.content-center.q-px-sm
    div(style=`height: 35px; width: 35px; borderRadius: 50%`).row.items-center.justify-center.bg-primary
      q-icon(name="vertical_align_center" size="20px" color="white")
    .col
      span.q-mx-md kalpa
  //- div(style=`height: 60px; borderBottom: 1px solid #eee`
  //-   ).row.full-width.items-center.bg-white.q-px-sm
  //-   div(style=`height: 35px; width: 35px; borderRadius: 50%`).row.items-center.justify-center.bg-grey-3
  //-     q-icon(name="face" size="20px" color="primary")
  //-   .col.q-px-md
  //-     span {{ $store.state.auth.user.name | cut(40) }}
  //- body
  .col.scroll
    div(v-for="(m, mi) in getPages" :key="m.id" @click="menuItemClick(m, mi)"
      :style=`{height: '40px'}`
        ).row.full-width.items-center.hr.cursor-pointer
      div(style=`height: 40px; width: 50px`).row.items-center.justify-center
        q-icon(:name="m.icon" size="24px" color="grey")
        q-tooltip {{ m.name }}
      span {{ m.name }}
    //- refresh
    div(@click="refresh").row.full-width.items-center.hr.cursor-pointer
      div(style=`height: 40px; width: 50px`).row.items-center.justify-center
        q-icon(name="refresh" size="24px" color="grey")
        q-tooltip {{$t('clear_cache')}}
      span {{$t('clear_cache')}}
    //- logout
    div(@click="logout").row.full-width.items-center.hr.cursor-pointer
      div(style=`height: 40px; width: 50px`).row.items-center.justify-center
        q-icon(name="power_off" size="24px" color="grey")
        q-tooltip {{$t('logout')}}
      span {{$t('logout')}}
  div(style=`height: 30px; borderTop: 1px solid #eee`).row.full-width.items-center.q-px-md
    small v0.0.4
</template>

<script>
export default {
  name: 'kMenu',
  data () {
    return {
    }
  },
  computed: {
    getPages () {
      return this.$store.state.ui.pages.filter(p => {
        return p.hidden !== true
      })
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
  // watch: {
  //   '$route': {
  //     deep: true,
  //     immediate: true,
  //     handler (to, from) {
  //       this.$log('$route CHANGED', to.matched)
  //       if (to.matched[1]) {
  //         this.$set(this, 'menu', this.menus.find(i => i.id === to.matched[1].name))
  //       }
  //     }
  //   }
  // },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
