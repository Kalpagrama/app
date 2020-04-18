<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  //- menu
  div(
    v-if="$q.screen.width > $store.state.ui.maxWidthPage+$store.state.ui.maxWidthMenu*2"
    :style=`{
      position: 'fixed',
      top: '0px',
      zIndex: 1000,
      width: $store.state.ui.maxWidthMenu+'px',
      height: $q.screen.height+'px',
      right: ($q.screen.width-$store.state.ui.maxWidthPage)/2-$store.state.ui.maxWidthMenu+'px',
      paddingTop: '68px',
    }`).row.items-start.content-start.q-px-sm.q-pb-sm
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        maxHeight: '70vh'
      }`
      ).column.fit.bg-grey-9
      div(:style=`{height: '70px'}`).row.full-width.items-center.q-px-md
        span.text-white.text-bold Related spheres
      .col.full-width.scroll
        .row.full-width.q-pa-sm
          sphere-spheres(v-if="true" :oid="sphereOid")
  //- header
  q-header(
    reveal
    :style=`{zIndex: 200}`).row.full-width.justify-center.bg-grey-9
    .row.full-width.justify-center
      div(
        v-if="sphere"
        :style=`{
          height: '60px', background: 'rgba(33,33,33, 0.8)',
          maxWidth: $store.state.ui.maxWidthPage+'px'
        }`
        ).row.full-width.items-center.content-center
        //- div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
        //-   q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            span.text-white.text-bold {{ '#'+sphere.name }}
        //- div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
        //-   q-btn(
        //-     round flat color="white" @click="sphereOpen()"
        //-     :icon="openedHeight > 0 ? 'keyboard_arrow_up' : 'style'")
  //- footer
  q-footer(reveal)
    .row.full-width.justify-center
      div(:style=`{position: 'relative', height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius: '10px 10px 0 0 '}`
        ).row.full-width.items-center.content-center.justify-between.bg-grey-8.q-px-sm
        //- q-btn(
        //-   round push color="green" icon="add"
        //-   :style=`{position: 'absolute', top: '-20px', left: '50%', transform: 'translate(-50%, 0)', borderRadius: '50%'}`)
        q-btn(round flat color="grey-4" icon="menu" @click="$store.commit('ui/stateSet', ['menuAppShow', true])")
        .col
        q-btn(round flat color="grey-4" icon="more_vert")
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
        mode="extend" :essence="sphere ? sphere.name : ''" :node="node.rawData" :wsItemFinderOnBoot="true"
        @cancel="nodeEditorShow = false"
        :style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`)
  //- page
  q-page-conainter(:style=`{height: $q.screen.height-60+'px'}`)
    q-page(:style=`{height: $q.screen.height+'px'}`).row.full-width.justify-center
      kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
        template(v-slot=`{items}`)
          list-masonry(
            ref="listMasonry" :items="items"
            :style=`{maxWidth: $store.state.ui.maxWidthPage+'px', paddingTop: '60px'}`)
            template(v-slot:item=`{item, index, isOpened, isHovered}`)
              div(
                v-if="!isOpened"
                @click="$refs.listMasonry.itemClick(item, index)"
                :style=`{position: 'absolute', zIndex: 300, borderRadius: '10px', overflow: 'hidden', opacity: 0}`).row.fit
              node(
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
export default {
  name: 'sphereExplorer',
  props: ['mode', 'sphere'],
  data () {
    return {
      nodeEditorShow: false,
      node: {
        name: '',
        wsItemType: 'NODE',
        rawData: {
          name: '',
          items: [],
          spheres: [],
          category: 'FUN',
          layout: 'PIP'
        }
      }
    }
  },
  computed: {
    sphereOid () {
      return this.sphere.oid
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 10 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
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
