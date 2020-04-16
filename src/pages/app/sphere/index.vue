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
          sphere-spheres(v-if="sphere" :oid="sphere.oid")
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
  q-footer(reveal)
    .row.full-width.justify-center
      div(:style=`{position: 'relative', height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius: '10px 10px 0 0 '}`
        ).row.full-width.items-center.content-center.justify-between.bg-grey-8.q-px-sm
        //- q-btn(
        //-   round push color="green" icon="add"
        //-   :style=`{position: 'absolute', top: '-20px', left: '50%', transform: 'translate(-50%, 0)', borderRadius: '50%'}`)
        q-btn(round flat color="white" icon="menu" @click="$store.commit('ui/stateSet', ['menuAppShow', true])")
        .col
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
        :value="node" :wsItemFinderOnBoot="true"
        :style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`)
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
                :node="item" :visible="isOpened ? true : isHovered" :active="isOpened ? true : isHovered" layout="pip" :mini="!isOpened"
                :needFull="isOpened ? true : isHovered")
</template>

<script>
export default {
  name: 'pageAppSphere',
  components: {},
  data () {
    return {
      sphere: null,
      opened: false,
      openedHeight: 0,
      nodeEditorShow: false,
      node: null
    }
  },
  computed: {
    sphereOid () {
      return this.$route.params.oid
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
  watch: {
    $route: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.page = 'sphere'
        if (to.params.oid) {
          this.$log('$route CHANGED', to)
          this.sphere = await this.sphereLoad(to.params.oid)
        }
      }
    }
  },
  methods: {
    nodeEditorStart () {
      this.$log('nodeEditorStart')
      this.nodeEditorShow = !this.nodeEditorShow
    },
    sphereOpen () {
      this.$log('sphereOpen')
      this.$tween.to(this, 0.3, {
        openedHeight: this.opened ? 0 : 160,
        onComplete: () => {
          this.opened = !this.opened
        }
      })
    },
    async sphereLoad (oid) {
      this.$log('sphereLoad start', oid)
      let sphere = await this.$store.dispatch('objects/get', { oid, priority: 0 })
      this.$log('sphereLoad done', sphere)
      return sphere
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
