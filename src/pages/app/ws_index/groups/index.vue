<template lang="pug">
.row.full-width.justify-center.q-pt-sm
  div(:style=`{maxWidth: 700+'px'}`).row.full-width
    groups-list(
      v-if="!node"
      :nodes="nodes"
      @node="node = $event"
      @create="nodeParentCreate")
    div(v-if="node").row.full-width
      //- header
      .row.full-width.items-start.content-start
        q-btn(
          @click="node = null"
          round flat color="white" icon="keyboard_arrow_left"
          :style=`{height: '60px',}`)
        .col
          q-input(
            v-model="node.name"
            borderless dark
            type="textarea" autogrow
            :input-style=`{
              fontSize: '18px',
              fontWeight: 'bold',
              paddingLeft: '10px',
              paddingRight: '10px',
            }`
            ).full-width.text-bold
      //- views
      div(:style=`{paddingLeft: '40px',}`).row.full-width.text-white.q-pb-xs
        q-btn(
          @click="viewId = v"
          v-for="v in views" :key="v"
          flat no-caps
          :class="{'b-40': viewId === v}"
          :color="viewId === v ? 'green' : 'grey-7'") {{ v }}
      //- body
      component(
        :is="`view-${viewId}`"
        :node="node")
</template>

<script>
export default {
  name: 'wsGroups',
  components: {
    groupsList: () => import('./groups_list.vue'),
    viewFiles: () => import('./view_files.vue'),
    viewArticle: () => import('./view_article.vue'),
    viewGraph: () => import('./view_graph.vue'),
  },
  data () {
    return {
      viewId: 'article',
      views: ['files', 'article', 'graph'],
      nodes: [
        {
          id: '1',
          name: 'g 1',
          items: [
            {id: '7', type: 'TEXT', links: [], order: 5, item: {text: 'lorem ipsum dolor sit amet lorem ipsum'}, style: {border: '1px solid red'}, class: 'q-pa-xl'},
            {id: '8', type: 'TEXT', links: [], order: 6, item: {text: 'Hello world'}}
          ],
          links: [
            {
              id: 'l1',
              type: 'ESSENCE',
              items: ['7', '8'],
              name: '',
            }
          ],
          order: 0,
        },
        {
          id: '2',
          name: 'g 2',
          items: [],
          links: [],
          order: 0
        }
      ],
      links: [],
      node: null
    }
  },
  methods: {
    async nodeParentCreate () {
      this.$log('nodeParentCreate')
      let nodeParentInput = {
        id: Date.now().toString(),
        name: Date.now().toString(),
        items: [],
        links: [],
        order: 0
      }
      this.nodes.push(nodeParentInput)
      this.node = nodeParentInput
    },
    nodeAdd (nodeParent) {
      this.$log('nodeAdd')
      nodeParent.items.push({
        id: Date.now().toString(),
        type: 'p',
        links: [],
        items: [],
        order: 5,
        item: {text: ''}
      })
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
