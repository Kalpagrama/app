<template lang="pug">
div(
  :style=`{
    //- position: 'relative',
  }`
  ).row.full-width.justify-center
  div(
    :style=`{
      position: 'absolute', bottom: '0px',
      borderRadius: '10px',
      maxWidth: '340px',
      background: 'rgb(35,35,35)',
    }`
    ).row.q-pa-sm
    .row.full-width.q-pr-xs
      q-input(
        v-model="node.name"
        borderless dark dense
        type="textarea" autogrow
        placeholder="В чем суть?"
        :counter="true || node.name.length > 10"
        :maxlength="120"
        :input-style=`{
          paddingLeft: '12px',
          paddingTop: '8px',
          paddingRight: '8px',
          fontSize: fontSize+'px',
        }`
        :style=`{
        }`).full-width
    //- add category and spheres
    .row.full-width.q-pt-xs.q-mt-sm
      q-input(
        v-model="spheres"
        borderless dark dense size="xs" no-caps
        type="textarea" autogrow
        placeholder="Введите сферы сути"
        :rows="1"
        :input-style=`{
          fontSize: '12px',
          //- height: '20px',
          //- padding: '4px',
        }`
        :style=`{
          fontSize: '12px',
          //- height: '20px',
        }`).full-width.text-grey-5
        template(v-slot:prepend)
          small(
            v-if="nodeCategories.length > 0 && options.length > 0"
            @click.self="nodeCategoriesShow = true"
            :style=`{
              position: 'relative',
              fontSize: '12px',marginLeft: '12px'}`).text-grey-5.cursor-pointer {{ options.find(o => o.value === node.category).label }}:
              div(
                v-if="nodeCategoriesShow"
                :style=`{
                  position: 'absolute', zIndex: 1000,
                  bottom: '0px', left: '0px',
                  width: '200px',
                  borderRadius: '10px',
                  //- height: '500px',
                }`
                ).row.items-start.content-start.q-pa-xs.b-30
                q-btn(
                  v-for="(c,ci) in options" :key="ci"
                  @click="categoryClick(c)"
                  flat dense color="white" no-caps align="left" size="sm"
                  ).full-width {{ c.label }}
    //- handle video start, refresh
    div(
      :style=`{
      }`
      ).row.full-width.items-start.content-start.full-height
      q-btn(
        @click="nodeStart()"
        round flat dense
        :color="nodePlaying ? 'red' : 'white'"
        :icon="nodePlaying ? 'stop' : 'play_arrow'").q-mr-sm
      q-btn(
        @click="nodeRefresh()"
        round flat dense color="grey-8" icon="refresh")
      .col
      //- q-btn(
        round flat dense color="green" icon="fas fa-link")
      .col
      q-btn(
        @click="nodeCancel()"
        round flat dense color="grey-8" icon="clear")
      q-btn(
        @click="nodePublish()"
        round flat dense color="green" icon="check"
        :loading="nodePublishing")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'

export default {
  name: 'tintBarNode',
  props: ['player', 'convert', 'contentKalpa'],
  data () {
    return {
      node: {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: [],
        spheres: [],
        category: 'FUN',
      },
      nodePublishing: false,
      nodePlaying: false,
      nodeCategories: [],
      nodeCategoriesShow: false,
      width: 0,
      spheres: ''
    }
  },
  computed: {
    figureDuration () {
      return this.player.figure[1].t - this.player.figure[0].t
    },
    figurePercent () {
      return (this.player.currentTime - this.player.figure[0].t) / this.figureDuration
    },
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    },
    options () {
      // return this.nodeCategories
      return this.nodeCategories.reduce((acc, val) => {
        if (val.type !== 'ALL') {
          acc.push({
            value: val.type,
            label: val.alias.charAt(0).toUpperCase() + val.alias.slice(1),
          })
        }
        return acc
      }, [])
    }
  },
  watch: {
    'player.currentTime': {
      handler (to, from) {
        if (!this.nodePlaying) return
        this.$log('player.currentTime TO', to)
        if (to < this.player.figure[0].t || to >= this.player.figure[1].t) {
          this.player.setCurrentTime(this.player.figure[0].t)
        }
      }
    }
  },
  methods: {
    categoryClick (c) {
      this.$log('categoryClick', c)
      this.$set(this.node, 'category', c.value)
      this.nodeCategoriesShow = false
    },
    async onPan (e) {
      this.$log('onPan', e)
      if (e.delta.x === 0) return
      if (e.isFirst) {
        // this.$emit('first')
        // this.pointDragging = true
        // this.pointDraggingIndex = index
        this.player.pause()
      }
      // work
      let t = this.player.currentTime
      let tTotal = t + (e.delta.x * this.figureDuration) / this.width / this.figurePercent
      // this.$log('onPan t', t)
      this.player.setCurrentTime(tTotal)
      // final
      if (e.isFinal) {
        // await this.$wait(300)
        // this.$emit('final')
        // this.pointDragging = false
        // this.pointDraggingIndex = -1
      }
    },
    nodeCancel () {
      this.$log('nodeCancel')
      this.player.setState('figure', null)
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        let composition = {
          id: Date.now().toString(),
          thumbUrl: this.contentKalpa.thumbUrl,
          thumbHeight: this.contentKalpa.thumbHeight,
          thumbWidth: this.contentKalpa.thumbWidth,
          outputType: this.contentKalpa.type,
          layers: [
            {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: this.player.figure},
          ],
          operation: { items: null, operations: null, type: 'CONCAT' },
          __typename: 'Composition',
        }
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        nodeInput.items[0] = composition
        if (this.spheres.length > 0) {
          let spheres = this.spheres.split(',')
          nodeInput.spheres = spheres.reduce((acc, val) => {
            if (val.length > 0) {
              acc.push({name: val})
            }
            return acc
          }, [])
        }
        let nodeCreated = await ObjectCreateApi.essenceCreate(nodeInput)
        this.$log('nodePublish nodeCreated', nodeCreated)
        this.player.events.emit('node-created', nodeCreated)
        this.$log('nodePublish done')
        this.nodePublishing = false
        this.player.setState('figure', null)
      }
      catch (e) {
        this.$log('nodePublish')
        this.nodePublishing = false
      }
    },
    nodeStart () {
      this.$log('nodeStart')
      if (this.nodePlaying) {
        this.nodePlaying = false
      }
      else {
        this.nodePlaying = true
        if (this.figurePercent < 0 || this.figurePercent > 1) {
          this.player.setCurrentTime(this.player.figure[0].t)
        }
        this.player.play()
      }
      // if (this.player.playing) {
      //   this.player.pause()
      // }
      // else {
      //   if (this.figurePercent < 0 || this.figurePercent > 1) {
      //     this.player.setCurrentTime(this.player.figure[0].t)
      //   }
      //   this.player.play()
      // }
    },
    nodeRefresh () {
      this.$log('nodeRefresh')
      this.player.setCurrentTime(this.player.figure[0].t)
      // this.player.play()
    }
  },
  async mounted () {
    this.$log('mounted')
    this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
    // let {width, height} = this.$refs['figure-wrapper'].getBoundingClientRect()
    // this.width = width
  }
}
</script>
