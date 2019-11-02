<template lang="pug">
q-layout(view='hHh Lpr fFf' :container="inFinder").bg-grey-2
  q-drawer(ref="wsMenu" side="left" :width="230")
    div(:style=`{position: 'relative', borderRadius: '0px 10px 10px 0', overflow: 'hidden'}`).column.fit.bg-white
      //- menu header
      div(
        v-if="!inFinder"
        :style=`{height: '70px'}`).row.full-width.items-center.justify-center
        .col
          .row.fit.items-center.q-px-md
            span.text-bold Мастерская
      //- menu body
      .col.scroll
        .row.full-width.items-start.content-start
          div(
            v-for="(m, mkey) in menus" :key="mkey" @click="menusClick(m, mkey)"
            :style=`{height: '70px'}`
            ).row.full-width.items-center.hr.cursor-pointer
            div(:style=`{width: '40px', height: '70px'}`).row.items-center.justify-end
              q-icon(:name="m.icon" :color="menu === mkey ? 'primary' : 'grey-9'" :size="menu === mkey ? '25px' : '20px'")
            .col
              .row.fit.items-center.q-px-sm
                span(:class=`{'text-primary': menu === mkey}`).text-bold {{ m.name }}
  //- header
  q-header(reveal)
    div(:style=`{minHeight: '70px'}`).row.full-width.bg-white
      //- div(
      //-   v-if="!inFinder"
      //-   :style=`{height: '70px', width: '70px'}`).row.items-center.justify-center
      //-   q-btn(round flat icon="menu" color="primary" @click="$refs.wsMenu.toggle()")
      .col
        div(:class=`{'q-pl-sm': inFinder}`).row.fit.items-center.content-center.q-px-sm
          div(:style=`{borderRadius: '10px', overflow: 'hidden', zIndex: 100, position: 'relative'}`).row.full-width
            q-input(v-model="search" filled placeholder="Поиск").full-width
              template(v-slot:append)
                q-btn(round flat dense color="grey-7" icon="filter_list")
  //- page
  q-page-container
    //- ws-bookmarks
    //- ws-dashboard(v-if="search.length === 0" @menu="menusClick(null, $event)")
    ws-items(@item="$emit('item', $event)" :search="search" :type="type")
  //- footer
  q-footer(v-if="!inFinder" reveal).bg-grey-4
    k-menu-horiz(page="workspace" :colors="['white', 'grey-9']")
</template>

<script>
import wsItems from './ws_items'
import wsDashboard from './ws_dashboard'
import wsBookmarks from './ws_bookmarks'

export default {
  name: 'workspace',
  components: {wsItems, wsDashboard, wsBookmarks},
  props: {
    inFinder: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      reactive: 1,
      selected: {},
      search: '',
      type: '',
      filtersShow: false,
      filtersHeight: 0,
      menusShow: false,
      menusWidth: 0,
      menu: undefined,
      menus: {
        dashboard: {name: 'Дэшборд', icon: 'dashboard'},
        bookmarks: {name: 'Закладки', icon: 'bookmark_outline'},
        contents: {name: 'Контент', icon: 'photo_size_select_actual'},
        fragments: {name: 'Фрагменты', icon: 'aspect_ratio'},
        drafts: {name: 'Черновики', icon: 'post_add'},
        tags: {name: 'Тэги', icon: 'style'},
        settings: {name: 'Настройки', icon: 'settings'}
      }
    }
  },
  watch: {
    '$route': {
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.params.menu) {
          this.$set(this, 'menu', to.params.menu)
        } else {
          this.$set(this, 'menu', 'dashboard')
        }
      }
    }
  },
  methods: {
    async menusClick (m, mkey) {
      this.$log('menusClick', m, mkey)
      if (this.inFinder) {
        this.$log('IN FINDER')
        // this.menu = mkey
      } else {
        this.$log('IN WORKSPACE')
        if (mkey === 'dashboard') this.$router.push('/app/workspace')
        else this.$router.push({params: {menu: mkey}})
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$root.$on('page', () => {
      this.$refs.wsMenu.toggle()
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
