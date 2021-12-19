<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
      template(v-slot:center)
        q-btn(v-if="isCategory" flat ripple=false icon="add" size="sm" color="green" :label="$t('Добавить образ')" @click="itemEditorShow=true")
      template(v-slot:left-button)
        nav-mobile(v-if="isCategory")
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
</template>

//  @item="$go('/content/'+item.oid)
<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import navMobile from 'src/components/kalpa_menu_mobile/nav_mobile.vue'

import pageHeader from './page_header.vue'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'pageApp__sphere',
  components: {
    pageHeader,
    navMobile
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
        { id: 'nodes', name: this.$t('Nodes') },
        { id: 'joints', name: this.$t('Joints') },
        { id: 'blocks', name: this.$t('Blocks') },
        { id: 'contents', name: this.$t('Контент') }
        // {id: 'spheres', name: this.$t('Spheres')},
        // {id: 'users', name: this.$t('Users')}
      ]
    },
    // isCategory() {
    //   return !this.sphere.oid.in(
    //     '100958592395419654',
    //     '100958595004276745',
    //     '240094717834993691',
    //     '100958595625033739',
    //     '240094717994377244',
    //     '100958593859231751',
    //     '100958595302072330',
    //     '240094718212481053',
    //     '100958594719064072',
    //     '100958595964772364',
    //     '100958596275150861',
    //     '240094718267007006',
    //     '240094718296367135',
    //     '100958597248229392',
    //     '240094718334115872',
    //     '100958597571190801',
    //     '240094718376058913',
    //     '240094718401224738',
    //     '240094718430584867',
    //     '240094718459944996',
    //     '240094718485110821')
    // },
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
