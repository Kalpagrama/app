<template lang="pug">
div(
  :style=`{
  }`
  ).row.full-width.items-start.content-start.q-px-xs.b-30
  //- header joint name, always?
  div(
    :style=`{
      position: 'relative',
      //- overflow: 'hidden',
      minHeight: '60px',
      textAlign: 'center',
      paddingLeft: '70px', paddingRight: '70px',
    }`
    ).row.full-width.items-center.content-center.justify-center
    q-btn(
      @click="nameToggle()"
      round flat
      icon="multiple_stop"
      :color="joint.vertices[0] === 'ESSENCE' ? 'white' : 'green'"
      :style=`{
        borderRadius: '50%',
        overflow: 'hidden',
      }`).q-ml-sm.rotate-90
    div(:style=`{position: 'relative',}`).col
      div(
        v-if="showVertices"
        :style=`{
          position: 'absolute', zIndex: 10000,
          transform: 'translate3d(0,0,1000px)',
          left: '8px', maxWidth: 'calc(100% - 16px)',
          borderRadius: '30px',
        }`
        ).row.full-width.items-start.cotent-start.q-pa-sm.b-60
        q-btn(
          v-for="(v,vi) in vertices" :key="vi"
          @click="vertexClick(v)"
          flat dense color="white" no-caps
          :style=`{
            height: '30px',
          }`
          ).row.full-width {{ v.name }}
      q-input(
        v-if="joint.vertices[0] === 'ESSENCE'"
        v-model="joint.name"
        borderless dark
        type="textarea" autorgrow
        :placeholder="'В чем связь ?'"
        :rows="1"
        :input-style=`{
          textAlign: 'center',
          paddingTop: '18px',
          paddingBottom: '18px',
          paddingLeft: '50px',
          paddingRight: '50px',
          //- minHeight: '60px',
        }`
        :style=`{
          zIndex: 300,
          //- textAlign: 'center'
        }`
        ).full-width
      span(v-else-if="joint.vertices[0] === 'ASSOCIATIVE'").text-white Ассоциация
      div(v-else).row.full-width
        .row.full-width.justify-center
          span.text-white {{ $nodeItemType(joint.vertices[0]).name }}
        .row.full-width.justify-center
          span.text-white {{ $nodeItemType(joint.vertices[1]).name }}
    q-btn(
      @click="showVertices = !showVertices"
      round flat color="white"
      :icon="showVertices ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
      :style=`{
        borderRadius: '50%',
        opacity: joint.vertices[0] === 'ESSENCE' ? 0 : 1,
      }`).q-mr-sm
    q-icon(
      name="fas fa-link" size="80px"
      :style=`{
        color: 'rgb(38,38,38)',
        position: 'absolute', zIndex: 20000,
        top: '-10px',
        left: '8px',
      }`)
    //- q-btn(
      @click="stepBack()"
      round flat color="grey-6" icon="clear"
      :style=`{
        position: 'absolute', zIndex: 400,
        top: '8px', right: '8px',
      }`)
  //- finder
  view-finder(
    v-if="viewId === 'finder'"
    @item="itemFound")
  //- add
  div(
    v-if="viewId === null"
    :style=`{
      position: 'relative',
      paddingBottom: '50%',
    }`).row.full-width
    div(
      :style=`{
        position: 'absolute', zIndex: 100,
      }`).row.fit
      q-btn(
        @click="viewId = 'finder'"
        flat color="green" icon="add" size="xl"
        ).fit.b-50
    //- menu
    div(
      :style=`{
        position: 'fixed', zIndex: 1000, left: '0px', bottom: '0px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
      }`
      ).row.full-width.items-center.content-center.justify-center.q-px-sm.q-pt-sm
      div(
        :style=`{
          background: 'rgb(40,40,40)',
          borderRadius: '20px',
          maxWidth: '400px',
          minHeight: '66px',
        }`
        ).row.full-width.q-pa-sm
        q-btn(
          @click="stepBack()"
          round flat color='white' icon="west")
  //- editor
  div(
    v-if="viewId === 'editor'"
    ).row.full-width.items-start.content-start
    node-items-item(
      :item="joint.items[1]"
      :itemOpened="false"
      :itemActive="true"
      :styles=`{
        height: '300px',
        objectFit: 'contain',
      }`)
    //- small.text-white {{ joint.items[1] }}
    div(
      :style=`{
        position: 'fixed', zIndex: 1000, left: '0px', bottom: '0px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
      }`
      ).row.full-width.items-center.content-center.justify-center.q-px-sm.q-pt-sm
      div(
        :style=`{
          background: 'rgb(40,40,40)',
          borderRadius: '20px',
          maxWidth: '400px',
          minHeight: '66px',
        }`
        ).row.full-width.q-pa-sm
        q-btn(
          @click="itemDelete"
          round flat color='white' icon="west")
        .col
        q-btn(
          @click="publish()"
          color="green" flat no-caps
          :loading="publishing")
          span Опубликовать
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'
import { ContentApi } from 'src/api/content'

