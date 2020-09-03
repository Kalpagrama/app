<template lang="pug">
q-page(
  :style=`{paddingTop: '8px'}`
  ).row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: '600px',}`).row.full-width.items-start.content-start.q-px-sm
    //- small.text-white {{ contentKalpa }}
    span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentWorkspace.name }}
    .row.full-width.q-py-md
      .row.full-width
        q-btn(
          v-if="contentKalpa.contentSource !== 'KALPA'"
          @click="gotToOriginal"
          icon="fab fa-youtube"
          color="green" outline no-caps dense).full-width.q-px-sm
          span.q-mx-sm View original
      //- .row.full-width.q-px-sm
        small(:style=`{}`).text-white {{ contentKalpa.contentSource }}
    //- spheres
    .row.full-width.q-py-sm
      .row.full-width.q-py-md
        span.text-white.text-bold Сферы
      //- .row.full-width
        //- q-btn(flat no-caps icon="add" color="grey-7") Add spheres
        //- ws-sphere-finder(ref="wsSphereFinder" :searchString="sphere" @sphere="sphereAdd")
      //- div(v-for="(s,si) in contentWorkspace.spheres").row
      //-   span.text-white {{s}}
      .row.full-width
        ws-sphere-item(
          v-for="(s,si) in contentWorkspace.spheres" :key="s" :id="s"
          @clicked="sphereClicked").q-mb-sm.q-mr-sm
          template(v-slot:append)
            q-btn(
              v-if="sphereEditing === s"
              @click="sphereDelete(s)"
              round flat dense color="red" icon="delete_outline")
        div(
          :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '40px'}`
          ).row.items-start.content-start
          q-input(
            v-if="sphereAdding"
            v-model="sphere" autofocus
            placeholder="Найти сферу"
            filled dark dense color="grey-6"
            @keyup.enter="$refs.wsSphereFinder.sphereCreate().then(sphereAdd)")
          q-menu(
            v-model="sphereAdding"
            dark fit no-focus
            anchor="top left" self="bottom left")
            ws-sphere-finder(ref="wsSphereFinder" :searchString="sphere" @sphere="sphereAdd")
        q-btn(
          v-if="sphereAdding"
          @click="sphereAdding = false"
          round flat color="grey-8" icon="clear"
          :style=`{height: '40px',}`)
        q-btn(
          v-if="!sphereAdding"
          @click="sphereAdding = true"
          flat color="green" icon="add" no-caps dense
          :style=`{height: '40px'}`) {{$t('wsNodeEditor_sphereAddFirst', 'Добавь сферу')}}
</template>

<script>
import { openURL } from 'quasar'
import wsSphereFinder from 'components/ws_sphere_finder/index.vue'

export default {
  name: 'wsContentExplorer_video_viewDetails',
  components: {wsSphereFinder},
  props: ['contentKalpa', 'contentWorkspace'],
  data () {
    return {
      sphere: '',
      sphereAdding: false,
      sphereEditing: false,
    }
  },
  methods: {
    sphereClicked (sphere) {
      this.$log('sphereClicked', sphere)
      this.sphereEditing = sphere.id
    },
    sphereDelete (sphereId) {
      this.$log('sphereDelete', sphereId)
      this.contentWorkspace.spheres = this.contentWorkspace.spheres.filter(s => s !== sphereId)
    },
    gotToOriginal () {
      this.$log('gotToOriginal')
      if (this.contentKalpa.contentSource === 'YOUTUBE') {
        let arr = this.contentKalpa.url.split('/')
        let isEmbed = arr[arr.length - 2] === 'embed'
        if (isEmbed) openURL(`https://www.youtube.com/watch?v=${arr[arr.length - 1]}`)
        else openURL(this.contentKalpa.url)
      }
    },
    sphereAdd (sphere) {
      this.$log('sphereAdd', sphere)
      let sphereFind = this.contentWorkspace.spheres.find(s => s === sphere.id)
      if (sphereFind) {
        // do nothing...
      }
      else {
        this.contentWorkspace.spheres.push(sphere.id)
      }
      this.sphereAdding = false
      this.sphere = ''
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['wsContentLayers', null])
  }
}
</script>
