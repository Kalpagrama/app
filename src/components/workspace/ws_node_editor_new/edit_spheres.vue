<style lang="sass">
.sphere-item
  cursor: pointer
  &:hover
    background: rgb(80,80,80)
</style>

<template lang="pug">
.row.full-width.q-py-sm
  //- sphere dialog
  q-dialog(v-model="sphereDialogOpened")
    div(
      :style=`{
        position: 'relative',borderRadius: '10px', overflow: 'hidden',
        minHeight: '500px',
      }`).column.full-width.b-50
      //- header
      .row.full-width.items-center.content-center.justify-between.q-pa-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="sphereDialogOpened = false")
        span(:style=`{fontSize: '16px'}`).text-white.text-bold {{$t('wsNodeEditor_sphereDialogTitle', 'Добавить сферу')}}
        q-btn(round flat color="white" icon="more_vert")
      //- input
      div().row.full-width
        .col
          q-input(
            v-model="sphere"
            filled dark color="white"
            :placeholder="$t('wsNodeEditor_sphereInputPlaceholder', 'Найти или добавь сферу')"
            autofocus
            @keyup.enter="sphereInputEntered").full-width
            template(v-slot:append)
              q-btn(
                v-if="sphere.length > 0"
                round flat dense color="white" icon="clear" @click="sphere = ''")
      //- body
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-py-sm
           kalpa-loader(:mangoQuery="mangoQuery")
            template(v-slot=`{items}`)
              div(v-if="items.length > 0").row.full-width.items-start.content-start
                div(
                  v-for="(s,si) in items"
                  @click="sphereAdd(s)"
                  :style=`{
                    height: '40px', borderRadius: '10px', overflow: 'hidden',
                  }`
                  ).row.full-width.items-center.content-center.sphere-item.q-px-md.b-60.q-mb-xs
                  span.text-white 🔆 {{ s.name }}
              div(v-else).row.full-width.justify-center.items-center.content-center
                q-btn(
                  @click="sphereCreate()"
                  no-caps color="green") {{$t('ws_node_editor_sphereCreate', 'Создать сферу')}}: 🔆 {{ sphere }}
  //- sphere adding
  //- spheres list
  .row.full-width.items-start.content-start
    div(
      v-for="(s,si) in node.spheres" :key="si"
      @click="sphereSelectedClick(s)"
      :style=`{
        height: '40px', borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.items-center.content-center.sphere-item.q-px-md.b-60.q-mb-xs
      span.text-white 🔆 {{ s.name }}
    //- sphere add btn
    q-btn(
      v-if="node.spheres.length < 6"
      @click="sphereAddStart()"
      flat color="green" icon="add" no-caps
      :style=`{height: '40px',}`).full-width {{$t('ws_node_editor_add_sphere', 'Добавить сферу')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'editSpheres',
  props: ['node'],
  data () {
    return {
      sphere: '',
      sphereAdding: false,
      sphereDialogOpened: false,
    }
  },
  computed: {
    mangoQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
      if (this.sphere.length > 0) {
        let nameRegExp = new RegExp(this.sphere, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  methods: {
    sphereSelectedClick (s) {
      this.$log('sphereSelectedClick', s)
      this.node.spheres = this.node.spheres.filter(val => val.name !== s.name)
    },
    sphereAddStart (s) {
      this.$log('sphereAddStart')
      this.sphereDialogOpened = true
    },
    sphereAdd (s) {
      this.$log('sphereAdd', s)
      this.node.spheres.push(s)
      this.sphereDialogOpened = false
    },
    async sphereCreate () {
      this.$log('sphereCreate')
      if (this.sphere.length === 0) return
      let sphereInput = {
        wsItemType: 'WS_SPHERE',
        name: this.sphere,
        color: ''
      }
      let res = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
      // set sphere color...
      if (res.color.length === 0) res.color = this.$randomColor(res.id)
      this.$log('res', res)
      this.sphere = ''
      // then add this sphere to the node...
      this.sphereAdd(res)
    },
    sphereInputEntered () {
      this.$log('sphereInputEntered', this.sphere)
      this.sphereCreate()
      // this.sphere = ''
    },
  }
}
</script>
