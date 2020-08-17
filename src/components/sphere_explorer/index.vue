<template lang="pug">
//- kalpa-layout(
//-   :title="sphere ? sphere.name : ''"
//-   :style=`{height: $q.screen.height+'px'}`)
//-   template(v-slot:header)
//-     .row.full-width.justify-center
//-       div(
//-         :style=`{
//-           maxWidth: $store.state.ui.maxWidthPage+'px',
//-           zIndex: 30000,
//-           borderRadius: '0 0 10px 10px', overflow: 'hidden'
//-         }`
//-         ).row.full-width.items-center.content-center.justify-start.b-60.q-pa-sm
//-         q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
//-         .col.full-height
//-           .row.fit.items-center.content-center
//-             q-icon(name="blur_on" color="white" size="34px").q-mr-sm
//-             span(:style=`{fontSize: '16px'}`).text-white.text-bold {{ sphere.name }}
//-         q-btn(v-if="!isSubscribed" push color="green" no-caps @click="sphereFollow()") {{$t('Subscribe', 'Подписаться')}}
//-         q-btn(v-if="isSubscribed" flat color="green" no-caps @click="sphereUnfollow()") {{$t('UnSubscribe', 'Отписаться')}}
//-   template(v-slot:footer)
//-     div(:style=`{maxWidth: '800px', borderRadius: '10px 10px 0 0',}`).row.full-width.q-pa-sm.b-60
//-       q-btn(round flat color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
//-       .col
//-   template(v-slot:page)
//-     //- node add
//-     q-btn(
//-       @click="nodeAddStart()"
//-       push color="green" no-caps
//-       :style=`{
//-         position: 'fixed', zIndex: 10000,
//-         bottom: $q.screen.width > 1260 ? '10px' : '70px',
//-         left: 'calc(50% - 150px)',
//-         height: '50px',
//-         width: '300px',
//-       }`) {{$t('Add composition', 'Добавить образ')}}
//-     //- node editor
//-     q-dialog(
//-       v-model="nodeEditorOpened" position="bottom")
//-       ws-node-editor(
//-         @published="nodePublished"
//-         @close="nodeEditorOpened = false"
//-         :value="nodeEditorItem"
//-         :options=`{
//-           essenceEditable: true,
//-           itemAdd: true,
//-         }`
//-         :style=`{
//-           maxWidth: '800px',
//-           maxHeight: $q.screen.height-60+'px',
//-           minHeight: $q.screen.height-60+'px',
//-         }`)
//-     //- nodes
//-     kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
//-       template(v-slot=`{items,itemMore}`)
//-         list-middle(:items="items" :more="itemsMore")
//-           template(v-slot:itemFirst)
//-             div(:style=`{height: '70px'}`).row.full-width
//-           template(v-slot:item=`{item, index, indexMiddle}`)
//-             node(
//-               ctx="list" layout="PIP"
//-               :node="item" :index="index" :essence="true"
//-               :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
//-               :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
//-               :active="nodeListActive && index === indexMiddle"
//-               :mini="false")
//-           template(v-slot:itemLast)
//-             div(:style=`{height: '400px'}`).row.full-width
div(:style=`{position: 'relative'}`).column.fit
  //- navigation
  q-btn(
    @click="$store.commit('ui/stateSet', ['appShowMenu', true])"
    round flat color="white" icon="menu"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '24px', right: '24px',}`)
  q-btn(
    @click="$router.back()"
    round flat color="white" icon="keyboard_arrow_left"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '24px', left: '24px',}`)
  //- header
  div(:style=`{position: 'absolute', zIndex: 10000, top: '0px',}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px', borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).row.full-width.b-60
      //- sphere actions
      .row.full-width.items-center.content-center.q-pa-sm
        .col
          q-icon(color="white" name="blur_on" size="30px").q-mr-sm
          span.text-white.text-bold {{ $t('sphereExplorer', 'Сфера сути') }}
        q-btn(color="green" dense no-caps).q-px-sm {{$t('sphereExplorer_follow', 'Подписаться')}}
      //- sphere.name
      .row.full-width.items-center.content-center.q-py-sm.q-px-md
        span(v-if="sphere").text-bold.text-white {{ sphere.name }}
  //- body
  .col.full-width
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items,itemMore}`)
        list-middle(:items="items" :more="itemsMore")
          template(v-slot:itemFirst)
            div(:style=`{height: '100px'}`).row.full-width
          template(v-slot:item=`{item, index, indexMiddle}`)
            node(
              ctx="list" layout="PIP"
              :node="item" :index="index" :essence="true"
              :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
              :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
              :active="nodeListActive && index === indexMiddle"
              :mini="false")
          template(v-slot:itemLast)
            div(:style=`{height: '400px'}`).row.full-width
  //- footer: navigation, type picker
  div(
    v-if="false"
    :style=`{position: 'absolute', zIndex: 10000, bottom: '0px',}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).row.full-width.justify-center.b-60
      q-tabs(v-model="tab" no-caps dense active-color="green").text-white
        q-tab(v-for="t in tabs" :key="t.id" :name="t.id" :label="t.name")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'sphereExplorer',
  props: ['mode', 'sphere'],
  data () {
    return {
      tab: 'nodes',
      nodeEditorOpened: false,
      nodeEditorItem: null,
      nodeListActive: true,
      isSubscribed: false,
    }
  },
  computed: {
    sphereOid () {
      return this.sphere.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid
        }
      }
    },
    tabs () {
      return [
        {id: 'nodes', name: 'Nodes'},
        {id: 'contents', name: 'Content'}
      ]
    }
  },
  watch: {
    nodeEditorOpened: {
      handler (to, from) {
        this.$log('nodeEditorOpened TO', to)
        if (to) this.nodeListActive = false
        else this.nodeListActive = true
      }
    }
  },
  methods: {
    nodeEditorStart () {
      this.$log('nodeEditorStart')
      this.nodeEditorShow = !this.nodeEditorShow
    },
    async nodeAddStart () {
      this.$log('nodeAddStart', this.node)
      // create nodeInput
      let nodeInput = {
        name: '',
        wsItemType: 'WS_NODE',
        items: [],
        spheres: [{id: Date.now(), name: this.sphere.name}],
        category: 'FUN',
        layout: 'PIP',
      }
      this.$log('nodeInput', nodeInput)
      // create item
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeAdd item', item)
      // mute all
      // this.stateNodeExplorer.set('nodeActive', false)
      this.$log('nodeAddStart done')
      // open editor
      this.nodeEditorItem = item
      this.nodeEditorOpened = true
    },
    async nodePublished (oid) {
      this.$log('nodePublished', oid)
      this.$q.notify({
        type: 'positive',
        message: 'Образ успешно добавлен!',
      })
      // await this.$wait(200)
      // this.$router.push(`/node/${oid}`).catch(e => e)
    },
    async sphereFollow () {
      this.$log('sphereFollow')
      let res = await UserApi.subscribe(this.sphere.oid)
      this.$log('res', res)
      this.isSubscribed = true
    },
    async sphereUnfollow () {
      this.$log('sphereUnfollow')
      if (!confirm(`Unfollow user ${this.sphere.name} ? `)) return
      let res = await UserApi.unSubscribe(this.sphere.oid)
      this.$log('res', res)
      this.isSubscribed = false
    }
  },
  async mounted () {
    this.$log('mounted')
    this.isSubscribed = await UserApi.isSubscribed(this.sphere.oid)
    this.$log('itsSubscribed', this.isSubscribed)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
