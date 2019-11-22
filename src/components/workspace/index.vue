<template lang="pug">
q-layout(view='hHh Lpr fFf' container :style=`{position: 'relative', width: width+'px', height: height-0+'px !important'}`).bg-grey-3
  //- q-btn(
  //-   round push color="accent" icon="add"
  //-   :style=`{position: 'absolute', zIndex: 1000, bottom: '10px', right: '10px'}`)
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
              q-icon(:name="m.icon" :color="page === mkey ? 'accent' : 'grey-9'" :size="page === mkey ? '25px' : '20px'")
            .col
              .row.fit.items-center.q-px-sm
                span(:class=`{'text-accent': page === mkey}`).text-bold {{ m.name }}
  //- header
  //- q-header(reveal)
  //-   div(:style=`{minHeight: '60px'}`).row.full-width.bg-white
  //-     div(:style=`{height: '60px'}`).row.full-width
  //-       div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
  //-         q-btn(round flat icon="menu" color="black" @click="$refs.wsMenu.toggle()")
  //-       .col.full-height
  //-         .row.fit.items-center.content-center
  //-           span.text-bold.text-black Мастерская
  //-           .row.full-width
  //-             small(v-if="page").text-grey-9 {{ pages[page].name }}
  //-       div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
  //-         q-btn(round flat color="accent" icon="add" @click="$refs.wsAddDialog.show()")
  //- page
  q-page-container
    k-colls(@coll="collChanged" :coll="$route.params.page" :colls="colls" :header="true" :style=`{height: height+'px'}`)
      template(v-slot:header)
        .row.fit.items-center
          div(:style=`{height: '60px'}`).row.full-width.items-center
            //- div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
              //- anvil(:width="30" :height="30")
              q-btn(round flat icon="menu")
            .col.full-height
              .row.fit.items-center.q-px-md
                span.text-bold {{ $t('Workspace') }}
            div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
              q-btn(round flat icon="add" @click="$refs.wsAddDialog.show()")
          div(:style=`{height: '40px'}`).row.full-width
            //- div(:style=`{height: '40px', width: '40px', borderTop: $route.params.page === 'dashboard' ? '3px solid #101d49' : '3px solid white'}`).row.items-center.justify-center
            //-   anvil(:width="24" :height="24")
            div(
              v-for="c in colls" :key="c.id"
              @click="c.id !== $route.params.page ? $router.push({params: {page: c.id}}) : false"
              :style=`{borderTop: $route.params.page === c.id ? '3px solid #101d49' : '3px solid white'}`
              ).col.cursor-pointer
              .row.fit.items-center.justify-center
                span {{ c.name }}
      template(v-slot:dashboard)
        ws-dashboard
      template(
        v-for="(c, ci) in colls"
        v-slot:[c.id])
        ws-items(:type="c.id" :key="c.id")
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
      types: ['bookmarks', 'bragments', 'brafts', 'bpheres'],
      page: undefined,
      pages: {
        dashboard: {name: 'Дэшборд', icon: 'dashboard'},
        bookmarks: {name: 'Заметки', icon: 'bookmark_outline'},
        // contents: {name: 'Контент', icon: 'photo_size_select_actual'},
        fragments: {name: 'Фрагменты', icon: 'aspect_ratio'},
        drafts: {name: 'Ядра', icon: 'post_add'},
        spheres: {name: 'Сферы', icon: 'style'},
        settings: {name: 'Настройки', icon: 'settings'}
      },
      coll: 'dashboard',
      colls: [
        // {id: 'dashboard', name: 'Dashboard'},
        {id: 'bookmarks', name: 'Bookmarks'},
        {id: 'fragments', name: 'Fragments'},
        {id: 'drafts', name: 'Drafts'},
        {id: 'spheres', name: 'Spheres'}
      ]
    }
  },
  computed: {
    wsAddDialogOptions () {
      return {
        confirm: true,
        confirmName: 'Create node',
        actions: {
          addBookmark: {name: 'Add bookmark'},
          addFragment: {name: 'Add fragment'},
          addContent: {name: 'Add sphere'}
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
          this.$router.push({params: {page: 'bookmarks'}})
        }
      }
    }
  },
  methods: {
    collChanged (coll) {
      this.$router.push({params: {page: coll}})
    },
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
