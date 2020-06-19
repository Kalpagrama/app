<style lang="sass" scoped>
.layer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`).column.fit
  //- header: search
  div(:style=`{position: 'relative'}`).row.full-width
    //- kalpa-debug(:options=`{mode,contentOid}`)
    //- search
    .row.full-width.q-pa-sm
      q-input(
        v-model="searchString"
        label="Find layer..."
        filled dark dense color="grey-5"
        :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).full-width
        template(v-slot:prepend)
          q-btn(
            flat dense color="grey-5"
            icon="search")
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            @click="searchString = ''"
            round flat dense color="grey-5"
            icon="clear")
    //- layers selected
    div(
      v-if="layersSelected.length > 0"
      :style=`{position: 'absolute', zIndex: 1000}`).row.fit.q-pa-sm
      div(:style=`{borderRadius: $store.state.ui.borderRadius+'px'}`).row.full-width.items-center.q-px-xs.b-80
        q-btn(flat dense color="white" icon="clear" @click="layersSelectedDrop()").b-90.q-mr-sm
        slot(
          name="headerSelected"
          :layersSelected="layersSelected")
  //- body
  div(
    :style=`{
      overflowX: 'hidden',
    }`
    ).col.full-width.scroll
    div(
      v-if="content"
      ).row.full-width.items-start.content-start.q-py-md.q-pr-sm
      draggable(
        :list="content.layers" group="layers" handle=".layer-drag-handle"
        :sort="mode === 'layers'"
        @start="layersDragging = true"
        @end="layersDragging = false"
        ).full-width
        div(
          v-for="(l,li) in layersFiltered" :key="l.id"
          :style=`{
            height: '40px',
            borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'
          }`
          ).row.full-width.items-center.content-center.q-mb-xs
          div(:style=`{width: '40px'}`).row.full-height
            q-checkbox(v-model="layersSelected" :val="l.id" dark color="grey-6")
          .col.full-height
            div(
              :style=`{
                borderRadius: $store.state.ui.borderRadius+'px',
                overflow: 'hidden',
              }`).row.fit.items-center.content-center.q-pl-md.b-70.cursor-pointer.layer
              div().col.full-height.layer-drag-handle
                div(@click="layerClick(l,li)").row.fit.items-center.content-center
                  span(
                    v-if="l.spheres.length > 0"
                    :style=`{userSelect: 'none'}`
                    ).text-white.text-bold {{ l.spheres[0].name }}
              q-btn(round flat dense color="grey-6" icon="more_vert").q-mr-xs
                kalpa-menu-popup(:value="l" :actions="layerActions")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import draggable from 'vuedraggable'

export default {
  name: 'layerList',
  components: {draggable},
  props: ['mode', 'composition', 'contentOid', 'actions'],
  data () {
    return {
      content: null,
      searchString: '',
      layersSelected: [],
      layersDragging: false,
    }
  },
  computed: {
    // layers () {
    //   if (this.mode === 'layers') return this.composition.layers
    //   else {
    //     if (this.content) return this.content.layers
    //     else return []
    //   }
    // },
    layersFiltered () {
      if (!this.content) return []
      return this.content.layers.filter((l, li) => {
        if (l.spheres.length > 0) {
          if (this.searchString.length > 0) {
            let nameRegExp = new RegExp(this.searchString, 'i')
            return nameRegExp.test(l.spheres[0].name)
          }
          else return true
        }
        else {
          if (this.mode === 'layers') return true
          else return false
        }
      })
    },
    layerActions () {
      let res = {
      }
      if (this.actions) res = {...res, ...this.actions}
      return res
    }
  },
  watch: {
    composition: {
      immediate: true,
      handler (to, from) {
        this.$log('composition CHANGED', to)
        if (to) {
          this.content = to
        }
      }
    },
    contentOid: {
      immediate: true,
      async handler (to, from) {
        this.$log('contentOid CHANGED', to)
        if (to) {
          let {items: contentFind} = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
              contentOid: to
            }
          })
          this.$log('contentFind', contentFind[0])
          this.content = contentFind[0]
        }
      }
    }
  },
  methods: {
    layerClick (l, li) {
      this.$log('layerClick', l, li)
      this.$emit('pick', l)
    },
    layersSelectedDrop () {
      this.$log('layersSelectedDrop')
      this.layersSelected = []
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
