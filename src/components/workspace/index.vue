<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- menu backdrop
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="menusShow"
      :style=`{position: 'absolute', left: 0, top: 0, zIndex: 100, background: 'rgba(0, 0, 0, 0.5)'}` @click.self="menuToggle()").row.fit
  //- menu
  div(:style=`{position: 'absolute', left: '0px', zIndex: 200, width: menusWidth+'px', borderRadius: '0 10px 10px 0', overflow: 'hidden'}`
    ).column.full-height.bg-grey-2
    //- menu header
    div(
      v-if="!inFinder"
      :style=`{height: '70px'}`).row.full-width.items-center.justify-center
      div(:style=`{height: '70px', width: '60px'}`).row.items-center.justify-center
        q-btn(icon="keyboard_arrow_left" round flat color="primary" @click="menuToggle()").q-mx-sm
      .col
    //- menu body
    div(ignore-body-scroll-lock).col.scroll
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
  ws-items(type="bookmark" @item="$emit('item', $event)")
  //- ws-bookmarks(v-if="menu === 'bookmarks'" @menu="menuToggle()")
  //- ws-contents(v-else-if="menu === 'contents'" @menu="menuToggle()")
  //- ws-fragments(v-else-if="menu === 'fragments'" @menu="menuToggle()")
  //- ws-drafts(v-else-if="menu === 'drafts'" @menu="menuToggle()")
  //- ws-settings(v-else-if="menu === 'settings'" @menu="menuToggle()")
  //- ws-tags(v-else-if="menu === 'tags'" @menu="menuToggle()")
  //- ws-dashboard(v-else @menu="menuToggle()")
</template>

<script>
import wsItems from './ws_items'
import wsBookmarks from './ws_bookmarks'
import wsFragments from './ws_fragments'
import wsContents from './ws_contents'
import wsSettings from './ws_settings'
import wsDrafts from './ws_drafts'
import wsDashboard from './ws_dashboard'
import wsTags from './ws_tags'

export default {
  name: 'workspace',
  components: {wsItems, wsBookmarks, wsFragments, wsContents, wsSettings, wsDrafts, wsDashboard, wsTags},
  props: ['source', 'inFinder'],
  data () {
    return {
      reactive: 1,
      selected: {},
      search: '',
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
      await this.menuToggle()
      // this.$set(this, 'menu', mkey)
      if (mkey === 'dashboard') this.$router.push('/app/workspace')
      else this.$router.push({params: {menu: mkey}})
    },
    menuToggle () {
      return new Promise((resolve, reject) => {
        this.$log('menuToggle')
        if (this.menusShow) {
          this.$tween.to(this, 0.3, {
            menusWidth: 0,
            onComplete: () => {
              this.menusShow = false
              resolve()
            }
          })
        } else {
          this.menusShow = true
          this.$tween.to(this, 0.3, {
            menusWidth: 240,
            onComplete: () => {
              this.menusShow = true
              resolve()
            }
          })
        }
      })
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
