<template lang="pug">
q-layout(view="hHh Lpr lff" :style=`{zIndex: 4000, maxWidth: width+'px'}`).b-30
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px'}`).row.full-width.b-30
        div(:style=`{}`).row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
          span(:style=`{fontSize: '18px'}`).text-white.text-bold Item finder
        .row.full-width.q-px-md
          div(:style=`{position: 'relative',borderRadius: '10px',overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="searchString"
              placeholder="Find item"
              filled dark dense color="grey-6").full-width
        .row.full-width.q-px-md
          .row.full-width.q-px-md
            q-tabs(
              v-model="type"
              dense no-caps active-color="white" align="left" switch-indicator
              ).full-width.text-grey-8
              q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
  q-page-container
    q-page(:style=`{paddingTop: '10px', paddingBottom: '200px',}`).row.full-width.items-start.content-start
      div(v-if="type === 'content'").row.full-width.q-px-md
        div(
          v-for="(i,ii) in contents" :key="i.id"
          :style=`{
            height: '60px',
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.b-40.q-mb-sm.k-item
          img(
            :src="i.thumbOid"
            :style=`{
              height: '60px', width: '100px',
              objectFit: 'cover',
              borderRadius: '10px', overflow: 'hidden'}`).b-50
          .col.full-height
            .row.fit.items-center.content-center.q-px-md
              span.text-white {{ i.name.slice(0, 50) }}
              .row.full-width
                small.text-grey-7 {{i.contentType}}
      div(v-if="type === 'fragment'").row.full-width.q-px-md
        div(
          v-for="(i,ii) in fragments" :key="i.id"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.q-mb-sm
          //- default header
          div(
            @click="fragmentClick(i)"
            :style=`{
              height: '60px',
            }`
            ).row.full-width.items-start.content-start.b-40
            img(
              :src="i.items[0].thumbUrl"
              :style=`{
                height: '60px', width: '100px',
                objectFit: 'cover',
                borderRadius: '10px', overflow: 'hidden'
              }`
              )
            .col.full-height
              .row.fit.items-center.content-center.q-px-md
                small.text-white {{ i.name }}
      div(v-if="type === 'draft'").row.full-width
        div(
          v-for="(i,ii) in spheres" :key="i.id"
          :style=`{}`
          ).row.full-width
          small.text-white {{ i.name }}
      //- by Sphere
      kalpa-loader(v-if="type === 'sphere'" :mangoQuery="querySphere" :sliseSize="1000")
        template(v-slot=`{items}`)
          .row.full-width.items-start.content-start.q-px-md
            div(
              v-for="(i,ii) in items" :key="i.id"
              v-if="i.items.length > 0"
              :style=`{
                position: 'relative',
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).row.full-width.b-40.k-item.q-mb-sm
              //- default header
              div(
                @click="sphereClick(i)"
                :style=`{
                  position: 'relative', zIndex: 100,
                  height: '40px',
                  borderRadius: '10px', overflow: 'hidden',
                }`).row.full-width.items-start.content-start.b-40
                .col.full-height
                  .row.fit.items-center.content-center.q-px-md
                    span(:style=`{fontSize: '20px',}`).text-grey-6.text-bold.q-mr-sm #
                    span.text-white {{ i.name }}
              //- opened
              div(
                v-if="sphereOpened === i.id"
                :style=`{
                  marginTop: '-10px', paddingTop: '40px',
                }`
                ).row.full-width.b-50.q-px-sm
                div(
                  v-for="(si,sii) in i.items" :key="sii"
                  @click="sphereItemClick(si)"
                  :style=`{
                    height: '60px',
                    borderRadius: '10px', overflow: 'hidden',
                  }`
                  ).row.full-width.q-mb-sm.b-60
                  img(
                    :src="si.thumbOid"
                    :style=`{
                      height: '60px', width: '100px',
                      borderRadius: '10px', overflow: 'hidden',
                    }`)
                  .col.full-height
                    .row.fit.items-center.content-center.q-px-md
                      small.text-white {{ si.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodeEditor_itemFinder',
  data () {
    return {
      searchString: '',
      type: 'content',
      contents: [],
      fragments: [],
      sphereOpened: null
    }
  },
  methods: {
    sphereClick (s) {
      this.$log('sphereClick', s)
      this.sphereOpened = s.id
    },
    sphereItemClick (item) {
      this.$log('sphereItemClick', item)
    },
    fragmentClick (fragment) {
      this.$log('fragmentClick', fragment)
      let item = JSON.parse(JSON.stringify(fragment))
      let itemInput = {
        items: item.items,
        spheres: item.spheres,
        name: item.name
      }
      this.$emit('item', itemInput)
    }
  },
  computed: {
    types () {
      return [
        {id: 'content', name: 'by Content'},
        {id: 'sphere', name: 'by Sphere'},
        {id: 'fragment', name: 'Fragments'},
        {id: 'draft', name: 'Drafts'},
        {id: 'published', name: 'Published'},
      ]
    },
    width () {
      if (this.$q.screen.width < 800) return this.$q.screen.width
      else return 800
    },
    queryFragments () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          stage: 'fragment'
        }
      }
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      res.sort = [{updatedAt: 'desc'}]
      return res
    },
    queryContents () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
        }
      }
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      res.sort = [{updatedAt: 'desc'}]
      return res
    },
    querySphere () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      res.sort = [{updatedAt: 'desc'}]
      return res
    },
    // queryDrafts () {
    // },
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(600)
    // let {drafts} = await this.$rxdb.find(this.query)
    let {items: fragments} = await this.$rxdb.find(this.queryFragments)
    this.$log('fragmens', fragments)
    this.fragments = fragments
    let {items: contents} = await this.$rxdb.find(this.queryContents)
    this.$log('contents', contents)
    this.contents = contents
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
