<template lang="pug">
div(
  :style=`{
  }`
  ).row.full-width.justify-center.q-pb-sm
  div(
    :style=`{
      minHeight: '100px',
      maxWidth: '600px',
      background: background || 'rgba(30,30,30,0.8)',
      borderRadius: '20px',
    }`
    ).row.full-width.items-start.content-start
    q-input(
      v-model="node.name"
      dark borderless color="white"
      type="textarea" autogrow :rows="1"
      placeholder="В чем суть?"
      :input-style=`{
        padding: '20px',
        fontSize: fontSize+'px',
        color: 'white',
      }`
      ).full-width
    .row.full-width.items-start.content-start.q-pl-sm
      q-btn(
        flat no-caps color="grey-6" dense icon-right="keyboard_arrow_down"
        :style=`{
          marginTop: '6px'
        }`
        ).q-ml-sm.q-mt-xs.q-mr-sm Категория
      div(
        @click="sphereDelete(si)"
        v-for="(s,si) in node.spheres" :key="si"
        :style=`{
          background: 'rgba(40,40,40,0.5)',
          borderRadius: '10px',
          height: '34px',
          marginTop: '6px',
        }`
        ).row.items-center.content-center.q-px-sm.q-mr-sm.cursor-pointer
        q-icon(name="blur_on" color="grey-6" size="20px").q-mr-xs
        span.text-grey-4 {{ s.name }}
      q-input(
        ref="sphereInput"
        v-model="sphere"
        dark borderless color="white" dense
        placeholder="Введите сферу"
        :input-style=`{
          paddingTop: '13px',
          //- paddingLeft: node.spheres.length === 0 ? '12px' : '4px',
          paddingLeft: '4px',
          minWidth: '60px',
        }`
        @keyup.enter="sphereAdd")
    .row.full-width.items-center.content-center.q-pa-sm
      .col
      //- q-btn(
        @click="nodePublish()"
        round flat color="green" icon="check"
        :loading="nodePublishing")
      q-btn(
        @click="nodePublish()"
        flat color="green" no-caps
        :loading="nodePublishing") Опубликовать
</template>

<script>
export default {
  name: 'nodeEditorPopup',
  props: ['player', 'contentKalpa', 'background'],
  data () {
    return {
      node: {
        name: '',
        spheres: [],
      },
      sphere: '',
      nodePublishing: false,
    }
  },
  computed: {
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 20
      else if (l < 30) return 16
      else if (l < 40) return 14
      else return 12
    }
  },
  methods: {
    sphereAdd () {
      this.$log('sphereAdd')
      let sphereName = this.sphere.trim()
      if (sphereName.length === 0) return
      if (this.node.spheres.find(s => s.name === sphereName)) {
        this.sphere = ''
        return
      }
      this.node.spheres.push({ name: sphereName })
      this.sphere = ''
    },
    sphereDelete (si) {
      this.$log('sphereDelete', si)
      this.$delete(this.node.spheres, si)
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        await this.$wait(1000)
        this.$log('nodePublish done')
        this.nodePublishing = false
      }
      catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
      }
    },
    sphereInputOnKeydown (e) {
      this.$log('sphereInputOnKeydown', e)
      const key = e.key
      if (key === 'Backspace' || key === 'Delete') {
        if (this.sphere.length === 0) {
          if (this.node.spheres.length > 0) {
            this.$delete(this.node.spheres, this.node.spheres.length - 1)
          }
        }
        return false
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$refs.sphereInput.$el.addEventListener('keydown', this.sphereInputOnKeydown)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$refs.sphereInput.$el.removeEventListener('keydown', this.sphereInputOnKeydown, false)
  }
}
</script>
