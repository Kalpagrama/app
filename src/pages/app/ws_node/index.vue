<template lang="pug">
ws-node-editor(v-if="node" :node="node")
//- q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.b-30
        div(
          :style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between.q-px-md
          span(:style=`{fontSize: '19px'}`).text-white.text-bold Редактор ядра
  q-page-container
    q-page(:style=`{paddingBottom: '200px',}`)
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px',}`).row.full-wdith.items-start.content-start
          //- small.text-white {{ node }}
          div(v-if="node").row.full-width.items-start.content-start
            div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-50
              node-item(
                v-for="(i,ii) in node.items" :key="ii" :node="node" :item="i" :itemIndex="ii"
                :style=`{zIndex: 100}`)
              .row.full-width
                div(
                  :style=`{
                    position: 'relative',
                    marginTop: '-10px',
                    borderRadius: '10px', overflow: 'hidden'
                  }`).row.full-width
                  q-input(
                    v-model="node.name"
                    filled dense dark color="white" type="textarea"
                    placeholder="В чем суть?"
                    :input-style=`{
                      paddingTop: '20px',
                      minHeight: '60px',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }`
                    ).full-width.b-50
            //- spheres
            .row.full-width.q-py-sm
              q-btn(flat no-caps color="green" icon="blur_on").full-width Добавить сферу сути
            //- q-btn(
              @click="nodeAdd()"
              flat color="green" size="lg" icon="add"
              :style=`{height: '100px',}`
              ).full-width.b-50.q-my-md
      q-page-sticky(expand position="bottom")
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px', height: '50px',}`).row.full-width.items-center.content-center.q-px-sm
            q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
            .col
            q-btn(
              @click="publish()"
              no-caps color="green"
              :loading="publishing"
              ) Опубликовать
            //- q-tabs(v-model="type" no-caps dense active-color="white" align="left" switch-indicator).text-grey-4
            //-   q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './node_item/index.vue'

export default {
  name: 'pageApp_wsNode',
  components: {nodeItem},
  meta () {
    return {
      title: this.node ? this.node.name : ''
    }
  },
  data () {
    return {
      node: null,
      publishing: false,
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          let {items: [item]} = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_NODE,
              id: to
            }
          })
          this.node = item
        }
      }
    }
  },
  methods: {
    nodeAdd () {
      this.$log('nodeAdd')
    },
    publishCheck () {
      if (!this.node.category) throw new Error('No node.category !')
      // if (this.node.name.length === 0) throw new Error('No node.essence !')
      if (this.node.layout !== 'PIP') throw new Error('Only PIP layout for now !')
      if (this.node.items.length > 5) throw new Error('5 items maximum !')
      if (this.node.spheres.length > 5) throw new Error('5 spheres maximum !')
      // throw new Error('Wrong!')
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        await this.$wait(500)
        this.publishCheck()
        let createdNode = await NodeApi.nodeCreate(this.node)
        await this.node.updateExtended('stage', 'published', false)
        await this.node.updateExtended('oid', createdNode.oid, false)
        this.$log('publish done', createdNode.oid)
        this.publishing = false
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: 'Ядро отправлено на публикацию!'})
      }
      catch (e) {
        this.$log('publish error', e)
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          message: e.toString()})
        this.publishing = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
  }
}
</script>
