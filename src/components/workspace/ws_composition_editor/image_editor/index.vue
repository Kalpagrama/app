<style lang="sass">
.zoom-wrapper
  &:focus
    outline: none !important
    border: none !important
    border-color: none
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).column.full-width.b-50
  //- top
  //- div(:style=`{position: 'absolute', zIndex: 1000,}`).row
  //-   q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
  //-   div().row.full-height.items-center.content-center
  //-     q-resize-observer(@resize="heightOriginal = $event.height, widthOriginal = $event.width")
  //-     img(:src="content.url" :style=`{height: '40px', objectFit: 'contain'}`)
  //- header
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, top: '0px',
      borderRadius: '10px', overflow: 'hidden',
      background: 'rgba(0,0,0,0.1)',
    }`).row.full-width.items-center
    //- q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
    //- div().row.full-height.items-center.content-center
    //-   q-resize-observer(@resize="heightOriginal = $event.height, widthOriginal = $event.width")
    //-   img(:src="content.url" :style=`{height: '40px', objectFit: 'contain'}`)
    .col
      q-input(
        v-model="composition.name"
        :label="$t('Что ты видишь?')"
        filled dark color="white").full-width
        template(v-slot:prepend)
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
          div().row.full-height.items-center.content-center
            q-resize-observer(@resize="heightOriginal = $event.height, widthOriginal = $event.width")
            img(:src="content.url" :style=`{height: '40px', objectFit: 'contain'}`)
        template(v-slot:append)
          q-btn(round flat color="green" icon="check" @click="$emit('close')")
  //- tree
  transition(appear enter-active-class="animated slideInLeft" leave-active-class="animated slideOutLeft")
    div(
      v-if="layersTreeShow"
      :style=`{
        position: 'absolute', zIndex: 999999999999,
        width: '300px',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).column.full-height.b-50
      div(:style=`{}`).row.full-width
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-pa-sm
          div(
            v-for="(l,li) in composition.layers"
            @click="layerEditing = l.id"
            :style=`{height: '40px', borderRadius: '10px', overflow: 'hidden',}`
            ).row.full-width.items-center.content-center.q-px-md.q-mb-xs.b-60
            span.text-white {{li}}
  //- tools
  div(
    :style=`{
      position: 'absolute', zIndex: 1000,
      left: 'calc(50% - 50px)', bottom: '40px',
      width: '100px',
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '10px', overflow: 'hidden',
      border: 'none',
    }`).row.items-center.content-center
    //- .row.full-width
    q-btn(round flat dense color="white" icon="list" @click="layersTreeShow = !layersTreeShow")
    .col
    q-btn(round flat dense color="green" icon="add" @click="pointAddStart()")
  //- body
  div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden', border: 'none', outline: 'none'}`).col.full-width.bg-black
    //- zoom
    div(
      ref="zoomWrapper"
      :style=`{}`).row.fit.items-center.content-center.justify-center
      div(
        v-touch-pan.left.right.prevent.mouse="pointAddReady ? pointDragStart : null"
        :style=`{position: 'relative'}`).row.fit.items-center.content-center.justify-center
        q-resize-observer(@resize="height = $event.height, width = $event.width")
        img(
          :src="content.url" :style=`{position: 'absolute', zIndex: 10, objectFit: 'contain'}`).fit
        div(
          ref="imgWrapper"
          @click.self="layerEditing = null"
          :style=`{
            position: 'relative', zIndex: 200,
            maxWidth: height*ratio+'px',
            maxHeight: width/ratio+'px',
            //- border: '2px solid blue',
          }`).row.fit
          q-resize-observer(@resize="heightWrapper = $event.height, widthWrapper = $event.width")
          //- layers
          div(
            v-for="(l,li) in composition.layers" :key="l.id"
            v-touch-pan.left.right.prevent.mouse="e => layerDrag(e, li)"
            @click="layerEditing = l.id"
            accessKey="point"
            :style=`{
              position: 'absolute', zIndex: 100+li,
              top: l.figuresAbsolute[0].y+'%',
              left: l.figuresAbsolute[0].x+'%',
              height: l.figuresAbsolute[3].y-l.figuresAbsolute[0].y+'%',
              width: l.figuresAbsolute[1].x-l.figuresAbsolute[0].x+'%',
              background: 'rgba(76,175,80,0.3)',
              border: 2/scale+'px solid rgb(76,175,80)',
              borderRadius: 10/scale+'px',
            }`).row
            //- layer drag
            //- div(
            //-   v-touch-pan.left.right.prevent.mouse="e => layerDrag(e, li)"
            //-   accessKey="point"
            //-   :style=`{
            //-     position: 'absolute', zIndex: 101+li,
            //-     bottom: -44/scale+'px', left: 'calc(50% - '+20/scale+'px)',
            //-     width: 40/scale+'px', height: 40/scale+'px',
            //-     background: 'rgba(0,0,0,0.1)',
            //-     borderRadius: 10/scale+'px',
            //-   }`
            //-   ).row.items-center.content-center.justify-center.cursor-pointer
            //-   q-icon(color="white" name="drag_indicator" :size="20/scale+'px'")
            //- 3 point drag
            div(
              v-if="layerEditing === l.id"
              v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 2, li)"
              accessKey="point"
              :style=`{
                position: 'absolute', zIndex: 101+li,
                bottom: -20/scale+'px', right: -20/scale+'px',
                width: 40/scale+'px', height: 40/scale+'px',
                borderRadius: '50%', overflow: 'hidden',
                background: 'rgba(76,175,80,0.3)',
              }`).row.items-center.content-center.justify-center.cursor-pointer
              q-icon(color="white" name="drag_indicator" :size="20/scale+'px'")
  //- footer: tools
  div(
    v-if="false"
    :style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
    //- small.text-white height/width: {{height}}/{{width}}
    //- small.text-white scale: {{scale}}
    .col
    //- q-btn(
    //-   v-if="!pointAddReady"
    //-   @click="pointAddStart()"
    //-   round push color="green" icon="add"
    //-   :style=`{borderRadius: '50%'}`)
    //- q-btn(
    //-   v-if="pointAddReady"
    //-   @click="pointAddCancel()"
    //-   round push color="red" icon="check"
    //-   :style=`{borderRadius: '50%'}`)
    q-btn(round flat color="green" icon="check" @click="$emit('close')")
</template>

<script>
import panzoom from 'panzoom'

export default {
  name: 'imageEditor',
  props: {
    sid: {type: String, default () { return 'wce' }},
    composition: {type: Object},
    content: {type: Object},
    options: {
      type: Object,
      default () { return {} }
    }
  },
  data () {
    return {
      zoomInstance: null,
      heightOriginal: 0,
      widthOriginal: 0,
      heightWrapper: 0,
      widthWrapper: 0,
      height: 0,
      width: 0,
      scale: 1,
      pointAddReady: false,
      pointDragging: false,
      layerIndex: null,
      layerDragging: false,
      layerEditing: null,
      layersTreeShow: false,
    }
  },
  computed: {
    ratio () {
      return this.widthOriginal / this.heightOriginal
    }
  },
  methods: {
    pointAddStart () {
      this.$log('pointAddStart')
      this.zoomInstance.pause()
      this.pointAddReady = true
    },
    pointAddCancel () {
      this.$log('pointAddCancel')
      this.pointAddReady = false
      this.zoomInstance.resume()
    },
    pointDragStart (e) {
      // this.$log('pointDragStart', e)
      // let {scale} = this.zoomInstance.getTransform()
      let {left: leftImg, top: topImg} = this.$refs.imgWrapper.getBoundingClientRect()
      let leftPage = e.position.left
      let topPage = e.position.top
      // this.$log('leftPage/leftImg', leftPage, leftImg)
      // this.$log('topPage/topImg', topPage, topImg)
      let x = leftPage - leftImg
      let y = topPage - topImg
      // this.$log('x/y', x, y)
      // first
      if (e.isFirst) {
        this.layerIndex = this.composition.layers.length
        let xPercent = (x * 100) / (this.widthWrapper * this.scale)
        let yPercent = (y * 100) / (this.heightWrapper * this.scale)
        this.$set(
          this.composition.layers,
          this.layerIndex,
          {
            id: Date.now().toString(),
            figuresAbsolute: [
              {x: xPercent, y: yPercent},
              {x: xPercent, y: yPercent},
              {x: xPercent, y: yPercent},
              {x: xPercent, y: yPercent}
            ]
          }
        )
        this.$log('pointDragStart', e)
      }
      if (e.isFinal) {
        this.layerIndex = null
      }
      if (this.layerIndex) {
        this.pointDrag(e, 2, this.layerIndex)
      }
      // TODO: add > width, > height
      // if (x < 0 || y < 0) return
    },
    pointDrag (e, index, indexLayer) {
      // this.$log('pointDrag', index, indexLayer)
      if (indexLayer === undefined) return
      if (e.isFirst) {
        this.pointDragging = true
        this.zoomInstance.pause()
      }
      if (e.isFinal) {
        this.pointDragging = false
        this.zoomInstance.resume()
      }
      let x = (e.delta.x * 100) / (this.widthWrapper * this.scale)
      let y = (e.delta.y * 100) / (this.heightWrapper * this.scale)
      this.composition.layers[indexLayer].figuresAbsolute[index - 1].x += x
      this.composition.layers[indexLayer].figuresAbsolute[index].x += x
      this.composition.layers[indexLayer].figuresAbsolute[index].y += y
      this.composition.layers[indexLayer].figuresAbsolute[index + 1].y += y
    },
    layerDrag (e, indexLayer) {
      // this.$log('layerDrag', e, indexLayer)
      if (e.isFirst) {
        this.layerDragging = true
        this.zoomInstance.pause()
      }
      if (e.isFinal) {
        this.layerDragging = false
        this.zoomInstance.resume()
      }
      let x = (e.delta.x * 100) / (this.widthWrapper * this.scale)
      let y = (e.delta.y * 100) / (this.heightWrapper * this.scale)
      this.composition.layers[indexLayer].figuresAbsolute[0].x += x
      this.composition.layers[indexLayer].figuresAbsolute[0].y += y
      this.composition.layers[indexLayer].figuresAbsolute[1].x += x
      this.composition.layers[indexLayer].figuresAbsolute[1].y += y
      this.composition.layers[indexLayer].figuresAbsolute[2].x += x
      this.composition.layers[indexLayer].figuresAbsolute[2].y += y
      this.composition.layers[indexLayer].figuresAbsolute[3].x += x
      this.composition.layers[indexLayer].figuresAbsolute[3].y += y
    }
  },
  mounted () {
    this.$log('mounted')
    this.zoomInstance = panzoom(
      this.$refs.zoomWrapper,
      {
        maxZoom: 5,
        minZoom: 0.5,
        bounds: true,
        boundsPadding: 0.3,
        beforeMouseDown: (e) => {
          // allow mouse-down panning only if altKey is down. Otherwise - ignore
          // var shouldIgnore = !e.altKey;
          // return shouldIgnore;
          this.$log('beforeMouseDown', e)
          // if (this.pointDragging) return false
          // else return true
          if (e.target.accessKey === 'point') return true
          else if (this.layerEditing) return true
          // else return true
        }
      }
    )
    this.zoomInstance.on('zoom', (e) => {
      // this.$log('onZoom', e)
      let {scale} = e.getTransform()
      this.scale = scale
    })
  }
}
</script>
