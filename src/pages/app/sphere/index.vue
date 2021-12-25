<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
      template(v-slot:center)
        q-btn(v-if="$route.name !== 'category'" flat ripple=false icon="add" size="sm" color="green" :label="$t('Добавить образ')" @click="itemEditorShow=true")
      template(v-slot:left-button)
        nav-mobile(v-if="$route.name !== 'category'")
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
      q-dialog(
        v-model="itemEditorShow"
        :maximized="false"
        position="standard")
        item-editor(
          :item="newNode"
          :publish="true"
          @close="itemEditorShow=false")
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        tab-list-feed(
          v-if="sphere"
          :type="'customPPV'"
          :scrollAreaHeight="0"
          searchInputState="disabled"
          :pages="pages"
          :pageId="pageId"
          :query="query"
          :itemHeightApprox="pageId === 'contents' ? 30 : (Math.min($store.state.ui.pageWidth, $q.screen.width) * 0.6 + 170)"
          :itemActivePersist="true"
          @searchString="searchString = $event"
          @pageId="pageId = $event"
          @items="items = $event"
        ).row.full-width
          template(v-slot:externalHeader)
            page-header(v-if="sphere" :sphere="sphere" :topNode="topNode").q-mb-sm
          template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
            item-feed(
              :itemShortOrFull="item"
              :itemState="itemState"
              :itemIndex="itemIndex"
              :isActive="isActive"
              :isVisible="isVisible"
              :isPreload="isPreload"
              :scrolling="scrolling"
              :layout="item.type.in('NODE', 'JOINT', 'BLOCK') ? 'card' : 'line'"
              :height="pageId === 'contents' ? 30 : undefined")
            .row.full-width
              div(v-if="pageId === 'contents'").q-pb-md
              div(v-else).q-pb-xl
          template(v-slot:nodata)
            nodata-guard(
              :button="nodataGuardParams.button"
              :icon="nodataGuardParams.icon"
              :title="nodataGuardParams.title"
              :message="nodataGuardParams.message"
              :buttonName="nodataGuardParams.buttonName"
              :clickPath="nodataGuardParams.clickPath"
            )
              template(v-slot:footer)
                q-btn(v-if="pageId === 'nodes'"
                outline color="white"
                no-caps
                :style=`{height: '50px', minWidth: '200px',}`
                @click="itemEditorShow=true"
                )
                  h1.text-white {{ nodataGuardParams.buttonName }}
</template>

//  @item="$go('/content/'+item.oid)
<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import navMobile from 'src/components/kalpa_menu_mobile/nav_mobile.vue'
import nodataGuard from 'src/components/kalpa_guard/nodata_guard'

import pageHeader from './page_header.vue'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'pageApp__sphere',
  components: {
    pageHeader,
    navMobile,
    nodataGuard,
  },
  data () {
    return {
      sphere: null,
      pageId: null,
      itemEditorShow: false,
      items: [],
      topNode: null
    }
  },
  computed: {
    newNode () {
      return {
        name: this?.sphere?.name,
        type: ObjectTypeEnum.NODE,
        items: [],
        spheres: [],
        countStat: {}
      }
    },
    scrollAreaHeight () {
      return this.$q.screen.height
    },
    pages () {
      return [
        // { id: 'all', name: this.$t('All') },
        // {id: 'contents', name: this.$t('Media')},
        { id: 'nodes',
          name: this.$t('Nodes'),
          nodataGuardParams: {
            icon: 'adjust',
            button: false,
            message: this.$t('Создайте смысловое ядро связанное с этим смыслом  и оно отобразится здесь'),
            buttonName: this.$t('Создать ядро'),
            title: this.$t('Здесь пока ничего нет'),
            clickPath: '/workspace',
          }},
        { id: 'joints',
          name: this.$t('Joints'),
          nodataGuardParams: {
            icon: 'fas fa-link',
            button: false,
            message: this.$t('Создайте связь связанную с этим смыслом и она отобразится здесь'),
            // buttonName: this.$t('Создать ядро'),
            title: this.$t('Здесь пока ничего нет'),
            // clickPath: '/workspace',
          }},
        { id: 'blocks',
          name: this.$t('Essence blocks'),
          nodataGuardParams: {
            icon: 'dashboard_customize',
            button: true,
            message: this.$t('Создайте смысловой блок связанный с этим смыслом и он отобразится здесь'),
            buttonName: this.$t('Создать смысловой блок'),
            title: this.$t('Здесь пока ничего нет'),
            clickPath: '/workspace/edit?mode=block',
          }},
        { id: 'contents',
          name: this.$t('Контент'),
          nodataGuardParams: {
            icon: 'select_all',
            button: true,
            message: this.$t('Добавьте контент связанный с этим смыслом и он отобразится здесь'),
            buttonName: this.$t('Добавить'),
            title: this.$t('Здесь пока ничего нет'),
            clickPath: '/workspace',
          }},
        // {id: 'spheres', name: this.$t('Spheres')},
        // {id: 'users', name: this.$t('Users')}
      ]
    },
    nodataGuardParams() {
      return this.pages.find(page => page.id === this.pageId).nodataGuardParams
    },
    query () {
      let objectTypes
      if (this.pageId === 'all') {
        // objectTypes = ['VIDEO', 'IMAGE', 'BOOK', 'NODE', 'BLOCK', 'USER', 'JOINT', 'WORD', 'SENTENCE', 'CHAR']
        objectTypes = ['NODE', 'BLOCK', 'JOINT']
      } else if (this.pageId === 'nodes') {
        objectTypes = ['NODE']
      } else if (this.pageId === 'joints') {
        objectTypes = ['JOINT']
      } else if (this.pageId === 'blocks') {
        objectTypes = ['BLOCK']
      } else if (this.pageId === 'contents') {
        objectTypes = ['VIDEO', 'IMAGE', 'BOOK']
      } else if (this.pageId === 'users') {
        objectTypes = ['USER']
      } else if (this.pageId === 'spheres') {
        objectTypes = ['WORD', 'SENTENCE', 'CHAR']
      } else throw new Error('bad pageId: ' + this.pageId)

      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          oidSphere: this.sphere.oid,
          objectTypeEnum: { $in: objectTypes },
          // querySearch: this.searchString,
          sortStrategy: this.$route.params.sort || 'ACTIVITY' // 'ACTIVITY', // AGE HOT
        },
        populateObjects: false
      }
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.sphere = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
    pageId: {
      async handler (to, from) {
        if (this.$route.query.pageId !== to) await this.$router.replace({ query: { pageId: to } })
      }
    },
    async items (to) {
      if (to.length) {
        this.topNode = await this.$rxdb.get(RxCollectionEnum.OBJ, to[0].oid)
      }
    }
  },
  mounted () {
    this.$log('mounted', this.$route.params, this.$route.query)
    this.pageId = this.$route.query.pageId || 'nodes'
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
