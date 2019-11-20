<template lang="pug">
q-layout(view='hHh Lpr fFf' container :style=`{position: 'relative', width: width+'px', height: height-0+'px !important'}`).bg-grey-3
  //- dialogs
  k-dialog-bottom(ref="wsAddDialog" mode="actions" :options="wsAddDialogOptions" @action="wsAddDialogAction")
  //- menu
  q-drawer(ref="wsMenu" side="left" :width="250")
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
            v-for="(m, mkey) in pages" :key="mkey" @click="pageClick(m, mkey)"
            :style=`{height: '70px'}`
            ).row.full-width.items-center.hr.cursor-pointer
            div(:style=`{width: '40px', height: '70px'}`).row.items-center.justify-end
              q-icon(:name="m.icon" :color="page === mkey ? 'green' : 'grey-9'" :size="page === mkey ? '25px' : '20px'")
            .col
              .row.fit.items-center.q-px-sm
                span(:class=`{'text-green': page === mkey}`).text-bold {{ m.name }}
  //- header
  q-header(reveal)
    div(:style=`{minHeight: '60px'}`).row.full-width.bg-white
      div(:style=`{height: '60px'}`).row.full-width
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          q-btn(round flat icon="menu" color="black" @click="$refs.wsMenu.toggle()")
        .col.full-height
          .row.fit.items-center.content-center
            span.text-bold.text-black Мастерская
            .row.full-width
              small(v-if="page").text-grey-9 {{ pages[page].name }}
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          q-btn(round flat color="green" icon="add" @click="$refs.wsAddDialog.show()")
  //- page
  q-page-container
    ws-dashboard(v-if="page === 'dashboard'" @page="$router.push({params: {page: $event}})")
    ws-settings(v-else-if="page === 'settings'")
    ws-items(v-else-if="page" @item="$emit('item', $event)" :page="page")
</template>

<script>
import wsItems from './ws_items'
import wsDashboard from './ws_dashboard'
import wsSettings from './ws_settings'

export default {
  name: 'workspace',
  components: {wsItems, wsDashboard, wsSettings},
  props: {
    inFinder: {type: Boolean, default () { return false }},
    width: {type: Number},
    height: {type: Number}
  },
  data () {
    return {
      page: undefined,
      pages: {
        dashboard: {name: 'Дэшборд', icon: 'dashboard'},
        bookmarks: {name: 'Заметки', icon: 'bookmark_outline'},
        contents: {name: 'Контент', icon: 'photo_size_select_actual'},
        fragments: {name: 'Фрагменты', icon: 'aspect_ratio'},
        drafts: {name: 'Ядра', icon: 'post_add'},
        tags: {name: 'Сферы', icon: 'style'},
        settings: {name: 'Настройки', icon: 'settings'}
      }
    }
  },
  computed: {
    wsAddDialogOptions () {
      return {
        confirm: true,
        confirmName: 'Создать ядро',
        actions: {
          addBookmark: {name: 'Добавить заметку'},
          addContent: {name: 'Добавить конент'}
        }
      }
    }
  },
  watch: {
    '$route': {
      immediate: true,
      handler (to, from) {
        if (to.params.page) this.$set(this, 'page', to.params.page)
        else {
          this.$router.push({params: {page: 'dashboard'}})
        }
      }
    }
  },
  methods: {
    wsAddDialogAction (action) {
      this.$log('wsAddDialogAction', action)
      switch (action) {
        case 'addBookmark': {
          this.$store.commit('ui/stateSet', ['bookmarkDialogOpened', true])
          break
        }
        case 'addContent': {
          // this.$store.commit('ui/stateSet', ['contentDialogOpened', true])
          break
        }
        case 'confirm': {
          // this.$store.commit('')
          // set draft from the memory
          this.$store.commit('ui/stateSet', ['nodeCreatorDialogOpened', true])
          break
        }
      }
    },
    async pageClick (m, mkey) {
      this.$log('pageClick', m, mkey)
      this.$router.push({params: {page: mkey}})
    }
  }
}
</script>

<style lang="stylus">
.q-drawer {
  background: none !important
}
</style>
