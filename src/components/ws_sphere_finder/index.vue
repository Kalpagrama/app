<template lang="pug">
div(
  :style=`{
    borderRadius: '10px', overflow: 'hidden',
  }`).column.items-start.content-start.b-50
  //- header
  div(v-if="useSearch").row.full-width.q-pa-sm
    .row.full-width.items-center.content-center.q-pl-sm
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Add spheres
      .col
      q-btn(round flat color="white" icon="clear" @click="$emit('close')")
    div(
      :style=`{
        position: 'relative', zIndex: 100,
        borderRadius: '10px', overflow: 'hidden'
      }`).row.full-width.q-pa-sm.b-60
      //- q-input(
        v-model="searchStringLocal"
        placeholder="Add sphere"
        :autofocus="true"
        filled dark dense color="grey-7"
        type="textarea" autogrow
        :input-style=`{paddingLeft: '0px',}`
        ).full-width.justify-start.b-40
        //- @keyup.enter="sphereCreate()"
        template(v-slot:default)
          .row.full-width.items-start.content-start.br
            div(v-for="(s,si) in selectedIds"  :key="s").row.items-start.content-start.q-mr-xs.q-mb-xs
              ws-sphere-item(:id="s").b-90
              //- small(:style=`{fontSize: '14px'}`).text-white {{ s }}
      div(v-for="(s,si) in selectedIds"  :key="s").row.items-start.content-start.q-mr-xs.q-mb-xs
        ws-sphere-item(:id="s").b-70
          template(v-slot:append)
            q-icon(name="clear" color="white" size="14px")
      q-input(
        ref="sphereInput"
        v-model="searchStringLocal"
        borderless dark dense
        placeholder="Find sphere"
        :style=`{
          maxHeight: '24px',
          minWidth: '80px',
        }`
        @input.native="onInput"
        @keyup.enter="sphereCreate(), searchStringLocal = ''"
        ).col.br
  //- body
  .col.full-width.scroll
    kalpa-loader(
      :immediate="true"
      :query="spheresQuery" :limit="1000")
      template(v-slot=`{items}`)
        .row.full-width.items-start.content-start.q-pa-sm
          div(
            v-for="(s,si) in items" :key="s.id"
            v-if="!hiddenIds.includes(s.id)"
            @click="$emit('sphere', s)"
            ).row.full-width.items-center.content-center.justify-start.q-mb-xs
            q-btn(
              :class=`{
                'b-100': selectedIds.includes(s.id),
              }`
              flat color="white" icon="blur_on" align="left" no-caps
              ).full-width
              span.text-white.q-ml-sm {{s.name}}
  //- footer
  .row.full-width.q-pa-sm
    q-btn(
      v-if="searchStringLocal.length > 0"
      @click="sphereCreate()"
      flat color="green" icon="add" no-caps align="left").full-width Create sphere
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsSphereFinder',
  props: {
    searchString: {type: String},
    useSearch: {type: Boolean, default () { return true }},
    selectedIds: {type: Array, default () { return [] }},
    hiddenIds: {type: Array, default () { return [] }},
  },
  data () {
    return {
      searchStringLocal: ''
    }
  },
  watch: {
    searchString: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.searchStringLocal = to
        }
      }
    },
    searchStringLocal: {
      handler (to, from) {
        if (to) {
          this.$emit('searchString', to)
        }
      }
    }
  },
  computed: {
    spheresQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
      if (this.searchStringLocal.length > 0) {
        let nameRegExp = new RegExp(this.searchStringLocal, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // selector: props, import selector from props...
      return res
    }
  },
  methods: {
    onInput (e) {
      this.$log('onInput', e)
      let start = e.target.selectionStart
      let lastChar = String.fromCharCode(e.target.value.charCodeAt(start - 1))
      this.$log('lastChar', lastChar)
      if (lastChar === ',') {
        this.sphereCreate()
        this.searchStringLocal = ''
      }
      // input.addEventListener('input', function() {
      //     // Get cursor position
      //     var start = this.selectionStart;

      //     // Get last typed character
      //     var lastChar = String.fromCharCode(this.value.charCodeAt(start - 1));

      //     if(lastChar === '[YOURCHARHERE]') {
      //         // do something
      //     }
      // })
    },
    async sphereCreate () {
      return new Promise(async (resolve, reject) => {
        this.$log('sphereCreate')
        if (this.searchStringLocal.length > 0) {
          // check duplicates
          let [sphere] = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_SPHERE, name: this.searchStringLocal,
            }
          })
          this.$log('sphere', sphere)
          if (sphere) {
            this.$log('*** sphere DUPLICATE ***', sphere.name)
          }
          else {
            this.$log('sphere CREATE !', this.searchStringLocal)
            let sphereInput = {
              wsItemType: 'WS_SPHERE',
              name: this.searchStringLocal,
              spheres: [],
            }
            sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
          }
          this.$emit('sphere', sphere)
          resolve(sphere)
        }
        else {
          resolve(null)
        }
      })
    },
  },
  mounted () {
    this.$log('mounted', this.$refs.sphereInput)
    // this.$refs.sphereInput.addEventListener('input', function() {
    //     console.log('input!')
    //     // Get cursor position
    //     var start = this.selectionStart
    //     // // Get last typed character
    //     // var lastChar = String.fromCharCode(this.value.charCodeAt(start - 1));
    //     // if(lastChar === '[YOURCHARHERE]') {
    //     //     // do something
    //     // }
    // })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
