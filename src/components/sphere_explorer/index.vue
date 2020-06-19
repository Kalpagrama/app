<template lang="pug">
q-layout(view="hHh lpR fFf").b-30
  //- menu
  kalpa-menu-right
    div(
      :style=`{
        borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
        maxHeight: '70vh'
      }`
      ).column.fit.b-50
      div(:style=`{height: '70px'}`).row.full-width.items-center.q-px-md
        span.text-white.text-bold Related spheres
      .col.full-width.scroll
        .row.full-width.q-pa-sm
          sphere-spheres(v-if="true" :oid="sphereOid")
  //- header
  q-header(
    v-if="true"
    reveal :style=`{zIndex: 30000}`).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px',
        zIndex: 30000,
        borderRadius: '0 0 10px 10px', overflow: 'hidden'
      }`
      ).row.full-width.items-center.content-center.justify-start.b-50.q-py-md.q-px-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '16px'}`).text-white.text-bold {{ '#'+sphere.name }}
  //- footer
  //- kalpa-menu-footer
  //- add node
  q-btn(
    v-if="!nodeEditorShow"
    push color="green" no-caps @click="nodeEditorStart()"
    :style=`{
      position: 'fixed', zIndex: 4000, bottom: '68px', left: '50%', transform: 'translate(-50%, 0%)',
      width: '200px', height: '50px'
    }`).shadow-10
    span.text-white.text-bold Добавить свой образ
  //- node editor dialog
  q-dialog(v-model="nodeEditorShow" maximized position="bottom")
    div(:style=`{height: $q.screen.height+'px', paddingTop: '68px'}` @click.self="nodeEditorShow = false"
      ).row.full-width.items-start.content-start.justify-center.q-px-sm
      node-editor(
        mode="extend" :essence="sphere ? sphere.name : ''" :node="node" :wsItemFinderOnBoot="true"
        @cancel="nodeEditorShow = false"
        :style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`)
  //- page
  q-page-conainter(:style=`{height: $q.screen.height-60+'px'}`)
    q-page(:style=`{height: $q.screen.height+'px'}`).row.full-width.justify-center.q-pt-md
      kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
        template(v-slot=`{items}`)
          list-masonry(
            ref="listMasonry" :items="items"
            :style=`{maxWidth: $store.state.ui.maxWidthPage+'px', paddingTop: '60px'}`)
            template(v-slot:item=`{item, index, isOpened, isHovered}`)
              div(
                v-if="!isOpened"
                @click="$refs.listMasonry.itemClick(item, index)"
                :style=`{position: 'absolute', zIndex: 300, borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden', opacity: 0}`).row.fit
              node(
                ctx="list"
                :node="item"
                :index="index"
                :needFull="isOpened ? true : isHovered"
                :visible="isOpened ? true : isHovered"
                :active="isOpened ? true : isHovered" layout="pip"
                :mini="!isOpened"
                :opened="isOpened"
                :essence="isOpened")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'sphereExplorer',
  props: ['mode', 'sphere'],
  data () {
    return {
      nodeEditorShow: false,
      node: {
        wsItemType: 'WS_NODE',
        name: '',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP'
      }
    }
  },
  computed: {
    sphereOid () {
      return this.sphere.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid
        }
      }
      // return {
      //   oid: this.sphereOid,
      //   pagination: { pageSize: 10 },
      //   sortStrategy: 'HOT',
      //   filter: { types: 'NODE' }
      // }
    }
  },
  methods: {
    nodeEditorStart () {
      this.$log('nodeEditorStart')
      this.nodeEditorShow = !this.nodeEditorShow
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
