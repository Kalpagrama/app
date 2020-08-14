<template lang="pug">
q-btn(
  @click="start()"
  round push color="green" icon="add"
  :style=`{
    position: 'absolute', zIndex: 500, left: 'calc(50% - 20px)', bottom: '10px',
    borderRadius: '50%',
  }`)
  //- typePicker dialog
  q-dialog(v-model="typePickerOpened" position="bottom")
    .column.fit
      div(:style=`{}`).col.full-width.scroll
        .row.full-width.justify-center
          div(:style=`{maxWidth: '300px', borderRadius: '10px'}`).row.full-width.items-start.content-start.b-50
            .row.full-width.q-pa-md
              h6.text-white.text-bold.q-my-xs Выбери тип связи
            div(
              @click="typeClick(t)"
              v-for="(t,ti) in types" :key="t.id"
              :style=`{
                height: '50px',
              }`
              ).row.full-width.items-center.content-center.q-px-md
              span.text-white {{ t.name }}
      div(:style=`{height: '60px',}`).row.full-width
  //- wsItemPicker
  q-dialog(v-model="itemPickerOpened" position="bottom")
    ws-item-picker(
      @item="itemPicked"
      @close="itemPickerOpened = false"
      :title="wsItemPickerTitle"
      :types="{node: {types: ['saved', 'published']}}"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
      }`
      )
</template>

<script>
import { NodeApi } from 'src/api/node'

export default {
  name: 'chainCreator',
  props: ['node'],
  data () {
    return {
      typePickerOpened: false,
      type: null,
      itemPickerOpened: false,
    }
  },
  computed: {
    // PROBLEM_SOLUTION, FALSE_TRUE, FROM_TO
    types () {
      return [
        {id: 'problem', key: 'leftItem', name: this.$t('chainType_problem', 'Проблема'), type: 'PROBLEM_SOLUTION'},
        {id: 'solution', key: 'rightItem', name: this.$t('chainType_solution', 'Решение'), type: 'PROBLEM_SOLUTION'},
        {id: 'false', key: 'leftItem', name: this.$t('chainType_false', 'Фэйк'), type: 'FALSE_TRUE'},
        {id: 'true', key: 'rightItem', name: this.$t('chainType_true', 'Опровержение'), type: 'FALSE_TRUE'},
        {id: 'from', key: 'leftItem', name: this.$t('chainType_from', 'Причина'), type: 'FROM_TO'},
        {id: 'to', key: 'rightItem', name: this.$t('chainType_to', 'Следствие'), type: 'FROM_TO'},
      ]
    },
    wsItemPickerTitle () {
      if (!this.type) return ''
      return 'Pick node' + this.type.name
    }
  },
  methods: {
    start () {
      this.$log('start')
      this.typePickerOpened = true
    },
    async typeClick (type) {
      this.$log('typeClick', type)
      this.type = type
      this.typePickerOpened = false
      this.itemPickerOpened = true
    },
    async itemPicked ({type, item}) {
      this.$log('itemPicked', type, item)
      this.itemPickerOpened = false
      let itemOid = null
      if (type === 'node') {
        // if got oid => saved or published
        // if not publish and get node.oid
        if (item.oid) {
          itemOid = item.oid
        }
        else {
        }
      }
      else if (type === 'composition') {
        // publish this node
      }
      else if (type === 'content') {
        // open content explorer and wait for composition...
      }
      this.$log('itemPicked this.type', this.type)
      let chainInput = {
        name: '',
        category: 'FUN',
        spheres: [],
        links: [
          {
            type: this.type.type,
            leftItem: null,
            rightItem: null,
          }
        ]
      }
      this.$log('itemPicked chainInput', chainInput)
      if (!itemOid) {
        this.$q.notify({type: 'negative', message: 'No itemOid!'})
        return
      }
      if (this.type.key === 'leftItem') {
        chainInput.links[0].rightItem = {oid: this.node.oid}
        chainInput.links[0].leftItem = {oid: itemOid}
      }
      if (this.type.key === 'rightItem') {
        chainInput.links[0].leftItem = {oid: this.node.oid}
        chainInput.links[0].rightItem = {oid: itemOid}
      }
      let chain = await NodeApi.chainCreate(chainInput)
      this.$log('itemPicked chain', chain)
    }
  }
}
</script>