// import kalpaFinder from 'components/kalpa_finder/index.vue'
import viewFinder from './view_finder.vue'
import nodeItemsItem from 'components/node_feed/node_items_item.vue'

export default {
  name: 'jointCreator',
  props: ['item', 'height'],
  components: {
    // kalpaFinder,
    viewFinder,
    nodeItemsItem,
  },
  data () {
    return {
      viewId: null, // finder
      joint: {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: ['ASSOCIATIVE', 'ASSOCIATIVE'],
        spheres: [],
        category: 'FUN',
      },
      publishing: false,
      showVertices: false,
      // itemFinderShow: false,
    }
  },
  computed: {
    vertices () {
      return this.$nodeItemTypes
    }
  },
  methods: {
    vertexClick (v) {
      this.$log('vertexClick')
      // this.joint.name = ''
      this.joint.vertices = [v.id, v.pair]
      this.showVertices = false
    },
    nameToggle () {
      this.$log('nameToggle')
      if (this.joint.vertices[0] === 'ESSENCE') {
        this.joint.name = ''
        this.joint.vertices = ['ASSOCIATIVE', 'ASSOCIATIVE']
      }
      else {
        this.joint.vertices = ['ESSENCE', 'ESSENCE']
      }
    },
    itemEdit () {
      this.$log('itemEdit')
    },
    itemDelete () {
      this.$log('itemDelete')
      this.viewId = null
      this.$delete(this.joint.items, 1)
    },
    stepBack () {
      this.$log('stepBack')
      if (this.viewId === 'finder') {
        this.viewId = null
      }
      else if (this.viewId === 'editor') {
        // save & exit ?
        this.$emit('close')
      }
      else if (this.viewId === null) {
        this.$emit('close')
      }
    },
    async itemFound (item) {
      this.$log('itemFound', item)
      // from ws
      if (item.wsItemType) {
        // WS_BOOKMARK
        if (item.wsItemType === 'WS_BOOKMARK') {
          item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
          // this.$set(this.node.items, 1, item)
        }
        // WS_NODE
        if (item.wsItemType === 'WS_NODE') {
          // this.node.items[1] = item
        }
      }
      // from kalpa, published
      else {
        if (item.type === 'GIF') {
          // item = ???
          // TODO: schedule getContentByUrl()
          // this.node.items[1] = item
          // this.$set(this.node.items, 1, item)
        }
        else {
          // this.node.items[1] = item
          // this.$set(this.node.items, 1, item)
        }
      }
      this.$set(this.joint.items, 1, item)
      this.viewId = 'editor'
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        // await this.$wait(500)
        let jointInput = JSON.parse(JSON.stringify(this.joint))
        jointInput.items[0] = this.item
        if (jointInput.items.length === 1) {
          jointInput.vertices = []
        }
        if (jointInput.items.length === 2) {
          if (jointInput.name.length === 0) {
            if (jointInput.vertices.length === 0) {
              jointInput.vertices = ['ASSOCIATIVE', 'ASSOCIATIVE']
            }
          }
          else {
            jointInput.vertices = ['ESSENCE', 'ESSENCE']
          }
        }
        // let jointInput = this.joint
        // jointInput.items[0] = this.item
        // popuplate jointInput.items[1] fo GIF
        this.$log('jointInput', jointInput)
        if (jointInput.items[1].type === 'GIF' && !jointInput.items[1].oid) {
          let contentKalpa = await ContentApi.contentCreateFromUrl(jointInput.items[1].url)
          jointInput.items[1].oid = contentKalpa.oid
        }
        this.$log('jointInput', jointInput)
        this.$log('publish done')
        this.publishing = false
        // let createdNode = null
        let createdNode = await ObjectCreateApi.essenceCreate(jointInput)
        this.$log('publish createdNode', createdNode)
        this.$emit('close')
        // this.$emit('published', createdNode)
        // this.cancel()
      }
      catch (e) {
        this.$log('publish error', e)
        this.publishing = false
      }
    },
  }
}
</script>
