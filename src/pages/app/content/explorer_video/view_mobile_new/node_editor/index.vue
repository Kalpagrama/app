<template lang="pug">
div(
  :style=`{
    overflow: 'hidden',
  }`
  ).row.full-width
  //- itemFinder
  q-dialog(
    v-model="itemFinderShow"
    position="bottom" maximized)
    kalpa-finder(
      @contentKalpa="itemFound"
      :pages=`{
        workspace: {views: ['image', 'video', 'node', 'sphere', 'user']},
        kalpagrama: {views: ['all', 'users', 'nodes']},
        gif: {views: ['all']},
        web: {views: ['all', 'image', 'video',]}
      }`
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        height: $q.screen.height+'px',
      }`).b-30
      template(v-slot:header)
        div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="itemFinderShow = false")
          .col
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Выбрать связь
      template(v-slot:tint=`{item}`)
        div(
          @click="itemFound(item)"
          :style=`{position: 'absolute', zIndex: 1000,}`).row.fit
  div(
    :style=`{
      marginTop: '-20px',
      paddingTop: '20px',
      background: 'rgb(35,35,35)',
      borderRadius: '0 0 10px 10px',
    }`
    ).row.full-width
    name-editor(:node="node")
    //- spheres, links, names
    div(:style=`{order: 2}`).row.full-width.justify-center.q-py-sm
      //- innputs
      div(:style=`{maxWidth: '480px',}`).row.full-width.justify-center
        q-btn(round flat color="green" icon="link")
        .col
          q-input(
            v-if="true"
            v-model="sphere"
            borderless dense
            dark
            :disable="node.spheres.length > 2"
            :placeholder="node.spheres.length > 2 ? '3 сферы максимум' : 'Добавить сферу'"
            :input-style=`{
              textAlign: 'center',
              borderRadius: '10px',
              whiteSpace: 'nowrap',
            }`
            :style=`{
              borderRadius: '10px',
            }`
            @keyup.enter="sphereAdd"
            ).b-40
        q-btn(
          v-if="!node.items[1]"
          @click="itemFinderShow = true, $emit('active', false)"
          round flat color="green" icon="link")
        q-btn(
          v-else
          @click="node.items = [node.items[0]], node.vertices = []"
          round flat color="green" icon="link_off")
    //- spheres list
    div(:style=`{height: 'auto'}`).row.full-width.justify-center.scroll.q-pa-sm
      .row.no-wrap.q-pr-sm
        q-btn(
          v-for="(s,si) in node.spheres" :key="si"
          @click="sphereClick(s, si)"
          flat no-caps color="grey-4" dense
          ).b-40.q-mr-sm
          .row.items-center.content-center.no-wrap
            q-icon(name="blur_on" size="18px" color="grey-4").q-mr-sm
            span(:style=`{whiteSpace: 'nowrap'}`) {{ s.name }}
    div(:style=`{order: 2}`).row.full-width.justify-center.q-pb-sm
      category-editor(
        :node="node"
        :style=`{
          maxWidth: '400px',
        }`)
  //- footer
  .row.full-width.justify-center.q-py-sm
    div(:style=`{maxWidth: '400px'}`).row.full-width
      q-btn(
        @click="publish()"
        color="green" no-caps
        :loading="publishing"
        :style=`{
          height: '50px',
        }`
        ).full-width
        span.text-bold Опубликовать
      q-btn(
        @click="$emit('close')"
        color="grey-4" no-caps flat
        ).full-width.q-mt-sm Отмена
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'

export default {
  name: 'nodeEditor',
  props: ['node'],
  components: {
    kalpaFinder: () => import('components/kalpa_finder/index.vue'),
    nameEditor: () => import('./name_editor.vue'),
    categoryEditor: () => import('./category_editor.vue')
  },
  data () {
    return {
      sphere: '',
      sphereAdding: false,
      publishing: false,
      itemFinderShow: false,
    }
  },
  methods: {
    sphereAdd () {
      this.$log('sphereAdd')
      if (this.sphere.length === 0) return
      if (this.node.spheres.find(s => s.name === this.sphere)) return
      this.node.spheres.push({name: this.sphere})
      this.sphere = ''
    },
    sphereClick (sphere, si) {
      this.$log('sphereClick', sphere, si)
      this.node.spheres = this.node.spheres.filter(s => s.name !== sphere.name)
    },
    async itemFound (item) {
      this.$log('itemFound', item)
      this.itemFinderShow = false
      this.$emit('active', true)
      // from ws
      if (item.wsItemType) {
        // WS_BOOKMARK
        if (item.wsItemType === 'WS_BOOKMARK') {
          // this.node.items[1] = item
          item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
          this.$set(this.node.items, 1, item)
        }
        // WS_NODE
        if (item.wsItemType === 'WS_NODE') {
          this.node.items[1] = item
        }
      }
      // from kalpa, published
      else {
        if (item.type === 'VIDEO') {
          alert('VIDEO')
          this.node.items[1] = item
        }
        else if (item.type === 'IMAGE') {
          this.node.items[1] = item
        }
        else if (item.type === 'NODE') {
          // ?
        }
        else if (item.type === 'USER') {
          // ?
        }
        else if (['SPHERE', 'WORD', 'SENTENCE'].includes(item.type)) {
          // ?
        }
        else if (item.type === 'GIF') {
          alert('content.GIF')
          this.node.items[1] = item
        }
      }
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        if (nodeInput.items.length === 1) {
          // this.$router.push(`/node/${createdNode.oid}`).catch(e => e)
          nodeInput.vertices = []
        }
        if (nodeInput.items.length === 2) {
          if (nodeInput.name.length === 0) {
            // nodeInput.vertices = ['ASSOCIATIVE', 'ASSOCIATIVE']
            // TODO: pick vertices
          }
          else {
            nodeInput.vertices = ['ESSENCE', 'ESSENCE']
          }
        }
        this.$log('nodeInput', nodeInput)
        let createdNode = await ObjectCreateApi.essenceCreate(nodeInput)
        this.$log('publish createdNode', createdNode)
        // rightItem ? joint : node...
        // publish content... content&content
        // publish node... node&content
        // publish user... node
        // here we have node&[content,user,sphere,node]
        this.$log('publish done')
        this.publishing = false
        this.$emit('close')
      }
      catch (e) {
        this.$log('publish error', e)
        this.publishing = false
      }
    },
  }
}
</script>
