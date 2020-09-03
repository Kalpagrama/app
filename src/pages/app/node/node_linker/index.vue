<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  :style=`{zIndex: 4000, maxWidth: width+'px'}`).b-30
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px',height: '50px',}`
        ).row.full-width.items-center.content-center.q-px-xs.b-30
        q-btn(round flat color="white" icon="insert_link" @click="$emit('close')").q-mx-sm
        span(:style=`{fontSize: '18px',}`).text-bold.text-white Link node
        q-btn(
          flat dense no-caps color="white"
          icon-right="keyboard_arrow_down"
          ).b-40.q-mx-sm
          span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm similar to it
        .col
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  q-page-container
    q-page(:style=`{paddingTop: '20px', paddingBottom: '200px',}`).row.full-width.justify-center
      div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start.q-pa-sm
        //- spheres
        div(:style=`{width: '200px'}`).row
          //- small.text-white {{ spheresSelected }}
          .row.full-width.q-px-sm.q-pb-md
            q-btn(flat dense no-caps color="white" icon-right="keyboard_arrow_down").b-40
              span.text-white.text-bold.q-mx-sm by Spheres
          kalpa-loader(:mangoQuery="querySpheres" :sliceSize="1000")
            template(v-slot=`{items}`)
              .row.full-width.items-start.content-start.q-px-sm
                div(v-for="(s,si) in items" :key="i").row.full-width.q-mb-xs
                  ws-sphere-item(
                    @clicked="sphereClicked(s)"
                    :id="s.id"
                    :class=`{
                      'b-100': spheresSelected.includes(s.id)
                    }`
                    :style=`{
                      borderRadius: '10px', overflow: 'hidden'
                    }`
                    ).full-width.b-40
        //- sphere items
        .col
          kalpa-loader(:mangoQuery="queryNodes" :sliceSize="1000")
            template(v-slot=`{items}`)
              .row.full-width.items-start.content-start.justify-start
                div(
                  v-for="(i,ii) in items" :key="i.id"
                  :style=`{
                    borderRadius: '10px', overflow: 'hidden',
                    width: '200px',
                  }`
                  ).row.q-mr-sm.q-mb-sm.b-40
                  div(
                    :style=`{
                      height: '150px',
                      borderRadius: '10px', overflow: 'hidden'
                    }`).row.full-width.b-50
                    img(
                      :src="i.thumbOid"
                      :style=`{objectFit: 'cover'}`
                      ).fit
                  div(
                    :style=`{
                      height: 'auto',
                    }`
                    ).row.full-width.q-pa-sm
                    span.text-white {{ i.name }}
            //- .row.full-width.items-start.content-start.q-pa-sm
            //-   div(
            //-     v-for="(n,ni) in items" :key="n.id"
            //-     :style=`{height: '100px',borderRadius: '10px', overflow: 'hidden',}`
            //-     ).row.full-width.items-start.content-start.q-mb-sm.b-50
            //-     img(:src="n.color" :style=`{height: '100px'}`)
            //-     .col
            //-       .row.fit.q-pa-md
            //-         span.text-bold {{ n.name }}
      //- q-page-sticky(expand position="bottom" :offset="[0,0]" :style=`{zIndex: 1000}`)
        .row.full-width.justify-center
          div(:style=`{maxWidth: '800px', height: '50px',}`).row.full-width.b-30
            q-btn(round flat color="white" icon="keyboard_arrow_down" @click="$emit('close')")
            .col
      //- q-page-sticky(position="bottom-right" :offset="[25,25]" :style=`{zIndex: 2000}`)
        q-btn(
          round push color="green" icon="add" size="lg"
          :style=`{borderRadius: '50%'}`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_node_nodeLinker',
  props: ['node'],
  data () {
    return {
      searchStringSphere: '',
      spheresSelected: [],
    }
  },
  computed: {
    width () {
      if (this.$q.screen.width < 800) return this.$q.screen.width
      else return 800
    },
    queryNodes () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_ANY,
          spheres: {$elemMatch: {$in: this.spheresSelected}}
        }
      }
      // if (this.searchString.length > 0) {
      //   let nameRegExp = new RegExp(this.searchString, 'i')
      //   res.selector.name = {$regex: nameRegExp}
      // }
      return res
    },
    querySpheres () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_SPHERE
        }
      }
      if (this.searchStringSphere.length > 0) {
        let nameRegExp = new RegExp(this.searchStringSphere, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
  },
  methods: {
    sphereClicked (sphere) {
      this.$log('sphereClick', sphere)
      if (this.spheresSelected.includes(sphere.id)) {
        this.spheresSelected = this.spheresSelected.filter(id => id !== sphere.id)
      }
      else this.spheresSelected.push(sphere.id)
    },
    spheresFromItems (items) {
      return items.reduce((acc, val) => {
        if (val.spheres && val.spheres.length > 0) {
          val.spheres.map(s => acc.push(s))
        }
        return acc
      }, [])
    },
  }
}
</script>
