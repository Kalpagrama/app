<template lang="pug">
q-layout(
  view="hHh Lpr lff" container
  :style=`{
    zIndex: 4000, width: 600+'px', height: 600+'px',
    borderRadius: '10px', overflow: 'hidden'}`).b-30
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px',}`
        ).row.full-width.items-center.content-center.q-px-sm.b-30
        //- header
        //- .row.full-width.items-center.content-center.q-py-sm
          q-btn(round flat color="white" icon="insert_link" @click="$emit('close')")
          span(:style=`{fontSize: '18px',}`).text-bold.text-white Связать это ядро
        //- with picker
        div(
          v-if="withType"
          :style=`{paddingLeft: '0px',}`).row.full-width.items-center.content-center.q-py-sm
          q-btn(round flat color="white" icon="insert_link")
          .col
            .row.fit.items-center.content-center
              span(:style=`{fontSize: '18px',}`).text-bold.text-white Связать
              q-btn(
                flat dense no-caps color="white"
                icon-right="keyboard_arrow_down"
                ).q-mx-sm.b-40
                span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm {{ withTypes.find(t => t.id === withType).name }}
                q-menu(fit)
                  div(:style=`{maxWidth: '150px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-40
                    q-btn(
                      v-for="t in withTypes" :key="t.id" @click="withType = t.id, item = null"
                      flat dense no-caps color="white" align="left"
                      v-close-popup).full-width
                      span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm {{ t.name }}
          q-btn(round flat color="white" icon="clear" @click="$emit('close')")
        //- filters
        div(v-if="!item && withType").row.full-width.items-start.content-start.q-px-sm
          div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="searchString"
              filled dark dense color="grey-6"
              placeholder="Search").full-width
  q-page-container
    .row.full-width.q-px-sm
      //- item pick find...
      div(v-if="!item && withType").row.full-width
        component(
          :is="`with-${withType}`" :searchString="searchString"
          @item="item = $event")
      div(v-if="item").row.full-width
        //- item wrapper preview
        div(:style=`{paddingLeft: '40px', position: 'relative',}`).row.full-width.q-py-sm.q-mb-md
          q-btn(
            @click="item = null"
            round flat dense color="grey-6" icon="clear"
            :style=`{position: 'absolute', zIndex: 1000, left: '2px', top: 'calc(50% - 20px)',}`)
          ws-node-item(
            v-if="item.wsItemType === 'WS_NODE'" :node="item"
            :style=`{maxWidth: '50%'}`)
          ws-node-item(
            v-if="item.wsItemType === 'WS_BOOKMARK' && item.type === 'NODE'"
            :node="{oid: item.oid, name: item.name, items: [{thumbUrl: item.thumbUrl}]}"
            :style=`{maxWidth: '50%'}`)
          ws-node-item(
            v-if="!item.wsItemType && item.type === 'NODE'"
            :node="{oid: item.oid, name: item.name, items: item.metaStatic.items}"
            :style=`{maxWidth: '50%'}`)
          div(
            v-if="item.wsItemType === 'WS_SPHERE'"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`
            ).row.b-50.q-pa-md
            q-icon(name="blur_on" size="40px" color="white").q-mr-sm
            span(:style=`{fontSize: '24px',}`).text-white.text-bold.q-mr-lg {{ item.name }}
          ws-content-item(
            v-if="item.wsItemType === 'WS_BOOKMARK' && item.type === 'CONTENT'" :content="item"
            :style=`{}`
            ).full-width
        //- by ASSOCIATIVE
        div(
          :style=`{paddingLeft: '32px',}`
          ).row.full-width
          q-checkbox(
            :label="'Расширенный вариант'"
            dark color="green"
            v-model="byTypeDescribed"
            @input="e => e ? byType = 'ESSENCE' : byType = 'ASSOCIATIVE'"
            :style=`{}`
            ).text-grey-6
        //- by pick
        div(
          v-if="byType !== 'ASSOCIATIVE'"
          :style=`{paddingLeft: '40px',}`).row.full-width.items-center.content-center
          //- span(:style=`{fontSize: '18px',}`).text-bold.text-white how
          q-btn(
            flat dense no-caps color="white"
            icon-right="keyboard_arrow_down"
            ).b-40.q-mr-sm
            span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm {{ byTypes.find(t => t.id === byType).name }}
            q-menu(fit)
              div(:style=`{maxWidth: '300px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-40
                q-btn(
                  v-for="t in byTypes" :key="t.id" @click="byType = t.id"
                  flat dense no-caps color="white" align="left"
                  v-close-popup).full-width
                  span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm {{ t.name }}
        //- by body
        div(
          v-if="byType === 'ESSENCE'"
          :style=`{paddingLeft: '40px',}`).row.full-width.q-py-sm.q-mb-md
          div(:style=`{position: 'relative', zIndex: 1000, borderRadius: '10px', overflow: 'hidden'}`).full-width
            q-input(
              v-model="name"
              filled dark color="grey-6" type="textarea" autogrow autofocus
              placeholder="How are dots connected?"
              ).full-width
        //- confirm
        div(:style=`{paddingLeft: '40px',}`).row.full-width.q-py-sm
          q-btn(
            @click="link()"
            color="green" no-caps size="lg" align="left"
            icon="insert_link"
            :loading="linking"
            :style=`{minWidth: '200px',}`)
            span(:style=`{}`).text-white.text-bold.q-ml-md Связать
        //- debug
        //- div(:style=`{paddingLeft: '40px',}`).row.full-width
          small.text-grey-6 {{byType}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

import withContent from './with_content.vue'
import withSphere from './with_sphere.vue'
import withNode from './with_node.vue'

export default {
  name: 'pageApp_node_nodeLinker',
  components: {withContent, withSphere, withNode},
  props: ['node'],
  data () {
    return {
      searchString: '',
      withType: null,
      byType: 'ASSOCIATIVE',
      byTypeDescribed: false,
      item: null,
      linking: false,
      name: '',
    }
  },
  computed: {
    withTypes () {
      return [
        {id: 'sphere', name: 'со сферой'},
        {id: 'node', name: 'с ядром'},
        {id: 'content', name: 'с контентом'}
      ]
    },
    byTypes () {
      return [
        {id: 'ESSENCE', name: 'по сути'},
        // {id: 'ASSOCIATIVE', name: 'как ассоциацию'},
        {id: 'CAUSE_EFFECT', name: 'как следсвие'},
        {id: 'EFFECT_CAUSE', name: 'как причину'},
        {id: 'PROBLEM_SOLUTION', name: 'как решение'},
        {id: 'SOLUTION_PROBLEM', name: 'как источник проблемы'},
        {id: 'FALSE_TRUE', name: 'как опровержение'},
        {id: 'TRUE_FALSE', name: 'как фейк'},
        {id: 'FROM_TO', name: 'нужно перед'},
        {id: 'TO_FROM', name: 'нужно после'}
      ]
    },
    width () {
      if (this.$q.screen.width < 800) return this.$q.screen.width
      else return 800
    },
  },
  methods: {
    async link () {
      try {
        this.$log('link start', this.item)
        this.linking = true
        await this.$wait(500)
        let oid
        if (this.item.wsItemType === 'WS_CONTENT') oid = this.item.contentOid
        else oid = this.item.oid
        if (!oid) throw new Error('No oid!')
        let jointInput
        if (['EFFECT_CAUSE', 'SOLUTION_PROBLEM', 'TRUE_FALSE', 'TO_FROM'].includes(this.byType)) {
          jointInput = { leftItem: {oid: this.node.oid}, rightItem: {oid: oid} }
        }
        else {
          jointInput = { leftItem: {oid: oid}, rightItem: {oid: this.node.oid} }
        }
        if (this.byType === 'ESSENCE') {
          if (this.name.length === 0) throw new Error('No name for ESSENCE!')
          jointInput.name = this.name
        }
        // jointType
        if (this.byType === 'EFFECT_CAUSE') jointInput.jointType = 'CAUSE_EFFECT'
        else if (this.byType === 'SOLUTION_PROBLEM') jointInput.jointType = 'PROBLEM_SOLUTION'
        else if (this.byType === 'TRUE_FALSE') jointInput.jointType = 'FALSE_TRUE'
        else if (this.byType === 'TO_FROM') jointInput.jointType = 'FROM_TO'
        else jointInput.jointType = this.byType
        this.$log('jointInput', jointInput)
        // jointCreate
        let joint = await NodeApi.jointCreate(jointInput)
        this.$log('link done joint', joint)
        this.linking = false
        this.$emit('close')
      }
      catch (e) {
        this.$log('link error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.linking = false
      }
    },
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(500)
    this.withType = 'node'
  }
}
</script>
