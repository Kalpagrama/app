<template lang="pug">
div(style=`position: relative`).column.fit
  //- header
  //- slot(name="header")
  div(style=`height: 60px; borderRadius: 8px`).row.items-center.q-pl-md.q-pr-sm.bg-white
    span {{$t('nodes')}}
    .col
    q-btn(round flat icon="add" color="primary" @click="nodeCreateFromEmpty()")
      q-tooltip {{$t('create_node_from_empty')}}
  //- body
  .col.scroll.q-mt-md
    kFeed(queryKey="feed" :items="getNodes" :workspace="true" @nodeCreateFromNode="nodeCreateFromNode" :mini="true")
      template(v-slot:footer="{index, node, nodeFull}")
        div(style=`height: 60px`).row.full-width.items-center.justify-between.q-px-sm
          .col
          q-btn(icon="more_vert" round flat color="grey-9")
            q-menu()
              .row.fit.items-start.content-start.bg-white
                div(v-for="(m, mi) in menus" :key="mi" style=`height: 40px; borderBottom: 1px solid #eee`).row.full-width
                  span {{ m.name }}
      template(v-slot:actions="{index, node, nodeFull}")
        .row.q-pa-sm
          //- @click="nodeCreateFromFragment(index, node, nodeFull)"
          q-btn(round dense color="primary" icon="more_vert")
            q-menu
              .row.fit.bg-white
                div(v-for="(m, mkey) in menusFragment" :key="mkey"
                  style=`height: 40px; borderBottom: 1px solid #eee`
                  ).row.full-width.items-center
</template>

<script>
import kFeed from 'components/kFeed'
import kVisible from 'components/kVisible'
import nodeCard from 'components/node/node_card'

export default {
  name: 'pageApp__Workspace__Nodes',
  components: {kFeed, kVisible, nodeCard},
  data () {
    return {
      query: gql`
        query objectList {
          objectList(oids: ["AYjfv8rBIE0="]) {
            oid
            type
            thumbUrl(preferWidth: 600)
            name
            ...on Node {
              fragments {
                content {
                  oid
                  type
                }
                relativePoints { x y z}
                relativeScale
                url
              }
            }
          }
        }
      `,
      menus: {
        details: {name: 'node_details'},
        copy: {name: 'node_copy'},
        delete: {name: 'node_delete'}
      },
      menusFragment: {
        fork: {name: 'fork'},
        toContent: {name: 'to_content'},
        addContent: {name: 'add_content'}
      }
    }
  },
  computed: {
    getNodes () {
      let n = this.$store.state.workspace.workspace.nodes
      return n
    }
  },
  methods: {
    nodeCreateFromNode ({node, nodeFull}) {
      this.$log('nodeCreateFromNode', node, nodeFull)
      this.$q.notify('nodeCreateFromNode')
      let n = JSON.stringify(nodeFull)
      delete n.oid
      this.$router.push({path: '/app/create', query: {from: 'node', data: n}})
    },
    nodeCreateFromFragment (index, node, nodeFull) {
      this.$log('nodeCreateFromFragment')
      this.$q.notify('nodeCreateFromFragment')
      let n = {name: '', spheres: [], fragments: [null, null]}
      n.fragments[index] = nodeFull.fragments[index]
      n.fragments[index]['oid'] = nodeFull.fragments[index].content.oid
      this.$router.push({path: '/app/create', query: {from: 'fragment', data: JSON.stringify(n)}})
    },
    nodeCreateFromEmpty () {
      this.$log('nodeCreateFromEpty')
      this.$q.notify('nodeCreateFromEmpty')
      this.$router.push({path: '/app/create', query: {from: 'empty'}})
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
